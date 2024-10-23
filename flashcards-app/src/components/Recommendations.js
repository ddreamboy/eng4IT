import React from "react";
import "../styles/Recommendations.css";

function Recommendations({ words, userWords, learnedWords, repeatWords }) {
  const allWords = [...words, ...userWords];
  const recommendedWords = allWords.filter((word) =>
    repeatWords.includes(word.english),
  );

  return (
    <div className="recommendations">
      <h2>Рекомендации</h2>
      <ul>
        {recommendedWords.map((word, index) => (
          <li key={index} className="recommendation-item">
            <div className="word-info">
              <span className="word-english">{word.english}</span>
              <span className="word-russian">{word.russian.join(", ")}</span>
            </div>
            <div className="word-status">
              {learnedWords.includes(word.english)
                ? "Изучено"
                : "Для повторения"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Recommendations;
