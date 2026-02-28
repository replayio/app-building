import type { Handler } from '@netlify/functions';

const REJECTED_KEYWORDS = ['personal', 'private data', 'hack', 'exploit', 'scrape personal', 'surveillance'];

const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: { name: string; description: string; requirements: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!body.name || !body.description) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Name and description are required' }),
    };
  }

  const lowerDesc = (body.description + ' ' + (body.requirements || '')).toLowerCase();
  const isRejected = REJECTED_KEYWORDS.some((kw) => lowerDesc.includes(kw));

  if (isRejected) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        accepted: false,
        reason: 'The request contains specifications for handling sensitive personal information without adequate security protocols. Please revise your request to comply with data privacy guidelines.',
        appId: null,
      }),
    };
  }

  const appId = body.name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      accepted: true,
      reason: null,
      appId,
    }),
  };
};

export { handler };
