import { NextResponse } from 'next/server';
import { getMlsMetadata } from '@/lib/mls-metadata';

export async function GET() {
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
