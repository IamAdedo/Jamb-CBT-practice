const OPTIONS = ["A", "B", "C", "D"];

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  saving,
}) {
  if (!question) return null;

  const optionValues = [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Question header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-jamb-blue bg-jamb-light
                         px-3 py-1 rounded-full">
          Question {questionNumber} of {totalQuestions}
        </span>
        {saving && (
          <span className="text-xs text-gray-400 animate-pulse">Saving…</span>
        )}
        {selectedAnswer && !saving && (
          <span className="text-xs text-jamb-green font-semibold">✓ Saved</span>
        )}
      </div>

      {/* Question text */}
      <p className="text-gray-800 font-medium text-base leading-relaxed mb-6">
        {question.question_text}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {OPTIONS.map((letter, i) => {
          const isSelected = selectedAnswer === letter;
          return (
            <button
              key={letter}
              onClick={() => onAnswer(question.id, letter)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl
                border-2 text-left transition-all duration-150 font-medium
                ${isSelected
                  ? "border-jamb-blue bg-jamb-blue text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-jamb-blue hover:bg-jamb-light"
                }`}
            >
              <span className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center
                justify-center text-sm font-bold border-2
                ${isSelected
                  ? "border-white text-jamb-blue bg-white"
                  : "border-gray-300 text-gray-500"
                }`}>
                {letter}
              </span>
              <span className="text-sm leading-snug">{optionValues[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
