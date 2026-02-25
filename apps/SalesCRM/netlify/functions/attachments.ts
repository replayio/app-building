import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";
import { UTApi } from "uploadthing/server";

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const sql = getDb();
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const subPath = segments[3] || null;

  // GET /.netlify/functions/attachments?clientId=<id> or ?dealId=<id>
  if (req.method === "GET" && !subPath) {
    const clientId = url.searchParams.get("clientId");
    const dealId = url.searchParams.get("dealId");
    if (!clientId && !dealId) {
      return errorResponse(400, "clientId or dealId query param required");
    }

    let queryText: string;
    let params: unknown[];

    if (dealId) {
      queryText = `SELECT a.*, d.name AS deal_name
         FROM attachments a
         LEFT JOIN deals d ON d.id = a.deal_id
         WHERE a.deal_id = $1
         ORDER BY a.created_at DESC`;
      params = [dealId];
    } else {
      queryText = `SELECT a.*, d.name AS deal_name
         FROM attachments a
         LEFT JOIN deals d ON d.id = a.deal_id
         WHERE a.client_id = $1
         ORDER BY a.created_at DESC`;
      params = [clientId!];
    }

    const attachments = await query<{
      id: string;
      filename: string;
      file_type: string | null;
      url: string;
      size: number | null;
      client_id: string | null;
      deal_id: string | null;
      created_at: string;
      deal_name: string | null;
    }>(sql, queryText, params);

    return jsonResponse(
      attachments.map((a) => ({
        id: a.id,
        filename: a.filename,
        fileType: a.file_type,
        url: a.url,
        size: a.size,
        clientId: a.client_id,
        dealId: a.deal_id,
        dealName: a.deal_name,
        createdAt: a.created_at,
      }))
    );
  }

  // POST /.netlify/functions/attachments — create attachment (file upload or link)
  if (req.method === "POST" && !subPath) {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // File upload mode
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const clientId = formData.get("clientId") as string | null;
      const dealId = formData.get("dealId") as string | null;

      if (!file) {
        return errorResponse(400, "File is required");
      }
      if (!clientId) {
        return errorResponse(400, "clientId is required");
      }

      const utapi = new UTApi();
      const uploadResult = await utapi.uploadFiles([file]);
      const uploaded = uploadResult[0];

      if (!uploaded || uploaded.error) {
        return errorResponse(500, "File upload failed");
      }

      const fileUrl = uploaded.data.ufsUrl;
      const filename = file.name;
      const fileType = getFileCategory(filename);

      const created = await query<{
        id: string;
        filename: string;
        file_type: string | null;
        url: string;
        size: number | null;
        client_id: string | null;
        deal_id: string | null;
        created_at: string;
      }>(
        sql,
        `INSERT INTO attachments (filename, file_type, url, size, client_id, deal_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [filename, fileType, fileUrl, file.size, clientId, dealId || null]
      );

      const a = created[0];
      return jsonResponse(
        {
          id: a.id,
          filename: a.filename,
          fileType: a.file_type,
          url: a.url,
          size: a.size,
          clientId: a.client_id,
          dealId: a.deal_id,
          dealName: null,
          createdAt: a.created_at,
        },
        201
      );
    } else {
      // Link mode (JSON)
      let body: {
        filename?: string;
        url?: string;
        clientId?: string;
        dealId?: string;
      };
      try {
        body = await req.json();
      } catch {
        return errorResponse(400, "Invalid JSON body");
      }

      if (!body.url?.trim()) {
        return errorResponse(400, "URL is required");
      }
      if (!body.clientId) {
        return errorResponse(400, "clientId is required");
      }

      const filename = body.filename?.trim() || body.url.trim();

      const created = await query<{
        id: string;
        filename: string;
        file_type: string | null;
        url: string;
        size: number | null;
        client_id: string | null;
        deal_id: string | null;
        created_at: string;
      }>(
        sql,
        `INSERT INTO attachments (filename, file_type, url, client_id, deal_id)
         VALUES ($1, 'link', $2, $3, $4)
         RETURNING *`,
        [filename, body.url.trim(), body.clientId, body.dealId || null]
      );

      const a = created[0];
      return jsonResponse(
        {
          id: a.id,
          filename: a.filename,
          fileType: a.file_type,
          url: a.url,
          size: a.size,
          clientId: a.client_id,
          dealId: a.deal_id,
          dealName: null,
          createdAt: a.created_at,
        },
        201
      );
    }
  }

  // DELETE /.netlify/functions/attachments/<id>
  if (req.method === "DELETE" && subPath) {
    const existing = await queryOne<{ id: string }>(
      sql,
      "SELECT id FROM attachments WHERE id = $1",
      [subPath]
    );
    if (!existing) {
      return errorResponse(404, "Attachment not found");
    }

    await query(sql, "DELETE FROM attachments WHERE id = $1", [subPath]);
    return jsonResponse({ success: true });
  }

  return errorResponse(405, "Method not allowed");
}

function getFileCategory(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].includes(ext)) return "image";
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) return "document";
  if (["xls", "xlsx", "csv"].includes(ext)) return "spreadsheet";
  if (["js", "ts", "py", "java", "rb", "go", "rs", "c", "cpp", "h", "json", "xml", "yaml", "yml"].includes(ext)) return "code";
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return "archive";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) return "audio";
  return "document";
}
