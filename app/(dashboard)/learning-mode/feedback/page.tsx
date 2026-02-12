'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LearningFeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');

  // ✅ Remove awkward symbols from feedback
  const cleanFeedbackText = (text: string) => {
    return text
      .replace(/[✓✔]/g, '')   // remove checkmarks
      .replace(/[⚠△▲]/g, '')  // remove warning symbols
      .replace(/\s+/g, ' ')   // normalize spacing
      .trim();
  };

  useEffect(() => {
    const storedFeedback = sessionStorage.getItem('learningFeedback');

    if (!storedFeedback) {
      router.push('/learning-mode/setup');
      return;
    }

    // ✅ Clean feedback before displaying
    const cleanedFeedback = cleanFeedbackText(storedFeedback);
    setFeedback(cleanedFeedback);

    // 🔊 Speak cleaned feedback
    const utter = new SpeechSynthesisUtterance(cleanedFeedback);
    utter.lang = 'en-US';

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);

  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6">

      {/* Title */}
      <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">
        🟩 Learning Mode Feedback
      </h1>

      {/* Feedback Box */}
      <div className="max-w-3xl w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 shadow-lg text-center">

        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          AI Feedback
        </h2>

        <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
          {feedback}
        </p>

      </div>

      {/* Buttons */}
      <div className="flex gap-6 mt-8">

        <button
          onClick={() => router.push('/learning-mode/setup')}
          className="px-6 py-3 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-text)] font-semibold rounded-lg transition-all"
        >
          New Learning Session
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-lg transition-all"
        >
          Go To Dashboard
        </button>

      </div>
    </div>
  );
}
