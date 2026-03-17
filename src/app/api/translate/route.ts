import { NextRequest, NextResponse } from 'next/server';
import { translateToKorean } from '@/lib/gemini';
import { ensureInternalRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  // Security check: only allow requests from our own domain
  const authError = ensureInternalRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const translatedText = await translateToKorean(text);

    return NextResponse.json({ success: true, translation: translatedText });

  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json({ error: error.message || 'Error processing translation' }, { status: 500 });
  }
}
