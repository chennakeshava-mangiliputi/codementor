"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";
import AppButton from "@/components/ui/AppButton";
import PasswordField from "@/components/ui/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.trim()) {
        setError("Please enter your email");
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      if (!password) {
        setError("Please enter your password");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/welcome");
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-gray-100 blur-3xl opacity-80" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-neutral-100 blur-3xl opacity-80" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Sparkles size={24} />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-2xl font-bold text-black">CodeMentor</h1>
              <p className="text-xs text-gray-600">Master Your Interview Skills</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm text-black">
                {error}
              </div>
            )}

            <div>
              <label className="mb-3 block text-sm font-medium text-black">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 outline-none transition focus:border-black"
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-black">
                Password
              </label>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 outline-none transition focus:border-black"
                disabled={loading}
              />
            </div>

            <AppButton type="submit" disabled={loading} fullWidth>
              {loading ? "Signing in..." : "Sign In"}
            </AppButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Do not have an account?{" "}
              <Link href="/register" className="font-semibold text-black">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 transition hover:text-black">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
