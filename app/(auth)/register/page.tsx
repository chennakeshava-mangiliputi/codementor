'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Registration failed' });
        setLoading(false);
        return;
      }

      setRegistrationSuccess(true);
      setSuccessEmail(formData.email);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setErrors({
        general: error.message || 'An error occurred during registration',
      });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
            </div>

            <div className="px-6 py-8 text-center">
              <div className="mb-6 p-4 bg-slate-700 border-2 border-blue-500 rounded-lg">
                <p className="text-slate-200 mb-2">
                  <span className="font-bold text-lg">📧 Verification email sent to:</span>
                </p>
                <p className="text-lg font-mono text-blue-400 break-all font-semibold">{successEmail}</p>
              </div>

              <div className="space-y-4">
                <div className="text-left">
                  <h3 className="font-bold text-slate-200 mb-3 text-lg">What happens next?</h3>
                  <ol className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start">
                      <span className="font-bold text-green-400 mr-3 text-lg">1.</span>
                      <span className="font-semibold">Check your email inbox (and spam folder)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-400 mr-3 text-lg">2.</span>
                      <span className="font-semibold">Look for email from "CODEMENTOR"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-400 mr-3 text-lg">3.</span>
                      <span className="font-semibold">Click "✓ Verify My Account" button</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-400 mr-3 text-lg">4.</span>
                      <span className="font-semibold">You'll be redirected to login page</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-green-400 mr-3 text-lg">5.</span>
                      <span className="font-semibold">Login with your email and password</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-slate-700 border-l-4 border-yellow-400 rounded-lg p-4 mt-5">
                  <p className="text-sm text-yellow-300 font-semibold">
                    ⏰ Verification link expires in 24 hours
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  Go Back to Login
                </Link>
                <button
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setFormData({
                      fullName: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                    });
                  }}
                  className="block w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  Register Another Account
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 text-slate-400 text-sm font-semibold">
            <p>Email not arriving? Check your spam folder</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 border-b border-slate-700">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-slate-300 mt-2 font-semibold">Join CODEMENTOR today</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {errors.general && (
              <div className="bg-red-950 border-l-4 border-red-500 text-red-200 px-4 py-3 rounded">
                <p className="font-bold">Error</p>
                <p className="text-sm mt-1">{errors.general}</p>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-slate-200 mb-3">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 transition text-white placeholder-slate-500 bg-slate-700 ${
                  errors.fullName ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs font-bold mt-2">⚠ {errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-200 mb-3">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 transition text-white placeholder-slate-500 bg-slate-700 ${
                  errors.email ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs font-bold mt-2">⚠ {errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-200 mb-3">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 transition text-white placeholder-slate-500 bg-slate-700 ${
                  errors.password ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.password && (
                <p className="text-red-400 text-xs font-bold mt-2">⚠ {errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-200 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 transition text-white placeholder-slate-500 bg-slate-700 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs font-bold mt-2">⚠ {errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mt-7 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="bg-slate-700 px-6 py-4 border-t border-slate-600 text-center">
            <p className="text-slate-300 text-sm font-semibold">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}