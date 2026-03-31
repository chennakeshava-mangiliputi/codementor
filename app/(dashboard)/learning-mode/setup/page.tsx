"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppButton from "@/components/ui/AppButton";
import SelectionGroup from "@/components/ui/SelectionGroup";

export default function LearningSetup() {
  const router = useRouter();
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewLanguage, setInterviewLanguage] = useState("");

  const handleStartLearning = () => {
    if (!programmingLanguage || !difficulty || !interviewLanguage) {
      alert("Please select all options before starting the learning session");
      return;
    }

    sessionStorage.setItem("programmingLanguage", programmingLanguage);
    sessionStorage.setItem("difficulty", difficulty);
    sessionStorage.setItem("interviewLanguage", interviewLanguage);
    sessionStorage.setItem("mode", "learning");

    router.push("/learning-mode/session");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-black text-black">Learning Mode Setup</h1>
          <p className="text-gray-600">
            Choose your preferences and let AI provide an optimal solution and explanation.
          </p>
        </div>

        <div className="space-y-8">
          <SelectionGroup
            label="Select Programming Language"
            options={["C", "C++", "Java", "Python", "SQL"]}
            value={programmingLanguage}
            onChange={setProgrammingLanguage}
          />

          <SelectionGroup
            label="Select Difficulty Level"
            options={["Easy", "Medium", "Hard"]}
            value={difficulty}
            onChange={setDifficulty}
            columns="grid-cols-3"
          />

          <SelectionGroup
            label="Select Interview Language"
            options={["English", "Hindi"]}
            value={interviewLanguage}
            onChange={setInterviewLanguage}
            columns="grid-cols-2"
          />

          <AppButton
            onClick={handleStartLearning}
            disabled={!programmingLanguage || !difficulty || !interviewLanguage}
            fullWidth
            className="text-base"
          >
            Start Learning Mode
          </AppButton>
        </div>

        {(programmingLanguage || difficulty || interviewLanguage) && (
          <div className="mt-6 rounded-2xl border border-gray-300 bg-gray-50 p-5">
            <p className="mb-3 text-sm font-semibold text-gray-600">Your selections</p>
            <div className="flex flex-wrap gap-2">
              {[programmingLanguage, difficulty, interviewLanguage]
                .filter(Boolean)
                .map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black bg-black px-3 py-1 text-sm font-medium text-white"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
