/**
 * Gemini API Key Rotation + Model Provider
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
];

const validKeys = GEMINI_API_KEYS.filter(key => key && key !== "undefined");

if (validKeys.length === 0) {
  throw new Error("No Gemini API keys configured");
}

let currentKeyIndex = 0;

export function getNextGeminiKey(): string {
  const key = validKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % validKeys.length;
  return key;
}

/**
 * ✅ THIS FIXES YOUR ERROR
 */
export function getGeminiModel() {
  const key = getNextGeminiKey();

  const genAI = new GoogleGenerativeAI(key);

  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
}
