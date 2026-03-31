"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FeedbackSections from "@/components/feedback/FeedbackSections";
import AppButton from "@/components/ui/AppButton";
import { toSpeechFriendlyFeedback } from "@/lib/feedback";

export default function LearningFeedbackPage() {
  const router = useRouter();
  const [feedback] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("learningFeedback") || "";
  });

  useEffect(() => {
    if (!feedback) {
      router.push("/learning-mode/setup");
      return;
    }

    const utter = new SpeechSynthesisUtterance(
      toSpeechFriendlyFeedback(feedback),
    );
    const interviewLanguage = sessionStorage.getItem("interviewLanguage");
    utter.lang = interviewLanguage === "Hindi" ? "hi-IN" : "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);

    return () => window.speechSynthesis.cancel();
  }, [feedback, router]);

  const navigateWithSpeechStop = (href: string) => {
    window.speechSynthesis.cancel();
    router.push(href);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <h1 className="mb-8 text-4xl font-black text-black">Learning Mode Feedback</h1>

      <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <FeedbackSections feedback={feedback} />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <AppButton onClick={() => navigateWithSpeechStop("/learning-mode/setup")}>
          Start New Interview
        </AppButton>
        <AppButton onClick={() => navigateWithSpeechStop("/dashboard")}>
          Go To Dashboard
        </AppButton>
      </div>
    </div>
  );
}
