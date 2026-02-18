const AUTH_TOKEN_KEY = 'auth-token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

// Patch window.fetch to automatically inject Authorization header
// on requests to /.netlify/functions/
const originalFetch = window.fetch.bind(window)
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  if (url.includes('/.netlify/functions/')) {
    const token = getToken()
    if (token) {
      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${token}`)
      return originalFetch(input, { ...init, headers })
    }
  }
  return originalFetch(input, init)
}
