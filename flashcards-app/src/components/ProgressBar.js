import React from "react";
import "../styles/ProgressBar.css";

function ProgressBar({ correctAnswers, incorrectAnswers, learnedWords }) {
  const totalAnswers = correctAnswers + incorrectAnswers;
  const correctPercentage = totalAnswers
    ? (correctAnswers / totalAnswers) * 100
    : 0;

  return (
    <div className="progress-bar">
      <div className="stats">
        <div>Правильных ответов: {correctAnswers}</div>
        <div>Неправильных ответов: {incorrectAnswers}</div>
        <div>Изученных слов: {learnedWords}</div>
      </div>
      <div className="bar">
        <div className="fill" style={{ width: `${correctPercentage}%` }}></div>
      </div>
    </div>
  );
}

export default ProgressBar;
