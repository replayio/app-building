import { requiresAuth, type OptionalAuthRequest } from '../utils/auth'

async function handler(req: OptionalAuthRequest) {
  return new Response(
    JSON.stringify({
      id: req.user!.id,
      email: req.user!.email,
      name: req.user!.name,
      avatar_url: req.user!.avatar_url,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

export default requiresAuth(handler)
