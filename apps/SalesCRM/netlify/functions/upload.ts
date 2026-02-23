import { UTApi } from 'uploadthing/server'

const utapi = new UTApi()

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
    }

    const result = await utapi.uploadFiles(file)
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), { status: 500 })
    }

    return Response.json({
      url: result.data.ufsUrl,
      key: result.data.key,
      name: result.data.name,
      size: result.data.size,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
