import { neon } from '@neondatabase/serverless'

interface HandlerEvent {
  httpMethod: string
  path: string
  queryStringParameters: Record<string, string> | null
  body: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
    body: JSON.stringify(body),
  }
}

type SqlFn = ReturnType<typeof neon>

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const sql = neon(process.env.DATABASE_URL!)
  const segments = event.path.split('/').filter(Boolean)
  const resourceId = segments[3] || null
  const subResource = segments[4] || null
  const subResourceId = segments[5] || null

  try {
    if (event.httpMethod === 'GET') {
      if (resourceId) {
        if (subResource === 'history') {
          return await handleGetHistory(sql, resourceId)
        }
        if (subResource === 'writeups') {
          if (subResourceId === 'versions') {
            const writeupId = event.queryStringParameters?.writeup_id
            if (!writeupId) return json(400, { error: 'writeup_id required' })
            return await handleGetWriteupVersions(sql, writeupId)
          }
          return await handleGetWriteups(sql, resourceId)
        }
        if (subResource === 'tasks') {
          return await handleGetTasks(sql, resourceId)
        }
        if (subResource === 'attachments') {
          return await handleGetAttachments(sql, resourceId)
        }
        if (subResource === 'contacts') {
          return await handleGetContacts(sql, resourceId)
        }
        return await handleGetDeal(sql, resourceId)
      }
      return await handleListDeals(sql, event.queryStringParameters)
    }

    if (event.httpMethod === 'POST') {
      if (resourceId && subResource === 'history') {
        return await handleCreateHistory(sql, resourceId, event.body)
      }
      if (resourceId && subResource === 'writeups') {
        return await handleCreateWriteup(sql, resourceId, event.body)
      }
      if (resourceId && subResource === 'attachments') {
        return await handleCreateAttachment(sql, resourceId, event.body)
      }
      if (resourceId && subResource === 'contacts') {
        return await handleAddContact(sql, resourceId, event.body)
      }
      if (!resourceId) {
        return await handleCreateDeal(sql, event.body)
      }
      return json(400, { error: 'Invalid endpoint' })
    }

    if (event.httpMethod === 'PUT') {
      if (resourceId && subResource === 'writeups' && subResourceId) {
        return await handleUpdateWriteup(sql, subResourceId, event.body)
      }
      if (resourceId && !subResource) {
        return await handleUpdateDeal(sql, resourceId, event.body)
      }
      return json(400, { error: 'Invalid endpoint' })
    }

    if (event.httpMethod === 'DELETE') {
      if (resourceId && subResource === 'writeups' && subResourceId) {
        await sql`DELETE FROM deal_writeups WHERE id = ${subResourceId}`
        return json(200, { deleted: true })
      }
      if (resourceId && subResource === 'attachments' && subResourceId) {
        await sql`DELETE FROM attachments WHERE id = ${subResourceId}`
        return json(200, { deleted: true })
      }
      if (resourceId && subResource === 'contacts' && subResourceId) {
        await sql`DELETE FROM deal_contacts WHERE deal_id = ${resourceId} AND individual_id = ${subResourceId}`
        return json(200, { deleted: true })
      }
      if (resourceId && !subResource) {
        return await handleDeleteDeal(sql, resourceId)
      }
      return json(400, { error: 'Invalid endpoint' })
    }

    return json(405, { error: 'Method not allowed' })
  } catch (err: unknown) {
    console.error('Error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return json(500, { error: message })
  }
}

async function handleGetDeal(sql: SqlFn, id: string) {
  const rows = await sql`
    SELECT d.*,
      c.name as client_name
    FROM deals d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE d.id = ${id}
  `
  if (!rows.length) return json(404, { error: 'Not found' })
  return json(200, rows[0])
}

async function handleListDeals(sql: SqlFn, params?: Record<string, string> | null) {
  const p = params || {}
  const page = parseInt(p.page || '1')
  const pageSize = parseInt(p.pageSize || '15')
  const offset = (page - 1) * pageSize
  const search = p.search || ''
  const stageFilter = p.stage || ''
  const clientFilter = p.client || ''
  const statusFilter = p.status || ''
  const sort = p.sort || 'close_date_newest'
  const dateFrom = p.date_from || null
  const dateTo = p.date_to || null
  const clientId = p.client_id || ''
  const searchPattern = search ? `%${search}%` : ''

  const countResult = await sql`
    SELECT COUNT(*)::int as total FROM deals d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE
      (${clientId} = '' OR d.client_id::text = ${clientId})
      AND (${stageFilter} = '' OR d.stage = ${stageFilter})
      AND (${clientFilter} = '' OR c.name = ${clientFilter})
      AND (
        ${statusFilter} = ''
        OR (${statusFilter} = 'Active' AND d.status NOT IN ('Won', 'Lost'))
        OR (${statusFilter} != '' AND ${statusFilter} != 'Active' AND d.status = ${statusFilter})
      )
      AND (${searchPattern} = '' OR d.name ILIKE ${searchPattern})
      AND (${dateFrom} IS NULL OR d.close_date >= ${dateFrom}::date)
      AND (${dateTo} IS NULL OR d.close_date <= ${dateTo}::date)
  `
  const total = countResult[0].total

  const rows = await sql`
    SELECT d.*, c.name as client_name
    FROM deals d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE
      (${clientId} = '' OR d.client_id::text = ${clientId})
      AND (${stageFilter} = '' OR d.stage = ${stageFilter})
      AND (${clientFilter} = '' OR c.name = ${clientFilter})
      AND (
        ${statusFilter} = ''
        OR (${statusFilter} = 'Active' AND d.status NOT IN ('Won', 'Lost'))
        OR (${statusFilter} != '' AND ${statusFilter} != 'Active' AND d.status = ${statusFilter})
      )
      AND (${searchPattern} = '' OR d.name ILIKE ${searchPattern})
      AND (${dateFrom} IS NULL OR d.close_date >= ${dateFrom}::date)
      AND (${dateTo} IS NULL OR d.close_date <= ${dateTo}::date)
    ORDER BY
      CASE WHEN ${sort} = 'close_date_oldest' THEN d.close_date END ASC NULLS LAST,
      CASE WHEN ${sort} = 'value_highest' THEN d.value END DESC NULLS LAST,
      CASE WHEN ${sort} = 'value_lowest' THEN d.value END ASC NULLS LAST,
      CASE WHEN ${sort} NOT IN ('close_date_oldest', 'value_highest', 'value_lowest') THEN d.close_date END DESC NULLS LAST
    LIMIT ${pageSize} OFFSET ${offset}
  `

  const now = new Date()
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3)
  const qYear = now.getFullYear()
  const qStartMonth = (currentQuarter - 1) * 3
  const qStart = `${qYear}-${String(qStartMonth + 1).padStart(2, '0')}-01`
  const qEndDate = new Date(qYear, qStartMonth + 3, 0)
  const qEnd = `${qYear}-${String(qStartMonth + 3).padStart(2, '0')}-${String(qEndDate.getDate()).padStart(2, '0')}`

  const summary = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status NOT IN ('Won', 'Lost'))::int as total_active,
      COALESCE(SUM(value) FILTER (WHERE status NOT IN ('Won', 'Lost')), 0)::numeric as pipeline_value,
      COUNT(*) FILTER (WHERE status = 'Won' AND close_date >= ${qStart}::date AND close_date <= ${qEnd}::date)::int as won_count,
      COALESCE(SUM(value) FILTER (WHERE status = 'Won' AND close_date >= ${qStart}::date AND close_date <= ${qEnd}::date), 0)::numeric as won_value,
      COUNT(*) FILTER (WHERE status = 'Lost' AND close_date >= ${qStart}::date AND close_date <= ${qEnd}::date)::int as lost_count,
      COALESCE(SUM(value) FILTER (WHERE status = 'Lost' AND close_date >= ${qStart}::date AND close_date <= ${qEnd}::date), 0)::numeric as lost_value
    FROM deals
  `

  const availableClients = await sql`
    SELECT DISTINCT c.name FROM clients c
    JOIN deals d ON d.client_id = c.id
    WHERE c.name IS NOT NULL
    ORDER BY c.name
  `

  return json(200, {
    deals: rows,
    total,
    page,
    pageSize,
    summary: {
      totalActive: summary[0].total_active,
      pipelineValue: Number(summary[0].pipeline_value),
      wonCount: summary[0].won_count,
      wonValue: Number(summary[0].won_value),
      lostCount: summary[0].lost_count,
      lostValue: Number(summary[0].lost_value),
      currentQuarter,
    },
    availableClients: availableClients.map((c: Record<string, string>) => c.name),
  })
}

async function handleCreateDeal(sql: SqlFn, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { name, client_id, stage, value, owner, status, probability, expected_close_date, close_date } = data
  if (!name) return json(400, { error: 'Deal name is required' })
  if (!client_id) return json(400, { error: 'Client is required' })

  const result = await sql`
    INSERT INTO deals (name, client_id, stage, value, owner, status, probability, expected_close_date, close_date)
    VALUES (
      ${name},
      ${client_id},
      ${stage || 'Lead'},
      ${value || null},
      ${owner || null},
      ${status || 'On Track'},
      ${probability === undefined ? null : probability},
      ${expected_close_date || null},
      ${close_date || null}
    )
    RETURNING *
  `

  const newDeal = result[0]

  await sql`
    INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
    VALUES (
      ${client_id},
      'deal_created',
      ${'Deal Created: ' + name},
      ${'New deal "' + name + '" was created' + (stage ? ' in stage ' + (stage || 'Lead') : '')},
      ${owner || null},
      ${newDeal.id},
      'deal'
    )
  `

  const dealWithClient = await sql`
    SELECT d.*, c.name as client_name
    FROM deals d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE d.id = ${newDeal.id}
  `

  return json(201, dealWithClient[0])
}

async function handleUpdateDeal(sql: SqlFn, id: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { name, client_id, stage, value, owner, status, probability, expected_close_date, close_date } = data

  const current = await sql`SELECT * FROM deals WHERE id = ${id}`
  if (!current.length) return json(404, { error: 'Not found' })
  const oldDeal = current[0]

  const skipName = name === undefined
  const skipClientId = client_id === undefined
  const skipStage = stage === undefined
  const skipValue = value === undefined
  const skipOwner = owner === undefined
  const skipStatus = status === undefined
  const skipProbability = probability === undefined
  const skipExpectedClose = expected_close_date === undefined
  const skipCloseDate = close_date === undefined

  await sql`
    UPDATE deals SET
      name = CASE WHEN ${skipName}::boolean THEN name ELSE ${name || null} END,
      client_id = CASE WHEN ${skipClientId}::boolean THEN client_id ELSE ${client_id || null} END,
      stage = CASE WHEN ${skipStage}::boolean THEN stage ELSE ${stage || null} END,
      value = CASE WHEN ${skipValue}::boolean THEN value ELSE ${value === '' ? null : value} END,
      owner = CASE WHEN ${skipOwner}::boolean THEN owner ELSE ${owner || null} END,
      status = CASE WHEN ${skipStatus}::boolean THEN status ELSE ${status || null} END,
      probability = CASE WHEN ${skipProbability}::boolean THEN probability ELSE ${probability === null || probability === '' ? null : probability} END,
      expected_close_date = CASE WHEN ${skipExpectedClose}::boolean THEN expected_close_date ELSE ${expected_close_date || null} END,
      close_date = CASE WHEN ${skipCloseDate}::boolean THEN close_date ELSE ${close_date || null} END,
      updated_at = now()
    WHERE id = ${id}
  `

  if (!skipStage && stage !== oldDeal.stage) {
    await sql`
      INSERT INTO deal_stage_history (deal_id, old_stage, new_stage, changed_by)
      VALUES (${id}, ${oldDeal.stage}, ${stage}, ${owner || oldDeal.owner || null})
    `
    await sql`
      INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
      VALUES (
        ${oldDeal.client_id},
        'deal_stage_change',
        ${'Deal Stage Changed: ' + (name || oldDeal.name)},
        ${'Deal "' + (name || oldDeal.name) + '" stage changed from ' + oldDeal.stage + ' to ' + stage},
        ${owner || oldDeal.owner || null},
        ${id},
        'deal'
      )
    `
  }

  const updated = await sql`
    SELECT d.*, c.name as client_name
    FROM deals d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE d.id = ${id}
  `
  if (!updated.length) return json(404, { error: 'Not found' })
  return json(200, updated[0])
}

async function handleDeleteDeal(sql: SqlFn, id: string) {
  const current = await sql`
    SELECT d.*, c.name as client_name
    FROM deals d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE d.id = ${id}
  `
  if (current.length) {
    const deal = current[0]
    await sql`
      INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
      VALUES (
        ${deal.client_id},
        'deal_deleted',
        ${'Deal Deleted: ' + deal.name},
        ${'Deal "' + deal.name + '" was deleted'},
        ${deal.owner || null},
        ${id},
        'deal'
      )
    `
  }
  await sql`DELETE FROM deals WHERE id = ${id}`
  return json(200, { deleted: true })
}

async function handleGetHistory(sql: SqlFn, dealId: string) {
  const rows = await sql`
    SELECT * FROM deal_stage_history
    WHERE deal_id = ${dealId}
    ORDER BY changed_at DESC
  `
  return json(200, { history: rows })
}

async function handleCreateHistory(sql: SqlFn, dealId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { old_stage, new_stage, changed_by } = data
  if (!new_stage) return json(400, { error: 'New stage is required' })

  const result = await sql`
    INSERT INTO deal_stage_history (deal_id, old_stage, new_stage, changed_by)
    VALUES (${dealId}, ${old_stage || null}, ${new_stage}, ${changed_by || null})
    RETURNING *
  `
  return json(201, result[0])
}

async function handleGetWriteups(sql: SqlFn, dealId: string) {
  const rows = await sql`
    SELECT * FROM deal_writeups
    WHERE deal_id = ${dealId}
    ORDER BY created_at DESC
  `
  return json(200, { writeups: rows })
}

async function handleGetWriteupVersions(sql: SqlFn, writeupId: string) {
  const current = await sql`SELECT * FROM deal_writeups WHERE id = ${writeupId}`
  if (!current.length) return json(404, { error: 'Not found' })
  return json(200, { versions: current })
}

async function handleCreateWriteup(sql: SqlFn, dealId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { title, content, author } = data
  if (!title) return json(400, { error: 'Title is required' })

  const result = await sql`
    INSERT INTO deal_writeups (deal_id, title, content, author)
    VALUES (${dealId}, ${title}, ${content || null}, ${author || null})
    RETURNING *
  `
  return json(201, result[0])
}

async function handleUpdateWriteup(sql: SqlFn, id: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { title, content } = data

  const current = await sql`SELECT * FROM deal_writeups WHERE id = ${id}`
  if (!current.length) return json(404, { error: 'Not found' })

  const newVersion = (current[0].version || 1) + 1

  await sql`
    UPDATE deal_writeups SET
      title = COALESCE(${title || null}, title),
      content = COALESCE(${content || null}, content),
      version = ${newVersion},
      updated_at = now()
    WHERE id = ${id}
  `

  const updated = await sql`SELECT * FROM deal_writeups WHERE id = ${id}`
  return json(200, updated[0])
}

async function handleGetTasks(sql: SqlFn, dealId: string) {
  const rows = await sql`
    SELECT t.*,
      c.name as client_name,
      d.name as deal_name
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE t.deal_id = ${dealId}
    ORDER BY t.completed ASC, t.due_date ASC NULLS LAST, t.created_at DESC
  `
  return json(200, { tasks: rows })
}

async function handleGetAttachments(sql: SqlFn, dealId: string) {
  const rows = await sql`
    SELECT * FROM attachments
    WHERE deal_id = ${dealId}
    ORDER BY created_at DESC
  `
  return json(200, { attachments: rows })
}

async function handleCreateAttachment(sql: SqlFn, dealId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { filename, file_type, file_url, file_size, client_id } = data
  if (!filename) return json(400, { error: 'Filename is required' })

  const result = await sql`
    INSERT INTO attachments (deal_id, client_id, filename, file_type, file_url, file_size)
    VALUES (
      ${dealId},
      ${client_id || null},
      ${filename},
      ${file_type || 'application/octet-stream'},
      ${file_url || null},
      ${file_size || null}
    )
    RETURNING *
  `
  return json(201, result[0])
}

async function handleGetContacts(sql: SqlFn, dealId: string) {
  const rows = await sql`
    SELECT dc.role,
      i.id, i.name, i.title, i.email,
      (
        SELECT c.name FROM client_individuals ci
        JOIN clients c ON ci.client_id = c.id
        WHERE ci.individual_id = i.id
        LIMIT 1
      ) as client_name
    FROM deal_contacts dc
    JOIN individuals i ON dc.individual_id = i.id
    WHERE dc.deal_id = ${dealId}
    ORDER BY i.name
  `
  return json(200, { contacts: rows })
}

async function handleAddContact(sql: SqlFn, dealId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { individual_id, role } = data
  if (!individual_id) return json(400, { error: 'Individual is required' })

  await sql`
    INSERT INTO deal_contacts (deal_id, individual_id, role)
    VALUES (${dealId}, ${individual_id}, ${role || null})
    ON CONFLICT (deal_id, individual_id) DO UPDATE SET role = ${role || null}
  `

  const rows = await sql`
    SELECT dc.role,
      i.id, i.name, i.title, i.email,
      (
        SELECT c.name FROM client_individuals ci
        JOIN clients c ON ci.client_id = c.id
        WHERE ci.individual_id = i.id
        LIMIT 1
      ) as client_name
    FROM deal_contacts dc
    JOIN individuals i ON dc.individual_id = i.id
    WHERE dc.deal_id = ${dealId} AND dc.individual_id = ${individual_id}
  `
  return json(201, rows[0])
}
