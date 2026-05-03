import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useExamStore } from "../store/examStore";

export function useExamSession() {
  const { sessionId, saveAnswer, setSessionId } = useExamStore();
  const [saving, setSaving] = useState(false);

  // Persist a single answer immediately to Supabase
  const persistAnswer = useCallback(
    async (questionId, option) => {
      saveAnswer(questionId, option); // update local store instantly

      if (!sessionId) return;
      setSaving(true);

      const current = useExamStore.getState().answers;
      const updated = { ...current, [questionId]: option };

      await supabase
        .from("exam_sessions")
        .update({ saved_answers: updated })
        .eq("id", sessionId);

      setSaving(false);
    },
    [sessionId, saveAnswer]
  );

  // Create a brand-new session when exam starts
  const createSession = useCallback(async (userId, subjects, questionIds) => {
    const { data, error } = await supabase
      .from("exam_sessions")
      .insert({
        user_id: userId,
        selected_subjects: subjects,
        question_order: questionIds,
        time_remaining: 7200,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;
    setSessionId(data.id);
    return data;
  }, []);

  // Resume an existing active session
  const resumeSession = useCallback(async (userId) => {
    const { data } = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    return data ?? null;
  }, []);

  return { persistAnswer, createSession, resumeSession, saving };
}
