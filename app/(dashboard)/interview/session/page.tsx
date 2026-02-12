'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CaptionDisplay from '@/components/interview/CaptionDisplay';
import CodeEditor from '@/components/interview/CodeEditor';

interface Problem {
  title: string;
  description: string;
  input: string;
  output: string;
}

interface ConversationItem {
  speaker: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export default function InterviewSession() {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'problem' | 'coding' | 'interview' | 'complete'>('problem');
  
  // Session data
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [interviewLanguage, setInterviewLanguage] = useState<'English' | 'Hindi'>('English');
  
  // Interview state
  const [submittedCode, setSubmittedCode] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  
  // Caption state
  const [currentCaption, setCurrentCaption] = useState({ 
    speaker: 'ai' as 'ai' | 'user', 
    text: '', 
    isActive: false 
  });
  
  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const recognitionRef = useRef<any>(null);

  // Load session data
const hasGeneratedProblem = useRef(false);

useEffect(() => {
  if (hasGeneratedProblem.current) return;

  const lang = sessionStorage.getItem('programmingLanguage');
  const diff = sessionStorage.getItem('difficulty');
  const intLang = sessionStorage.getItem('interviewLanguage') as 'English' | 'Hindi';

  if (!lang || !diff || !intLang) {
    router.push('/interview/setup');
    return;
  }

  setProgrammingLanguage(lang);
  setDifficulty(diff);
  setInterviewLanguage(intLang);

  hasGeneratedProblem.current = true;

  generateProblem(lang, diff, intLang);
}, [router]);


  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Changed to continuous
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

    // ✅ Correct transcript extraction
    const transcript = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' ';
    } else {
      interimTranscript += transcript;
    }
  }

  // ✅ Update textbox only when final speech arrives
  if (finalTranscript.trim()) {
    setUserResponse(prev => (prev + ' ' + finalTranscript).trim());
  }

  // ✅ Realtime captions
  const captionText = (finalTranscript + interimTranscript).trim();

  if (captionText) {
    setCurrentCaption({
      speaker: 'user',
      text: captionText,
      isActive: true,
    });
  }

  console.log('Interim:', interimTranscript);
  console.log('Final:', finalTranscript);
};


        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);

setTimeout(() => {
  setCurrentCaption(prev => ({ ...prev, isActive: false }));
}, 1500);

        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.error('Speech Recognition not supported in this browser');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [interviewLanguage]);

  // Generate coding problem
  const generateProblem = async (lang: string, diff: string, intLang: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/interview/generate-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programmingLanguage: lang,
          difficulty: diff,
          interviewLanguage: intLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate problem');
      }

      if (!data.problem) {
        throw new Error('No problem data received');
      }

setProblem(data.problem);

const problemText = `Here is your coding problem. ${data.problem.title}. ${data.problem.description}. Input: ${data.problem.input}. Output: ${data.problem.output}`;

speakText(problemText);

setLoading(false);
setPhase('coding');

    } catch (error: any) {
      console.error('Error generating problem:', error);
      setError(error.message || 'Failed to generate problem. Please try again.');
      setLoading(false);
    }
  };

  // Text-to-Speech function
  const speakText = (text: string, onComplete?: () => void) => {
    // Clean text - remove markdown symbols
    const cleanText = text
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/\*\*/g, '')
      .replace(/---/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Speaking:', cleanText);

    // Show AI caption
    setCurrentCaption({
      speaker: 'ai',
      text: cleanText,
      isActive: true,
    });

    // Use browser TTS
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = interviewLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setTimeout(() => {
        setCurrentCaption(prev => ({ ...prev, isActive: false }));
        if (onComplete) onComplete();
      }, 500);
    };
    
    // Stop any previous speech first
window.speechSynthesis.cancel();

window.speechSynthesis.speak(utterance);

  };

  // Handle code submission
  const handleCodeSubmit = async (code: string) => {
    setSubmittedCode(code);
    setPhase('interview');
    
    // Ask first question immediately
    setTimeout(() => {
      askNextQuestion(code, []);
    }, 1000);
  };

  // Ask next interview question
  const askNextQuestion = async (code: string, previousConversation: ConversationItem[]) => {
    console.log('askNextQuestion called, questionCount:', questionCount);
    
    if (questionCount >= 5) {
      console.log('Interview complete, generating feedback');
      generateFeedback();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/interview/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          problem: problem,
          conversation: previousConversation,
          questionNumber: questionCount + 1,
          interviewLanguage: interviewLanguage,
        }),
      });

      const data = await response.json();
      const question = data.question;
      
      console.log('Question received:', question);
      
      setCurrentQuestion(question);
      setQuestionCount(prev => prev + 1);
      
      // Add to conversation
      const newConversation = [
        ...previousConversation,
        { speaker: 'ai' as const, text: question, timestamp: new Date() },
      ];
      setConversation(newConversation);
      
      setLoading(false);
      
      // Speak question
      speakText(question);
      
    } catch (error) {
      console.error('Error asking question:', error);
      setLoading(false);
      alert('Failed to ask question. Please try again.');
    }
  };

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setUserResponse(''); // Clear previous response
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  // Submit user response - FIXED
  const submitResponse = () => {
    console.log('Submit Response called');
    console.log('Current userResponse:', userResponse);
    
    const finalResponse = userResponse.trim();
    
    if (!finalResponse) {
      alert('Please provide a response before submitting');
      return;
    }

    // Stop listening if active
    if (isListening) {
      stopListening();
    }
    
    // Add user response to conversation
    const newConversation = [
      ...conversation,
      { speaker: 'user' as const, text: finalResponse, timestamp: new Date() },
    ];
    setConversation(newConversation);
    
    console.log('Updated conversation:', newConversation);
    
    // Clear user response and caption
    setUserResponse('');
    setCurrentCaption({ speaker: 'ai', text: '', isActive: false });
    
    // Ask next question after 2 seconds
    setTimeout(() => {
      console.log('Calling askNextQuestion after user response');
      askNextQuestion(submittedCode, newConversation);
    }, 2000);
  };

  // Generate final feedback
  const generateFeedback = async () => {
    setPhase('complete');
    setLoading(true);

    try {
      const response = await fetch('/api/interview/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: submittedCode,
          problem: problem,
          conversation: conversation,
          interviewLanguage: interviewLanguage,
        }),
      });

      const data = await response.json();
      
      // Store feedback in sessionStorage
      sessionStorage.setItem('interviewFeedback', data.feedback);
      // ✅ Save session to MongoDB
await fetch('/api/session/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'interview',
    programmingLanguage,
    difficulty,
    interviewLanguage,
    problem,
    aiSolution: submittedCode, // user's code
    aiExplanation: '',
    conversation,
    feedback: data.feedback,
  }),
});

      
      // Navigate to feedback page after 3 seconds
      setTimeout(() => {
        router.push('/interview/feedback');
      }, 3000);
      
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert('Failed to generate feedback. Please try again.');
      setLoading(false);
    }
  };

  // Error display
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-surface)] border border-red-500 rounded-2xl p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setError(null);
                generateProblem(programmingLanguage, difficulty, interviewLanguage);
              }}
              className="flex-1 px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-lg transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/interview/setup')}
              className="flex-1 px-4 py-3 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-text)] font-semibold rounded-lg transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading display
  if (loading && !problem) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text)] text-lg">
            {interviewLanguage === 'Hindi' 
              ? 'आपका इंटरव्यू तैयार हो रहा है...' 
              : 'Preparing your interview...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-[var(--color-primary)] text-white px-6 py-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold">
            🟦 Interview Simulation
          </h1>
          <p className="text-sm opacity-90 mt-1">
            {programmingLanguage} • {difficulty} • {interviewLanguage}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {phase === 'coding' && problem && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem Statement */}
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
                Problem Statement
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {problem.description}
                  </p>
                </div>

                <div className="bg-[var(--color-background)] p-4 rounded border border-[var(--color-border)]">
                  <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                    Input:
                  </p>
                  <code className="text-sm text-[var(--color-text-secondary)]">
                    {problem.input}
                  </code>
                </div>

                <div className="bg-[var(--color-background)] p-4 rounded border border-[var(--color-border)]">
                  <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                    Output:
                  </p>
                  <code className="text-sm text-[var(--color-text-secondary)]">
                    {problem.output}
                  </code>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div>
              <CodeEditor
                language={programmingLanguage}
                onSubmit={handleCodeSubmit}
                disabled={loading}
              />
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
                    <p className="text-xs font-semibold mb-1" style={{
                      color: item.speaker === 'ai' ? 'var(--color-primary)' : '#2563EB'
                    }}>
                      {item.speaker === 'ai' ? 'AI' : 'You'}
                    </p>
                    <p className="text-[var(--color-text)]">{item.text}</p>
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
                  <span>{isListening ? '🔴 Stop Speaking' : '🎤 Start Speaking'}</span>
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
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-primary)] mx-auto mb-4"></div>
            <p className="text-[var(--color-text)] text-lg">
              Generating your feedback... Please wait.
            </p>
          </div>
        )}
      </div>

      {/* Caption Display */}
      <CaptionDisplay
        speaker={currentCaption.speaker}
        text={currentCaption.text}
        isActive={currentCaption.isActive}
        language={interviewLanguage}
      />
    </div>
  );
}
