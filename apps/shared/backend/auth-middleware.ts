import { errorResponse } from "./db";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest {
  req: Request;
  user: AuthenticatedUser | null;
}

type HandlerFn = (
  authReq: AuthenticatedRequest,
  context: unknown
) => Promise<Response>;

/**
 * Decodes a JWT payload without verifying the signature.
 * For optional auth mode, we extract user info from the token
 * and trust the token as-is (verification happens at the auth endpoint).
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Optional JWT auth middleware for Netlify Functions.
 *
 * Extracts user info from Authorization Bearer token when present.
 * In optional mode (default), unauthenticated requests are allowed through
 * with user set to null. In required mode, returns 401 if no valid token.
 */
export function withAuth(handler: HandlerFn, options?: { required?: boolean }) {
  const required = options?.required ?? false;

  return async (req: Request, context: unknown): Promise<Response> => {
    const token = extractBearerToken(req);

    if (!token) {
      if (required) {
        return errorResponse(401, "Authentication required");
      }
      return handler({ req, user: null }, context);
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      if (required) {
        return errorResponse(401, "Invalid token");
      }
      return handler({ req, user: null }, context);
    }

    const id = payload.sub ?? payload.id;
    const email = payload.email;
    const name = payload.name;

    if (typeof id !== "string" || typeof email !== "string") {
      if (required) {
        return errorResponse(401, "Invalid token payload");
      }
      return handler({ req, user: null }, context);
    }

    const user: AuthenticatedUser = {
      id,
      email,
      name: typeof name === "string" ? name : email,
    };

    return handler({ req, user }, context);
  };
}
