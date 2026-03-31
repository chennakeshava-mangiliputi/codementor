export type SupportedSpeechLanguage = "English" | "Hindi";

export function getSpeechLang(language: SupportedSpeechLanguage) {
  return language === "Hindi" ? "hi-IN" : "en-US";
}

const devanagariMap: Record<string, string> = {
  "\u0905": "a",
  "\u0906": "aa",
  "\u0907": "i",
  "\u0908": "ee",
  "\u0909": "u",
  "\u090A": "oo",
  "\u090F": "e",
  "\u0910": "ai",
  "\u0913": "o",
  "\u0914": "au",
  "\u090B": "ri",
  "\u0915": "ka",
  "\u0916": "kha",
  "\u0917": "ga",
  "\u0918": "gha",
  "\u0919": "ng",
  "\u091A": "cha",
  "\u091B": "chha",
  "\u091C": "ja",
  "\u091D": "jha",
  "\u091E": "ny",
  "\u091F": "ta",
  "\u0920": "tha",
  "\u0921": "da",
  "\u0922": "dha",
  "\u0923": "na",
  "\u0924": "ta",
  "\u0925": "tha",
  "\u0926": "da",
  "\u0927": "dha",
  "\u0928": "na",
  "\u092A": "pa",
  "\u092B": "pha",
  "\u092C": "ba",
  "\u092D": "bha",
  "\u092E": "ma",
  "\u092F": "ya",
  "\u0930": "ra",
  "\u0932": "la",
  "\u0935": "va",
  "\u0936": "sha",
  "\u0937": "sha",
  "\u0938": "sa",
  "\u0939": "ha",
  "\u0933": "la",
  "\u093E": "a",
  "\u093F": "i",
  "\u0940": "ee",
  "\u0941": "u",
  "\u0942": "oo",
  "\u0947": "e",
  "\u0948": "ai",
  "\u094B": "o",
  "\u094C": "au",
  "\u0943": "ri",
  "\u0902": "n",
  "\u0903": "h",
  "\u0901": "n",
  "\u094D": "",
  "\u0964": ".",
};

function verbalizeHindiExpression(text: string) {
  return text
    .replace(/\bn\b/gi, "\u090F\u0928")
    .replace(/\bf\b/gi, "\u090F\u092B")
    .replace(/>=/g, " \u0938\u0947 \u092C\u0921\u093C\u093E \u092F\u093E \u092C\u0930\u093E\u092C\u0930 ")
    .replace(/<=/g, " \u0938\u0947 \u091B\u094B\u091F\u093E \u092F\u093E \u092C\u0930\u093E\u092C\u0930 ")
    .replace(/!=/g, " \u092C\u0930\u093E\u092C\u0930 \u0928\u0939\u0940\u0902 ")
    .replace(/==/g, " \u092C\u0930\u093E\u092C\u0930 ")
    .replace(/=/g, " \u092C\u0930\u093E\u092C\u0930 ")
    .replace(/\+/g, " \u092A\u094D\u0932\u0938 ")
    .replace(/-/g, " \u092E\u093E\u0907\u0928\u0938 ")
    .replace(/\*/g, " \u0917\u0941\u0923\u093E ")
    .replace(/\//g, " \u092D\u093E\u0917\u093E ")
    .replace(/%/g, " \u092E\u0949\u0921\u094D\u092F\u0942\u0932\u094B ")
    .replace(/>/g, " \u0938\u0947 \u092C\u0921\u093C\u093E ")
    .replace(/</g, " \u0938\u0947 \u091B\u094B\u091F\u093E ")
    .replace(/\(/g, " ")
    .replace(/\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeHindiSpeechText(text: string) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\bHere is your coding problem\b/gi, "\u092F\u0939 \u0906\u092A\u0915\u093E \u0915\u094B\u0921\u093F\u0902\u0917 \u092A\u094D\u0930\u0936\u094D\u0928 \u0939\u0948")
    .replace(/\bYeh aapka coding problem hai\b/gi, "\u092F\u0939 \u0906\u092A\u0915\u093E \u0915\u094B\u0921\u093F\u0902\u0917 \u092A\u094D\u0930\u0936\u094D\u0928 \u0939\u0948")
    .replace(/\bInput format\b/gi, "\u0907\u0928\u092A\u0941\u091F")
    .replace(/\bOutput format\b/gi, "\u0906\u0909\u091F\u092A\u0941\u091F")
    .replace(/\bConstraints?\b/gi, "\u0938\u0940\u092E\u093E\u090F\u0902")
    .replace(/\bTrue\b/gi, "\u0938\u0924\u094D\u092F")
    .replace(/\bFalse\b/gi, "\u0905\u0938\u0924\u094D\u092F")
    .replace(/\bpositive integer\b/gi, "\u0927\u0928\u093E\u0924\u094D\u092E\u0915 \u092A\u0942\u0930\u094D\u0923\u093E\u0902\u0915")
    .replace(/\bnegative integer\b/gi, "\u090B\u0923\u093E\u0924\u094D\u092E\u0915 \u092A\u0942\u0930\u094D\u0923\u093E\u0902\u0915")
    .replace(/\bprime number\b/gi, "\u092A\u094D\u0930\u093E\u0907\u092E \u0938\u0902\u0916\u094D\u092F\u093E")
    .replace(/\bdivisors?\b/gi, "\u092D\u093E\u091C\u0915")
    .replace(/\bcoding problem\b/gi, "\u0915\u094B\u0921\u093F\u0902\u0917 \u092A\u094D\u0930\u0936\u094D\u0928")
    .replace(/\bF\s*\(([^)]+)\)/gi, (_, expr: string) => {
      const spokenExpr = verbalizeHindiExpression(expr);
      return `\u090F\u092B ${spokenExpr}`;
    })
    .replace(/\bO\s*\(([^)]+)\)/gi, (_, expr: string) => {
      const spokenExpr = verbalizeHindiExpression(expr);
      return `\u092C\u093F\u0917 \u0913 ${spokenExpr}`;
    })
    .replace(/[=:<>+\-*/%]+/g, (match) => ` ${verbalizeHindiExpression(match)} `)
    .replace(/\bn\b/gi, "\u090F\u0928")
    .replace(/\bf\b/gi, "\u090F\u092B")
    .replace(/[()[\]{}]/g, " ")
    .replace(/'/g, " ")
    .replace(/"/g, " ")
    .replace(/:/g, "\u0964 ")
    .replace(/;/g, "\u0964 ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeSpeechText(
  text: string,
  language: SupportedSpeechLanguage = "English",
) {
  const normalized = language === "Hindi" ? sanitizeHindiSpeechText(text) : text;

  return normalized
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[_*#~]/g, " ")
    .replace(/[|[\]{}]/g, " ")
    .replace(/[-–—]+/g, language === "Hindi" ? " \u092E\u093E\u0907\u0928\u0938 " : " ")
    .replace(/\//g, language === "Hindi" ? " \u092F\u093E " : " or ")
    .replace(/\bC\+\+\b/g, "C plus plus")
    .replace(/\bC#\b/g, "C sharp")
    .replace(/\bSQL\b/g, "S Q L")
    .replace(/\bAPI\b/g, "A P I")
    .replace(/\bchar_counts\b/g, "character counts")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSpeechPlaybackText(
  text: string,
  language: SupportedSpeechLanguage = "English",
) {
  if (language !== "Hindi") {
    return text;
  }

  return text
    .split("")
    .map((char) => devanagariMap[char] ?? char)
    .join("")
    .replace(/\u0938\u0924\u094D\u092F/g, "satya")
    .replace(/\u0905\u0938\u0924\u094D\u092F/g, "asatya")
    .replace(/\u0938\u0940\u092E\u093E\u090F\u0902/g, "seemaayein")
    .replace(/\u0907\u0928\u092A\u0941\u091F/g, "input")
    .replace(/\u0906\u0909\u091F\u092A\u0941\u091F/g, "output")
    .replace(/\u092A\u094D\u0930\u0936\u094D\u0928/g, "prashn")
    .replace(/\u0938\u0942\u091A\u0940/g, "soochi")
    .replace(/\u092A\u0942\u0930\u094D\u0923\u093E\u0902\u0915/g, "poornank")
    .replace(/\s+/g, " ")
    .trim();
}
