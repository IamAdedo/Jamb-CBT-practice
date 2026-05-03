import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useExamStore } from "../store/examStore";

export function useAuth() {
  const { user, setUser } = useExamStore();

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    useExamStore.getState().resetExam();
  };

  return { user, logout };
}
