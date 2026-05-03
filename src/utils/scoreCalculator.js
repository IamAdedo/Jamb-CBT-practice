/**
 * Calculates per-subject scores and total from answers + questions.
 * @param {Object} answers       - { questionId: "A"|"B"|"C"|"D" }
 * @param {Array}  questions     - array of question objects from DB
 * @param {Array}  subjects      - selected subjects array
 * @returns {{ scores, totalScore, totalQuestions, percentage }}
 */
export function calculateScores(answers, questions, subjects) {
  const scores = {};

  subjects.forEach((subject) => {
    const subjectQs = questions.filter((q) => q.subject === subject);
    const correct = subjectQs.filter(
      (q) => answers[q.id] === q.correct_answer
    ).length;
    scores[subject] = correct;
  });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const totalQuestions = questions.length;
  const percentage =
    totalQuestions > 0
      ? parseFloat(((totalScore / totalQuestions) * 100).toFixed(2))
      : 0;

  return { scores, totalScore, totalQuestions, percentage };
}
