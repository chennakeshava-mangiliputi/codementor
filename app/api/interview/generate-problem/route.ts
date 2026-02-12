import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";

export async function POST(req: Request) {

  try {

    const { programmingLanguage, difficulty, interviewLanguage } =
      await req.json();

    const model = getGeminiModel();

    const prompt = `
Generate ONE ${difficulty} coding problem in ${programmingLanguage}.

Return STRICT JSON ONLY:

{
"title": "string",
"description": "string",
"input": "string",
"output": "string"
}

No explanation. No markdown. No examples.
`;

    const result = await model.generateContent(prompt);

    let text = result.response.text();

    // 🔥 remove markdown if Gemini adds it
    text = text.replace(/```json|```/g, "").trim();

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

    // 🔥 validate required fields
    if (!parsed.title || !parsed.description) {
      return NextResponse.json(
        { error: "Incomplete AI problem" },
        { status: 500 }
      );
    }

    return NextResponse.json({ problem: parsed });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
