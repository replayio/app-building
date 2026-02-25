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
  const supplierId = segments[3] || null;

  if (!supplierId) {
    return new Response(JSON.stringify({ error: "Supplier ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT id, supplier_id, file_name, file_url, document_type, upload_date
        FROM supplier_documents
        WHERE supplier_id = ${supplierId}::uuid
        ORDER BY upload_date DESC, created_at DESC
      `;
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Supplier documents GET error:", err);
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
        INSERT INTO supplier_documents (supplier_id, file_name, file_url, document_type)
        VALUES (
          ${supplierId}::uuid,
          ${fileName},
          ${fileUrl},
          ${documentType}
        )
        RETURNING id, supplier_id, file_name, file_url, document_type, upload_date
      `;
      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Supplier documents POST error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const documentId = url.searchParams.get("documentId");
      if (!documentId) {
        return new Response(JSON.stringify({ error: "documentId query param is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await sql`
        DELETE FROM supplier_documents
        WHERE id = ${documentId}::uuid AND supplier_id = ${supplierId}::uuid
      `;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Supplier documents DELETE error:", err);
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
