import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo/Title */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                CODEMENTOR
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Transform Code into Interview Success</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6">
            Master your coding interviews with AI-powered interview simulations, 
            real-time feedback, and intelligent learning. Practice with real companies' 
            interview patterns and ace your next technical interview.
          </p>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">
                Intelligent interview simulations powered by Gemini AI
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="text-white font-semibold mb-2">Voice Interview</h3>
              <p className="text-gray-400 text-sm">
                Real-time voice conversation with AI interviewer
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-white font-semibold mb-2">Smart Feedback</h3>
              <p className="text-gray-400 text-sm">
                Detailed feedback on performance and code optimization
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Login Button */}
          <Link
            href="/login"
            className="px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-500/50"
          >
            Sign In
          </Link>

          {/* Register Button */}
          <Link
            href="/register"
            className="px-8 py-3 md:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            Create Account
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-gray-500 text-sm mt-12">
          Ready to transform your coding interview preparation?
        </p>
      </div>
    </div>
  );
}