import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";

export async function POST(req: Request) {
  try {
    const { code, problem, conversation, questionNumber, interviewLanguage } =
      await req.json();

    const model = getGeminiModel();

    const history = conversation
      .map(
        (c: any) =>
          `${c.speaker === "ai" ? "Interviewer" : "Candidate"}: ${c.text}`
      )
      .join("\n");

    const prompt =
      interviewLanguage === "Hindi"
        ? `
आप एक वास्तविक टेक्निकल इंटरव्यूअर हैं।

नियम:
- पहले उम्मीदवार के पिछले उत्तर पर छोटा रिएक्शन दें
- फिर अगला सवाल पूछें
- कोई markdown या symbols इस्तेमाल ना करें

समस्या:
${problem.title}
${problem.description}

उम्मीदवार का कोड:
${code}

पिछली बातचीत:
${history || "कोई नहीं"}

अब प्रश्न नंबर ${questionNumber} पूछें।
`
        : `
You are a real technical interviewer.

Rules:
- First react shortly to previous answer
- Then ask next question
- No markdown or symbols

Problem:
${problem.title}
${problem.description}

Candidate Code:
${code}

Conversation:
${history || "None"}

Ask question number ${questionNumber}.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/[*#]/g, "").trim();

    return NextResponse.json({ question: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
