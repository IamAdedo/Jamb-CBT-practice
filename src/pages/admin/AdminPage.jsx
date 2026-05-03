import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useExamStore } from "../../store/examStore";
import QuestionUploader from "../../components/admin/QuestionUploader";

export default function AdminPage() {
  const navigate  = useNavigate();
  const user      = useExamStore((s) => s.user);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Subject-level question counts
      const { data } = await supabase
        .from("questions")
        .select("subject");

      if (data) {
        const counts = data.reduce((acc, { subject }) => {
          acc[subject] = (acc[subject] || 0) + 1;
          return acc;
        }, {});
        setStats({ total: data.length, bySubject: counts });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-jamb-light flex flex-col">

      {/* Header */}
      <header className="bg-jamb-blue text-white px-6 py-4 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <span className="text-jamb-blue font-bold text-lg">J</span>
            </div>
            <div>
              <p className="font-bold text-lg leading-none">Admin Panel</p>
              <p className="text-blue-200 text-xs">JAMB CBT Practice Portal</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm bg-white text-jamb-blue px-4 py-1.5 rounded-lg
                       font-semibold hover:bg-blue-100 transition"
          >
            ← Portal
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Questions"
            value={loading ? "…" : stats?.total ?? 0}
            icon="📚"
            highlight
          />
          {!loading && stats?.bySubject &&
            Object.entries(stats.bySubject)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([subject, count]) => (
                <StatCard
                  key={subject}
                  label={subject}
                  value={count}
                  icon="📄"
                />
              ))}
        </div>

        {/* Subject breakdown table */}
        {!loading && stats?.bySubject && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-jamb-blue mb-4">Questions by Subject</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(stats.bySubject)
                .sort((a, b) => b[1] - a[1])
                .map(([subject, count]) => {
                  const pct = Math.min((count / 60) * 100, 100);
                  return (
                    <div key={subject}
                         className="bg-jamb-light rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-600 truncate">
                        {subject}
                      </p>
                      <p className="text-xl font-bold text-jamb-blue">{count}</p>
                      <div className="mt-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-jamb-blue h-1.5 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {count >= 60 ? "Ready ✓" : `${60 - count} more needed`}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Uploader */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-jamb-blue text-lg mb-1">
            Upload Questions
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Add questions via bulk JSON/CSV upload or enter them one at a time.
          </p>
          <QuestionUploader />
        </div>

      </main>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm border
      ${highlight
        ? "bg-jamb-blue text-white border-jamb-blue"
        : "bg-white text-gray-700 border-gray-100"}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-3xl font-bold ${highlight ? "text-white" : "text-jamb-blue"}`}>
        {value}
      </p>
      <p className={`text-xs mt-1 ${highlight ? "text-blue-200" : "text-gray-500"}`}>
        {label}
      </p>
    </div>
  );
}
