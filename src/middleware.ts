import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (Note: This is per-instance in serverless)
const ipCache = new Map<string, { count: number; lastReset: number }>();
const authIpCache = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 1000; // 1000 requests per minute per IP (relaxed to accommodate image fetches)
const AUTH_MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute for auth endpoints

function isRateLimited(ip: string, pathname: string): boolean {
  const now = Date.now();
  const userData = ipCache.get(ip);

  if (!userData || now - userData.lastReset > RATE_LIMIT_WINDOW) {
    ipCache.set(ip, { count: 1, lastReset: now });
    return false;
  }

  userData.count += 1;
  return userData.count > MAX_REQUESTS_PER_WINDOW;
}

function isAuthRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = authIpCache.get(ip);

  if (!userData || now - userData.lastReset > RATE_LIMIT_WINDOW) {
    authIpCache.set(ip, { count: 1, lastReset: now });
    return false;
  }

  userData.count += 1;
  return userData.count > AUTH_MAX_REQUESTS_PER_WINDOW;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth 엔드포인트 전용 엄격한 Rate Limiting (분당 10회)
  if (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/verify-2fa' ||
    pathname === '/api/auth/request-reset' ||
    pathname === '/api/auth/reset-password'
  ) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : (request.headers.get('x-real-ip') || 'anonymous');

    if (isAuthRateLimited(ip)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Only apply to MLS API routes
  if (pathname.startsWith('/api/mls-') || pathname.startsWith('/api/property-')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
    // Get IP safely (Next.js 16/Vercel)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : (request.headers.get('x-real-ip') || 'anonymous');

    // 1. Basic Rate Limiting
    if (isRateLimited(ip, pathname)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Bot Detection (Simple)
    const bots = [
      'bot', 'spider', 'crawler', 'scraper', 'python', 'curl', 'postman',
      'axios', 'wget', 'headless', 'selenium', 'puppeteer', 'libwww', 'scrapy'
    ];
    if (bots.some(bot => userAgent.includes(bot))) {
      return new NextResponse(JSON.stringify({ error: 'Bot access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. SEC-FETCH Headers (Modern Browsers)
    // For API calls from our frontend, this should ideally be 'same-origin'
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized cross-origin request' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Origin/Referer Validation (STRICT)
    const allowedDomains = [
      'sellbyeunice.com',
      'localhost',
      '127.0.0.1'
    ];

    // REQUIRE at least one to match our domain
    const originMatch = origin && allowedDomains.some(domain => origin.includes(domain));
    const refererMatch = referer && allowedDomains.some(domain => referer.includes(domain));

    // If both are missing OR both don't match, block it
    // Exception: Allow if it's a direct browser hit (no origin/referer) ONLY if UA is not a bot? 
    // Actually, for /api/ we should ALWAYS expect a referer from our page.
    if (!originMatch && !refererMatch) {
      return new NextResponse(JSON.stringify({ error: 'Direct API access is restricted' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
