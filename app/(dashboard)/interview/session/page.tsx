"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff } from "lucide-react";
import CaptionDisplay from "@/components/interview/CaptionDisplay";
import CodeEditor from "@/components/interview/CodeEditor";
import { InterviewSimulationIcon } from "@/components/icons/ModeIcons";
import AppButton from "@/components/ui/AppButton";

interface Problem {
  title: string;
  description: string;
  input: string;
  output: string;
  constraints?: string;
}

interface ConversationItem {
  speaker: "ai" | "user";
  text: string;
  timestamp: Date;
}

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

export default function InterviewSession() {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"problem" | "coding" | "interview" | "complete">(
    "problem",
  );
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewLanguage, setInterviewLanguage] = useState<"English" | "Hindi">(
    "English",
  );
  const [submittedCode, setSubmittedCode] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [currentCaption, setCurrentCaption] = useState({
    speaker: "ai" as "ai" | "user",
    text: "",
    isActive: false,
  });
  const [isListening, setIsListening] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [canUserRespond, setCanUserRespond] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const hasGeneratedProblem = useRef(false);
  const speechGuardTimeoutRef = useRef<number | null>(null);

  const getProblemHistory = useCallback(() => {
    const raw = sessionStorage.getItem("interviewProblemHistory");
    return raw ? (JSON.parse(raw) as string[]) : [];
  }, []);

  const saveProblemHistory = useCallback(
    (title: string) => {
      const nextHistory = [...getProblemHistory(), title].slice(-12);
      sessionStorage.setItem("interviewProblemHistory", JSON.stringify(nextHistory));
    },
    [getProblemHistory],
  );

  const speakText = useCallback(
    (
      text: string,
      options?: {
        unlockResponse?: boolean;
        onComplete?: () => void;
      },
    ) => {
      const cleanText = text
        .replace(/###|##|\*\*|---/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

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
      setCurrentCaption({
        speaker: "ai",
        text: cleanText,
        isActive: true,
      });

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

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = interviewLanguage === "Hindi" ? "hi-IN" : "en-US";
      utterance.rate = 0.9;
      utterance.onend = finishSpeech;
      utterance.onerror = finishSpeech;

      speechGuardTimeoutRef.current = window.setTimeout(
        finishSpeech,
        Math.max(6000, cleanText.length * 85),
      );

      window.speechSynthesis.speak(utterance);
    },
    [interviewLanguage],
  );

  const generateProblem = useCallback(
    async (lang: string, diff: string) => {
      setLoading(true);
      setError(null);

      try {
        const problemLanguage = "English";
        const response = await fetch("/api/interview/generate-problem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programmingLanguage: lang,
            difficulty: diff,
            interviewLanguage: problemLanguage,
            previousTitles: getProblemHistory(),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.problem) {
          throw new Error(data.message || "Failed to generate problem");
        }

        setProblem(data.problem);
        saveProblemHistory(data.problem.title);
        setPhase("coding");
        setCanUserRespond(false);
        setLoading(false);

        const problemText = `Here is your coding problem. ${data.problem.title}. ${data.problem.description}. Input format: ${data.problem.input}. Output format: ${data.problem.output}. ${data.problem.constraints ? `Constraints: ${data.problem.constraints}.` : ""}`;
        speakText(problemText);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to generate problem. Please try again.";
        setError(message);
        setLoading(false);
      }
    },
    [getProblemHistory, saveProblemHistory, speakText],
  );

  useEffect(() => {
    if (hasGeneratedProblem.current) return;

    const lang = sessionStorage.getItem("programmingLanguage");
    const diff = sessionStorage.getItem("difficulty");
    const intLang = sessionStorage.getItem("interviewLanguage") as "English" | "Hindi";

    if (!lang || !diff || !intLang) {
      router.push("/interview/setup");
      return;
    }

    setProgrammingLanguage(lang);
    setDifficulty(diff);
    setInterviewLanguage(intLang);
    hasGeneratedProblem.current = true;

    generateProblem(lang, diff);
  }, [generateProblem, router]);

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

    recognition.onstart = () => {
      setIsListening(true);
    };

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

  const handleCodeSubmit = async (code: string) => {
    setSubmittedCode(code);
    setPhase("interview");
    setUserResponse("");
    setCanUserRespond(false);
    await askNextQuestion(code, []);
  };

  const askNextQuestion = async (
    code: string,
    previousConversation: ConversationItem[],
  ) => {
    if (questionCount >= 5) {
      generateFeedback(previousConversation);
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
          questionNumber: questionCount + 1,
          interviewLanguage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to ask question");

      const nextConversation = [
        ...previousConversation,
        { speaker: "ai" as const, text: data.question, timestamp: new Date() },
      ];

      setConversation(nextConversation);
      setQuestionCount((prev) => prev + 1);
      setLoading(false);
      speakText(data.question, { unlockResponse: true });
    } catch {
      setLoading(false);
      setCanUserRespond(true);
      alert("Failed to ask question. Please try again.");
    }
  };

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
      askNextQuestion(submittedCode, newConversation);
    }, 250);
  };

  const generateFeedback = async (conversationData = conversation) => {
    setPhase("complete");
    setLoading(true);

    try {
      const response = await fetch("/api/interview/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: submittedCode,
          problem,
          conversation: conversationData,
          interviewLanguage,
        }),
      });

      const data = await response.json();

      sessionStorage.setItem("interviewFeedback", data.feedback);

      await fetch("/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interview",
          programmingLanguage,
          difficulty,
          interviewLanguage,
          problem,
          aiSolution: submittedCode,
          aiExplanation: "",
          conversation: conversationData,
          feedback: data.feedback,
        }),
      });

      window.speechSynthesis.cancel();
      router.push("/interview/feedback");
    } catch {
      alert("Failed to generate feedback. Please try again.");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl">
          <h2 className="mb-4 text-2xl font-bold text-black">Error</h2>
          <p className="mb-6 text-black">{error}</p>
          <div className="flex gap-3">
            <AppButton
              onClick={() => {
                setError(null);
                generateProblem(programmingLanguage, difficulty);
              }}
              fullWidth
            >
              Try Again
            </AppButton>
            <AppButton onClick={() => router.push("/interview/setup")} fullWidth>
              Go Back
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-gray-300 border-t-black" />
          <p className="text-lg text-black">
            {interviewLanguage === "Hindi"
              ? "\u0906\u092A\u0915\u093E \u0907\u0902\u091F\u0930\u0935\u094D\u092F\u0942 \u0924\u0948\u092F\u093E\u0930 \u0939\u094B \u0930\u0939\u093E \u0939\u0948..."
              : "Preparing your interview..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto mb-6 max-w-7xl rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="mb-2 flex items-center gap-3">
          <InterviewSimulationIcon size={30} />
          <h1 className="text-3xl font-black text-black">Interview Simulation Mode</h1>
        </div>
        <p className="text-sm text-gray-600">
          {programmingLanguage} • {difficulty} • {interviewLanguage}
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        {phase === "coding" && problem && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-black">Problem Statement</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-black">{problem.title}</h3>
                  <p className="leading-8 text-gray-700">{problem.description}</p>
                </div>

                <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-black">Input</p>
                  <code className="text-sm text-gray-700">{problem.input}</code>
                </div>

                <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-black">Output</p>
                  <code className="text-sm text-gray-700">{problem.output}</code>
                </div>

                {problem.constraints && (
                  <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-black">Constraints</p>
                    <p className="text-sm text-gray-700">{problem.constraints}</p>
                  </div>
                )}
              </div>
            </div>

            <CodeEditor
              language={programmingLanguage}
              onSubmit={handleCodeSubmit}
              disabled={loading || isAISpeaking}
              placeholder={`Write your ${programmingLanguage} solution here.`}
            />
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
                    <p className="text-black">{item.text}</p>
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
                    ? "Wait for the interviewer to finish speaking..."
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
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-gray-300 border-t-black" />
            <p className="text-lg text-black">Generating your feedback...</p>
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
