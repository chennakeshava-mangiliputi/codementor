import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";

interface ConversationTurn {
  speaker: "ai" | "user";
  text: string;
}

export async function POST(req: Request) {
  try {
    const { code, problem, conversation, questionNumber, interviewLanguage } =
      await req.json();

    const model = getGeminiModel();
    const history = conversation
      .map(
        (c: ConversationTurn) =>
          `${c.speaker === "ai" ? "Interviewer" : "Candidate"}: ${c.text}`,
      )
      .join("\n");

    const prompt =
      interviewLanguage === "Hindi"
        ? `
You are a real technical interviewer.

Rules:
- Reply completely in natural spoken Hindi.
- First react briefly to the candidate's previous answer.
- Then ask the next interview question.
- Do not use markdown, bullets, code formatting, or special symbols.
- Keep the wording speech-friendly.

Problem:
${problem.title}
${problem.description}

Candidate Code:
${code}

Conversation:
${history || "None"}

Ask question number ${questionNumber}.
`
        : `
You are a real technical interviewer.

Rules:
- First react shortly to the previous answer.
- Then ask the next question.
- Do not use markdown or special symbols.
- Keep the wording speech-friendly.

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
    const text = result.response
      .text()
      .replace(/[*#`]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return NextResponse.json({ question: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
