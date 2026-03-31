import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";

interface ConversationTurn {
  speaker: "ai" | "user";
  text: string;
}

const englishFallback = `The candidate showed a workable understanding of the problem and stayed engaged throughout the interview.
Strengths
- Identified the main goal of the problem and stayed focused on it.
- Responded to follow-up questions without losing the core approach.
- Kept a cooperative and interview-appropriate tone.
Areas for Improvement
- Needs to explain implementation decisions more clearly.
- Should validate edge cases before finalizing the answer.
Optimization Suggestions
- Summarize time and space complexity before submitting the final approach.
Communication
- Communication was polite and understandable, but confidence can improve with more practice.`;

const hindiFallback = `उम्मीदवार ने समस्या की दिशा समझी और इंटरव्यू के दौरान जुड़ा रहा।
Strengths
- समस्या का मुख्य लक्ष्य सही तरीके से पहचाना।
- फॉलो अप प्रश्नों के दौरान बातचीत जारी रखी।
- विनम्र और इंटरव्यू के अनुसार व्यवहार रखा।
Areas for Improvement
- समाधान के कदम और स्पष्ट तरीके से समझाने की जरूरत है।
- अंतिम उत्तर देने से पहले edge cases पर ध्यान देना चाहिए।
Optimization Suggestions
- अंतिम समाधान से पहले time complexity और space complexity स्पष्ट बताएं।
Communication
- संचार अच्छा था, लेकिन आत्मविश्वास को और मजबूत किया जा सकता है।`;

export async function POST(req: Request) {
  let selectedLanguage: "English" | "Hindi" = "English";

  try {
    const { code, problem, conversation, interviewLanguage } = await req.json();
    selectedLanguage = interviewLanguage;
    const model = getGeminiModel();

    const history = conversation
      .map((c: ConversationTurn) => `${c.speaker}: ${c.text}`)
      .join("\n");

    const prompt =
      interviewLanguage === "Hindi"
        ? `
उम्मीदवार के इंटरव्यू का साफ, पेशेवर और speech-friendly feedback दें।

नियम:
- कोई markdown नहीं
- कोई ###, **, emojis या अजीब symbols नहीं
- केवल plain text headings और hyphen bullets प्रयोग करें
- Heading नाम बिल्कुल यही रखें:
Strengths
Areas for Improvement
Optimization Suggestions
Communication
- पहले एक summary line दें
- हर section के नीचे 1 से 3 concise bullet points दें
`
        : `
Give clear, professional, speech-friendly interview feedback.

Rules:
- No markdown
- No ###, **, emojis, or decorative symbols
- Use only plain text headings and hyphen bullets
- Use these exact headings:
Strengths
Areas for Improvement
Optimization Suggestions
Communication
- Start with one summary sentence
- Under each section provide 1 to 3 concise bullet points
`;

    const result = await model.generateContent(
      `${prompt}

Problem:
${problem?.title}
${problem?.description}

Code:
${code}

Conversation:
${history}`,
    );

    const feedback = result.response
      .text()
      .replace(/[*#]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({
      feedback: feedback || (interviewLanguage === "Hindi" ? hindiFallback : englishFallback),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      feedback: selectedLanguage === "Hindi" ? hindiFallback : englishFallback,
    });
  }
}
