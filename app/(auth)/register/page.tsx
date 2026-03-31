"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";
import AppButton from "@/components/ui/AppButton";
import PasswordField from "@/components/ui/PasswordField";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const inputClasses =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-600 outline-none transition focus:border-black";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "Registration failed" });
        setLoading(false);
        return;
      }

      setRegistrationSuccess(true);
      setSuccessEmail(formData.email);
      resetForm();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during registration";
      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
            <div className="px-6 py-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                  <MailCheck size={30} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-black">
                Registration Successful!
              </h2>
            </div>

            <div className="px-6 py-8 text-center">
              <div className="mb-6 rounded-xl border border-gray-300 bg-gray-50 p-4">
                <p className="mb-2 text-gray-700">
                  <span className="text-lg font-bold">Verification email sent to:</span>
                </p>
                <p className="break-all font-mono text-lg font-semibold text-black">
                  {successEmail}
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-left">
                  <h3 className="mb-3 text-lg font-bold text-gray-700">
                    What happens next?
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-700">
                    {[
                      "Check your email inbox and spam folder.",
                      'Look for an email from "CODEMENTOR".',
                      "Click the Verify My Account button.",
                      "You will be redirected to the login page.",
                      "Log in with your email and password.",
                    ].map((step, index) => (
                      <li key={step} className="flex items-start">
                        <span className="mr-3 text-lg font-bold text-black">
                          {index + 1}.
                        </span>
                        <span className="font-semibold">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-xl border border-gray-300 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Verification link expires in 24 hours
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <AppButton href="/login" fullWidth>
                  Go Back to Login
                </AppButton>
                <AppButton
                  onClick={() => {
                    setRegistrationSuccess(false);
                    resetForm();
                    router.refresh();
                  }}
                  fullWidth
                >
                  Register Another Account
                </AppButton>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm font-semibold text-gray-600">
            <p>Email not arriving? Check your spam folder</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-gray-100 blur-3xl opacity-80" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-neutral-100 blur-3xl opacity-80" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-200 px-6 py-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Sparkles size={24} />
              </div>
              <p className="text-sm font-medium text-gray-600">Join CODEMENTOR today</p>
            </div>
            <h1 className="text-3xl font-bold text-black">Create Account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
            {errors.general && (
              <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-black">
                <p className="font-bold">Error</p>
                <p className="mt-1 text-sm">{errors.general}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="fullName"
                className="mb-3 block text-sm font-bold text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={inputClasses}
              />
              {errors.fullName && (
                <p className="mt-2 text-xs font-bold text-black">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-3 block text-sm font-bold text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                className={inputClasses}
              />
              {errors.email && (
                <p className="mt-2 text-xs font-bold text-black">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-3 block text-sm font-bold text-gray-700"
              >
                Password
              </label>
              <PasswordField
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className={inputClasses}
              />
              {errors.password && (
                <p className="mt-2 text-xs font-bold text-black">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-3 block text-sm font-bold text-gray-700"
              >
                Confirm Password
              </label>
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={inputClasses}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-xs font-bold text-black">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <AppButton type="submit" disabled={loading} fullWidth>
              {loading ? "Creating Account..." : "Create Account"}
            </AppButton>
          </form>

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-center">
            <p className="text-sm font-semibold text-gray-700">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-black hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
