"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Volume2 } from "lucide-react";
import CaptionDisplay from "@/components/interview/CaptionDisplay";
import CodeEditor from "@/components/interview/CodeEditor";
import { LearningModeIcon } from "@/components/icons/ModeIcons";
import AppButton from "@/components/ui/AppButton";
import { getSpeechLang, sanitizeSpeechText } from "@/lib/speech";

type Problem = {
  title: string;
  description: string;
  input?: string;
  output?: string;
  constraints?: string;
};

type ConversationItem = {
  speaker: "ai" | "user";
  text: string;
  timestamp: Date;
};

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: Array<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechRecognitionCtor {
  new (): SpeechRecognitionLike;
}

function getMatchingVoice(language: "English" | "Hindi") {
  if (typeof window === "undefined") return null;

  const target = getSpeechLang(language).toLowerCase();
  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find((voice) => voice.lang.toLowerCase() === target) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(target.split("-")[0])) ||
    null
  );
}

function splitSpeechText(text: string, maxChunkLength = 220) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized.split(/(?<=[.!?।])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (!sentence) continue;

    if (`${current} ${sentence}`.trim().length <= maxChunkLength) {
      current = `${current} ${sentence}`.trim();
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (sentence.length <= maxChunkLength) {
      current = sentence;
      continue;
    }

    const words = sentence.split(" ");
    let wordChunk = "";

    for (const word of words) {
      if (`${wordChunk} ${word}`.trim().length <= maxChunkLength) {
        wordChunk = `${wordChunk} ${word}`.trim();
      } else {
        if (wordChunk) chunks.push(wordChunk);
        wordChunk = word;
      }
    }

    current = wordChunk;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function sanitizeExplanationText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*#_~]/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/[|<>[\]{}]/g, " ")
    .replace(/[:;]\s*\)/g, " ")
    .replace(/\bO\(([^)]+)\)/gi, "Big O of $1")
    .replace(/\bN\b/g, "N")
    .replace(/\bchar_counts\b/g, "character counts")
    .replace(/\bindex\b/gi, "index")
    .replace(/\btime and space complexity\b/gi, "time and space complexity")
    .replace(/\s+/g, " ")
    .trim();
}

const MAX_QUESTIONS = 5;

export default function LearningSessionPage() {
  const router = useRouter();
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewLanguage, setInterviewLanguage] = useState<"English" | "Hindi">(
    "English",
  );
  const [problem, setProblem] = useState<Problem | null>(null);
  const [aiSolution, setAiSolution] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"explain" | "interview" | "complete">(
    "explain",
  );
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [submittedCode, setSubmittedCode] = useState("");
  const [currentCaption, setCurrentCaption] = useState({
    speaker: "ai" as "ai" | "user",
    text: "",
    isActive: false,
  });
  const [isListening, setIsListening] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [canUserRespond, setCanUserRespond] = useState(false);
  const [isExplanationSpeaking, setIsExplanationSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const hasInitialized = useRef(false);
  const speechGuardTimeoutRef = useRef<number | null>(null);
  const explanationPlaybackIdRef = useRef(0);

  const getProblemHistory = useCallback(() => {
    const raw = sessionStorage.getItem("learningProblemHistory");
    return raw ? (JSON.parse(raw) as string[]) : [];
  }, []);

  const saveProblemHistory = useCallback((title: string) => {
    const nextHistory = [...getProblemHistory(), title].slice(-12);
    sessionStorage.setItem("learningProblemHistory", JSON.stringify(nextHistory));
  }, [getProblemHistory]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const lang = sessionStorage.getItem("programmingLanguage");
    const diff = sessionStorage.getItem("difficulty");
    const iLang = sessionStorage.getItem("interviewLanguage") as "English" | "Hindi" | null;

    if (!lang || !diff || !iLang) {
      router.push("/learning-mode/setup");
      return;
    }

    setProgrammingLanguage(lang);
    setDifficulty(diff);
    setInterviewLanguage(iLang);

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/learning-mode/generate-solution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          programmingLanguage: lang,
          difficulty: diff,
          interviewLanguage: iLang,
          previousTitles: getProblemHistory(),
        }),
      });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to generate solution");

        setProblem(data.problem);
        saveProblemHistory(data.problem.title);
        setAiSolution(data.solution || "");
        setAiExplanation(data.explanation || "");
        sessionStorage.setItem("aiSolution", data.solution || "");
        sessionStorage.setItem("aiExplanation", data.explanation || "");
        sessionStorage.setItem("mode", "learning");
        setCanUserRespond(false);
        setLoading(false);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to generate learning content";
        setError(message);
        setLoading(false);
      }
    })();
  }, [getProblemHistory, router, saveProblemHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = interviewLanguage === "Hindi" ? "hi-IN" : "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setUserResponse((prev) => `${prev} ${finalTranscript}`.trim());
      }

      const captionText = `${finalTranscript}${interimTranscript}`.trim();
      if (captionText) {
        setCurrentCaption({
          speaker: "user",
          text: captionText,
          isActive: true,
        });
      }
    };
    recognition.onend = () => {
      setIsListening(false);
      setCurrentCaption({
        speaker: "user",
        text: "",
        isActive: false,
      });
    };
    recognition.onerror = () => {
      setIsListening(false);
      setCurrentCaption({
        speaker: "user",
        text: "",
        isActive: false,
      });
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [interviewLanguage]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        if (speechGuardTimeoutRef.current) {
          window.clearTimeout(speechGuardTimeoutRef.current);
        }
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const speakText = useCallback((
    text: string,
    options?: {
      unlockResponse?: boolean;
      onComplete?: () => void;
      showCaption?: boolean;
    },
  ) => {
    const cleanText = sanitizeSpeechText(text);

    if (!cleanText) {
      setIsAISpeaking(false);
      if (options?.unlockResponse) {
        setCanUserRespond(true);
      }
      options?.onComplete?.();
      return;
    }

    if (speechGuardTimeoutRef.current) {
      window.clearTimeout(speechGuardTimeoutRef.current);
    }

    window.speechSynthesis.cancel();
    setIsAISpeaking(true);
    setCanUserRespond(false);
    if (options?.showCaption !== false) {
      setCurrentCaption({
        speaker: "ai",
        text: cleanText,
        isActive: true,
      });
    } else {
      setCurrentCaption({
        speaker: "ai",
        text: "",
        isActive: false,
      });
    }

    const finishSpeech = () => {
      if (speechGuardTimeoutRef.current) {
        window.clearTimeout(speechGuardTimeoutRef.current);
        speechGuardTimeoutRef.current = null;
      }

      setIsAISpeaking(false);
      setCurrentCaption({
        speaker: "ai",
        text: "",
        isActive: false,
      });

      if (options?.unlockResponse) {
        setCanUserRespond(true);
      }

      options?.onComplete?.();
    };

      const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = getSpeechLang(interviewLanguage);
    const voice = getMatchingVoice(interviewLanguage);
    if (voice) {
      utter.voice = voice;
    }
    utter.rate = 0.9;
    utter.onend = finishSpeech;
    utter.onerror = finishSpeech;

    speechGuardTimeoutRef.current = window.setTimeout(
      finishSpeech,
      Math.max(6000, cleanText.length * 85),
    );

    window.speechSynthesis.speak(utter);
    window.speechSynthesis.resume();
  }, [interviewLanguage]);

  const playExplanation = useCallback((text: string) => {
    const cleanedText = sanitizeSpeechText(sanitizeExplanationText(text));
    const chunks = splitSpeechText(cleanedText);
    if (!chunks.length || typeof window === "undefined") {
      return;
    }

    explanationPlaybackIdRef.current += 1;
    const playbackId = explanationPlaybackIdRef.current;
    const voice = getMatchingVoice(interviewLanguage);
    const lang = getSpeechLang(interviewLanguage);

    window.speechSynthesis.cancel();
    setIsExplanationSpeaking(true);

    const speakChunk = (index: number) => {
      if (playbackId !== explanationPlaybackIdRef.current) return;

      if (index >= chunks.length) {
        setIsExplanationSpeaking(false);
        setCurrentCaption({
          speaker: "ai",
          text: "",
          isActive: false,
        });
        return;
      }

      setCurrentCaption({
        speaker: "ai",
        text: chunks[index],
        isActive: true,
      });

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = lang;
      utterance.rate = 0.9;
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => speakChunk(index + 1);
      utterance.onerror = () => {
        setIsExplanationSpeaking(false);
        setCurrentCaption({
          speaker: "ai",
          text: "",
          isActive: false,
        });
      };

      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.resume();
    };

    speakChunk(0);
  }, [interviewLanguage]);

  const displayExplanation = sanitizeExplanationText(aiExplanation);

  const startListening = () => {
    if (!recognitionRef.current || isListening || isAISpeaking || !canUserRespond) return;
    try {
      recognitionRef.current.start();
    } catch {}
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  };

  const startInterviewOnSolution = async () => {
    if (!aiSolution) {
      alert("AI solution missing");
      return;
    }

    setSubmittedCode(aiSolution);
    sessionStorage.setItem("submittedCode", aiSolution);
    setConversation([]);
    setQuestionCount(0);
    setPhase("interview");
    setCanUserRespond(false);
    await askNextQuestion(aiSolution, [], 1);
  };

  const askNextQuestion = async (
    code: string,
    previousConversation: ConversationItem[],
    nextQuestionNumber?: number,
  ) => {
    const questionNumber = nextQuestionNumber ?? questionCount + 1;

    if (questionNumber > MAX_QUESTIONS) {
      await generateFeedback(code, previousConversation);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/interview/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          problem,
          conversation: previousConversation,
          questionNumber,
          interviewLanguage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to ask question");

      const nextConversation = [
        ...previousConversation,
        { speaker: "ai" as const, text: data.question, timestamp: new Date() },
      ];

      setConversation(nextConversation);
      setQuestionCount(questionNumber);
      setLoading(false);
      speakText(data.question, { unlockResponse: true });
    } catch {
      setLoading(false);
      setCanUserRespond(true);
      alert("Failed to generate the next question. Please try again.");
    }
  };

  const submitResponse = () => {
    const finalResponse = userResponse.trim();
    if (!finalResponse) {
      alert("Please provide a response before submitting");
      return;
    }

    if (isListening) stopListening();

    const newConversation = [
      ...conversation,
      { speaker: "user" as const, text: finalResponse, timestamp: new Date() },
    ];

    setConversation(newConversation);
    setUserResponse("");
    setCanUserRespond(false);
    setCurrentCaption({ speaker: "ai", text: "", isActive: false });

    setTimeout(() => {
      askNextQuestion(submittedCode || aiSolution, newConversation, questionCount + 1);
    }, 250);
  };

  const generateFeedback = async (
    code: string,
    conversationData: ConversationItem[],
  ) => {
    setPhase("complete");
    setLoading(true);

    try {
      const res = await fetch("/api/interview/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          problem,
          conversation: conversationData,
          interviewLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate feedback");

      sessionStorage.setItem("learningFeedback", data.feedback || "");

      await fetch("/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "learning",
          programmingLanguage,
          difficulty,
          interviewLanguage,
          problem,
          aiSolution,
          aiExplanation,
          conversation: conversationData,
          feedback: data.feedback || "",
        }),
      });

      window.speechSynthesis.cancel();
      router.push("/learning-mode/feedback");
    } catch {
      setLoading(false);
      alert("Failed to generate feedback. Please try again.");
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-gray-200 border-t-black" />
          <p className="font-semibold text-gray-700">Generating learning content...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl">
          <p className="mb-4 font-semibold text-black">
            {error || "Failed to load learning content"}
          </p>
          <AppButton onClick={() => router.push("/learning-mode/setup")}>
            Go back to setup
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto mb-6 max-w-7xl rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <LearningModeIcon size={30} />
          <h1 className="text-3xl font-black text-black">Learning Mode</h1>
        </div>
        <p className="text-sm text-gray-600">
          {programmingLanguage} • {difficulty} • {interviewLanguage}
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        {phase === "explain" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-black">Problem Statement</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-black">{problem.title}</h3>
                  <p className="leading-8 text-gray-700">{problem.description}</p>
                </div>

                {problem.input && (
                  <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-black">Input</p>
                    <p className="text-sm text-gray-700">{problem.input}</p>
                  </div>
                )}

                {problem.output && (
                  <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-black">Output</p>
                    <p className="text-sm text-gray-700">{problem.output}</p>
                  </div>
                )}

                {problem.constraints && (
                  <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-black">Constraints</p>
                    <p className="text-sm text-gray-700">{problem.constraints}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="font-semibold text-black">AI Optimal Solution</h3>
                <p className="mt-1 text-xs text-gray-600">
                  This is the AI generated optimal code in read-only mode.
                </p>
              </div>

              <CodeEditor language={programmingLanguage} initialCode={aiSolution} readOnly />

              <div>
                <h4 className="mb-2 text-lg font-semibold text-black">Explanation</h4>
                <div className="max-h-[400px] w-full overflow-y-auto rounded-2xl border border-gray-300 bg-gray-50 p-4 text-gray-700 leading-8 break-words">
                  {displayExplanation || "No explanation provided."}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <AppButton
                  onClick={() => playExplanation(displayExplanation)}
                  disabled={!displayExplanation}
                  className="sm:min-w-48"
                >
                  <span className="inline-flex items-center gap-2">
                    <Volume2 size={18} />
                    {isExplanationSpeaking ? "Playing Explanation..." : "Play Explanation"}
                  </span>
                </AppButton>

                <AppButton onClick={startInterviewOnSolution} fullWidth>
                  Start Interview Simulation
                </AppButton>
              </div>
            </div>
          </div>
        )}

        {phase === "interview" && (
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="max-h-96 overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-black">Conversation</h2>

              <div className="space-y-4">
                {conversation.map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-4 ${
                      item.speaker === "ai"
                        ? "border-gray-300 bg-gray-50"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {item.speaker === "ai" ? "AI" : "You"}
                    </p>
                    <p className="whitespace-pre-wrap text-black">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-black">Your Response</h3>

              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder={
                  !canUserRespond || isAISpeaking
                    ? "Wait for the AI to finish speaking..."
                    : "Type or speak your answer here..."
                }
                disabled={isAISpeaking || !canUserRespond}
                className="mb-4 h-32 w-full resize-none rounded-2xl border border-gray-300 bg-white p-4 text-black outline-none transition focus:border-black disabled:bg-gray-100 disabled:text-gray-500"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <AppButton
                  onClick={isListening ? stopListening : startListening}
                  disabled={isAISpeaking || loading || !canUserRespond}
                  className="sm:min-w-56"
                >
                  <span className="inline-flex items-center gap-2">
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    {isListening ? "Stop Speaking" : "Start Speaking"}
                  </span>
                </AppButton>

                <AppButton
                  onClick={submitResponse}
                  disabled={!userResponse.trim() || isAISpeaking || loading || !canUserRespond}
                  fullWidth
                >
                  Submit Response
                </AppButton>
              </div>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <div className="mt-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-gray-300 border-t-black" />
            <h3 className="text-lg font-semibold text-black">
              Interview completed. Generating feedback...
            </h3>
          </div>
        )}

      </div>

      <CaptionDisplay
        speaker={currentCaption.speaker}
        text={currentCaption.text}
        isActive={currentCaption.isActive}
        language={interviewLanguage}
      />
    </div>
  );
}
