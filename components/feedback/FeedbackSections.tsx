import { parseFeedbackSections } from "@/lib/feedback";

interface FeedbackSectionsProps {
  feedback: string;
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-black">{title}</h2>
      <ul className="space-y-2 text-left text-gray-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span className="mt-1 text-black">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function FeedbackSections({ feedback }: FeedbackSectionsProps) {
  const sections = parseFeedbackSections(feedback);

  return (
    <div className="space-y-6 text-left">
      {sections.summary && (
        <p className="text-base leading-7 text-black">{sections.summary}</p>
      )}
      <Section title="Strengths" items={sections.strengths} />
      <Section title="Areas for Improvement" items={sections.improvements} />
      <Section
        title="Optimization Suggestions"
        items={sections.optimizations}
      />
      <Section title="Communication" items={sections.communication} />
    </div>
  );
}
