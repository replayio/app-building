import { neon } from '@neondatabase/serverless'

export async function seedTestData(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  await sql`
    INSERT INTO apps (id, name, description, status, progress)
    VALUES
      ('inventory-management', 'Inventory Management System', 'Autonomous system to track and order stock in real-time, integrating with suppliers and sales data.', 'building', 65),
      ('crm-dashboard', 'CRM Dashboard', 'Customer relationship management dashboard with analytics and reporting.', 'finished', 100),
      ('task-tracker', 'Task Tracker', 'Project task tracking application with kanban boards and sprint management.', 'queued', 0)
    ON CONFLICT (id) DO NOTHING
  `

  await sql`
    INSERT INTO app_requests (name, description, requirements, status, app_id)
    VALUES
      ('Inventory Management System', 'Autonomous system to track and order stock in real-time.', 'Real-time tracking, supplier integration', 'accepted', 'inventory-management'),
      ('CRM Dashboard', 'Customer relationship management dashboard.', 'Analytics, reporting, contact management', 'accepted', 'crm-dashboard'),
      ('Task Tracker', 'Project task tracking application.', 'Kanban boards, sprint management', 'accepted', 'task-tracker')
    ON CONFLICT DO NOTHING
  `

  await sql`
    INSERT INTO activity_log (app_id, log_type, message)
    VALUES
      ('inventory-management', 'build', 'Build started'),
      ('inventory-management', 'build', 'Dependencies installed'),
      ('crm-dashboard', 'build', 'Build completed'),
      ('crm-dashboard', 'deploy', 'Deployed successfully')
    ON CONFLICT DO NOTHING
  `
}
