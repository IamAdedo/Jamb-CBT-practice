import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useExamStore } from "../../store/examStore";
import { useExamSession } from "../../hooks/useExamSession";
import { useTimer } from "../../hooks/useTimer";
import { calculateScores } from "../../utils/scoreCalculator";

import SubjectTabs from "./SubjectTabs";
import QuestionCard from "./QuestionCard";
import QuestionGrid from "./QuestionGrid";
import Timer from "./Timer";
import LoadingSpinner from "../shared/LoadingSpinner";

export default function ExamEngine() {
  const navigate = useNavigate();
  const {
    user,
    selectedSubjects,
    sessionId,
    answers,
    timeRemaining,
    setTimeRemaining,
    setSessionId,
  } = useExamStore();

  const { persistAnswer, createSession, resumeSession, saving } =
    useExamSession();

  const [questions, setQuestions] = useState([]);       // all questions flat
  const [questionsBySubject, setQuestionsBySubject] = useState({});
  const [activeSubject, setActiveSubject] = useState(selectedSubjects[0]);
  const [currentIndex, setCurrentIndex] = useState(0); // index within active subject
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Submit exam ─────────────────────────────────────────────────────────────
  const submitExam = useCallback(
    async (reason = "manual") => {
      if (submitting || !sessionId) return;
      setSubmitting(true);

      const status = reason === "timeout" ? "timed_out" : "submitted";
      const { scores, totalScore, totalQuestions, percentage } =
        calculateScores(answers, questions, selectedSubjects);

      // Mark session done
      await supabase
        .from("exam_sessions")
        .update({ status, submitted_at: new Date().toISOString() })
        .eq("id", sessionId);

      // Write results
      await supabase.from("results").insert({
        session_id: sessionId,
        user_id: user.id,
        scores,
        total_score: totalScore,
        total_questions: totalQuestions,
        percentage,
      });

      navigate("/results", {
        state: { scores, totalScore, totalQuestions, percentage, reason },
      });
    },
    [submitting, sessionId, answers, questions, selectedSubjects, user, navigate]
  );

  // ── Timer ───────────────────────────────────────────────────────────────────
  const { formatted } = useTimer(() => submitExam("timeout"));

  // ── Load questions & session ─────────────────────────────────────────────
  useEffect(() => {
    if (!user || !selectedSubjects.length) return;

    const init = async () => {
      setLoading(true);

      // Fetch 60 questions: 15 per subject (or all if fewer exist)
      const { data: qs, error } = await supabase
        .from("questions")
        .select("*")
        .in("subject", selectedSubjects)
        .limit(240); // fetch enough, then slice per subject

      if (error || !qs) {
        console.error("Failed to load questions", error);
        setLoading(false);
        return;
      }

      // Group and limit to 60 per subject (JAMB standard)
      const grouped = {};
      selectedSubjects.forEach((sub) => {
        const subQs = qs.filter((q) => q.subject === sub).slice(0, 60);
        grouped[sub] = subQs;
      });

      const allQs = Object.values(grouped).flat();
      setQuestionsBySubject(grouped);
      setQuestions(allQs);

      // Resume or create session
      let session = await resumeSession(user.id);
      if (session) {
        setSessionId(session.id);
        setTimeRemaining(session.time_remaining);
        // Restore saved answers into store
        const saved = session.saved_answers || {};
        Object.entries(saved).forEach(([qId, opt]) => {
          useExamStore.getState().saveAnswer(qId, opt);
        });
      } else {
        const qIds = allQs.map((q) => q.id);
        await createSession(user.id, selectedSubjects, qIds);
      }

      setLoading(false);
    };

    init();
  }, [user, selectedSubjects]);

  // ── Navigation helpers ──────────────────────────────────────────────────
  const activeQuestions = questionsBySubject[activeSubject] || [];
  const currentQuestion = activeQuestions[currentIndex];

  const goNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Move to next subject tab
      const idx = selectedSubjects.indexOf(activeSubject);
      if (idx < selectedSubjects.length - 1) {
        const nextSub = selectedSubjects[idx + 1];
        setActiveSubject(nextSub);
        setCurrentIndex(0);
      }
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      const idx = selectedSubjects.indexOf(activeSubject);
      if (idx > 0) {
        const prevSub = selectedSubjects[idx - 1];
        setActiveSubject(prevSub);
        setCurrentIndex((questionsBySubject[prevSub]?.length || 1) - 1);
      }
    }
  };

  const handleSubjectChange = (subject) => {
    setActiveSubject(subject);
    setCurrentIndex(0);
  };

  const handleJump = (i) => setCurrentIndex(i);

  // Global question number (across all subjects)
  const globalIndex =
    selectedSubjects
      .slice(0, selectedSubjects.indexOf(activeSubject))
      .reduce((acc, sub) => acc + (questionsBySubject[sub]?.length || 0), 0) +
    currentIndex;

  if (loading) return <LoadingSpinner message="Loading exam questions…" />;

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jamb-light">
        <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md">
          <p className="text-2xl mb-3">📭</p>
          <h2 className="text-xl font-bold text-jamb-blue mb-2">
            No Questions Found
          </h2>
          <p className="text-gray-500 text-sm">
            No questions are available for your selected subjects yet.
            Ask your admin to upload questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jamb-light flex flex-col">

      {/* ── Top bar ── */}
      <header className="bg-jamb-blue text-white px-4 py-3 flex items-center
                         justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-jamb-blue font-bold">J</span>
          </div>
          <span className="font-bold hidden sm:block">JAMB CBT Practice</span>
        </div>

        <Timer formatted={formatted()} timeRemaining={timeRemaining} />

        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="bg-jamb-green hover:bg-green-700 text-white text-sm font-bold
                     px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          Submit Exam
        </button>
      </header>

      {/* ── Subject tabs ── */}
      <SubjectTabs
        subjects={selectedSubjects}
        activeSubject={activeSubject}
        onSelect={handleSubjectChange}
        answers={answers}
        questionsBySubject={questionsBySubject}
      />

      {/* ── Main layout ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 grid
                      grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">

        {/* Question area */}
        <div className="flex flex-col gap-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={globalIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion?.id]}
            onAnswer={persistAnswer}
            saving={saving}
          />

          {/* Prev / Next */}
          <div className="flex justify-between items-center">
            <button
              onClick={goPrev}
              disabled={globalIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2
                         border-jamb-blue text-jamb-blue font-semibold text-sm
                         hover:bg-jamb-light transition disabled:opacity-30
                         disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-500 font-medium">
              {globalIndex + 1} / {questions.length}
            </span>

            <button
              onClick={goNext}
              disabled={globalIndex === questions.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                         bg-jamb-blue text-white font-semibold text-sm
                         hover:bg-blue-900 transition disabled:opacity-30
                         disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question grid sidebar */}
        <div className="hidden lg:block">
          <QuestionGrid
            questions={activeQuestions}
            answers={answers}
            currentIndex={currentIndex}
            onJump={handleJump}
          />
        </div>
      </div>

      {/* Mobile question grid (collapsible) */}
      <div className="lg:hidden px-4 pb-6">
        <details className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <summary className="px-4 py-3 font-semibold text-jamb-blue cursor-pointer
                              text-sm select-none">
            📊 Question Navigator
          </summary>
          <div className="px-4 pb-4">
            <QuestionGrid
              questions={activeQuestions}
              answers={answers}
              currentIndex={currentIndex}
              onJump={(i) => {
                handleJump(i);
              }}
            />
          </div>
        </details>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-jamb-blue mb-2">
              Submit Exam?
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              You have answered{" "}
              <strong>
                {questions.filter((q) => answers[q.id]).length}
              </strong>{" "}
              out of <strong>{questions.length}</strong> questions.
            </p>
            {questions.filter((q) => !answers[q.id]).length > 0 && (
              <p className="text-orange-500 text-sm mb-4">
                ⚠️ {questions.filter((q) => !answers[q.id]).length} question(s)
                are unanswered. You cannot change answers after submitting.
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5
                           rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => submitExam("manual")}
                disabled={submitting}
                className="flex-1 bg-jamb-green text-white py-2.5 rounded-xl
                           font-bold hover:bg-green-700 transition
                           disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
