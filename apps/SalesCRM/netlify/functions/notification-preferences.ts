import { getDb, query, queryOne, jsonResponse, errorResponse } from "@shared/backend/db";
import { withAuth } from "@shared/backend/auth-middleware";

interface NotificationPreferences {
  client_updated: boolean;
  deal_created: boolean;
  deal_stage_changed: boolean;
  task_created: boolean;
  task_completed: boolean;
  task_canceled: boolean;
  contact_added: boolean;
  note_added: boolean;
  attachment_added: boolean;
  attachment_deleted: boolean;
}

function mapPreferences(row: NotificationPreferences) {
  return {
    clientUpdated: row.client_updated,
    dealCreated: row.deal_created,
    dealStageChanged: row.deal_stage_changed,
    taskCreated: row.task_created,
    taskCompleted: row.task_completed,
    taskCanceled: row.task_canceled,
    contactAdded: row.contact_added,
    noteAdded: row.note_added,
    attachmentAdded: row.attachment_added,
    attachmentDeleted: row.attachment_deleted,
  };
}

async function handler(authReq: { req: Request; user: { id: string; name: string; email: string } | null }): Promise<Response> {
  const { req, user } = authReq;

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (!user) {
    return errorResponse(401, "Authentication required");
  }

  const sql = getDb();

  // GET - fetch preferences
  if (req.method === "GET") {
    const row = await queryOne<NotificationPreferences>(
      sql,
      "SELECT client_updated, deal_created, deal_stage_changed, task_created, task_completed, task_canceled, contact_added, note_added, attachment_added, attachment_deleted FROM notification_preferences WHERE user_id = $1",
      [user.id]
    );

    if (!row) {
      // Return defaults (all true)
      return jsonResponse({
        clientUpdated: true,
        dealCreated: true,
        dealStageChanged: true,
        taskCreated: true,
        taskCompleted: true,
        taskCanceled: true,
        contactAdded: true,
        noteAdded: true,
        attachmentAdded: true,
        attachmentDeleted: true,
      });
    }

    return jsonResponse(mapPreferences(row));
  }

  // PUT - update preferences
  if (req.method === "PUT") {
    const body = await req.json() as Record<string, boolean>;

    const clientUpdated = body.clientUpdated ?? true;
    const dealCreated = body.dealCreated ?? true;
    const dealStageChanged = body.dealStageChanged ?? true;
    const taskCreated = body.taskCreated ?? true;
    const taskCompleted = body.taskCompleted ?? true;
    const taskCanceled = body.taskCanceled ?? true;
    const contactAdded = body.contactAdded ?? true;
    const noteAdded = body.noteAdded ?? true;
    const attachmentAdded = body.attachmentAdded ?? true;
    const attachmentDeleted = body.attachmentDeleted ?? true;

    // Upsert
    const existing = await queryOne<{ id: string }>(
      sql,
      "SELECT id FROM notification_preferences WHERE user_id = $1",
      [user.id]
    );

    if (existing) {
      await query(
        sql,
        `UPDATE notification_preferences SET
          client_updated = $1, deal_created = $2, deal_stage_changed = $3,
          task_created = $4, task_completed = $5, task_canceled = $6, contact_added = $7, note_added = $8,
          attachment_added = $9, attachment_deleted = $10,
          updated_at = NOW()
        WHERE user_id = $11`,
        [clientUpdated, dealCreated, dealStageChanged, taskCreated, taskCompleted, taskCanceled, contactAdded, noteAdded, attachmentAdded, attachmentDeleted, user.id]
      );
    } else {
      await query(
        sql,
        `INSERT INTO notification_preferences (user_id, client_updated, deal_created, deal_stage_changed, task_created, task_completed, task_canceled, contact_added, note_added, attachment_added, attachment_deleted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [user.id, clientUpdated, dealCreated, dealStageChanged, taskCreated, taskCompleted, taskCanceled, contactAdded, noteAdded, attachmentAdded, attachmentDeleted]
      );
    }

    return jsonResponse({
      clientUpdated,
      dealCreated,
      dealStageChanged,
      taskCreated,
      taskCompleted,
      taskCanceled,
      contactAdded,
      noteAdded,
      attachmentAdded,
      attachmentDeleted,
    });
  }

  return errorResponse(405, "Method not allowed");
}

export default withAuth(handler, { required: true });
