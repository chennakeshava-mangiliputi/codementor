'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {

  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/session/list")
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []));
  }, []);

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">

    {/* Hero Header */}
{/* Hero Header */}
<div className="max-w-7xl mx-auto mb-10">

  {/* Back Button */}
  <button
    onClick={() => router.push('/welcome')}
    className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition font-semibold"
  >
    ← Back to Home Page
  </button>

  <h1 className="text-4xl font-bold text-white mb-2">
    📊 Your Dashboard
  </h1>

  <p className="text-slate-400">
    Track your progress and continue mastering interviews
  </p>

</div>


    {/* Mode Cards */}
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

      {/* Interview Card */}
      <div
  onClick={() => router.push('/interview/setup')}
  className="group cursor-pointer p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 backdrop-blur-lg hover:scale-[1.02] transition-all shadow-lg hover:shadow-blue-500/20"
>

        <div className="flex items-center gap-4 mb-4">

  {/* Icon */}
  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300
">
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1m2-1v2.5M2 7l2-1m-2 1l2 1m-2-1v2.5" />
    </svg>
  </div>

  {/* Title */}
  <h3 className="text-xl font-semibold text-white">
    Interview Simulation
  </h3>

</div>


        <p className="text-slate-300">
          Practice AI powered coding interviews
        </p>
      </div>

      {/* Learning Card */}
      <div
  onClick={() => router.push('/learning-mode/setup')}
  className="group cursor-pointer p-8 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 backdrop-blur-lg hover:scale-[1.02] transition-all shadow-lg hover:shadow-emerald-500/20"
>

        <div className="flex items-center gap-4 mb-4">

  {/* Icon */}
  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300
">
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25c0 5.25 4.5 10 10 10s10-4.75 10-10c0-6.252-4.5-11-10-11z" />
    </svg>
  </div>

  {/* Title */}
  <h3 className="text-xl font-semibold text-white">
    Learning Mode
  </h3>

</div>


        <p className="text-slate-300">
          Learn optimal solutions with AI explanations
        </p>
      </div>

    </div>

    {/* Sessions Section */}
    <div className="max-w-7xl mx-auto">

      <h2 className="text-2xl font-bold text-white mb-6">
        📚 Recent Sessions
      </h2>

      <div className="space-y-6">

        {sessions.map((session: any) => (

          <div
            key={session._id}
            className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 backdrop-blur-lg hover:border-indigo-500/40 transition-all"
          >

            {/* Mode Badge */}
            <span
              className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                session.mode === 'interview'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {session.mode.toUpperCase()}
            </span>

            {/* Problem Title */}
            <h3 className="text-xl font-semibold text-white mb-2">
              {session.problem?.title || 'Untitled Problem'}
            </h3>

            {/* Metadata */}
            <p className="text-slate-400 text-sm mb-4">
              {session.programmingLanguage} • {session.difficulty}
            </p>

            <p className="text-slate-500 text-xs mb-4">
              {new Date(session.createdAt).toLocaleString()}
            </p>

            {/* View Button */}
            <button
              onClick={() =>
                router.push(`/dashboard/session/${session._id}`)
              }
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              View Full Session →
            </button>

          </div>

        ))}

      </div>
    </div>
  </div>
);
}
