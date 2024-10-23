import React, { useState, useEffect, useCallback } from "react";
import Card from "./components/Card";
import ProgressBar from "./components/ProgressBar";
import AchievementModal from "./components/AchievementModal";
import WordList from "./components/WordList";
import Test from "./components/Test";
import Compare from "./components/Compare";
import CreateCard from "./components/CreateCard";
import Statistics from "./components/Statistics";
import Settings from "./components/Settings";
import Recommendations from "./components/Recommendations";
import useLocalStorage from "./hooks/useLocalStorage";
import words from "./data/words";
import "./styles/App.css";

function App() {
  const [currentWord, setCurrentWord] = useState(null);
  const [isNewCard, setIsNewCard] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSlideOut, setIsSlideOut] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useLocalStorage(
    "correctAnswers",
    0,
  );
  const [incorrectAnswers, setIncorrectAnswers] = useLocalStorage(
    "incorrectAnswers",
    0,
  );
  const [learnedWords, setLearnedWords] = useLocalStorage("learnedWords", []);
  const [repeatWords, setRepeatWords] = useLocalStorage("repeatWords", []);
  const [includeLearnedWords, setIncludeLearnedWords] = useLocalStorage(
    "includeLearnedWords",
    true,
  );
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState("");
  const [mode, setMode] = useState("cards"); // Режим обучения
  const [userWords, setUserWords] = useLocalStorage("userWords", []); // Сохраненные пользовательские карточки
  const [achievements, setAchievements] = useLocalStorage("achievements", []); // Достижения
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage(
    "notificationsEnabled",
    true,
  ); // Оповещения
  const [notificationFrequency, setNotificationFrequency] = useLocalStorage(
    "notificationFrequency",
    "daily",
  ); // Частота оповещений
  const [showCreateCard, setShowCreateCard] = useState(false); // Отображение формы создания карточки

  // Новое состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const wordsPerPage = 10;

  // Новое состояние для отслеживания правильных ответов на каждое слово
  const [wordCorrectCounts, setWordCorrectCounts] = useLocalStorage(
    "wordCorrectCounts",
    {},
  );

  // Функция для выбора нового слова
  const selectNewWord = useCallback(() => {
    setIsSlideOut(true);
    setTimeout(() => {
      setIsNewCard(false);
      setShowSkip(false);
      setIsSlideOut(false);

      const availableWords = words.filter(
        (word) =>
          !learnedWords.includes(word.english) ||
          (includeLearnedWords && Math.random() > 0.7),
      );

      const newWord =
        availableWords[Math.floor(Math.random() * availableWords.length)];
      setCurrentWord(newWord);
      setIsNewCard(true);
    }, 500);
  }, [learnedWords, includeLearnedWords]);

  useEffect(() => {
    selectNewWord();
  }, [selectNewWord]);

  useEffect(() => {
    // Обновление словаря при изменении userWords
    const updatedWords = [...words, ...userWords];
    setCurrentWord(
      updatedWords[Math.floor(Math.random() * updatedWords.length)],
    );
  }, [userWords]);

  const handleCorrectAnswer = () => {
    setCorrectAnswers((prev) => prev + 1);

    const updatedWordCorrectCounts = { ...wordCorrectCounts };
    if (!updatedWordCorrectCounts[currentWord.english]) {
      updatedWordCorrectCounts[currentWord.english] = 0;
    }
    updatedWordCorrectCounts[currentWord.english] += 1;

    if (updatedWordCorrectCounts[currentWord.english] >= 3) {
      setLearnedWords((prev) => [...prev, currentWord.english]);
      setRepeatWords((prev) =>
        prev.filter((word) => word !== currentWord.english),
      );
    }

    setWordCorrectCounts(updatedWordCorrectCounts);
    checkAchievements();
    selectNewWord();
  };

  const handleIncorrectAnswer = () => {
    setIncorrectAnswers((prev) => prev + 1);

    const updatedWordCorrectCounts = { ...wordCorrectCounts };
    if (!updatedWordCorrectCounts[currentWord.english]) {
      updatedWordCorrectCounts[currentWord.english] = 0;
    }
    updatedWordCorrectCounts[currentWord.english] = Math.max(
      0,
      updatedWordCorrectCounts[currentWord.english] - 1,
    );

    if (!repeatWords.includes(currentWord.english)) {
      setRepeatWords((prev) => [...prev, currentWord.english]);
    }

    setWordCorrectCounts(updatedWordCorrectCounts);
    setIsShaking(true);
    setShowSkip(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSkip = () => {
    selectNewWord();
  };

  const checkAchievements = () => {
    if (correctAnswers + 1 === 10 && !achievements.includes("10_correct")) {
      setAchievements([...achievements, "10_correct"]);
      setAchievementMessage("Поздравляем! Вы правильно ответили на 10 слов!");
      setShowAchievement(true);
    }
  };

  // Функция для управления режимами обучения
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setShowCreateCard(newMode === "create");
  };

  return (
    <div className="App">
      <ProgressBar
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        learnedWords={learnedWords.length}
      />

      <div className="mode-selector">
        <button onClick={() => handleModeChange("cards")}>Карточки</button>
        <button onClick={() => handleModeChange("list")}>Список</button>
        <button onClick={() => handleModeChange("test")}>Тест</button>
        <button onClick={() => handleModeChange("compare")}>Сравнение</button>
        <button onClick={() => handleModeChange("statistics")}>
          Статистика
        </button>
        <button onClick={() => handleModeChange("settings")}>Настройки</button>
        <button onClick={() => handleModeChange("recommendations")}>
          Рекомендации
        </button>
        <button onClick={() => handleModeChange("create")}>
          Создать карточку
        </button>
      </div>

      {mode === "cards" && (
        <div className="card-stack">
          <div className="card-placeholder" />
          <div className="card-placeholder" />
          <div className="card-placeholder" />
          {currentWord && (
            <Card
              word={currentWord}
              onCorrectAnswer={handleCorrectAnswer}
              onIncorrectAnswer={handleIncorrectAnswer}
              isNew={isNewCard}
              isShaking={isShaking}
              isSlideOut={isSlideOut}
              mode={mode} // Передаем mode в props
            />
          )}
          <div className="settings">
            <label>
              <input
                type="checkbox"
                checked={includeLearnedWords}
                onChange={() => setIncludeLearnedWords(!includeLearnedWords)}
              />
              Включить изученные слова
            </label>
          </div>
        </div>
      )}

      {mode === "list" && (
        <WordList
          words={words}
          userWords={userWords}
          learnedWords={learnedWords}
          repeatWords={repeatWords}
          setLearnedWords={setLearnedWords}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          wordsPerPage={wordsPerPage}
        />
      )}

      {mode === "test" && (
        <Test
          words={words}
          userWords={userWords}
          learnedWords={learnedWords}
          repeatWords={repeatWords}
          setLearnedWords={setLearnedWords}
          wordCorrectCounts={wordCorrectCounts}
          setWordCorrectCounts={setWordCorrectCounts}
        />
      )}

      {mode === "compare" && (
        <Compare
          words={words}
          userWords={userWords}
          learnedWords={learnedWords}
          repeatWords={repeatWords}
          setLearnedWords={setLearnedWords}
          wordCorrectCounts={wordCorrectCounts}
          setWordCorrectCounts={setWordCorrectCounts}
        />
      )}

      {showCreateCard && (
        <CreateCard userWords={userWords} setUserWords={setUserWords} />
      )}

      {mode === "statistics" && (
        <Statistics
          correctAnswers={correctAnswers}
          incorrectAnswers={incorrectAnswers}
          learnedWords={learnedWords}
          repeatWords={repeatWords}
        />
      )}

      {mode === "settings" && (
        <Settings
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          notificationFrequency={notificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
        />
      )}

      {mode === "recommendations" && (
        <Recommendations
          words={words}
          userWords={userWords}
          learnedWords={learnedWords}
          repeatWords={repeatWords}
        />
      )}

      {showSkip && (
        <button className="skip-button" onClick={handleSkip}>
          Пропустить
        </button>
      )}

      <AchievementModal
        show={showAchievement}
        message={achievementMessage}
        onClose={() => setShowAchievement(false)}
      />
    </div>
  );
}

export default App;
