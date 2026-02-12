import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";

export async function POST(req: Request) {
  try {
    const { programmingLanguage, difficulty, interviewLanguage } =
      await req.json();

    const model = getGeminiModel();

    /* ---------- PROMPT ---------- */

    const prompt = `
Generate ONE ${difficulty} coding problem in ${programmingLanguage}.

Return STRICT JSON ONLY:

{
  "problem": {
    "title": "string",
    "description": "string",
    "input": "string",
    "output": "string"
  },
  "solution": "code as a single string with \\n for new lines",
  "explanation": "detailed explanation text"
}

Language for explanation: ${interviewLanguage}

Do NOT include markdown or any text outside JSON.
`;

    /* ---------- GEMINI CALL ---------- */

    const result = await model.generateContent(prompt);

    let text = result.response.text();

    // Remove markdown if Gemini adds
    text = text.replace(/```json|```/g, "").trim();

    /* ---------- JSON PARSE ---------- */

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Gemini returned invalid JSON:", text);

      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 500 }
      );
    }

    /* ---------- VALIDATION ---------- */

    if (!parsed.problem || !parsed.solution || !parsed.explanation) {
      return NextResponse.json(
        { error: "Incomplete AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
