import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini-keys";

export async function POST(req: Request) {
  try {
    const { code, problem, conversation, interviewLanguage } =
      await req.json();

    const model = getGeminiModel();

    const history = conversation
      .map((c: any) => `${c.speaker}: ${c.text}`)
      .join("\n");

    /* ---------- STRICT FEEDBACK PROMPT ---------- */

    const prompt =
      interviewLanguage === "Hindi"
        ? `
उम्मीदवार के इंटरव्यू का छोटा और स्पष्ट फीडबैक दें।

नियम:
- फीडबैक 8 से 10 लाइनों के अंदर होना चाहिए
- भाषा सरल और इंटरव्यू जैसी हो
- कोई markdown या special symbols ना दें
- slash शब्द जैसे input/output का उपयोग ना करें
- केवल सामान्य वाक्य प्रयोग करें
- तकनीकी शब्द सरल रखें

संरचना इस प्रकार रखें:

शुरुआत में 1 लाइन प्रदर्शन का सार

Strengths
तीन पॉइंट दें (✔ से शुरू करें)

Improvements
एक या दो पॉइंट दें (⚠ से शुरू करें)

Optimization Suggestion
कोड को बेहतर बनाने का एक आसान सुझाव दें

अंत में confidence और communication पर एक छोटा सार दें
`
        : `
Give short and clear interview feedback.

Rules:
- Feedback must be within 8 to 10 lines only
- Keep language simple and professional
- Do NOT use markdown or special symbols like hashes or stars
- Do NOT use slash words like input/output
- Make feedback speech friendly
- Avoid complex technical wording

Follow this structure:

Start with one summary sentence about performance

Strengths
Give three bullet points starting with ✔

Improvements
Give one or two bullet points starting with ⚠

Optimization Suggestion
Give one simple improvement suggestion for the code

End with one short summary about confidence and communication
`;

    const result = await model.generateContent(
      `${prompt}

Problem:
${problem.title}

Code:
${code}

Conversation:
${history}`
    );

    /* ---------- CLEAN OUTPUT ---------- */

    const feedback = result.response
      .text()
      .replace(/[*#]/g, "")
      .replace(/input\/output/gi, "input and output")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
