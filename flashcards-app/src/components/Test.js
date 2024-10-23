import React, { useState } from "react";

function Test({
  words,
  userWords,
  learnedWords,
  repeatWords,
  setLearnedWords,
  wordCorrectCounts,
  setWordCorrectCounts,
}) {
  const [testLevel, setTestLevel] = useState("easy");
  const [testWords, setTestWords] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const startTest = () => {
    const allWords = [...words, ...userWords].filter(
      (word) => !learnedWords.includes(word.english),
    );
    const shuffledWords = allWords.sort(() => 0.5 - Math.random());
    const numQuestions =
      testLevel === "easy" ? 5 : testLevel === "medium" ? 10 : 15;
    setTestWords(shuffledWords.slice(0, numQuestions));
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const handleAnswer = (answer) => {
    const updatedWordCorrectCounts = { ...wordCorrectCounts };
    const currentWord = testWords[currentQuestion];

    if (answer === currentWord.russian[0]) {
      if (!updatedWordCorrectCounts[currentWord.english]) {
        updatedWordCorrectCounts[currentWord.english] = 0;
      }
      updatedWordCorrectCounts[currentWord.english] += 1;

      if (updatedWordCorrectCounts[currentWord.english] >= 3) {
        setLearnedWords((prev) => [...prev, currentWord.english]);
      }
    } else {
      if (!updatedWordCorrectCounts[currentWord.english]) {
        updatedWordCorrectCounts[currentWord.english] = 0;
      }
      updatedWordCorrectCounts[currentWord.english] = Math.max(
        0,
        updatedWordCorrectCounts[currentWord.english] - 1,
      );
    }

    setWordCorrectCounts(updatedWordCorrectCounts);
    setAnswers([...answers, answer]);

    if (currentQuestion < testWords.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const correctAnswers = answers.filter(
    (answer, index) => answer === testWords[index].russian[0],
  ).length;

  return (
    <div>
      {!showResults ? (
        <>
          <div>
            <label htmlFor="test-level">Уровень сложности:</label>
            <select
              id="test-level"
              value={testLevel}
              onChange={(e) => setTestLevel(e.target.value)}
            >
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </select>
          </div>
          <button onClick={startTest}>Начать тест</button>
          {testWords.length > 0 && (
            <div>
              <h2>
                Вопрос {currentQuestion + 1} из {testWords.length}
              </h2>
              <p>{testWords[currentQuestion].english}</p>
              {testWords[currentQuestion].russian.map((translation, index) => (
                <button key={index} onClick={() => handleAnswer(translation)}>
                  {translation}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <h2>Результаты теста</h2>
          <p>
            Правильных ответов: {correctAnswers} из {testWords.length}
          </p>
          <p>
            Процент правильных ответов:{" "}
            {(correctAnswers / testWords.length) * 100}%
          </p>
          <ul>
            {testWords.map((word, index) => (
              <li key={index}>
                {word.english} - {answers[index]} (
                {answers[index] === word.russian[0]
                  ? "Правильно"
                  : "Неправильно"}
                )
              </li>
            ))}
          </ul>
          <button onClick={startTest}>Повторить тест</button>
        </div>
      )}
    </div>
  );
}

export default Test;
