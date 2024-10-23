// В src/components/Compare.js
import React, { useState } from "react";

function Compare({
  words,
  userWords,
  learnedWords,
  repeatWords,
  setLearnedWords,
}) {
  const [compareWords, setCompareWords] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const startCompare = () => {
    const allWords = [...words, ...userWords].filter(
      (word) => !learnedWords.includes(word.english),
    );
    const shuffledWords = allWords.sort(() => 0.5 - Math.random());
    setCompareWords(shuffledWords.slice(0, 2));
    setAnswers([]);
    setShowResults(false);
  };

  const handleAnswer = (word, correct) => {
    setAnswers([...answers, { word, correct }]);
    if (compareWords.length < 2) {
      setShowResults(true);
    } else {
      startCompare();
    }
  };

  const correctAnswers = answers.filter((answer) => answer.correct).length;

  return (
    <div>
      {!showResults ? (
        <>
          <button onClick={startCompare}>Начать сравнение</button>
          {compareWords.length > 0 && (
            <div>
              <h2>Сравнение</h2>
              {compareWords.map((word, index) => (
                <div key={index}>
                  <p>
                    {word.english}: {word.russian.join(", ")}
                  </p>
                  <button onClick={() => handleAnswer(word, true)}>
                    Правильно
                  </button>
                  <button onClick={() => handleAnswer(word, false)}>
                    Неправильно
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <h2>Результаты сравнения</h2>
          <p>
            Правильных ответов: {correctAnswers} из {answers.length}
          </p>
          <p>
            Процент правильных ответов:{" "}
            {(correctAnswers / answers.length) * 100}%
          </p>
          <ul>
            {answers.map((answer, index) => (
              <li key={index}>
                {answer.word.english} -{" "}
                {answer.correct ? "Правильно" : "Неправильно"}
              </li>
            ))}
          </ul>
          <button onClick={startCompare}>Повторить сравнение</button>
        </div>
      )}
    </div>
  );
}

export default Compare;
