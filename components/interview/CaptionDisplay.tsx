"use client";

interface CaptionDisplayProps {
  speaker: "ai" | "user";
  text: string;
  isActive: boolean;
  language: "English" | "Hindi";
}

export default function CaptionDisplay({
  speaker,
  text,
  isActive,
  language,
}: CaptionDisplayProps) {
  if (!isActive || !text.trim()) return null;

  const speakerConfig = {
    ai: {
      label: language === "Hindi" ? "AI" : "AI",
      backgroundColor: "#f3f4f6",
      border: "1px solid #d1d5db",
    },
    user: {
      label: language === "Hindi" ? "आप" : "You",
      backgroundColor: "#ffffff",
      border: "1px solid #9ca3af",
    },
  };

  const config = speakerConfig[speaker];

  return (
    <div
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 max-w-[85%] z-50 transition-opacity duration-300"
      style={{ opacity: isActive ? 1 : 0 }}
    >
      <div
        className="rounded-lg shadow-lg px-6 py-4"
        style={{
          backgroundColor: config.backgroundColor,
          border: config.border,
        }}
      >
        <div className="flex items-start gap-3">
          <span className="font-semibold text-sm uppercase tracking-wide flex-shrink-0 text-gray-800">
            {config.label}:
          </span>
          <p
            className="text-black text-lg leading-relaxed"
            style={{ fontWeight: 500, lineHeight: 1.5 }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
