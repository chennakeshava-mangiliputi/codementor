import { Bot, ChartColumnBig, Mic, Sparkles } from "lucide-react";
import AppButton from "@/components/ui/AppButton";

const features = [
  {
    title: "AI-Powered",
    description: "Intelligent interview simulations powered by AI.",
    icon: Bot,
  },
  {
    title: "Voice Interview",
    description: "Real-time voice conversation with your AI interviewer.",
    icon: Mic,
  },
  {
    title: "Smart Feedback",
    description: "Detailed feedback on performance, code quality, and clarity.",
    icon: ChartColumnBig,
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white px-4 py-16">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-gray-100 blur-3xl opacity-70" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-neutral-100 blur-3xl opacity-80" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <div className="mb-10 flex items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <Sparkles size={30} />
          </div>
          <div className="text-left">
            <h1 className="text-5xl font-black tracking-tight text-black md:text-7xl">
              CODEMENTOR
            </h1>
            <p className="text-sm font-medium text-gray-600 md:text-base">
              Transform Code into Interview Success
            </p>
          </div>
        </div>

        <p className="mx-auto mb-10 max-w-4xl text-lg leading-9 text-gray-600 md:text-2xl">
          Master coding interviews with AI-powered simulations, real-time voice
          interaction, and clear feedback that feels like a real technical loop.
        </p>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-3xl border border-gray-200 bg-gray-50 p-8 text-left shadow-sm"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <Icon size={22} />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-black">{title}</h2>
              <p className="text-base leading-7 text-gray-600">{description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <AppButton href="/login" className="min-w-48">
            Sign In
          </AppButton>
          <AppButton href="/register" className="min-w-48">
            Create Account
          </AppButton>
        </div>
      </div>
    </div>
  );
}
