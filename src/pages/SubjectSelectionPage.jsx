import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExamStore } from "../store/examStore";
import Navbar from "../components/shared/Navbar";

const ALL_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "Government",
  "Economics",
  "Literature",
  "Commerce",
  "Accounting",
  "Agricultural Science",
  "CRS",
  "IRS",
];

// English Language is compulsory for JAMB
const COMPULSORY = "English Language";
const MAX_SUBJECTS = 4;

export default function SubjectSelectionPage() {
  const navigate = useNavigate();
  const setSelectedSubjects = useExamStore((s) => s.setSelectedSubjects);

  const [chosen, setChosen] = useState([COMPULSORY]);

  const toggle = (subject) => {
    if (subject === COMPULSORY) return; // can't deselect compulsory

    setChosen((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      }
      if (prev.length >= MAX_SUBJECTS) return prev; // already at limit
      return [...prev, subject];
    });
  };

  const handleStart = () => {
    setSelectedSubjects(chosen);
    navigate("/exam");
  };

  return (
    <div className="min-h-screen bg-jamb-light">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-jamb-blue mb-1">
            Select Your Subjects
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Choose <strong>4 subjects</strong>. English Language is compulsory.
          </p>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: MAX_SUBJECTS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < chosen.length ? "bg-jamb-blue" : "bg-gray-200"
                }`}
              />
            ))}
            <span className="text-sm font-medium text-gray-600 ml-2">
              {chosen.length}/{MAX_SUBJECTS}
            </span>
          </div>

          {/* Subject grid */}
          <div className="grid grid-cols-2 gap-3">
            {ALL_SUBJECTS.map((subject) => {
              const isChosen = chosen.includes(subject);
              const isCompulsory = subject === COMPULSORY;
              const isDisabled = !isChosen && chosen.length >= MAX_SUBJECTS;

              return (
                <button
                  key={subject}
                  onClick={() => toggle(subject)}
                  disabled={isDisabled}
                  className={`p-3 rounded-xl border-2 text-sm font-medium text-left
                    transition-all duration-150
                    ${isChosen
                      ? "border-jamb-blue bg-jamb-light text-jamb-blue"
                      : "border-gray-200 bg-white text-gray-700 hover:border-jamb-blue"}
                    ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    ${isCompulsory ? "ring-2 ring-jamb-green ring-offset-1" : ""}
                  `}
                >
                  <span>{subject}</span>
                  {isCompulsory && (
                    <span className="block text-xs text-jamb-green font-normal mt-0.5">
                      Compulsory
                    </span>
                  )}
                  {isChosen && !isCompulsory && (
                    <span className="block text-xs text-jamb-blue font-normal mt-0.5">
                      ✓ Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={chosen.length < MAX_SUBJECTS}
            className="mt-8 w-full bg-jamb-blue text-white py-3 rounded-xl
                       font-bold text-lg hover:bg-blue-900 transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {chosen.length < MAX_SUBJECTS
              ? `Select ${MAX_SUBJECTS - chosen.length} more subject${MAX_SUBJECTS - chosen.length > 1 ? "s" : ""}`
              : "Start Exam →"}
          </button>
        </div>
      </main>
    </div>
  );
}
