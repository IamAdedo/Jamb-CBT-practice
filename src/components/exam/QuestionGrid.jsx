export default function QuestionGrid({
  questions,
  answers,
  currentIndex,
  onJump,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">
        Question Navigator
      </h3>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-jamb-blue inline-block" /> Current
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-jamb-green inline-block" /> Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-gray-200 inline-block" /> Unanswered
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = i === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => onJump(i)}
              className={`h-9 w-full rounded-lg text-xs font-bold transition-all
                ${isCurrent
                  ? "bg-jamb-blue text-white ring-2 ring-offset-1 ring-jamb-blue"
                  : isAnswered
                  ? "bg-jamb-green text-white hover:opacity-80"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Answered</span>
          <span className="font-bold text-jamb-green">
            {questions.filter((q) => answers[q.id]).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Unanswered</span>
          <span className="font-bold text-red-400">
            {questions.filter((q) => !answers[q.id]).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-bold">{questions.length}</span>
        </div>
      </div>
    </div>
  );
}
