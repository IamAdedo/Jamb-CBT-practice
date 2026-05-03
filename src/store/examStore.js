import { create } from "zustand";

export const useExamStore = create((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Subject selection
  selectedSubjects: [],
  setSelectedSubjects: (subjects) => set({ selectedSubjects: subjects }),

  // Active exam session
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  // Answers map { questionId: "A" | "B" | "C" | "D" }
  answers: {},
  saveAnswer: (qId, option) =>
    set((state) => ({ answers: { ...state.answers, [qId]: option } })),

  // Timer
  timeRemaining: 7200,
  setTimeRemaining: (t) => set({ timeRemaining: t }),

  // Reset everything on logout or submission
  resetExam: () =>
    set({
      selectedSubjects: [],
      sessionId: null,
      answers: {},
      timeRemaining: 7200,
    }),
}));
