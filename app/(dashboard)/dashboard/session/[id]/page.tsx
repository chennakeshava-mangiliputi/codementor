"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FeedbackSections from "@/components/feedback/FeedbackSections";

interface SessionDetail {
  _id: string;
  mode: string;
  programmingLanguage: string;
  difficulty: string;
  problem?: {
    title?: string;
    description?: string;
  };
  feedback: string;
}

export default function FullSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session/list")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.sessions as SessionDetail[]).find((s) => s._id === id);
        setSession(found);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-black">Session not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 font-semibold text-black transition hover:underline"
        >
          Back to Dashboard
        </button>

        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <span className="mb-4 inline-block rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-black">
            {session.mode.toUpperCase()}
          </span>
          <h1 className="mb-4 text-3xl font-bold text-black">
            {session.problem?.title}
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            {session.programmingLanguage} • {session.difficulty}
          </p>
          <p className="leading-relaxed text-gray-700">{session.problem?.description}</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-black">AI Feedback</h2>
          <FeedbackSections feedback={session.feedback} />
        </div>
      </div>
    </div>
  );
}
