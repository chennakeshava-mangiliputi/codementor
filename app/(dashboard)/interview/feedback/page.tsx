'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('interviewFeedback');
    if (!raw) return;

    // Clean unwanted symbols (IMPORTANT for voice clarity)
    const clean = raw
      .replace(/[⚠✔✖•]/g, '') // remove symbols
      .replace(/[#*]/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    setFeedback(clean);

    // 🔊 Speak feedback
    const utter = new SpeechSynthesisUtterance(clean);
    const lang = sessionStorage.getItem('interviewLanguage');

    utter.lang = lang === 'Hindi' ? 'hi-IN' : 'en-US';
    utter.rate = 0.9;

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6">

      {/* Page Title */}
      <h1 className="text-4xl font-bold text-[var(--color-text)] mb-8 text-center">
        📝 Interview Feedback
      </h1>

      {/* Feedback Card */}
      <div className="max-w-3xl w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-lg text-center">
        <p className="text-[var(--color-text)] leading-relaxed text-lg">
          {feedback}
        </p>
      </div>

      {/* Buttons Section */}
      <div className="flex gap-6 mt-8">

        {/* Start New Interview */}
        <button
          onClick={() => router.push('/interview/setup')}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg font-semibold transition"
        >
          🔄 Start New Interview
        </button>

        {/* Dashboard */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-text)] rounded-lg font-semibold transition"
        >
          🏠 Go To Dashboard
        </button>

      </div>
    </div>
  );
}
