import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates if the request is coming from an authorized origin (the website itself).
 * This helps prevent unauthorized external systems from consuming internal APIs.
 */
export function validateRequestOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // Get the allowed site domain from environment or default to production/local
  const allowedHost = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sellbyeunice.com';
  const isLocal = process.env.NODE_ENV === 'development';

  // In production, we expect either Origin or Referer to match our domain
  // In development, we allow localhost/127.0.0.1
  const isAuthorized = (
    (origin && (origin.includes(allowedHost) || (isLocal && origin.includes('localhost')))) ||
    (referer && (referer.includes(allowedHost) || (isLocal && referer.includes('localhost'))))
  );

  if (!isAuthorized && !isLocal) {
    return {
      isValid: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized access. External API calls are not permitted.' },
        { status: 403 }
      )
    };
  }

  return { isValid: true };
}

/**
 * Higher-level check that can be used directly in route handlers
 */
export function ensureInternalRequest(req: NextRequest) {
  const auth = validateRequestOrigin(req);
  if (!auth.isValid) {
    return auth.errorResponse;
  }
  return null;
}
