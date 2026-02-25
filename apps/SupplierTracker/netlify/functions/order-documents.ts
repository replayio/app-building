import { neon } from "@neondatabase/serverless";
import { UTApi } from "uploadthing/server";
import type { Context } from "@netlify/functions";

export default async function handler(req: Request, _context: Context) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "DATABASE_URL not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(dbUrl);
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const orderId = segments[3] || null;

  if (!orderId) {
    return new Response(JSON.stringify({ error: "Order ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT id, order_id, file_name, file_url, document_type, upload_date
        FROM order_documents
        WHERE order_id = ${orderId}::uuid
        ORDER BY upload_date DESC, created_at DESC
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Order documents GET error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "POST") {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const documentType = (formData.get("document_type") as string) || "";

      if (!file) {
        return new Response(JSON.stringify({ error: "file is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const utapi = new UTApi();
      const uploadResult = await utapi.uploadFiles([file]);
      const uploaded = uploadResult[0];

      if (!uploaded || uploaded.error) {
        console.error("UploadThing error:", uploaded?.error);
        return new Response(JSON.stringify({ error: "File upload failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const fileUrl = uploaded.data.ufsUrl;
      const fileName = file.name;

      const rows = await sql`
        INSERT INTO order_documents (order_id, file_name, file_url, document_type)
        VALUES (
          ${orderId}::uuid,
          ${fileName},
          ${fileUrl},
          ${documentType}
        )
        RETURNING id, order_id, file_name, file_url, document_type, upload_date
      `;

      // Add history entry
      await sql`
        INSERT INTO order_history (order_id, event_type, description, actor)
        VALUES (
          ${orderId}::uuid,
          'document',
          ${"Document uploaded: " + fileName},
          'System'
        )
      `;

      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Order documents POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
