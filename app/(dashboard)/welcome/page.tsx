"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { InterviewSimulationIcon, LearningModeIcon } from "@/components/icons/ModeIcons";
import AppButton from "@/components/ui/AppButton";

interface User {
  id: string;
  fullName: string;
  email: string;
}

const modeCards = [
  {
    key: "interview",
    title: "Interview Simulation Mode",
    description:
      "Practice with AI-powered interview simulations. Get real-time feedback on your coding solutions, communication, and problem-solving approach.",
    features: [
      "Mock interviews with AI mentor",
      "Real-time code submission",
      "Instant feedback and explanations",
    ],
  },
  {
    key: "learning",
    title: "Learning Mode",
    description:
      "AI generates realistic interview questions, shares optimal solutions, and then continues with an interactive follow-up interview on the same problem.",
    features: [
      "AI-generated coding questions",
      "Optimal solution with explanations",
      "Interactive code review interview",
    ],
  },
] as const;

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"interview" | "learning" | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setError("Failed to load profile");
          setTimeout(() => {
            router.push("/login");
          }, 1500);
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setError(null);
      } catch {
        setError("Failed to load profile");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    } catch {
      setIsLoggingOut(false);
    }
  };

  const startMode = (mode: "interview" | "learning") => {
    setSelectedMode(mode);
    setTimeout(() => {
      router.push(mode === "interview" ? "/interview/setup" : "/learning-mode/setup");
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-gray-200 border-t-black" />
          <p className="font-semibold text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="mb-4 font-semibold text-black">{error}</p>
          <p className="text-gray-700">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">CodeMentor</h1>
              <p className="text-xs text-gray-600">Master Your Interview Skills</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-black"
            >
              <LayoutDashboard size={22} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="hidden border-l border-gray-200 pl-4 sm:block">
              <p className="text-right text-sm font-semibold text-black">
                {user.fullName.split(" ")[0]}
              </p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>

            <AppButton onClick={handleLogout} disabled={isLoggingOut}>
              <span className="inline-flex items-center gap-2">
                <LogOut size={16} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </AppButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="mb-12">
          <h2 className="mb-4 text-5xl font-black text-black sm:text-6xl">
            Welcome back, {user.fullName.split(" ")[0]}!
          </h2>
          <p className="text-lg font-medium text-gray-700">
            Choose your mode and keep practicing with a consistent interview workflow.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {modeCards.map((card) => {
            const selected = selectedMode === card.key;
            const Icon =
              card.key === "interview" ? InterviewSimulationIcon : LearningModeIcon;

            return (
              <section
                key={card.key}
                className={`flex h-full flex-col rounded-3xl border p-8 shadow-sm transition ${
                  selected ? "border-black bg-gray-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                  <Icon size={30} />
                </div>
                <h3 className="mb-3 text-4xl font-black text-black">{card.title}</h3>
                <p className="mb-6 text-lg leading-9 text-gray-700">{card.description}</p>

                <ul className="mb-8 flex-1 space-y-3">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-700">
                      <Check size={18} className="text-black" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <AppButton
                  onClick={() => startMode(card.key)}
                  fullWidth
                  className="text-base"
                >
                  {card.key === "interview"
                    ? "Start Interview Simulation"
                    : "Start Learning Mode"}
                </AppButton>
              </section>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-black">Pro Tip</h2>
          <p className="leading-7 text-gray-700">
            Start with Learning Mode to understand coding patterns and best
            practices. Then challenge yourself with Interview Simulation to
            practice under pressure. Both modes work best when used
            consistently!
          </p>
        </div>
      </main>
    </div>
  );
}
