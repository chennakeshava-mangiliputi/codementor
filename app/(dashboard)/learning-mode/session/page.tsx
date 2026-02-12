// app/(dashboard)/learning-mode/session/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CodeEditor from '@/components/interview/CodeEditor';
import CaptionDisplay from '@/components/interview/CaptionDisplay';

type Problem = {
  title: string;
  description: string;
  input?: string;
  output?: string;
};

type ConversationItem = {
  speaker: 'ai' | 'user';
  text: string;
  timestamp: Date;
};



const MAX_QUESTIONS = 5;

export default function LearningSessionPage() {
  const router = useRouter();

  // Session selections
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [interviewLanguage, setInterviewLanguage] = useState<'English' | 'Hindi'>('English');

  // AI content
  const [problem, setProblem] = useState<Problem | null>(null);
  const [aiSolution, setAiSolution] = useState<string>('');
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phase: 'explain' | 'interview' | 'complete'
  const [phase, setPhase] = useState<'explain' | 'interview' | 'complete'>('explain');

  // Interview state (re-used interview flow)
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [submittedCode, setSubmittedCode] = useState<string>('');
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Captions/TTS
  const [currentCaption, setCurrentCaption] = useState<{ speaker: 'ai' | 'user'; text: string; isActive: boolean }>({
    speaker: 'ai',
    text: '',
    isActive: false,
  });

  // Voice recognition & user response (mirrors interview page)
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const hasInitialized = useRef(false);

  // Helper: speak text and show caption (same style as interview page)
  const speakText = (text: string, onComplete?: () => void) => {
    try {
      if (!text) return;
      const cleanText = text.replace(/###/g, '').replace(/##/g, '').replace(/\*\*/g, '').replace(/---/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

      // show caption
      setCurrentCaption({ speaker: 'ai', text: cleanText, isActive: true });

      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = interviewLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
      utter.rate = 0.9;
      utter.onend = () => {
        setTimeout(() => {
          setCurrentCaption(prev => ({ ...prev, isActive: false }));
          if (onComplete) onComplete();
        }, 300);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error('TTS error', e);
    }
  };

  // init: load selections + generate solution
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const lang = sessionStorage.getItem('programmingLanguage');
    const diff = sessionStorage.getItem('difficulty');
    const iLang = sessionStorage.getItem('interviewLanguage') as 'English' | 'Hindi' | null;

    if (!lang || !diff || !iLang) {
      router.push('/learning-mode/setup');
      return;
    }

    setProgrammingLanguage(lang);
    setDifficulty(diff);
    setInterviewLanguage(iLang as 'English' | 'Hindi');

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // NOTE: use the correct endpoint that you provided in your repo
        const res = await fetch('/api/learning-mode/generate-solution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ programmingLanguage: lang, difficulty: diff, interviewLanguage: iLang }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to generate solution');
        }

        setProblem(data.problem);
        setAiSolution(data.solution || '');
        setAiExplanation(data.explanation || '');

        sessionStorage.setItem('aiSolution', data.solution || '');
        sessionStorage.setItem('aiExplanation', data.explanation || '');
        sessionStorage.setItem('mode', 'learning');

        setPhase('explain');
        setLoading(false);
      } catch (err: any) {
        console.error('generate-solution error:', err);
        setError(err?.message || 'Failed to generate learning content');
        setLoading(false);
      }
    })();
  }, [router]);

  // SpeechRecognition initialization (mirror interview page behaviour)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = interviewLanguage === 'Hindi' ? 'hi-IN' : 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Append final transcript to userResponse
      if (finalTranscript.trim()) {
        setUserResponse(prev => (prev + ' ' + finalTranscript).trim());
      }

      const captionText = (finalTranscript + interimTranscript).trim();
      if (captionText) {
        setCurrentCaption({ speaker: 'user', text: captionText, isActive: true });
      }

      console.log('Interim:', interimTranscript, 'Final:', finalTranscript);
    };

recognition.onend = () => {
  console.log('Speech recognition ended');
  setIsListening(false);

  // Hide captions after user stops speaking
  setTimeout(() => {
    setCurrentCaption(prev => ({
      ...prev,
      isActive: false,
    }));
  }, 1200);
};


    recognition.onerror = (e: any) => {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
      recognitionRef.current = null;
    };
  }, [interviewLanguage]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setUserResponse(''); // clear previous
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('start listening error', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('stop listening error', e);
      }
    }
  };

  // Start interview flow (triggered by "Start interview on this coding question")
  const startInterviewOnSolution = async () => {
    if (!aiSolution) {
      alert('AI solution missing');
      return;
    }

    setSubmittedCode(aiSolution);
    sessionStorage.setItem('submittedCode', aiSolution);

    setConversation([]);
    setQuestionCount(0);
    setCurrentQuestion(null);
    setPhase('interview');

    // ask first question (askNextQuestion will derive next question number from conversation)
    await askNextQuestion(aiSolution, []);
  };

  // Robust askNextQuestion: derive nextQuestionNumber from previousConversation (count AI messages)
  const askNextQuestion = async (code: string, previousConversation: ConversationItem[]) => {
    setIsGeneratingQuestion(true);

    try {
      const aiMessages = previousConversation.filter((p) => p.speaker === 'ai').length;
      if (aiMessages >= MAX_QUESTIONS) {
        // generate feedback directly
        await generateFeedback(code, previousConversation);
        setIsGeneratingQuestion(false);
        return;
      }

      const nextQuestionNumber = aiMessages + 1;

      const response = await fetch('/api/interview/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          problem,
          conversation: previousConversation,
          questionNumber: nextQuestionNumber,
          interviewLanguage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to ask question');
      }

      const question = data.question;
      setCurrentQuestion(question);
      setQuestionCount((prev) => {
        // synchronize with derived aiMessages + 1
        const newCount = Math.max(prev, nextQuestionNumber);
        return newCount;
      });

      const newConversation: ConversationItem[] = [
        ...previousConversation,
        { speaker: 'ai', text: question, timestamp: new Date(), },
      ];
      setConversation(newConversation);

      // speak question and show caption
      speakText(question);
      setIsGeneratingQuestion(false);
    } catch (err) {
      console.error('ask-question error', err);
      setIsGeneratingQuestion(false);
      alert('Failed to generate the next question. Please try again.');
    }
  };

  // Handle typed or speech-based submit (mirrors interview page submitResponse)
  const submitResponse = async () => {
    const finalResponse = userResponse.trim();
    if (!finalResponse) {
      alert('Please provide a response before submitting');
      return;
    }

    if (isListening) stopListening();

const newConversation: ConversationItem[] = [
  ...conversation,
  { speaker: 'user', text: finalResponse, timestamp: new Date() },
];

    setConversation(newConversation);
    setUserResponse('');
    setCurrentCaption({ speaker: 'ai', text: '', isActive: false });

    // Wait a short while and ask next (gives TTS / UI a moment)
    setTimeout(() => {
      askNextQuestion(submittedCode || aiSolution, newConversation);
    }, 800);
  };

  // Also allow handleUserAnswer from the textarea on Enter (this keeps parity with interview session's behaviour)
  const handleUserAnswerDirect = async (text: string) => {
const newConversation: ConversationItem[] = [
  ...conversation,
  {
    speaker: 'user',
    text,
    timestamp: new Date(),
  },
];

    setConversation(newConversation);
    setUserResponse('');

    // if max reached, generate feedback
    const aiMessages = newConversation.filter((p) => p.speaker === 'ai').length;
    if (aiMessages >= MAX_QUESTIONS) {
      await generateFeedback(submittedCode || aiSolution, newConversation);
      return;
    }

    await askNextQuestion(submittedCode || aiSolution, newConversation);
  };

  const generateFeedback = async (code: string, conversationData: ConversationItem[]) => {
    setIsGeneratingFeedback(true);
    try {
      const res = await fetch('/api/interview/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          problem,
          conversation: conversationData,
          interviewLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate feedback');

      sessionStorage.setItem('learningFeedback', data.feedback || '');
      // ✅ Save session to MongoDB
await fetch('/api/session/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'learning',
    programmingLanguage,
    difficulty,
    interviewLanguage,
    problem,
    aiSolution,
    aiExplanation,
    conversation: conversationData,
    feedback: data.feedback || '',
  }),
});

      const sessionObj = {
        mode: 'learning',
        createdAt: new Date().toISOString(),
        programmingLanguage,
        difficulty,
        interviewLanguage,
        problem,
        aiSolution,
        aiExplanation,
        conversation: conversationData,
        feedback: data.feedback || '',
      };
      sessionStorage.setItem('lastSession', JSON.stringify(sessionObj));

      setIsGeneratingFeedback(false);
      setPhase('complete');

      setTimeout(() => {
        router.push('/learning-mode/feedback');
      }, 1200);
    } catch (err) {
      console.error('generate-feedback error', err);
      setIsGeneratingFeedback(false);
      alert('Failed to generate feedback. Please try again.');
    }
  };

  // Loading & error screens (same minimal behavior you used)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300 font-semibold">Generating learning content...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-red-600 rounded-2xl p-8 text-center">
          <p className="text-red-400 font-semibold mb-4">{error || 'Failed to load learning content'}</p>
          <button onClick={() => router.push('/learning-mode/setup')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
            Go back to setup
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-[var(--color-primary)] text-white px-6 py-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold">🟩 Learning Mode</h1>
          <p className="text-sm opacity-90 mt-1">
            {programmingLanguage} • {difficulty} • {interviewLanguage}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {phase === 'explain' && problem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Problem Statement</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-2">{problem.title}</h3>
                  <p className="text-[var(--color-text-secondary)]">{problem.description}</p>
                  {problem.input && (
                    <div className="mt-3">
                      <strong className="text-sm text-[var(--color-text)]">Input:</strong>
                      <p className="text-[var(--color-text-secondary)]">{problem.input}</p>
                    </div>
                  )}
                  {problem.output && (
                    <div className="mt-3">
                      <strong className="text-sm text-[var(--color-text)]">Output:</strong>
                      <p className="text-[var(--color-text-secondary)]">{problem.output}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="font-semibold text-[var(--color-text)]">AI Optimal Solution</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">This is the AI generated optimal code (read-only).</p>
              </div>

              <CodeEditor language={programmingLanguage} initialCode={aiSolution} readOnly />

              <div className="mt-4">
                <h4 className="text-md font-semibold text-[var(--color-text)] mb-2">Explanation</h4>
                <div className="p-3 bg-slate-900 rounded-md max-h-56 overflow-auto text-[var(--color-text-secondary)]">
                  {aiExplanation || 'No explanation provided.'}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button onClick={() => speakText(aiExplanation)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
                    ▶️ Play Explanation
                  </button>

                  <button onClick={startInterviewOnSolution} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                    🧑‍💻 Start interview on this coding question
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

{phase === 'interview' && (
  <div className="max-w-4xl mx-auto">

    {/* Conversation History */}
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6 mb-6 max-h-96 overflow-y-auto">
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
        Conversation
      </h2>

      <div className="space-y-4">
        {conversation.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              item.speaker === 'ai'
                ? 'bg-[var(--color-bg-1)] border-l-4 border-[var(--color-primary)]'
                : 'bg-[var(--color-bg-4)] border-l-4 border-blue-500'
            }`}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{
                color:
                  item.speaker === 'ai'
                    ? 'var(--color-primary)'
                    : '#2563EB',
              }}
            >
              {item.speaker === 'ai' ? 'AI' : 'You'}
            </p>

            <p className="text-[var(--color-text)] whitespace-pre-wrap">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Response Input */}
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
      <h3 className="font-semibold text-[var(--color-text)] mb-4">
        Your Response
      </h3>

      <textarea
        value={userResponse}
        onChange={(e) => setUserResponse(e.target.value)}
        placeholder="Type or speak your answer here..."
        className="w-full h-32 p-4 bg-[var(--color-background)] text-[var(--color-text)] rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none mb-4"
      />

      <div className="flex gap-3">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-text)]'
          }`}
        >
          <span>
            {isListening ? '🔴 Stop Speaking' : '🎤 Start Speaking'}
          </span>

          {isListening && <span className="animate-pulse">●</span>}
        </button>

        <button
          onClick={submitResponse}
          disabled={!userResponse.trim()}
          className="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Submit Response
        </button>
      </div>
    </div>
  </div>
)}


        {phase === 'complete' && (
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Interview completed — generating feedback...</h3>
            <p className="text-[var(--color-text-secondary)] mt-2">You will be redirected to the feedback page shortly.</p>
          </div>
        )}
      </div>

      {/* Captions (shared component) */}
      <CaptionDisplay speaker={currentCaption.speaker} text={currentCaption.text} isActive={currentCaption.isActive} language={interviewLanguage} />
    </div>
  );
}
