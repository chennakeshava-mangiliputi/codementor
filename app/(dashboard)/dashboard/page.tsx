"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

interface SessionSummary {
  _id: string;
  mode: string;
  createdAt: string;
  programmingLanguage: string;
  difficulty: string;
  problem?: {
    title?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    fetch("/api/session/list")
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []));
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto mb-10 max-w-7xl">
        <button
          onClick={() => router.push("/welcome")}
          className="mb-4 inline-flex items-center gap-2 font-semibold text-gray-700 transition hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Home Page
        </button>

        <div className="flex items-center gap-3">
          <LayoutDashboard size={22} />
          <h1 className="text-4xl font-bold text-black">Dashboard</h1>
        </div>

        <p className="mt-2 text-gray-600">
          Track your progress and continue mastering interviews.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
        {[
          {
            title: "Interview Simulation Mode",
            description: "Practice AI powered coding interviews",
            href: "/interview/setup",
          },
          {
            title: "Learning Mode",
            description: "Learn optimal solutions with AI explanations",
            href: "/learning-mode/setup",
          },
        ].map((card) => (
          <button
            key={card.title}
            onClick={() => router.push(card.href)}
            className="rounded-3xl border border-gray-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-black"
          >
            <h3 className="mb-3 text-2xl font-bold text-black">{card.title}</h3>
            <p className="text-gray-700">{card.description}</p>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-7xl">
        <h2 className="mb-6 text-2xl font-bold text-black">Recent Sessions</h2>

        <div className="space-y-6">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <span className="mb-3 inline-block rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-black">
                {session.mode.toUpperCase()}
              </span>

              <h3 className="mb-2 text-xl font-semibold text-black">
                {session.problem?.title || "Untitled Problem"}
              </h3>

              <p className="mb-2 text-sm text-gray-600">
                {session.programmingLanguage} • {session.difficulty}
              </p>

              <p className="mb-4 text-xs text-gray-600">
                {new Date(session.createdAt).toLocaleString()}
              </p>

              <button
                onClick={() => router.push(`/dashboard/session/${session._id}`)}
                className="font-semibold text-black transition hover:underline"
              >
                View Full Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
