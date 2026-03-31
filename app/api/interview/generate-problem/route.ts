import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";
import {
  getDiversityPrompt,
  getFallbackProblem,
  normalizeProblemTitle,
} from "@/lib/interview-content";

interface GeneratedProblemPayload {
  title?: string;
  description?: string;
  input?: string;
  output?: string;
  constraints?: string;
}

function isValidProblem(problem: GeneratedProblemPayload) {
  return (
    problem &&
    typeof problem.title === "string" &&
    typeof problem.description === "string" &&
    typeof problem.input === "string" &&
    typeof problem.output === "string"
  );
}

function normalizeProblem(
  problem: GeneratedProblemPayload,
  difficulty: string,
  previousTitles: string[],
) {
  const fallback = getFallbackProblem(difficulty, previousTitles);

  return {
    title: problem.title?.trim() || fallback.title,
    description: problem.description?.trim() || fallback.description,
    input: problem.input?.trim() || fallback.input,
    output: problem.output?.trim() || fallback.output,
    constraints: problem.constraints?.trim() || fallback.constraints,
  };
}

export async function POST(req: Request) {
  try {
    const {
      programmingLanguage,
      difficulty,
      interviewLanguage,
      previousTitles = [],
    } = await req.json();
    const model = getGeminiModel();
    const fallbackProblem = getFallbackProblem(difficulty, previousTitles);

    const prompt = `
Generate ONE realistic coding interview question for a ${difficulty} level candidate using ${programmingLanguage}.

Requirements:
- The problem must feel like a real interview question commonly asked by companies.
- Match the difficulty strictly. Easy must stay easy, Medium must stay medium, and Hard must stay hard.
- Avoid trivial prompts such as checking even or odd numbers or summing two numbers.
- Make it different from overused toy examples.
- ${getDiversityPrompt(difficulty, previousTitles)}
- Use ${programmingLanguage} only as the target solution language, not as part of the question text.
- Write the title, description, input, output, and constraints in ${interviewLanguage}.
- If ${interviewLanguage} is Hindi, use natural spoken Hindi.

Return STRICT JSON ONLY:
{
  "title": "string",
  "description": "string",
  "input": "string",
  "output": "string",
  "constraints": "string"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(text);
      const normalizedPreviousTitles = previousTitles.map(normalizeProblemTitle);

      if (
        !isValidProblem(parsed) ||
        normalizedPreviousTitles.includes(normalizeProblemTitle(parsed.title || ""))
      ) {
        throw new Error("Invalid or repeated AI problem");
      }

      return NextResponse.json({
        problem: normalizeProblem(parsed, difficulty, previousTitles),
        source: "ai",
      });
    } catch {
      return NextResponse.json({
        problem: fallbackProblem,
        source: "fallback",
      });
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { problem: getFallbackProblem("Medium"), source: "fallback" },
      { status: 200 },
    );
  }
}
