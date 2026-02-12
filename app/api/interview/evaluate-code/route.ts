import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getNextGeminiKey } from '@/lib/gemini-keys';

export async function POST(request: NextRequest) {
  try {
    const { code, problem, programmingLanguage, interviewLanguage } = await request.json();

    // Use rotating API key
    const apiKey = getNextGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = interviewLanguage === 'Hindi'
      ? `निम्नलिखित ${programmingLanguage} कोड का मूल्यांकन करें:

समस्या: ${problem.title}
विवरण: ${problem.description}

कोड:
\`\`\`${programmingLanguage.toLowerCase()}
${code}
\`\`\`

इस कोड का संक्षिप्त मूल्यांकन करें (2-3 वाक्य):
- क्या यह समस्या को हल करता है?
- क्या कोड सही है?
- क्या कोई syntax errors हैं?

केवल मूल्यांकन दें।`
      : `Evaluate the following ${programmingLanguage} code:

Problem: ${problem.title}
Description: ${problem.description}

Code:
\`\`\`${programmingLanguage.toLowerCase()}
${code}
\`\`\`

Provide a brief evaluation (2-3 sentences):
- Does it solve the problem?
- Is the code correct?
- Are there any syntax errors?

Return ONLY the evaluation.`;

    const result = await model.generateContent(prompt);
    const evaluation = result.response.text().trim();

    console.log('✅ Code evaluated successfully');

    return NextResponse.json({ evaluation });
  } catch (error: any) {
    console.error('❌ Error evaluating code:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate code', message: error.message },
      { status: 500 }
    );
  }
}