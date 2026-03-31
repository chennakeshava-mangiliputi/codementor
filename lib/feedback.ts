export interface FeedbackSections {
  summary: string;
  strengths: string[];
  improvements: string[];
  optimizations: string[];
  communication: string[];
}

const headings = {
  strengths: /^strengths:?$/i,
  improvements: /^(areas for improvement|improvements):?$/i,
  optimizations: /^(optimization suggestions?|optimization):?$/i,
  communication: /^communication:?$/i,
};

export function parseFeedbackSections(feedback: string): FeedbackSections {
  const cleanedLines = feedback
    .replace(/[*#]/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: FeedbackSections = {
    summary: "",
    strengths: [],
    improvements: [],
    optimizations: [],
    communication: [],
  };

  let current: keyof Omit<FeedbackSections, "summary"> | null = null;

  for (const line of cleanedLines) {
    if (headings.strengths.test(line)) {
      current = "strengths";
      continue;
    }
    if (headings.improvements.test(line)) {
      current = "improvements";
      continue;
    }
    if (headings.optimizations.test(line)) {
      current = "optimizations";
      continue;
    }
    if (headings.communication.test(line)) {
      current = "communication";
      continue;
    }

    const normalized = line.replace(/^[-•]\s*/, "").trim();

    if (!sections.summary && !current) {
      sections.summary = normalized;
      continue;
    }

    if (current) {
      sections[current].push(normalized);
    }
  }

  return sections;
}

export function toSpeechFriendlyFeedback(feedback: string) {
  const sections = parseFeedbackSections(feedback);
  const chunks = [sections.summary];

  if (sections.strengths.length) {
    chunks.push(`Strengths. ${sections.strengths.join(". ")}`);
  }
  if (sections.improvements.length) {
    chunks.push(`Areas for improvement. ${sections.improvements.join(". ")}`);
  }
  if (sections.optimizations.length) {
    chunks.push(`Optimization suggestions. ${sections.optimizations.join(". ")}`);
  }
  if (sections.communication.length) {
    chunks.push(`Communication. ${sections.communication.join(". ")}`);
  }

  return chunks
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
