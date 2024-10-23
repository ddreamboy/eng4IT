import React, { useState, useEffect } from "react";
import "../styles/Card.css";
import words from "../data/words";

function Card({
  word,
  onCorrectAnswer,
  onIncorrectAnswer,
  isNew,
  isShaking,
  isSlideOut,
  mode, // Добавляем свойство mode
  testAnswer, // Функция для обработки ответа в тесте
  testIndex, // Индекс слова в тесте
  compareAnswer, // Функция для обработки ответа в сравнении
}) {
  const [flipped, setFlipped] = useState(false);
  const [options, setOptions] = useState([]);
  const [hasBeenShaken, setHasBeenShaken] = useState(false);

  useEffect(() => {
    const correctTranslation = word.russian[0];
    const incorrectOptions = getRandomIncorrectOptions(word.english, 3);
    const allOptions = [...incorrectOptions, correctTranslation].sort(
      () => Math.random() - 0.5,
    );
    setOptions(allOptions);
    setFlipped(false);
    setHasBeenShaken(false);
  }, [word]);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleOptionClick = (option) => {
    if (option === word.russian[0]) {
      onCorrectAnswer();
    } else {
      onIncorrectAnswer();
      setHasBeenShaken(true);
    }
  };

  const getRandomIncorrectOptions = (currentWord, count) => {
    const allWords = words.filter((w) => w.english !== currentWord);
    const shuffled = allWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((w) => w.russian[0]);
  };

  return (
    <div
      className={`card ${flipped ? "flipped" : ""} ${
        isNew ? "zoom-in" : ""
      } ${isShaking ? "shake" : ""} ${isSlideOut ? "slide-out" : ""}`}
      onClick={handleFlip}
    >
      <div className="card-inner">
        <div className="card-front">
          <h2>{word.english}</h2>
          {mode === "cards" && (
            <div className="options">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {mode === "test" && (
            <div className="options">
              <select onChange={(e) => testAnswer(testIndex, e.target.value)}>
                {word.russian.map((translation, i) => (
                  <option key={i} value={translation}>
                    {translation}
                  </option>
                ))}
              </select>
            </div>
          )}
          {mode === "compare" && (
            <div className="options">
              <button
                onClick={() => compareAnswer(word.english)}
                className="compare-button"
              >
                {word.english}
              </button>
            </div>
          )}
        </div>
        <div className="card-back">
          <h2>{word.english}</h2>
          <p>{word.russian.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}

export default Card;
