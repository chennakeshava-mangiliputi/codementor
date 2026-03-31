import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";
import {
  getDiversityPrompt,
  getFallbackProblem,
  normalizeProblemTitle,
} from "@/lib/interview-content";

interface GeneratedLearningResponse {
  problem?: {
    title?: string;
    description?: string;
    input?: string;
    output?: string;
    constraints?: string;
  };
  solution?: string;
  explanation?: string;
}

function buildFallbackSolution(language: string, problemTitle: string) {
  const lower = language.toLowerCase();

  if (lower === "python") {
    return `# ${problemTitle}\ndef solve():\n    # Implement the optimal approach here\n    pass\n`;
  }
  if (lower === "java") {
    return `class Solution {\n    public void solve() {\n        // Implement the optimal approach here\n    }\n}\n`;
  }
  if (lower === "c++") {
    return `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Implement the optimal approach here\n    return 0;\n}\n`;
  }
  if (lower === "c") {
    return `#include <stdio.h>\n\nint main() {\n    // Implement the optimal approach here\n    return 0;\n}\n`;
  }
  if (lower === "sql") {
    return `-- Write the optimal SQL query for ${problemTitle}\n`;
  }

  return `// Write the optimal solution for ${problemTitle}\n`;
}

function buildFallbackExplanation(interviewLanguage: string) {
  return interviewLanguage === "Hindi"
    ? "Sabse pehle input aur constraints ko dhyan se dekhiye. Fir problem ko chhote steps mein tod kar sahi data structure aur algorithm chuniye. Optimal solution ka goal yeh hona chahiye ki time complexity aur space complexity dono practical rahein. Solve karte waqt edge cases, boundary values, aur dry run par bhi dhyan dijiye."
    : "Start by understanding the input shape and the constraints. Then break the problem into smaller steps and choose the most suitable data structure and algorithm. The goal of the optimal solution is to keep both time complexity and space complexity practical. While solving, also verify edge cases, boundary values, and a quick dry run.";
}

function extractJsonPayload(text: string) {
  const withoutFences = text.replace(/```json|```/g, "").trim();
  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return withoutFences;
  }

  return withoutFences.slice(firstBrace, lastBrace + 1);
}

function parseLearningResponse(text: string) {
  const payload = extractJsonPayload(text);
  return JSON.parse(payload) as GeneratedLearningResponse;
}

function isUsableResponse(
  parsed: GeneratedLearningResponse,
  previousTitles: string[],
) {
  const normalizedPreviousTitles = previousTitles.map(normalizeProblemTitle);

  return Boolean(
    parsed.problem?.title &&
      parsed.problem.description &&
      parsed.problem.input &&
      parsed.problem.output &&
      parsed.problem.constraints &&
      parsed.solution &&
      parsed.explanation &&
      !normalizedPreviousTitles.includes(
        normalizeProblemTitle(parsed.problem.title),
      ),
  );
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
    const attempts = 3;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const prompt = `
Generate ONE realistic coding interview problem for a ${difficulty} candidate who will solve it in ${programmingLanguage}.

Requirements:
- Use a commonly asked interview pattern.
- Match the selected difficulty strictly.
- Avoid trivial prompts such as checking even or odd numbers or summing two numbers.
- ${getDiversityPrompt(difficulty, previousTitles)}
- Write the problem statement fields in ${interviewLanguage}.
- The solution must be the best practical optimal solution for ${programmingLanguage}.
- The explanation must be natural, detailed, and speech-friendly in ${interviewLanguage}.
- The explanation must clearly cover:
  1. Core idea
  2. Step by step approach
  3. Why the approach is optimal
  4. Time complexity
  5. Space complexity
  6. Important edge cases
- Do not include markdown fences or extra text outside JSON.

Return STRICT JSON ONLY:
{
  "problem": {
    "title": "string",
    "description": "string",
    "input": "string",
    "output": "string",
    "constraints": "string"
  },
  "solution": "complete ${programmingLanguage} solution as a single string with \\n for new lines",
  "explanation": "plain text explanation in ${interviewLanguage}"
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      try {
        const parsed = parseLearningResponse(text);

        if (!isUsableResponse(parsed, previousTitles)) {
          continue;
        }

        return NextResponse.json({
          problem: {
            title: parsed.problem?.title?.trim() || fallbackProblem.title,
            description:
              parsed.problem?.description?.trim() || fallbackProblem.description,
            input: parsed.problem?.input?.trim() || fallbackProblem.input,
            output: parsed.problem?.output?.trim() || fallbackProblem.output,
            constraints:
              parsed.problem?.constraints?.trim() || fallbackProblem.constraints,
          },
          solution: parsed.solution?.trim(),
          explanation: parsed.explanation?.trim(),
          source: "ai",
        });
      } catch {
        continue;
      }
    }

    return NextResponse.json({
      problem: fallbackProblem,
      solution: buildFallbackSolution(programmingLanguage, fallbackProblem.title),
      explanation: buildFallbackExplanation(interviewLanguage),
      source: "fallback",
    });
  } catch (error) {
    console.error(error);
    const fallbackProblem = getFallbackProblem("Medium");

    return NextResponse.json({
      problem: fallbackProblem,
      solution: buildFallbackSolution("python", fallbackProblem.title),
      explanation: buildFallbackExplanation("English"),
      source: "fallback",
    });
  }
}
