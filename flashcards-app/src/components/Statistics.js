// В src/components/Statistics.js
import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function Statistics({
  correctAnswers,
  incorrectAnswers,
  learnedWords,
  repeatWords,
}) {
  const totalAnswers = correctAnswers + incorrectAnswers;
  const correctPercentage = totalAnswers
    ? (correctAnswers / totalAnswers) * 100
    : 0;
  const incorrectPercentage = totalAnswers
    ? (incorrectAnswers / totalAnswers) * 100
    : 0;

  const data = {
    labels: [
      "Правильные ответы",
      "Неправильные ответы",
      "Изученные слова",
      "Слова для повторения",
    ],
    datasets: [
      {
        label: "Статистика",
        data: [
          correctAnswers,
          incorrectAnswers,
          learnedWords.length,
          repeatWords.length,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#2196f3", "#ff9800"],
      },
    ],
  };

  return (
    <div>
      <h2>Статистика</h2>
      <Bar data={data} />
      <div>
        <p>Процент правильных ответов: {correctPercentage.toFixed(2)}%</p>
        <p>Процент неправильных ответов: {incorrectPercentage.toFixed(2)}%</p>
      </div>
    </div>
  );
}

export default Statistics;
