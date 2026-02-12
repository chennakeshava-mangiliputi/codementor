'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  fullName: string;
  email: string;
}

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'interview' | 'learning' | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('🔄 Fetching user profile...');
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.log('❌ Profile fetch failed:', errorData);
          setError('Failed to load profile');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }

        const data = await response.json();
        console.log('✅ User profile received:', data.user.fullName);
        setUser(data.user);
        setError(null);
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        setError('Failed to load profile');
        setTimeout(() => {
          router.push('/login');
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
      console.log('🔄 Logging out...');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('✅ Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleStartInterview = () => {
    setSelectedMode('interview');
    setTimeout(() => {
      router.push('/interview/setup');
    }, 300);
  };

  const handleStartLearning = () => {
    setSelectedMode('learning');
    setTimeout(() => {
      router.push('/learning-mode/setup');
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300 font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-4">{error}</p>
          <p className="text-slate-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CodeMentor</h1>
              <p className="text-xs text-slate-400">Master Your Interview Skills</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white font-semibold transition duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4V3" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-white font-semibold text-sm">{user.fullName.split(' ')[0]}</p>
                <p className="text-slate-400 text-xs">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{user.fullName.split(' ')[0]}</span>!
          </h2>
          <p className="text-slate-300 text-lg font-medium">
            Choose your mode and master coding interviews
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Interview Simulation Mode Card */}
          <div
            className={`relative group p-8 rounded-2xl border-2 transition duration-300 ${
              selectedMode === 'interview'
                ? 'border-blue-500 bg-slate-700'
                : 'border-slate-700 bg-slate-800 hover:border-blue-500'
            }`}
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1m2-1v2.5M2 7l2-1m-2 1l2 1m-2-1v2.5" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold text-white mb-3 text-left">Interview Simulation</h3>

              {/* Description */}
              <p className="text-slate-300 text-left mb-6 leading-relaxed">
                Practice with AI-powered interview simulations. Get real-time feedback on your coding solutions, communication, and problem-solving approach.
              </p>

              {/* Features */}
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center text-slate-200">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Mock interviews with AI mentor</span>
                </li>
                <li className="flex items-center text-slate-200">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time code submission</span>
                </li>
                <li className="flex items-center text-slate-200">
                  <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Instant feedback & explanations</span>
                </li>
              </ul>

              {/* CTA Button */}
              <button
                onClick={handleStartInterview}
                className="mt-auto w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 text-center group-hover:shadow-lg"
              >
                Start Interview Simulation
                <span className="ml-2 inline-block group-hover:translate-x-1 transition duration-300">→</span>
              </button>
            </div>
          </div>

          {/* Learning Mode Card */}
          <div
            className={`relative group p-8 rounded-2xl border-2 transition duration-300 ${
              selectedMode === 'learning'
                ? 'border-emerald-500 bg-slate-700'
                : 'border-slate-700 bg-slate-800 hover:border-emerald-500'
            }`}
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25c0 5.25 4.5 10 10 10s10-4.75 10-10c0-6.252-4.5-11-10-11z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold text-white mb-3 text-left">Learning Mode</h3>

              {/* Description */}
              <p className="text-slate-300 text-left mb-6 leading-relaxed">
                Select your preferred language and difficulty level. AI generates tailored coding questions, explains optimal solutions with detailed walkthroughs, and conducts an interactive interview on the same code to reinforce your understanding.
              </p>

              {/* Features */}
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center text-slate-200">
                  <svg className="w-5 h-5 text-emerald-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>AI-generated coding questions</span>
                </li>
                <li className="flex items-center text-slate-200">
                  <svg className="w-5 h-5 text-emerald-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Optimal solution with explanations</span>
                </li>
                <li className="flex items-center text-slate-200">
                  <svg className="w-5 h-5 text-emerald-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Interactive code review interview</span>
                </li>
              </ul>

              {/* CTA Button */}
              <button
                onClick={handleStartLearning}
                className="mt-auto w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 text-center group-hover:shadow-lg"
              >
                Start Learning Mode
                <span className="ml-2 inline-block group-hover:translate-x-1 transition duration-300">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm font-semibold mb-2">Interview Attempts</p>
            <p className="text-4xl font-bold text-blue-400">0</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm font-semibold mb-2">Success Rate</p>
            <p className="text-4xl font-bold text-yellow-400">0%</p>
          </div>
        </div> */}

        {/* Quick Tips Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-2">Pro Tip</h4>
              <p className="text-slate-300 leading-relaxed">
                Start with Learning Mode to understand coding patterns and best practices. Then challenge yourself with Interview Simulation to practice under pressure. Both modes work best when used consistently!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}