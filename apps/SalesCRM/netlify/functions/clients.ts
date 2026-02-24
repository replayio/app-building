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

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const sql = neon(process.env.DATABASE_URL!)
  const segments = event.path.split('/').filter(Boolean)
  const resourceId = segments[3] || null
  const subResource = segments[4] || null
  const subResourceId = segments[5] || null
  const params = event.queryStringParameters || {}

  try {
    if (event.httpMethod === 'GET') {
      if (resourceId) {
        if (subResource === 'deals') {
          return await handleGetClientDeals(sql, resourceId)
        }
        if (subResource === 'people') {
          return await handleGetClientPeople(sql, resourceId)
        }
        if (subResource === 'attachments') {
          return await handleGetClientAttachments(sql, resourceId)
        }
        if (subResource === 'timeline') {
          return await handleGetTimeline(sql, resourceId)
        }
        if (!subResource) {
          const rows = await sql`
            SELECT c.*,
              (SELECT COALESCE(json_agg(t.name), '[]'::json) FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags
            FROM clients c WHERE c.id = ${resourceId}
          `
          if (!rows.length) return json(404, { error: 'Not found' })
          return json(200, rows[0])
        }
      }

      if (params.format === 'csv') {
        return await handleExport(sql, params)
      }

      return await handleList(sql, params)
    }

    if (event.httpMethod === 'POST') {
      if (resourceId && subResource === 'people') {
        return await handleAddPerson(sql, resourceId, event.body)
      }
      if (resourceId && subResource === 'attachments') {
        return await handleCreateClientAttachment(sql, resourceId, event.body)
      }
      if (resourceId && subResource === 'timeline') {
        return await handleCreateTimelineEvent(sql, resourceId, event.body)
      }
      if (params.action === 'import') {
        return await handleImport(sql, event.body)
      }
      return await handleCreate(sql, event.body)
    }

    if (event.httpMethod === 'PUT') {
      if (!resourceId) return json(400, { error: 'Client ID required' })
      return await handleUpdate(sql, resourceId, event.body)
    }

    if (event.httpMethod === 'DELETE') {
      if (resourceId && subResource === 'people' && subResourceId) {
        return await handleRemovePerson(sql, resourceId, subResourceId)
      }
      if (resourceId && subResource === 'attachments' && subResourceId) {
        await sql`DELETE FROM attachments WHERE id = ${subResourceId} AND client_id = ${resourceId}`
        return json(200, { deleted: true })
      }
      if (resourceId && !subResource) {
        await sql`DELETE FROM clients WHERE id = ${resourceId}`
        return json(200, { deleted: true })
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

type SqlFn = ReturnType<typeof neon>

async function handleGetClientDeals(sql: SqlFn, clientId: string) {
  const rows = await sql`
    SELECT d.*, c.name as client_name
    FROM deals d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE d.client_id = ${clientId}
    ORDER BY d.created_at DESC
  `
  return json(200, { deals: rows })
}

async function handleGetClientPeople(sql: SqlFn, clientId: string) {
  const rows = await sql`
    SELECT i.id, i.name, i.title, i.email, i.phone, ci.role, ci.is_primary
    FROM client_individuals ci
    JOIN individuals i ON ci.individual_id = i.id
    WHERE ci.client_id = ${clientId}
    ORDER BY ci.is_primary DESC, i.name
  `
  return json(200, { people: rows })
}

async function handleAddPerson(sql: SqlFn, clientId: string, body: string | null) {
  const data = JSON.parse(body || '{}')

  if (data.create_new) {
    const { name, title, email, phone, role } = data
    if (!name) return json(400, { error: 'Name is required' })

    const result = await sql`
      INSERT INTO individuals (name, title, email, phone)
      VALUES (${name}, ${title || null}, ${email || null}, ${phone || null})
      RETURNING *
    `
    const newPerson = result[0]

    await sql`
      INSERT INTO client_individuals (client_id, individual_id, role)
      VALUES (${clientId}, ${newPerson.id}, ${role || null})
      ON CONFLICT (client_id, individual_id) DO UPDATE SET role = ${role || null}
    `

    await sql`
      INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
      VALUES (
        ${clientId},
        'contact_added',
        ${'Contact Added: ' + name},
        ${'New contact "' + name + '" was added' + (role ? ' as ' + role : '')},
        ${null},
        ${newPerson.id},
        'individual'
      )
    `

    return json(201, { ...newPerson, role })
  }

  const { individual_id, role } = data
  if (!individual_id) return json(400, { error: 'Person is required' })

  await sql`
    INSERT INTO client_individuals (client_id, individual_id, role)
    VALUES (${clientId}, ${individual_id}, ${role || null})
    ON CONFLICT (client_id, individual_id) DO UPDATE SET role = ${role || null}
  `

  const person = await sql`
    SELECT i.id, i.name, i.title, i.email, i.phone, ci.role, ci.is_primary
    FROM client_individuals ci
    JOIN individuals i ON ci.individual_id = i.id
    WHERE ci.client_id = ${clientId} AND ci.individual_id = ${individual_id}
  `

  await sql`
    INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
    VALUES (
      ${clientId},
      'contact_added',
      ${'Contact Added: ' + (person[0]?.name || 'Unknown')},
      ${'Contact "' + (person[0]?.name || 'Unknown') + '" was associated' + (role ? ' as ' + role : '')},
      ${null},
      ${individual_id},
      'individual'
    )
  `

  return json(201, person[0])
}

async function handleRemovePerson(sql: SqlFn, clientId: string, individualId: string) {
  const person = await sql`
    SELECT i.name FROM individuals i WHERE i.id = ${individualId}
  `
  const personName = person[0]?.name || 'Unknown'

  await sql`DELETE FROM client_individuals WHERE client_id = ${clientId} AND individual_id = ${individualId}`

  await sql`
    INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
    VALUES (
      ${clientId},
      'contact_removed',
      ${'Contact Removed: ' + personName},
      ${'Contact "' + personName + '" was removed'},
      ${null},
      ${individualId},
      'individual'
    )
  `

  return json(200, { deleted: true })
}

async function handleGetClientAttachments(sql: SqlFn, clientId: string) {
  const rows = await sql`
    SELECT a.*, d.name as deal_name
    FROM attachments a
    LEFT JOIN deals d ON a.deal_id = d.id
    WHERE a.client_id = ${clientId}
    ORDER BY a.created_at DESC
  `
  return json(200, { attachments: rows })
}

async function handleCreateClientAttachment(sql: SqlFn, clientId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { filename, file_type, file_url, file_size, deal_id } = data
  if (!filename) return json(400, { error: 'Filename is required' })

  const result = await sql`
    INSERT INTO attachments (client_id, deal_id, filename, file_type, file_url, file_size)
    VALUES (
      ${clientId},
      ${deal_id || null},
      ${filename},
      ${file_type || 'application/octet-stream'},
      ${file_url || null},
      ${file_size || null}
    )
    RETURNING *
  `

  await sql`
    INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
    VALUES (
      ${clientId},
      'attachment_uploaded',
      ${'Attachment Uploaded: ' + filename},
      ${'File "' + filename + '" was uploaded'},
      ${null},
      ${result[0].id},
      'attachment'
    )
  `

  return json(201, result[0])
}

async function handleGetTimeline(sql: SqlFn, clientId: string) {
  const rows = await sql`
    SELECT * FROM timeline_events
    WHERE client_id = ${clientId}
    ORDER BY event_date DESC
    LIMIT 100
  `
  return json(200, { events: rows })
}

async function handleCreateTimelineEvent(sql: SqlFn, clientId: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { event_type, title, description, actor, reference_id, reference_type } = data
  if (!event_type || !title) return json(400, { error: 'Event type and title are required' })

  const result = await sql`
    INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
    VALUES (
      ${clientId},
      ${event_type},
      ${title},
      ${description || null},
      ${actor || null},
      ${reference_id || null},
      ${reference_type || null}
    )
    RETURNING *
  `
  return json(201, result[0])
}

async function handleList(sql: SqlFn, params: Record<string, string>) {
  const page = parseInt(params.page || '1')
  const pageSize = parseInt(params.pageSize || '50')
  const offset = (page - 1) * pageSize
  const search = params.search || ''
  const statusFilter = params.status || ''
  const tagFilter = params.tag || ''
  const sourceFilter = params.source || ''
  const sort = params.sort || 'recently_updated'
  const searchPattern = search ? `%${search}%` : ''

  const countResult = await sql`
    SELECT COUNT(*)::int as total FROM clients c
    WHERE
      (${statusFilter} = '' OR c.status = ${statusFilter})
      AND (${sourceFilter} = '' OR c.source = ${sourceFilter})
      AND (${tagFilter} = '' OR EXISTS (
        SELECT 1 FROM client_tags ct JOIN tags t ON ct.tag_id = t.id
        WHERE ct.client_id = c.id AND t.name = ${tagFilter}
      ))
      AND (${searchPattern} = '' OR c.name ILIKE ${searchPattern}
        OR EXISTS (SELECT 1 FROM client_tags ct2 JOIN tags t2 ON ct2.tag_id = t2.id
                   WHERE ct2.client_id = c.id AND t2.name ILIKE ${searchPattern})
        OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
                   WHERE ci.client_id = c.id AND i.name ILIKE ${searchPattern})
      )
  `
  const total = countResult[0].total

  const rows = await sql`
    SELECT c.*,
      (SELECT COALESCE(json_agg(t.name), '[]'::json)
       FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags,
      (SELECT json_build_object('name', i.name, 'role', COALESCE(ci.role, ''))
       FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
       WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact,
      (SELECT json_build_object('count', COUNT(*)::int, 'totalValue', COALESCE(SUM(d.value), 0)::numeric)
       FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('Closed Won', 'Closed Lost')) as open_deals,
      (SELECT json_build_object('title', tk.title, 'dueDate', tk.due_date)
       FROM tasks tk WHERE tk.client_id = c.id AND tk.completed = false
       ORDER BY tk.due_date ASC NULLS LAST LIMIT 1) as next_task
    FROM clients c
    WHERE
      (${statusFilter} = '' OR c.status = ${statusFilter})
      AND (${sourceFilter} = '' OR c.source = ${sourceFilter})
      AND (${tagFilter} = '' OR EXISTS (
        SELECT 1 FROM client_tags ct JOIN tags t ON ct.tag_id = t.id
        WHERE ct.client_id = c.id AND t.name = ${tagFilter}
      ))
      AND (${searchPattern} = '' OR c.name ILIKE ${searchPattern}
        OR EXISTS (SELECT 1 FROM client_tags ct2 JOIN tags t2 ON ct2.tag_id = t2.id
                   WHERE ct2.client_id = c.id AND t2.name ILIKE ${searchPattern})
        OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
                   WHERE ci.client_id = c.id AND i.name ILIKE ${searchPattern})
      )
    ORDER BY
      CASE WHEN ${sort} = 'name_asc' THEN c.name END ASC NULLS LAST,
      CASE WHEN ${sort} = 'name_desc' THEN c.name END DESC NULLS LAST,
      c.updated_at DESC NULLS LAST
    LIMIT ${pageSize} OFFSET ${offset}
  `

  const allTags = await sql`SELECT DISTINCT name FROM tags ORDER BY name`
  const allSources = await sql`
    SELECT DISTINCT source FROM clients WHERE source IS NOT NULL AND source != '' ORDER BY source
  `

  return json(200, {
    clients: rows,
    total,
    page,
    pageSize,
    availableTags: allTags.map((t: Record<string, string>) => t.name),
    availableSources: allSources.map((s: Record<string, string>) => s.source),
  })
}

async function handleExport(sql: SqlFn, params: Record<string, string>) {
  const exportParams = { ...params, page: '1', pageSize: '10000' }
  delete exportParams.format
  const search = exportParams.search || ''
  const statusFilter = exportParams.status || ''
  const tagFilter = exportParams.tag || ''
  const sourceFilter = exportParams.source || ''
  const sort = exportParams.sort || 'recently_updated'
  const searchPattern = search ? `%${search}%` : ''

  const rows = await sql`
    SELECT c.*,
      (SELECT COALESCE(json_agg(t.name), '[]'::json)
       FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags,
      (SELECT json_build_object('name', i.name, 'role', COALESCE(ci.role, ''))
       FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
       WHERE ci.client_id = c.id AND ci.is_primary = true LIMIT 1) as primary_contact,
      (SELECT json_build_object('count', COUNT(*)::int, 'totalValue', COALESCE(SUM(d.value), 0)::numeric)
       FROM deals d WHERE d.client_id = c.id AND d.stage NOT IN ('Closed Won', 'Closed Lost')) as open_deals,
      (SELECT json_build_object('title', tk.title, 'dueDate', tk.due_date)
       FROM tasks tk WHERE tk.client_id = c.id AND tk.completed = false
       ORDER BY tk.due_date ASC NULLS LAST LIMIT 1) as next_task
    FROM clients c
    WHERE
      (${statusFilter} = '' OR c.status = ${statusFilter})
      AND (${sourceFilter} = '' OR c.source = ${sourceFilter})
      AND (${tagFilter} = '' OR EXISTS (
        SELECT 1 FROM client_tags ct JOIN tags t ON ct.tag_id = t.id
        WHERE ct.client_id = c.id AND t.name = ${tagFilter}
      ))
      AND (${searchPattern} = '' OR c.name ILIKE ${searchPattern}
        OR EXISTS (SELECT 1 FROM client_tags ct2 JOIN tags t2 ON ct2.tag_id = t2.id
                   WHERE ct2.client_id = c.id AND t2.name ILIKE ${searchPattern})
        OR EXISTS (SELECT 1 FROM client_individuals ci JOIN individuals i ON ci.individual_id = i.id
                   WHERE ci.client_id = c.id AND i.name ILIKE ${searchPattern})
      )
    ORDER BY
      CASE WHEN ${sort} = 'name_asc' THEN c.name END ASC NULLS LAST,
      CASE WHEN ${sort} = 'name_desc' THEN c.name END DESC NULLS LAST,
      c.updated_at DESC NULLS LAST
  `

  const csvHeader = 'Client Name,Type,Status,Tags,Source,Primary Contact,Open Deals,Next Task'
  const csvRows = rows.map((r: Record<string, unknown>) => {
    const tags = (r.tags as string[]) || []
    const pc = r.primary_contact as { name: string; role: string } | null
    const od = r.open_deals as { count: number; totalValue: number } | null
    const nt = r.next_task as { title: string; dueDate: string } | null
    return [
      `"${String(r.name || '').replace(/"/g, '""')}"`,
      r.type,
      r.status,
      `"${tags.join(', ')}"`,
      r.source || '',
      pc ? `${pc.name} (${pc.role || 'N/A'})` : '',
      od ? `${od.count} ($${od.totalValue})` : '0',
      nt ? `${nt.title} - ${nt.dueDate || 'No date'}` : 'N/A',
    ].join(',')
  })

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="clients.csv"',
      ...corsHeaders,
    },
    body: [csvHeader, ...csvRows].join('\n'),
  }
}

async function handleCreate(sql: SqlFn, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { name, type, status, tags, source, source_detail, campaign, channel, date_acquired, industry } = data
  if (!name) return json(400, { error: 'Client name is required' })

  const result = await sql`
    INSERT INTO clients (name, type, status, source, source_detail, campaign, channel, date_acquired, industry)
    VALUES (${name}, ${type || 'Organization'}, ${status || 'Prospect'}, ${source || null}, ${source_detail || null}, ${campaign || null}, ${channel || null}, ${date_acquired || null}, ${industry || null})
    RETURNING *
  `
  const newClient = result[0]

  if (tags && tags.length) {
    for (const tagName of tags) {
      await sql`INSERT INTO tags (name) VALUES (${tagName}) ON CONFLICT (name) DO NOTHING`
      const tagRows = await sql`SELECT id FROM tags WHERE name = ${tagName}`
      if (tagRows.length) {
        await sql`INSERT INTO client_tags (client_id, tag_id) VALUES (${newClient.id}, ${tagRows[0].id}) ON CONFLICT DO NOTHING`
      }
    }
  }

  return json(201, newClient)
}

async function handleImport(sql: SqlFn, body: string | null) {
  const data = JSON.parse(body || '{}')
  const clients = data.clients || []
  let imported = 0

  for (const c of clients) {
    if (!c.name) continue
    const inserted = await sql`
      INSERT INTO clients (name, type, status, source, source_detail, campaign, channel, date_acquired, industry)
      VALUES (${c.name}, ${c.type || 'Organization'}, ${c.status || 'Prospect'}, ${c.source || null}, ${c.source_detail || null}, ${c.campaign || null}, ${c.channel || null}, ${c.date_acquired || null}, ${c.industry || null})
      RETURNING id
    `
    const clientId = inserted[0].id

    if (c.tags) {
      const tagNames = typeof c.tags === 'string'
        ? c.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : c.tags
      for (const tagName of tagNames) {
        await sql`INSERT INTO tags (name) VALUES (${tagName}) ON CONFLICT (name) DO NOTHING`
        const tagRows = await sql`SELECT id FROM tags WHERE name = ${tagName}`
        if (tagRows.length) {
          await sql`INSERT INTO client_tags (client_id, tag_id) VALUES (${clientId}, ${tagRows[0].id}) ON CONFLICT DO NOTHING`
        }
      }
    }
    imported++
  }

  return json(200, { imported })
}

async function handleUpdate(sql: SqlFn, id: string, body: string | null) {
  const data = JSON.parse(body || '{}')
  const { name, type, status, tags, source, source_detail, campaign, channel, date_acquired, industry } = data

  const current = await sql`SELECT * FROM clients WHERE id = ${id}`
  if (!current.length) return json(404, { error: 'Not found' })
  const oldClient = current[0]

  const skipSourceDetail = source_detail === undefined
  const skipCampaign = campaign === undefined
  const skipChannel = channel === undefined
  const skipDateAcquired = date_acquired === undefined
  const skipIndustry = industry === undefined

  await sql`
    UPDATE clients SET
      name = COALESCE(${name || null}, name),
      type = COALESCE(${type || null}, type),
      status = COALESCE(${status || null}, status),
      source = ${source === undefined ? null : (source || null)},
      source_detail = CASE WHEN ${skipSourceDetail}::boolean THEN source_detail ELSE ${source_detail || null} END,
      campaign = CASE WHEN ${skipCampaign}::boolean THEN campaign ELSE ${campaign || null} END,
      channel = CASE WHEN ${skipChannel}::boolean THEN channel ELSE ${channel || null} END,
      date_acquired = CASE WHEN ${skipDateAcquired}::boolean THEN date_acquired ELSE ${date_acquired || null} END,
      industry = CASE WHEN ${skipIndustry}::boolean THEN industry ELSE ${industry || null} END,
      updated_at = now()
    WHERE id = ${id}
  `

  if (status && status !== oldClient.status) {
    await sql`
      INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
      VALUES (
        ${id},
        'status_changed',
        ${'Status Changed'},
        ${'Status changed from "' + oldClient.status + '" to "' + status + '"'},
        ${null},
        ${id},
        'client'
      )
    `
  }

  if (name && name !== oldClient.name) {
    await sql`
      INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
      VALUES (
        ${id},
        'name_changed',
        ${'Name Changed'},
        ${'Client name changed from "' + oldClient.name + '" to "' + name + '"'},
        ${null},
        ${id},
        'client'
      )
    `
  }

  if (!skipCampaign || !skipChannel || !skipSourceDetail || source !== undefined) {
    const changes: string[] = []
    if (!skipCampaign && (campaign || null) !== (oldClient.campaign || null)) {
      changes.push(`Campaign changed from '${oldClient.campaign || 'None'}' to '${campaign || 'None'}'`)
    }
    if (!skipChannel && (channel || null) !== (oldClient.channel || null)) {
      changes.push(`Channel changed from '${oldClient.channel || 'None'}' to '${channel || 'None'}'`)
    }
    if (source !== undefined && (source || null) !== (oldClient.source || null)) {
      changes.push(`Source changed from '${oldClient.source || 'None'}' to '${source || 'None'}'`)
    }
    if (!skipSourceDetail && (source_detail || null) !== (oldClient.source_detail || null)) {
      changes.push(`Source detail changed from '${oldClient.source_detail || 'None'}' to '${source_detail || 'None'}'`)
    }
    if (changes.length) {
      await sql`
        INSERT INTO timeline_events (client_id, event_type, title, description, actor, reference_id, reference_type)
        VALUES (
          ${id},
          'source_info_updated',
          ${'Source Info Updated'},
          ${changes.join('. ')},
          ${null},
          ${id},
          'client'
        )
      `
    }
  }

  if (tags !== undefined) {
    await sql`DELETE FROM client_tags WHERE client_id = ${id}`
    for (const tagName of tags) {
      await sql`INSERT INTO tags (name) VALUES (${tagName}) ON CONFLICT (name) DO NOTHING`
      const tagRows = await sql`SELECT id FROM tags WHERE name = ${tagName}`
      if (tagRows.length) {
        await sql`INSERT INTO client_tags (client_id, tag_id) VALUES (${id}, ${tagRows[0].id}) ON CONFLICT DO NOTHING`
      }
    }
  }

  const updated = await sql`
    SELECT c.*,
      (SELECT COALESCE(json_agg(t.name), '[]'::json) FROM client_tags ct JOIN tags t ON ct.tag_id = t.id WHERE ct.client_id = c.id) as tags
    FROM clients c WHERE c.id = ${id}
  `
  return json(200, updated[0])
}
