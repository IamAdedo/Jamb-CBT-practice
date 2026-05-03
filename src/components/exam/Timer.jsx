export default function Timer({ formatted, timeRemaining }) {
  const isWarning = timeRemaining <= 300; // last 5 minutes
  const isCritical = timeRemaining <= 60; // last 1 minute

  return (
    <div
      className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-2
        rounded-lg border-2 transition-all
        ${isCritical
          ? "bg-red-600 border-red-700 text-white animate-pulse"
          : isWarning
          ? "bg-orange-500 border-orange-600 text-white"
          : "bg-white border-jamb-blue text-jamb-blue"
        }`}
    >
      <span className="text-sm">⏱</span>
      <span>{formatted}</span>
    </div>
  );
}
