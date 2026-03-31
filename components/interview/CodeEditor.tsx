"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import AppButton from "@/components/ui/AppButton";

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
  initialCode = "",
  readOnly = false,
  placeholder,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode || "");

  const handleSubmit = () => {
    if (onSubmit) onSubmit(code);
  };

  const normalizedLanguage =
    language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase();

  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-black">Code Editor ({language})</h3>
        <span className="text-xs text-gray-600">
          {readOnly ? "Read-only (AI solution)" : "Write your solution below"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-300">
        <Editor
          height="460px"
          defaultLanguage={normalizedLanguage}
          language={normalizedLanguage}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs"
          options={{
            readOnly: disabled || readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            autoIndent: "advanced",
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
          }}
          loading={
            <div className="flex h-[460px] items-center justify-center bg-gray-50 text-sm text-gray-500">
              Loading editor...
            </div>
          }
        />
      </div>

      {!code && placeholder && (
        <p className="mt-2 text-xs text-gray-500">{placeholder}</p>
      )}

      {/* Monaco handles tab indentation and editor behavior natively. */}
      {/* placeholder is shown below because Monaco does not support native placeholders. */}
      <input
        type="hidden"
        value={code}
      />

      <div className="mt-4 flex justify-end">
        {!readOnly && onSubmit && (
          <AppButton
            onClick={handleSubmit}
            disabled={disabled || !code.trim()}
            className="min-w-40"
          >
            Submit Code
          </AppButton>
        )}
      </div>
    </div>
  );
}
