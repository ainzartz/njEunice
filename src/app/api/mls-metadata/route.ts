import { NextRequest, NextResponse } from 'next/server';
import { getMlsMetadata } from '@/lib/mls-metadata';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  try {
    const lastUpdated = await getMlsMetadata();

    // Fallback if no update has happened yet
    const displayDate = lastUpdated ? lastUpdated.toISOString() : new Date().toISOString();

    return NextResponse.json({
      success: true,
      lastUpdated: displayDate
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
