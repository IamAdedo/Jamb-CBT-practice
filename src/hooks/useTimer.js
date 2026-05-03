import { useEffect, useRef } from "react";
import { useExamStore } from "../store/examStore";
import { supabase } from "../lib/supabaseClient";

export function useTimer(onExpire) {
  const { timeRemaining, setTimeRemaining, sessionId } = useExamStore();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    intervalRef.current = setInterval(async () => {
      const next = useExamStore.getState().timeRemaining - 1;

      if (next <= 0) {
        clearInterval(intervalRef.current);
        setTimeRemaining(0);
        onExpire?.();
        return;
      }

      setTimeRemaining(next);

      // Persist time to DB every 30 seconds to survive refresh
      if (next % 30 === 0) {
        await supabase
          .from("exam_sessions")
          .update({ time_remaining: next })
          .eq("id", sessionId);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [sessionId]);

  const formatted = () => {
    const h = Math.floor(timeRemaining / 3600);
    const m = Math.floor((timeRemaining % 3600) / 60);
    const s = timeRemaining % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return { timeRemaining, formatted };
}
