'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewSetup() {
  const router = useRouter();
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [interviewLanguage, setInterviewLanguage] = useState('');

  const programmingLanguages = ['C', 'C++', 'Java', 'Python', 'SQL'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const interviewLanguages = ['English', 'Hindi'];

  const handleStartInterview = () => {
    if (!programmingLanguage || !difficulty || !interviewLanguage) {
      alert('Please select all options before starting the interview');
      return;
    }

    // Store selections in sessionStorage
    sessionStorage.setItem('programmingLanguage', programmingLanguage);
    sessionStorage.setItem('difficulty', difficulty);
    sessionStorage.setItem('interviewLanguage', interviewLanguage);

    // Navigate to interview session
    router.push('/interview/session');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Interview Simulation Setup
          </h1>
          <p className="text-slate-400">
            Configure your interview preferences before starting
          </p>
        </div>

        {/* Programming Language Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-white mb-3">
            Select Programming Language
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {programmingLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setProgrammingLanguage(lang)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  programmingLanguage === lang
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-blue-500'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Level Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-white mb-3">
            Select Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  difficulty === level
                    ? level === 'Easy'
                      ? 'bg-green-600 text-white border-green-600'
                      : level === 'Medium'
                      ? 'bg-yellow-600 text-white border-yellow-600'
                      : 'bg-red-600 text-white border-red-600'
                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-blue-500'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Interview Language Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-white mb-3">
            Select Interview Language
          </label>
          <div className="grid grid-cols-2 gap-3">
            {interviewLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => setInterviewLanguage(lang)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  interviewLanguage === lang
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-blue-500'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartInterview}
          disabled={!programmingLanguage || !difficulty || !interviewLanguage}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          🚀 Start Interview Simulation
        </button>

        {/* Selection Summary */}
        {(programmingLanguage || difficulty || interviewLanguage) && (
          <div className="mt-6 p-4 bg-slate-700 border border-slate-600 rounded-lg">
            <p className="text-sm text-slate-400 mb-2 font-semibold">
              Your selections:
            </p>
            <div className="flex flex-wrap gap-2">
              {programmingLanguage && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {programmingLanguage}
                </span>
              )}
              {difficulty && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {difficulty}
                </span>
              )}
              {interviewLanguage && (
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {interviewLanguage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}