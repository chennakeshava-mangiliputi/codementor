'use client';

import { useEffect, useState } from 'react';

interface CaptionDisplayProps {
  speaker: 'ai' | 'user';
  text: string;
  isActive: boolean;
  language: 'English' | 'Hindi';
}

export default function CaptionDisplay({
  speaker,
  text,
  isActive,
  language,
}: CaptionDisplayProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (isActive && text) {
      setDisplayText(text);
    } else {
      const timeout = setTimeout(() => setDisplayText(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [text, isActive]);

  if (!displayText) return null;

  const speakerConfig = {
    ai: {
      label: language === 'Hindi' ? 'AI' : 'AI',
      color: '#32A08D',
    },
    user: {
      label: language === 'Hindi' ? 'आप' : 'You',
      color: '#2563EB',
    },
  };

  const config = speakerConfig[speaker];

  return (
    <div
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 max-w-[85%] z-50 transition-opacity duration-300"
      style={{
        opacity: isActive ? 1 : 0,
      }}
    >
      <div
        className="rounded-lg shadow-2xl px-6 py-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.90)',
          borderLeft: `4px solid ${config.color}`,
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="font-semibold text-sm uppercase tracking-wide flex-shrink-0"
            style={{ color: config.color }}
          >
            {config.label}:
          </span>
          <p
            className="text-white text-lg leading-relaxed"
            style={{
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {displayText}
          </p>
        </div>
      </div>
    </div>
  );
}