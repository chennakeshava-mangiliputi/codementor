import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    // Using browser's built-in TTS (fallback approach)
    // For production, you can use Google Cloud Text-to-Speech API
    
    // Return a data URL for the audio (browser will handle TTS)
    return NextResponse.json({
      audioUrl: `data:text/plain;base64,${Buffer.from(text).toString('base64')}`,
      text: text,
      language: language,
      useBrowserTTS: true, // Flag to use browser's TTS
    });
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}