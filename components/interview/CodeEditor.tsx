// components/interview/CodeEditor.tsx
'use client';

import { useEffect, useState } from 'react';

interface CodeEditorProps {
  language: string;
  onSubmit?: (code: string) => void;
  disabled?: boolean;
  initialCode?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export default function CodeEditor({
  language,
  onSubmit,
  disabled = false,
  initialCode = '',
  readOnly = false,
  placeholder,
}: CodeEditorProps) {
  // The editor's internal state
  const [code, setCode] = useState(initialCode || '');

  // If initialCode changes (AI result arrives), update editor
  useEffect(() => {
    setCode(initialCode || '');
  }, [initialCode]);

  const handleSubmit = () => {
    if (onSubmit) onSubmit(code);
  };

  // Basic keyboard indent helper (keeps your old behavior)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      // Move cursor after inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-white">Code Editor ({language})</h3>
        <span className="text-xs text-slate-400">
          {readOnly ? 'Read-only (AI solution)' : 'Write your solution below'}
        </span>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || `// Write your ${language} code here`}
        disabled={disabled || readOnly}
        rows={14}
        className="w-full bg-slate-900 text-sm text-white p-3 rounded-md font-mono border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="mt-4 flex justify-end">
        {/* Only show submit for editable mode when onSubmit exists */}
        {!readOnly && onSubmit && (
          <button
            onClick={handleSubmit}
            disabled={disabled || !code.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Submit Code
          </button>
        )}
      </div>
    </div>
  );
}
