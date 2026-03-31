"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FeedbackSections from "@/components/feedback/FeedbackSections";
import AppButton from "@/components/ui/AppButton";
import { toSpeechFriendlyFeedback } from "@/lib/feedback";

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("interviewFeedback") || "";
  });

  useEffect(() => {
    if (!feedback) return;

    const utter = new SpeechSynthesisUtterance(toSpeechFriendlyFeedback(feedback));
    const lang = sessionStorage.getItem("interviewLanguage");

    utter.lang = lang === "Hindi" ? "hi-IN" : "en-US";
    utter.rate = 0.9;

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);

    return () => speechSynthesis.cancel();
  }, [feedback]);

  const navigateWithSpeechStop = (href: string) => {
    speechSynthesis.cancel();
    router.push(href);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <h1 className="mb-8 text-center text-4xl font-black text-black">
        Interview Feedback
      </h1>

      <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <FeedbackSections feedback={feedback} />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <AppButton onClick={() => navigateWithSpeechStop("/interview/setup")}>
          Start New Interview
        </AppButton>
        <AppButton onClick={() => navigateWithSpeechStop("/dashboard")}>
          Go To Dashboard
        </AppButton>
      </div>
    </div>
  );
}
