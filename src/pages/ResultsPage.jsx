import { useLocation, useNavigate } from "react-router-dom";
import { useExamStore } from "../store/examStore";

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const resetExam = useExamStore((s) => s.resetExam);

  const { scores = {}, totalScore = 0, totalQuestions = 0,
          percentage = 0, reason = "manual" } = state || {};

  const handleRetry = () => {
    resetExam();
    navigate("/");
  };

  const grade = percentage >= 70 ? "Excellent" :
                percentage >= 50 ? "Good" :
                percentage >= 40 ? "Pass" : "Below Pass";

  const gradeColor = percentage >= 70 ? "text-jamb-green" :
                     percentage >= 50 ? "text-blue-600" :
                     percentage >= 40 ? "text-orange-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-jamb-light flex flex-col">

      {/* Header */}
      <header className="bg-jamb-blue text-white px-6 py-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <span className="text-jamb-blue font-bold text-lg">J</span>
          </div>
          <span className="font-bold text-lg">JAMB CBT Practice — Results</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 space-y-6">

        {/* Timeout banner */}
        {reason === "timeout" && (
          <div className="bg-orange-100 border border-orange-300 text-orange-700
                          rounded-xl px-5 py-3 text-sm font-medium">
            ⏱ Time expired — your exam was automatically submitted.
          </div>
        )}

        {/* Score card */}
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <p className="text-gray-500 text-sm mb-1">Your Total Score</p>
          <p className="text-6xl font-bold text-jamb-blue mb-1">
            {totalScore}
            <span className="text-2xl text-gray-400 font-normal">
              /{totalQuestions}
            </span>
          </p>
          <p className={`text-2xl font-bold mt-2 ${gradeColor}`}>
            {percentage}% — {grade}
          </p>

          {/* Progress bar */}
          <div className="mt-5 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700
                ${percentage >= 70 ? "bg-jamb-green" :
                  percentage >= 50 ? "bg-blue-500" :
                  percentage >= 40 ? "bg-orange-400" : "bg-red-400"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Per-subject breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-jamb-blue mb-4 text-lg">
            Subject Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(scores).map(([subject, score]) => {
              const total = 60; // questions per subject
              const pct = Math.round((score / total) * 100);
              return (
                <div key={subject}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-gray-700">{subject}</span>
                    <span className="text-jamb-blue font-bold">
                      {score}/{total} ({pct}%)
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500
                        ${pct >= 70 ? "bg-jamb-green" :
                          pct >= 50 ? "bg-blue-400" :
                          pct >= 40 ? "bg-orange-400" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 bg-jamb-blue text-white py-3 rounded-xl font-bold
                       hover:bg-blue-900 transition"
          >
            🔄 Try Another Exam
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 border-2 border-jamb-blue text-jamb-blue py-3
                       rounded-xl font-bold hover:bg-jamb-light transition"
          >
            🖨 Print Results
          </button>
        </div>
      </main>
    </div>
  );
}
