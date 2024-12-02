export const calculateSuccessRate = (answers) => {
  if (!answers || answers.length === 0) return 0;
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  return Math.round((correctAnswers / answers.length) * 100);
};

export const calculateSessionStats = (session) => {
  return {
    correctResponses: session.filter((step) => step.isCorrect).length,
    totalResponses: session.length,
    hintsUsed: session.filter((step) => step.usedHint).length,
  };
};
