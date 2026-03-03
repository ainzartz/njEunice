import { NextResponse } from 'next/server';
import { translateToKorean } from '@/lib/gemini';

export async function POST(request: Request) {
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
