'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FullSessionPage() {

  const { id } = useParams();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("/api/session/list")
      .then(res => res.json())
      .then(data => {

        const found = data.sessions.find((s:any) => s._id === id);
        setSession(found);
        setLoading(false);

      });

  }, [id]);

  /* ================= LOADING SCREEN ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-red-400">Session not found</p>
      </div>
    );
  }

  /* ================= MAIN UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">

      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition"
        >
          ← Back to Dashboard
        </button>

        {/* Problem Card */}
        <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700 backdrop-blur-lg shadow-lg mb-8">

          {/* Mode Badge */}
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${
              session.mode === "interview"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {session.mode.toUpperCase()}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            {session.problem?.title}
          </h1>

          {/* Metadata */}
          <p className="text-slate-400 text-sm mb-6">
            {session.programmingLanguage} • {session.difficulty}
          </p>

          {/* Description */}
          <p className="text-slate-300 leading-relaxed">
            {session.problem?.description}
          </p>

        </div>

        {/* Feedback Card */}
        <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700 backdrop-blur-lg shadow-lg">

          <h2 className="text-2xl font-bold text-white mb-6">
            AI Feedback
          </h2>

          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {session.feedback}
          </p>

        </div>

      </div>

    </div>
  );
}
