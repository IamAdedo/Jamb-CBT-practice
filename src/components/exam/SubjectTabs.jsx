export default function SubjectTabs({ subjects, activeSubject, onSelect, answers, questionsBySubject }) {
  return (
    <div className="flex flex-wrap gap-2 bg-white border-b border-gray-200 px-4 py-3">
      {subjects.map((subject) => {
        const qs = questionsBySubject[subject] || [];
        const answered = qs.filter((q) => answers[q.id]).length;
        const isActive = subject === activeSubject;

        return (
          <button
            key={subject}
            onClick={() => onSelect(subject)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2
              ${isActive
                ? "bg-jamb-blue text-white border-jamb-blue"
                : "bg-white text-jamb-blue border-jamb-blue hover:bg-jamb-light"
              }`}
          >
            {subject}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full
              ${isActive ? "bg-white text-jamb-blue" : "bg-jamb-light text-jamb-blue"}`}>
              {answered}/{qs.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
