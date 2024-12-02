Claude 3.5 Sonnet и фикс отображения избранных слов в интерфейсе (спойлер: неудача)

eng4IT/frontend/src
```css eng4IT/frontend/src/App.css
.App {
    text-align: center;
}

.App-logo {
    height: 40vmin;
    pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
    .App-logo {
        animation: App-logo-spin infinite 20s linear;
    }
}

@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-5px);
    }
    75% {
        transform: translateX(5px);
    }
}

.animate-shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.App-header {
    background-color: #282c34;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;
}

.App-link {
    color: #61dafb;
}

@keyframes App-logo-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
```

```js eng4IT/frontend/src/App.js
// eng4IT/frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import Dashboard from "./components/Dashboard";
import WordAssessment from "./components/WordAssessment";
import LearningInterface from "./components/LearningInterface";
import ChatExercise from "./components/ChatExercise";
import MatchingExercise from "./components/MatchingExercise";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<WordAssessment />} />
          <Route path="/learning" element={<LearningInterface />} />
          <Route path="/chat-exercise" element={<ChatExercise />} />
          <Route path="/matching" element={<MatchingExercise />} />
        </Routes>
        <ThemeToggle />
      </Router>
    </ThemeProvider>
  );
};

export default App;
```

```js eng4IT/frontend/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

components
```js eng4IT/frontend/src/components/CategoryTree.js
// eng4IT/frontend/src/components/CategoryTree.js
import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CategoryItem = ({ category, level = 0, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`
          flex items-center space-x-2 p-2 rounded-lg cursor-pointer
          hover:bg-gray-800 transition-colors
        `}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          }
          onSelect(category);
        }}
      >
        {hasChildren ? (
          <span className="text-gray-400">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        ) : (
          <span className="w-[18px]" />
        )}
        <span className="text-primary">
          {isOpen ? <FolderOpen size={18} /> : <Folder size={18} />}
        </span>
        <span className="text-gray-200">{category.name}</span>
        {category.metadata?.count && (
          <span className="text-xs text-gray-400">
            ({category.metadata.count})
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {category.children.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                level={level + 1}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryTree = ({ categories, onSelectCategory }) => {
  return (
    <div className="bg-dark-card border border-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-primary mb-4">Categories</h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryTree;
```

```js eng4IT/frontend/src/components/ChatExercise.js
import React, { useState, useEffect } from "react";
import { MessageSquare, Volume2, Languages, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Добавляем AnimatePresence
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Обновляем компонент HintMessage
const HintMessage = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute bottom-full left-0 right-0 mb-2 px-4 py-2 bg-zinc-800 rounded-lg shadow-lg"
  >
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        {message.split("\n").map((line, index) => (
          <p key={index} className="text-sm text-zinc-300">
            {line}
          </p>
        ))}
      </div>
      <button
        onClick={onClose}
        className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </motion.div>
);

const Message = ({ text, translation, isUser }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div
      className={`flex items-start gap-4 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* остальной код без изменений */}
      <div className={`flex-1 ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-xl p-4 inline-block ${
            isUser ? "bg-primary text-dark" : "bg-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {!isUser && (
              <button className="text-zinc-400 hover:text-zinc-300">
                <Volume2 size={16} />
              </button>
            )}
            {translation && (
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`${isUser ? "text-dark/70 hover:text-dark" : "text-zinc-400 hover:text-zinc-300"}`}
              >
                <Languages size={16} />
              </button>
            )}
          </div>
          <p className="text-base">{text}</p>
          {showTranslation && translation && (
            <p
              className={`text-sm mt-2 ${isUser ? "text-dark/70" : "text-zinc-400"}`}
            >
              {translation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-start gap-4 mb-4">
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-700">
      <MessageSquare size={20} className="text-zinc-400" />
    </div>
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex space-x-2">
        <div
          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
        <div
          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "600ms" }}
        />
      </div>
    </div>
  </div>
);

const AnimatedAnswerField = ({
  selectedWords,
  handleWordReturn,
  incorrectWords,
  showAnswerTranslation,
  setShowAnswerTranslation, // Добавьте этот пропс
  translation,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-end mb-6"
    >
      <div className="max-w-[80%]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-primary rounded-xl p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 mb-2"
          >
            <button className="text-dark/70 hover:text-dark">
              <Mic size={16} />
            </button>
            <button
              onClick={() => setShowAnswerTranslation(!showAnswerTranslation)}
              className="text-dark/70 hover:text-dark"
            >
              <Languages size={16} />
            </button>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                {word ? (
                  <button
                    onClick={() => handleWordReturn(word, index)}
                    className={`px-3 py-1 rounded-lg transition-all duration-300 ${
                      index === 0 || index === selectedWords.length - 1
                        ? "bg-primary-dark/20 text-dark/50 cursor-not-allowed"
                        : incorrectWords.includes(index)
                          ? "bg-red-500 text-white"
                          : "bg-primary-dark/20 text-dark hover:bg-primary-dark/30"
                    }`}
                    disabled={index === 0 || index === selectedWords.length - 1}
                  >
                    {word}
                  </button>
                ) : (
                  <span className="px-3 py-1 text-dark">...</span>
                )}
              </motion.div>
            ))}
          </div>
          {showAnswerTranslation && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm mt-2 text-dark/70"
            >
              {translation}
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const Congratulations = ({ onHome, onNext }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
  >
    <motion.div
      initial={{ y: 50 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      className="bg-zinc-900 rounded-2xl p-8 max-w-md mx-4 relative overflow-hidden"
    >
      {/* Конфетти эффект */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(45deg, rgba(74,222,128,0.1) 0%, rgba(34,197,94,0.1) 100%)",
        }}
      />

      {/* Иконка успеха */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-20 h-20 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center"
      >
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>

      {/* Текст поздравления */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-primary mb-2">
          Отличная работа!
        </h2>
        <p className="text-gray-400">
          Вы успешно завершили диалог. Продолжайте практиковаться для улучшения
          навыков!
        </p>
      </motion.div>

      {/* Кнопки */}
      <div className="flex gap-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onHome}
          className="flex-1 px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          На главную
        </motion.button>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          onClick={onNext}
          className="flex-1 px-6 py-3 rounded-xl bg-primary text-dark hover:bg-primary-hover transition-colors"
        >
          Следующий диалог
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

const ChatExercise = () => {
  const [dialogue, setDialogue] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [availableWords, setAvailableWords] = useState([]);
  const [showAnswerTranslation, setShowAnswerTranslation] = useState(false);
  const [incorrectWords, setIncorrectWords] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showAnswerField, setShowAnswerField] = useState(false);
  const [hint, setHint] = useState(null);
  // Добавляем состояние для прогресса
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHintButton, setShowHintButton] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const navigate = useNavigate(); // Добавляем хук для навигации
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNew, setIsLoadingNew] = useState(false);

  const fetchDialogue = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/chat-exercise",
      );
      setDialogue(response.data);
    } catch (error) {
      console.error("Error fetching dialogue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики для кнопок
  const handleHomeClick = () => {
    navigate("/");
  };

  const handleNextDialogue = async () => {
    try {
      setIsLoadingNew(true);
      setShowCongratulations(false);
      setCurrentStep(0);
      setMessages([]);
      setProgress({ current: 0, total: 0 });
      setSelectedWords([]);
      setAvailableWords([]);
      setIsCorrect(null);
      setIncorrectWords([]);
      setHint(null);
      setShowHintButton(false);
      setShowAnswerTranslation(false);
      await fetchDialogue();
    } finally {
      setIsLoadingNew(false);
    }
  };

  useEffect(() => {
    fetchDialogue();
  }, []); // Пустой массив зависимостей

  useEffect(() => {
    if (dialogue) {
      setMessages([
        {
          isUser: false,
          text: dialogue.steps[0].messages[0].text,
          translation: dialogue.steps[0].messages[0].translation,
        },
      ]);
      setProgress({ current: 0, total: dialogue.steps.length });
      setTimeout(() => {
        setShowAnswerField(true);
      }, 1000);
    }
  }, [dialogue]);

  // Отдельный useEffect для сброса состояния проверки при изменении выбранных слов
  useEffect(() => {
    if (selectedWords.length > 0) {
      setIsCorrect(null);
    }
  }, [selectedWords]);

  useEffect(() => {
    if (dialogue && currentStep < dialogue.steps.length) {
      setAttemptCount(0);
      setShowHintButton(false);
      const answer = dialogue.steps[currentStep].correctAnswer;
      const words = answer.split(" ");
      // Изменяем обработку ключевых слов
      const keyWords =
        dialogue.steps[currentStep].words.map((word) =>
          word.includes(" ") ? word : word.trim(),
        ) || [];

      // Очищаем слова от пустых значений и пробелов
      const cleanWords = words.filter((word) => word.trim().length > 0);

      // Формируем начальный массив выбранных слов
      const initialSelected = cleanWords.map((word, idx) => {
        // Оставляем первое и последнее слово
        if (idx === 0 || idx === cleanWords.length - 1) {
          return word;
        }

        // Если слово входит в список ключевых, всегда скрываем его
        if (keyWords.includes(word)) {
          return null;
        }

        // Для неключевых слов оставляем некоторые видимыми
        return Math.random() > 0.4 ? word : null;
      });

      // Собираем слова для угадывания (только скрытые слова)
      const wordsToGuess = cleanWords.filter((word, idx) => {
        return initialSelected[idx] === null;
      });

      // Проверяем, что все ключевые слова включены в wordsToGuess
      const missingKeyWords = keyWords.filter(
        (word) => !wordsToGuess.includes(word),
      );
      const allGuessWords = [...wordsToGuess, ...missingKeyWords];

      // Добавляем несколько запутывающих слов
      const extraWords = Object.values({
        technical: ["database", "server", "config", "deploy", "api", "cache"],
        general: ["usually", "typically", "currently", "already", "basically"],
        actions: [
          "implement",
          "update",
          "check",
          "verify",
          "modify",
          "process",
        ],
      })
        .flat()
        .filter((word) => !cleanWords.includes(word))
        .sort(() => Math.random() - 0.6)
        .slice(0, 2); // Ограничиваем количество дополнительных слов

      // Формируем финальный набор слов
      const availableWordsSet = new Set([...allGuessWords, ...extraWords]);

      setSelectedWords(initialSelected);
      setAvailableWords(
        [...availableWordsSet].filter((word) => word && word.length > 0),
      );

      // Для отладки
      console.log({
        answer,
        keyWords,
        initialSelected,
        wordsToGuess,
        availableWords: [...availableWordsSet],
      });
    }
  }, [dialogue, currentStep]);

  // Обработка выбора слова
  const handleWordSelect = (word) => {
    // Проверяем, является ли слово пустым или состоит только из пробелов
    if (!word || word.trim().length === 0) {
      return;
    }

    setSelectedWords((prev) => {
      const newSelected = [...prev];
      // Подсчитываем количество пустых мест
      const emptySpots = newSelected.filter(
        (w, i) => w === null && i !== 0 && i !== newSelected.length - 1,
      ).length;

      // Если нет пустых мест, не добавляем новое слово
      if (emptySpots === 0) {
        return prev;
      }

      // Находим первую пустую позицию
      const insertIndex = newSelected.findIndex(
        (w, i) => i !== 0 && i !== newSelected.length - 1 && !w,
      );

      if (insertIndex !== -1) {
        newSelected[insertIndex] = word;
      }
      return newSelected;
    });

    setAvailableWords((prev) => prev.filter((w) => w !== word));
    setIncorrectWords([]);
  };

  // Обработка возврата слова
  const handleWordReturn = (word, index) => {
    if (index === 0 || index === selectedWords.length - 1) return;

    setSelectedWords((prev) => {
      const newSelected = [...prev];
      newSelected[index] = null;
      return newSelected;
    });

    if (!availableWords.includes(word)) {
      setAvailableWords((prev) =>
        [...prev, word].sort(() => Math.random() - 0.5),
      );
    }

    setIsCorrect(null);
    setIncorrectWords([]); // Сбрасываем подсветку ошибок
  };

  const handleCheck = () => {
    if (!dialogue || selectedWords.includes(null)) return;

    const correctAnswer = dialogue.steps[currentStep].correctAnswer;
    const userAnswer = selectedWords.filter(Boolean).join(" ");
    const correctWords = correctAnswer.split(" ");
    const wrongPositions = [];
    let hintMessage = null;

    // Проверяем каждое слово и формируем подсказку
    selectedWords.forEach((word, index) => {
      if (index === 0 || index === selectedWords.length - 1) return;
      if (word && word !== correctWords[index]) {
        wrongPositions.push(index);

        // Формируем подсказку
        if (!hintMessage) {
          const expectedWord = correctWords[index];
          hintMessage = `Подсказка: вместо "${word}" нужно использовать "${expectedWord}"`;

          if (index > 0 && index < correctWords.length - 1) {
            hintMessage += `. Это слово должно подходить между "${correctWords[index - 1]}" и "${correctWords[index + 1]}"`;
          }
        }
      }
    });

    const isAnswerCorrect = userAnswer === correctAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setHint(null);
      setShowHintButton(false);
      setAttemptCount(0);
      setShowAnswerField(false);
      setProgress((prev) => ({ ...prev, current: prev.current + 1 }));

      setMessages((prev) => [
        ...prev,
        {
          isUser: true,
          text: userAnswer,
          translation: dialogue.steps[currentStep].messages[1].translation,
        },
      ]);

      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        if (currentStep < dialogue.steps.length - 1) {
          setMessages((prev) => [
            ...prev,
            {
              isUser: false,
              text: dialogue.steps[currentStep + 1].messages[0].text,
              translation:
                dialogue.steps[currentStep + 1].messages[0].translation,
            },
          ]);

          setCurrentStep(currentStep + 1);
          setSelectedWords([]);
          setIsCorrect(null);
          setIncorrectWords([]);

          setTimeout(() => {
            setShowAnswerField(true);
          }, 1000);
        } else {
          setShowCongratulations(true);
        }
      }, 3000);
    } else {
      setIncorrectWords(wrongPositions);
      setAttemptCount((prev) => prev + 1);

      if (attemptCount + 1 >= 2) {
        setShowHintButton(true);
      }

      // Убираем автоматическое исчезновение подсказки и ошибок
      setTimeout(() => {
        setIncorrectWords([]);
        setIsCorrect(null);
        // Убрали setHint(null)
      }, 2000);
    }
  };

  const showHintMessage = () => {
    const correctAnswer = dialogue.steps[currentStep].correctAnswer;
    const correctWords = correctAnswer.split(" ");
    let hintMessage = null;

    selectedWords.forEach((word, index) => {
      if (index === 0 || index === selectedWords.length - 1) return;
      if (word && word !== correctWords[index]) {
        if (!hintMessage) {
          const expectedWord = correctWords[index];
          hintMessage = `Подсказка: вместо "${word}" нужно использовать "${expectedWord}"`;

          if (index > 0 && index < correctWords.length - 1) {
            hintMessage += `. Это слово должно подходить между "${correctWords[index - 1]}" и "${correctWords[index + 1]}"`;
          }
        }
      }
    });

    setHint(hintMessage || "Проверьте порядок слов в предложении");
    setShowHintButton(false); // Скрываем кнопку после показа подсказки
  };

  if (isLoading || isLoadingNew || !dialogue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-900 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">
              {isLoadingNew
                ? "Генерация нового диалога..."
                : "Загрузка диалога..."}
            </span>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Кнопка "На главную" */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>На главную</span>
      </motion.button>
      <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl relative">
        {/* Индикатор прогресса */}
        <div className="absolute top-4 right-4 bg-zinc-800 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">{progress.current}</span>
            <span className="text-zinc-400">/</span>
            <span className="text-zinc-400">{progress.total}</span>
          </div>
        </div>
        {/* Чат */}
        <div className="mb-8 space-y-4">
          {/* История сообщений */}
          {messages.map((msg, idx) => (
            <Message
              key={idx}
              text={msg.text}
              translation={msg.translation}
              isUser={msg.isUser}
            />
          ))}

          {/* Индикатор печатания */}
          {isTyping && <TypingIndicator />}
        </div>

        {/* Поле ответа пользователя */}
        {showAnswerField && (
          <AnimatedAnswerField
            selectedWords={selectedWords}
            handleWordReturn={handleWordReturn}
            incorrectWords={incorrectWords}
            showAnswerTranslation={showAnswerTranslation}
            setShowAnswerTranslation={setShowAnswerTranslation} // Добавьте это
            translation={dialogue.steps[currentStep].messages[1].translation}
          />
        )}

        {/* Доступные слова и кнопка проверки */}
        {showAnswerField && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-6 relative"
          >
            {/* Кнопка подсказки */}
            {showHintButton && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={showHintMessage}
                className="w-full py-2 mb-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Показать подсказку
              </motion.button>
            )}
            {/* Подсказка */}
            <AnimatePresence>
              {hint && (
                <HintMessage
                  message={hint}
                  onClose={() => {
                    setHint(null);
                    setShowHintButton(true); // Опционально: показываем кнопку подсказки снова
                  }}
                />
              )}
            </AnimatePresence>

            {/* Банк доступных слов */}
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  onClick={() => handleWordSelect(word)}
                  className={`px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors ${
                    incorrectWords.length > 0 ? "hover:bg-zinc-600" : ""
                  }`}
                >
                  {word}
                </motion.button>
              ))}
            </div>

            {process.env.NODE_ENV === "development" && isCorrect === false && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  const answer = dialogue.steps[currentStep].correctAnswer;
                  setHint(`Правильный ответ: "${answer}"`);
                }}
                className="mt-2 text-xs text-zinc-500 hover:text-zinc-400"
              >
                Показать правильный ответ
              </motion.button>
            )}

            {/* Кнопка проверки с подсветкой правильного ответа */}
            <div className="relative">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={handleCheck}
                disabled={selectedWords.includes(null)}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  isCorrect === true
                    ? "bg-green-500 text-white"
                    : isCorrect === false
                      ? "bg-red-500 text-white"
                      : "bg-primary hover:bg-primary-hover text-dark"
                } disabled:opacity-50`}
              >
                {isCorrect === true
                  ? "Правильно!"
                  : isCorrect === false
                    ? "Попробуйте еще раз"
                    : "Отправить"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
      {/* Поздравление */}
      <AnimatePresence>
        {showCongratulations && (
          <Congratulations
            onHome={handleHomeClick}
            onNext={handleNextDialogue}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatExercise;
```

```js eng4IT/frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  SortAsc,
  Eye,
  EyeOff,
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Shuffle,
  Star,
  Layout,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

import TermModal from "./TermModal";
import WordList from "./WordList";
import StatisticsPanel from "./StatisticsPanel";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "tasks",
  );
  const [currentModel, setCurrentModel] = useState("ollama");
  const [subModel, setSubModel] = useState({
    ollama: "llama3.2",
    gemini: "gemini-1.5-flash",
  });
  const [apiKey, setApiKey] = useState("");
  const [originalApiKey, setOriginalApiKey] = useState("");
  const [unknownWords, setUnknownWords] = useState([]);
  const [allTerms, setAllTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelOptions] = useState({
    // Убираем setModelOptions
    ollama: false,
    gemini: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState("");
  const [useAI, setUseAI] = useState(
    () => localStorage.getItem("matchingUseAI") === "true",
  );
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    showFavorites: false,
    progressFilter: "all",
    categoryFilter: "all",
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch current model settings
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/model/current",
        );
        setCurrentModel(response.data.model);

        if (response.data.model === "ollama") {
          setSubModel((prev) => ({ ...prev, ollama: response.data.sub_model }));
        } else {
          setSubModel((prev) => ({ ...prev, gemini: response.data.sub_model }));
        }

        if (response.data.has_api_key && response.data.api_key) {
          setOriginalApiKey(response.data.api_key);
          setApiKey(response.data.api_key);
          setDisplayedApiKey("*".repeat(response.data.api_key.length));
        } else {
          setOriginalApiKey("");
          setApiKey("");
          setDisplayedApiKey("");
        }
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    };

    fetchCurrentModel();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Используем Promise.all для параллельной загрузки данных
        const [wordsRes, statsRes, categoriesRes, termsRes] = await Promise.all(
          [
            axios.get("http://localhost:5000/api/unknown-words"),
            axios.get("http://localhost:5000/api/terms/statistics"),
            axios.get("http://localhost:5000/api/categories/tree"),
            axios.get("http://localhost:5000/api/all-terms"),
          ],
        );

        setUnknownWords(wordsRes.data);
        setStatistics(statsRes.data);
        setCategories(categoriesRes.data.categories);
        setAllTerms(termsRes.data);

        console.log("Loaded terms:", termsRes.data); // Добавим для отладки
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUnknownWords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/unknown-words",
      );
      setUnknownWords(
        response.data.map((word) => ({
          ...word,
          id: word.term_id || word.id, // Убедитесь, что у вас есть ID
        })),
      );
    } catch (error) {
      console.error("Error fetching unknown words:", error);
    }
  };

  const fetchAllTerms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all-terms");
      console.log("Fetched terms:", response.data); // Добавим для отладки
      if (response.data) {
        setAllTerms(response.data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const handleFavoriteToggle = async (termId) => {
    try {
      console.log("Toggling favorite for term:", termId); // Добавляем лог
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        },
      );

      if (response.data.status === "success") {
        // Обновляем состояние только для конкретного слова
        setUnknownWords((prevWords) =>
          prevWords.map((word) =>
            word.id === termId
              ? { ...word, is_favorite: !word.is_favorite }
              : word,
          ),
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTermClick = (word) => {
    setSelectedTerm({
      term: word.original,
      translation: word.translation,
      category: word.category,
      attempts: word.attempts,
      last_attempt: word.last_attempt,
    });
    setIsModalOpen(true);
  };

  const handleModelChange = useCallback(
    async (model) => {
      try {
        const data = {
          model,
          sub_model: model === "ollama" ? subModel.ollama : subModel.gemini,
          api_key: apiKey !== "********" ? apiKey : undefined,
        };

        const response = await axios.post(
          "http://localhost:5000/api/model/set",
          data,
        );
        if (response.data.status === "success") {
          setCurrentModel(model);
        }
      } catch (error) {
        console.error("Error setting model:", error);
      }
    },
    [subModel, apiKey],
  );

  const handleSubModelChange = async (newSubModel) => {
    try {
      const updatedSubModel = {
        ...subModel,
        [currentModel]: newSubModel,
      };
      setSubModel(updatedSubModel);

      const data = {
        model: currentModel,
        sub_model: newSubModel,
        api_key: apiKey,
      };

      await axios.post("http://localhost:5000/api/model/set", data);
    } catch (error) {
      console.error("Error setting sub-model:", error);
    }
  };

  const handleApiKeyChange = async (newApiKey) => {
    if (!newApiKey) return;

    try {
      const data = {
        model: currentModel,
        sub_model:
          currentModel === "ollama" ? subModel.ollama : subModel.gemini,
        api_key: newApiKey,
      };

      const response = await axios.post(
        "http://localhost:5000/api/model/set",
        data,
      );
      if (response.data.status === "success") {
        setOriginalApiKey(newApiKey);
        setApiKey(newApiKey);
        setDisplayedApiKey("*".repeat(newApiKey.length));
        setShowApiKey(false);
      }
    } catch (error) {
      console.error("Error setting API key:", error);
    }
  };

  useEffect(() => {
    if (showApiKey) {
      setDisplayedApiKey(originalApiKey || apiKey);
    } else {
      setDisplayedApiKey(
        apiKey.startsWith("*") ? apiKey : "*".repeat(apiKey.length),
      );
    }
  }, [showApiKey, originalApiKey, apiKey]);

  useEffect(() => {
    if (activeTab === "unknown-words") {
      fetchUnknownWords();
    }
  }, [activeTab, filters.showFavorites]);

  // Filter and sort words
  const filteredWords = unknownWords.filter((word) => {
    if (!word) return false;

    // Проверяем фильтр избранного
    if (filters.showFavorites && !word.is_favorite) {
      return false;
    }

    // Остальные фильтры
    if (
      filters.categoryFilter !== "all" &&
      word.category !== filters.categoryFilter
    ) {
      return false;
    }

    if (filters.progressFilter !== "all") {
      if (
        filters.progressFilter === "completed" &&
        word.study_progress !== 100
      ) {
        return false;
      }
      if (
        filters.progressFilter === "in-progress" &&
        (word.study_progress === 0 || word.study_progress === 100)
      ) {
        return false;
      }
      if (
        filters.progressFilter === "not-started" &&
        word.study_progress !== 0
      ) {
        return false;
      }
    }

    // Поиск по тексту
    const searchQuery = searchTerm.toLowerCase();
    return (
      (word.original && word.original.toLowerCase().includes(searchQuery)) ||
      (word.translation && word.translation.toLowerCase().includes(searchQuery))
    );
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortType) {
      case "alphabetical":
        return a.term.localeCompare(b.term);
      case "progress":
        return (b.study_progress || 0) - (a.study_progress || 0);
      case "category":
        return a.category.localeCompare(b.category);
      default: // 'newest'
        return new Date(b.last_attempt || 0) - new Date(a.last_attempt || 0);
    }
  });

  const renderUnknownWordsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Незнакомые слова
          </h2>
          <p className="text-sm text-gray-400">
            Всего слов: {filteredWords.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="header-button"
          >
            <Layout size={16} />
          </button>

          <button
            onClick={() => setSortType("newest")}
            className={`header-button ${sortType === "newest" ? "active" : ""}`}
          >
            <Clock size={16} />
            <span>Новые</span>
          </button>

          <button
            onClick={() => setSortType("alphabetical")}
            className={`header-button ${sortType === "alphabetical" ? "active" : ""}`}
          >
            <SortAsc size={16} />
            <span>По алфавиту</span>
          </button>

          <button
            onClick={() =>
              setFilters((f) => ({ ...f, showFavorites: !f.showFavorites }))
            }
            className={`header-button ${filters.showFavorites ? "active" : ""}`}
          >
            <Star size={16} />
            <span>Избранное</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск слов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.progressFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, progressFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Весь прогресс</option>
          <option value="completed">Изучены</option>
          <option value="in-progress">В процессе</option>
          <option value="not-started">Не начаты</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedWords.map((word, index) => (
            <WordList
              key={word.id || index}
              id={word.id} // Убедитесь, что передаете id
              word={word.original}
              translation={word.translation}
              category={word.category}
              attempts={word.attempts}
              lastAttempt={word.last_attempt}
              progress={word.study_progress}
              isFavorite={word.is_favorite}
              onClick={() => {
                if (word && word.original) {
                  setSelectedTerm(word);
                  setIsModalOpen(true);
                }
              }}
              onFavoriteToggle={() => handleFavoriteToggle(word.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="max-w-2xl mx-auto">
      <div className="settings-section">
        <h2 className="settings-title">Настройки генерации</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-primary mb-2">Основная модель</label>
            <div className="settings-group">
              <button
                onClick={() => handleModelChange("ollama")}
                className={`settings-button ${
                  currentModel === "ollama" ? "active" : ""
                }`}
                disabled={!modelOptions.ollama}
              >
                Ollama
              </button>
              <button
                onClick={() => handleModelChange("gemini")}
                className={`settings-button ${
                  currentModel === "gemini" ? "active" : ""
                }`}
              >
                Gemini
              </button>
            </div>
          </div>
          <div>
            <label className="block text-primary mb-2">
              {currentModel === "ollama" ? "Модель Ollama" : "Версия Gemini"}
            </label>
            <select
              value={
                currentModel === "ollama" ? subModel.ollama : subModel.gemini
              }
              onChange={(e) => handleSubModelChange(e.target.value)}
              className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {currentModel === "ollama" ? (
                <option value="llama3.2">Llama 3.2</option>
              ) : (
                <>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-flash-8b">
                    Gemini 1.5 Flash 8B
                  </option>
                </>
              )}
            </select>
          </div>
          {currentModel === "gemini" && (
            <div>
              <label className="block text-primary mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={showApiKey ? apiKey : displayedApiKey}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setApiKey(newValue);
                      setDisplayedApiKey(newValue);
                    }}
                    placeholder="Введите API ключ Gemini"
                    className="w-full bg-dark border border-gray-700 text-text px-4 py-2 pr-10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  onClick={() => handleApiKeyChange(apiKey)}
                  disabled={!apiKey || apiKey === displayedApiKey}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark rounded-lg transition-colors disabled:opacity-50"
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTermBase = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">База терминов</h2>
          <p className="text-sm text-gray-400">
            Все доступные технические термины
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск терминов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.categoryFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, categoryFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Все категории</option>
          {Object.values(categories).map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Добавим проверку на наличие терминов */}
      {Object.keys(allTerms).length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Термины загружаются...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(allTerms)
            .filter(([term, category]) => {
              const termLower = term.toLowerCase();
              const searchLower = searchTerm.toLowerCase();
              const categoryMatch =
                filters.categoryFilter === "all" ||
                category === filters.categoryFilter;

              return categoryMatch && termLower.includes(searchLower);
            })
            .map(([term, category], index) => (
              <div
                key={index}
                className="bg-dark-card border border-gray-800 p-4 rounded-xl hover:border-primary transition-colors"
              >
                <h3 className="text-primary font-medium mb-2">{term}</h3>
                <p className="text-sm text-gray-400">{category}</p>
              </div>
            ))}
        </div>
      )}

      {/* Добавим отладочную информацию */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-dark-card rounded-xl">
          <p className="text-gray-400">Debug Info:</p>
          <p>Terms count: {Object.keys(allTerms).length}</p>
          <p>Categories count: {Object.keys(categories).length}</p>
        </div>
      )}
    </div>
  );

  const renderTasksContent = () => (
    <div className="text-center py-12">
      <h2 className="page-title">Изучение технических терминов</h2>
      <p className="page-subtitle">
        Практикуйтесь в чтении технических текстов и изучайте новые термины
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/assessment"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <ClipboardCheck size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Оценка знаний</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Проверьте свое знание технических терминов
          </p>
        </Link>

        <Link
          to="/learning"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Практика чтения</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Читайте технические тексты в контексте
          </p>
        </Link>

        <Link
          to="/chat-exercise"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Чат с коллегой</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Практикуйте технический английский в диалоге
          </p>
        </Link>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group relative">
          <div
            className="absolute top-4 right-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group/ai">
              <button
                className="w-10 h-5 bg-gray-700 rounded-full flex items-center relative"
                onClick={() => {
                  const newValue = !useAI;
                  setUseAI(newValue);
                  localStorage.setItem("matchingUseAI", newValue);
                }}
              >
                <div
                  className={`absolute w-3 h-3 rounded-full transition-all duration-200 ${
                    useAI
                      ? "translate-x-6 bg-primary"
                      : "translate-x-1 bg-gray-400"
                  }`}
                />
              </button>
              <span className="absolute right-0 top-[-30px] opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap bg-dark-card px-2 py-1 rounded text-xs text-gray-400 border border-gray-700">
                Улучшение перевода с ИИ
              </span>
            </div>
          </div>

          <Link to="/matching">
            <div className="text-primary mb-3">
              <Shuffle size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Найти пару</h3>
            <p className="text-gray-400 text-sm group-hover:text-gray-300">
              Сопоставьте слова с их переводами
            </p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl shadow-xl p-6">
          <div className="border-b border-gray-800 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`${activeTab === "tasks" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Задания
              </button>
              <button
                onClick={() => setActiveTab("unknown-words")}
                className={`${activeTab === "unknown-words" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Незнакомые слова
              </button>
              <button
                onClick={() => setActiveTab("term-base")}
                className={`${activeTab === "term-base" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                База терминов
              </button>
              <button
                onClick={() => setActiveTab("statistics")}
                className={`${activeTab === "statistics" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Статистика
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`${activeTab === "settings" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Настройки
              </button>
            </nav>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "unknown-words" && renderUnknownWordsContent()}
              {activeTab === "statistics" && (
                <StatisticsPanel statistics={statistics} />
              )}
              {activeTab === "tasks" && renderTasksContent()}
              {activeTab === "term-base" && renderTermBase()}
              {activeTab === "settings" && renderSettingsContent()}
            </>
          )}
        </div>
      </div>

      <TermModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        term={selectedTerm?.original} // Изменено с term на original
        translation={selectedTerm?.translation}
        category={selectedTerm?.category}
      />
    </div>
  );
};

export default Dashboard;
```

```js eng4IT/frontend/src/components/LearningInterface.js
// Path: frontend/src/components/LearningInterface.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { UsedTermsSection, TranslationToggle } from './SharedComponents';

const API_URL = 'http://localhost:5000/api';

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
  >
    <div className="glass-card p-8 rounded-2xl flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-lg font-medium text-primary">Генерация текста...</span>
      <span className="text-gray-400">Это может занять несколько секунд</span>
    </div>
  </motion.div>
);

const TranslationPopup = ({ text, position }) => {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 px-3 py-1 text-sm bg-dark-card rounded shadow-lg pointer-events-none transform -translate-x-1/2 text-gray-200 border border-gray-700"
      style={{
        left: position.x,
        top: position.y + 20,
        opacity: text ? 1 : 0,
        transition: 'opacity 0.2s ease'
      }}
    >
      {text}
    </div>
  );
};

const LearningInterface = () => {
  const [scenario, setScenario] = useState('');
  const [categories, setCategories] = useState({});
  const [selectedWords, setSelectedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [translationPopup, setTranslationPopup] = useState({ text: '', position: null });
  const [translationEnabled, setTranslationEnabled] = useState(() => {
    const saved = localStorage.getItem('translationEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Кэш переводов для оптимизации
  const [translationsCache] = useState(new Map());

  // Добавляем использование хука
  const navigate = useNavigate();

  // Add new refs after existing state declarations
  const translationTimeoutRef = useRef(null);
  const lastTranslatedWordRef = useRef('');
  const translationCacheRef = useRef(new Map());
  const startWordRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('translationEnabled', JSON.stringify(translationEnabled));
  }, [translationEnabled]);

  const fetchScenario = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/scenario`);
      setScenario(response.data.text);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching scenario:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchScenario();
  }, [fetchScenario]);

  const cleanWord = useCallback((word) => {
    return word.trim().replace(/^[.,!?()"\s]+|[.,!?()"\s]+$/g, '');
  }, []);

  const isValidWord = useCallback((word) => {
    const cleanedWord = cleanWord(word);
    return cleanedWord.length > 0 &&
           /[a-zA-Z]/.test(cleanedWord) &&
           !['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for'].includes(cleanedWord.toLowerCase());
  }, [cleanWord]);

  const translateWord = useCallback(async (word) => {
    const cleanedWord = cleanWord(word);

    // Проверяем кэш
    if (translationsCache.has(cleanedWord)) {
      return translationsCache.get(cleanedWord);
    }

    try {
      const response = await axios.post(`${API_URL}/translate`, {
        text: cleanedWord,
        source_lang: 'en',
        target_lang: 'ru'
      });
      const translation = response.data.translation;

      // Сохраняем в кэш
      translationsCache.set(cleanedWord, translation);
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return 'Перевод недоступен';
    }
  }, [cleanWord, translationsCache]);

  const selectWordsBetween = useCallback((startElement, endElement) => {
    if (!startElement || !endElement) return;

    const spans = Array.from(document.querySelectorAll('.word-span'));
    const startIndex = spans.indexOf(startElement);
    const endIndex = spans.indexOf(endElement);

    if (startIndex === -1 || endIndex === -1) return;

    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    // Очищаем предыдущее выделение
    currentSelection.forEach(span => span.classList.remove('selected'));

    const selectedSpans = spans.slice(start, end + 1);
    const meaningfulWords = selectedSpans.filter(span => {
      const word = cleanWord(span.textContent).toLowerCase();
      return !['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for'].includes(word);
    });

    if (meaningfulWords.length > 4) return;

    selectedSpans.forEach(span => span.classList.add('selected'));
    setCurrentSelection(selectedSpans);
  }, [cleanWord, currentSelection]);

  const addToSelectedWords = useCallback(async () => {
    if (currentSelection.length === 0) return;

    const phrase = currentSelection
      .map(span => cleanWord(span.textContent))
      .filter(word => isValidWord(word))
      .join(' ');

    if (phrase && !selectedWords.some(w => w.original === phrase)) {
      const translation = await translateWord(phrase);
      setSelectedWords(prev => [...prev, { original: phrase, translation }]);
    }

    // Очищаем выделение
    currentSelection.forEach(span => span.classList.remove('selected'));
    setCurrentSelection([]);
  }, [currentSelection, selectedWords, cleanWord, isValidWord, translateWord]);

  const handleMouseMove = useCallback((e) => {
    if (isSelecting && e.target.classList.contains('word-span')) {
      selectWordsBetween(startWordRef.current, e.target);
      return;
    }

    if (!translationEnabled) {
      setTranslationPopup({ text: '', position: null });
      return;
    }

    if (e.target.classList.contains('word-span')) {
      const word = cleanWord(e.target.textContent);

      if (lastTranslatedWordRef.current === word) {
        return;
      }

      if (isValidWord(word)) {
        setTranslationPopup(prev => ({
          ...prev,
          position: { x: e.clientX, y: e.clientY }
        }));

        if (translationTimeoutRef.current) {
          clearTimeout(translationTimeoutRef.current);
        }

        translationTimeoutRef.current = setTimeout(async () => {
          if (translationCacheRef.current.has(word)) {
            setTranslationPopup(prev => ({
              text: translationCacheRef.current.get(word),
              position: prev.position
            }));
          } else {
            const translation = await translateWord(word);
            translationCacheRef.current.set(word, translation);
            setTranslationPopup(prev => ({
              text: translation,
              position: prev.position
            }));
          }
          lastTranslatedWordRef.current = word;
        }, 500);
      }
    } else {
      setTranslationPopup({ text: '', position: null });
      lastTranslatedWordRef.current = '';
    }
  }, [translationEnabled, isSelecting, cleanWord, isValidWord, translateWord, selectWordsBetween]);

  const handleMouseDown = useCallback((e) => {
    if (!e.target.classList.contains('word-span')) return;

    setIsSelecting(true);
    startWordRef.current = e.target;

    currentSelection.forEach(span => span.classList.remove('selected'));
    setCurrentSelection([]);

    selectWordsBetween(e.target, e.target);
  }, [selectWordsBetween, currentSelection]);

  const handleMouseUp = useCallback(async () => {
    if (!isSelecting) return;

    setIsSelecting(false);
    if (currentSelection.length > 0) {
      const phrase = currentSelection
        .map(span => cleanWord(span.textContent))
        .filter(word => isValidWord(word))
        .join(' ');

      if (phrase && !selectedWords.some(w => w.original === phrase)) {
        const translation = await translateWord(phrase);
        setSelectedWords(prev => [...prev, { original: phrase, translation }]);
      }
    }

    currentSelection.forEach(span => span.classList.remove('selected'));
    setCurrentSelection([]);
    startWordRef.current = null;
  }, [isSelecting, currentSelection, selectedWords, cleanWord, isValidWord, translateWord]);

  // Add cleanup effect after other useEffects
  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, []);

  // Add new handleGenerateNew function before return
  const handleGenerateNew = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/generate_new`);
      if (response.data && response.data.text) {
        setScenario(response.data.text);
        setCategories(response.data.categories);
      } else {
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      console.error('Error generating new scenario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (selectedWords.length === 0) {
      handleGenerateNew();
      return;
    }

    setIsSaving(true);
    try {
      // 1. Получаем категоризацию для слов
      const categorizationResponse = await axios.post(
        `${API_URL}/categorize-words`,
        { words: selectedWords }
      );

      // 2. Проверяем ответ и обрабатываем категоризированные слова
      if (categorizationResponse.data && Array.isArray(categorizationResponse.data.words)) {
        const categorizedWords = categorizationResponse.data.words;

        // 3. Сохраняем слова с присвоенными категориями
        await axios.post(`${API_URL}/save_words`, {
          words: categorizedWords.map(word => ({
            original: word.original || word.term,
            translation: word.translation,
            category: word.category // Теперь каждое слово имеет свою категорию
          }))
        });
      } else {
        throw new Error('Invalid categorization response format');
      }

      // 4. Перенаправляем на дашборд
      navigate('/?tab=unknown-words');
    } catch (error) {
      console.error('Error handling next:', error);
      // Добавьте обработку ошибок для пользователя
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background relative">
      <AnimatePresence>
        {(isLoading || isSaving) && <LoadingOverlay />}
      </AnimatePresence>

      <TranslationToggle
        enabled={translationEnabled}
        onChange={setTranslationEnabled}
      />

      <TranslationPopup {...translationPopup} />
      {/* Добавляем навигацию */}
      <nav className="bg-dark-card/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-4 text-gray-400 hover:text-primary transition-colors">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
            Technical Terms
          </h1>
          <button
            onClick={handleGenerateNew}
            disabled={isLoading}
            className="px-6 py-2 rounded-xl bg-dark-card border border-gray-800 text-gray-300 hover:text-primary hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Генерация...' : 'Сгенерировать новый текст'}
          </button>
        </div>

        <div className="bg-dark-card rounded-2xl p-8 mb-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Technical Text</h2>
            <button
              onClick={handleNext}
              disabled={isSaving || isLoading}
              className={`px-6 py-2 rounded-xl transition-all duration-200 ${
                isSaving || isLoading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-dark'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Сохранение...</span>
                </div>
              ) : (
                'Далее'
              )}
            </button>
          </div>
          <div
            className="text-gray-300 leading-relaxed select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isSelecting) {
                setIsSelecting(false);
                currentSelection.forEach(span => span.classList.remove('selected'));
                setCurrentSelection([]);
                startWordRef.current = null;
              }
              setTranslationPopup({ text: '', position: null });
            }}
          >
            {scenario.split(' ').map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="word-span cursor-pointer px-1 py-0.5 rounded transition-colors duration-150 hover:text-primary"
                data-word={word}
              >
                {word}{' '}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-dark-card rounded-2xl p-8 mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-primary mb-4">Незнакомые слова</h2>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {selectedWords.map(({ original, translation }) => (
                <motion.div
                  key={original}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-dark-lighter border border-gray-800 text-gray-300 px-4 py-2 rounded-xl flex items-center space-x-2 group hover:border-primary transition-colors"
                >
                  <span>{original}</span>
                  <span className="text-sm text-primary/80 ml-2">{translation}</span>
                  <button
                    onClick={() => setSelectedWords(words => words.filter(w => w.original !== original))}
                    className="text-gray-500 hover:text-primary ml-2"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <UsedTermsSection terms={categories} />
      </div>
    </div>
  );
};

export default LearningInterface;
```

```js eng4IT/frontend/src/components/MatchingExercise.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MatchingExercise = () => {
  const [allPairs, setAllPairs] = useState([]); // Все 20 пар
  const [displayedPairs, setDisplayedPairs] = useState([]); // Текущие отображаемые пары
  const [selectedPair, setSelectedPair] = useState({
    english: null,
    russian: null,
  });
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrongPair, setWrongPair] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [correctPairs, setCorrectPairs] = useState(new Map());

  // Показываем отладку только в режиме разработки
  const isDev = process.env.NODE_ENV === "development";
  const [showDebug, setShowDebug] = useState(isDev);

  const [currentPairIndex, setCurrentPairIndex] = useState(0); // Добавим индекс текущей пары
  // Добавим состояние для отслеживания текущей группы пар
  const [currentGroup, setCurrentGroup] = useState(0);

  // Обновим начальную загрузку пар
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        setIsLoading(true);
        const useAI = localStorage.getItem("matchingUseAI") === "true";
        const response = await axios.get(
          `http://localhost:5000/api/matching-pairs?useAI=${useAI}`,
        );

        if (response.data.english && response.data.russian) {
          // Создаем Map с правильными парами для всех слов
          const translations = new Map();
          const englishWords = response.data.english;
          const russianWords = response.data.russian;

          englishWords.forEach((word, index) => {
            translations.set(
              word.toLowerCase(),
              russianWords[index].toLowerCase(),
            );
          });

          // Создаем массив всех пар
          const allFormattedPairs = englishWords.map((word, index) => ({
            id: index,
            english: word,
            russian: russianWords[index],
          }));

          setAllPairs(allFormattedPairs);
          setCorrectPairs(translations);

          // Берем первые 5 пар и перемешиваем только их русские переводы
          const firstGroupPairs = allFormattedPairs.slice(0, 5);
          const firstGroupRussian = firstGroupPairs.map((pair) => pair.russian);
          const shuffledRussian = [...firstGroupRussian].sort(
            () => Math.random() - 0.5,
          );

          // Создаем отображаемые пары с перемешанными переводами
          const initialDisplayedPairs = firstGroupPairs.map((pair, index) => ({
            ...pair,
            russian: shuffledRussian[index],
          }));

          setDisplayedPairs(initialDisplayedPairs);
          setCurrentGroup(0);
        }
      } catch (error) {
        setError("Произошла ошибка при загрузке данных");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPairs();
  }, []);

  // Обновим функцию загрузки следующей группы пар
  const loadNextGroup = () => {
    const nextGroupIndex = currentGroup + 1;
    const startIndex = nextGroupIndex * 5;
    const endIndex = startIndex + 5;

    if (startIndex < allPairs.length) {
      // Берем следующие 5 пар
      const nextGroupPairs = allPairs.slice(startIndex, endIndex);

      // Перемешиваем только русские переводы этой группы
      const groupRussian = nextGroupPairs.map((pair) => pair.russian);
      const shuffledRussian = [...groupRussian].sort(() => Math.random() - 0.5);

      // Создаем новые пары с перемешанными переводами
      const newDisplayedPairs = nextGroupPairs.map((pair, index) => ({
        ...pair,
        russian: shuffledRussian[index],
      }));

      // Быстрее обновляем группу
      setTimeout(() => {
        setDisplayedPairs(newDisplayedPairs);
        setCurrentGroup(nextGroupIndex);
      }, 300); // Уменьшили время до 300мс
    } else {
      setIsComplete(true);
    }
  };

  // Обновим функцию добавления новой пары
  const addNewPair = () => {
    if (currentPairIndex < allPairs.length) {
      const newPair = allPairs[currentPairIndex];

      setDisplayedPairs((prev) => {
        // Удаляем сопоставленные пары и добавляем новую
        const activePairs = prev.filter(
          (p) =>
            !matchedPairs.some(
              (mp) => mp.english.toLowerCase() === p.english.toLowerCase(),
            ),
        );
        return [...activePairs, newPair];
      });

      setCurrentPairIndex((prev) => prev + 1);
    }
  };

  // Изменим обработку правильного сопоставления
  const handleCardClick = (word, isEnglish) => {
    const normalizedWord = word.toLowerCase();

    if (
      matchedPairs.some(
        (pair) =>
          pair.english === normalizedWord || pair.russian === normalizedWord,
      )
    ) {
      return;
    }

    const newSelectedPair = { ...selectedPair };
    if (isEnglish) {
      newSelectedPair.english =
        selectedPair.english === normalizedWord ? null : normalizedWord;
    } else {
      newSelectedPair.russian =
        selectedPair.russian === normalizedWord ? null : normalizedWord;
    }

    if (newSelectedPair.english && newSelectedPair.russian) {
      const correctTranslation = correctPairs.get(newSelectedPair.english);

      if (correctTranslation === newSelectedPair.russian) {
        const matchedPair = {
          english: newSelectedPair.english,
          russian: newSelectedPair.russian,
        };

        setMatchedPairs((prev) => [...prev, matchedPair]);
        setScore((prev) => prev + 1);
        setSelectedPair({ english: null, russian: null });

        // Проверяем, завершена ли текущая группа
        const currentGroupMatched =
          matchedPairs.length + 1 === (currentGroup + 1) * 5;
        if (currentGroupMatched) {
          setTimeout(() => {
            loadNextGroup();
          }, 1000);
        }
      } else {
        setWrongPair(newSelectedPair);
        setTimeout(() => {
          setWrongPair(null);
          setSelectedPair({ english: null, russian: null });
        }, 1000);
      }
    } else {
      setSelectedPair(newSelectedPair);
    }
  };

  // Добавим компонент для промежуточного сообщения
  const GroupTransition = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: { duration: 0.2 },
        }}
        exit={{
          scale: 0.8,
          opacity: 0,
          transition: { duration: 0.2 },
        }}
        className="bg-zinc-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            transition: { duration: 0.3, repeat: Infinity },
          }}
          className="text-primary text-2xl font-bold mb-2"
        >
          Следующая группа
        </motion.div>
      </motion.div>
    </motion.div>
  );

  // В компоненте Card также приводим слово к нижнему регистру при отображении
  const Card = ({ word, isEnglish, isSelected, isMatched, isWrong, index }) => (
    <div
      onClick={() => handleCardClick(word, isEnglish)}
      className={`
        w-full min-h-[80px] p-4 rounded-xl cursor-pointer
        flex items-center justify-center text-center
        transition-all duration-200
        ${isMatched ? "bg-green-600/20 pointer-events-none" : "bg-zinc-800"}
        ${isSelected ? "border-2 border-indigo-500 scale-105" : "border-2 border-gray-700"}
        ${isWrong ? "animate-shake bg-red-500/20" : ""}
        hover:scale-102
        transform
        ${isSelected ? "scale-105" : "scale-100"}
      `}
    >
      <span className="text-white text-lg font-medium break-words">
        {word.toLowerCase()}
      </span>
    </div>
  );

  // Компонент для отображения отладочной информации
  const DebugInfo = () => (
    <div className="mt-8 p-4 bg-zinc-900 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">
          Отладочная информация
        </h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-zinc-400 hover:text-primary"
        >
          {showDebug ? "Скрыть" : "Показать"}
        </button>
      </div>

      {showDebug && (
        <div className="mt-4 text-sm">
          <h4 className="text-zinc-400 mb-2">Текущий выбор:</h4>
          <div className="flex gap-4">
            <span className="text-white">
              English: {selectedPair.english || "не выбрано"}
            </span>
            <span className="text-white">
              Russian: {selectedPair.russian || "не выбрано"}
            </span>
          </div>
        </div>
      )}

      {showDebug && (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-zinc-400 mb-2">Оригинальные пары:</h4>
            <div className="space-y-2">
              {allPairs.map((pair, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-white">{pair.english}</span>
                  <span className="text-primary">→</span>
                  <span className="text-white">{pair.russian}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-zinc-400 mb-2">Текущие пары:</h4>
            <div className="space-y-2">
              {displayedPairs.map((pair, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-white">{pair.english}</span>
                  <span className="text-primary">→</span>
                  <span className="text-white">{pair.russian}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Компонент завершения
  const CompletionScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-zinc-900 p-8 rounded-2xl text-center"
      >
        <h2 className="text-2xl font-bold text-primary mb-4">Поздравляем!</h2>
        <p className="text-gray-300 mb-6">Вы успешно завершили упражнение</p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-dark rounded-lg"
          >
            Ещё раз
          </button>
          <Link
            to="/"
            className="px-6 py-2 bg-zinc-700 text-white rounded-lg inline-block"
          >
            На главную
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-dark rounded-lg"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-background py-8">
      <div className="max-w-4xl mx-auto p-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-primary mb-8"
        >
          <ArrowLeft className="mr-2" size={20} />
          на главную
        </Link>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">
              Группа {currentGroup + 1} из {Math.ceil(allPairs.length / 5)}
            </span>
            <span className="text-primary">
              {score} / {allPairs.length} слов
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(score / allPairs.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Английские слова */}
          <div className="space-y-4">
            {displayedPairs.map((pair, index) => (
              <Card
                key={`en-${pair.id}-${pair.english}`}
                word={pair.english}
                isEnglish={true}
                isSelected={selectedPair.english === pair.english.toLowerCase()}
                isMatched={matchedPairs.some(
                  (mp) => mp.english === pair.english.toLowerCase(),
                )}
                isWrong={wrongPair?.english === pair.english.toLowerCase()}
                index={index}
              />
            ))}
          </div>

          {/* Русские переводы */}
          <div className="space-y-4">
            {displayedPairs.map((pair, index) => (
              <Card
                key={`ru-${pair.id}-${pair.russian}`}
                word={pair.russian}
                isEnglish={false}
                isSelected={selectedPair.russian === pair.russian.toLowerCase()}
                isMatched={matchedPairs.some(
                  (mp) => mp.russian === pair.russian.toLowerCase(),
                )}
                isWrong={wrongPair?.russian === pair.russian.toLowerCase()}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Отладочная информация только в режиме разработки */}
        {/* {isDev && <DebugInfo />} */}
      </div>

      <AnimatePresence>
        {displayedPairs.length === 0 && !isComplete && <GroupTransition />}
        {isComplete && <CompletionScreen />}
      </AnimatePresence>
    </div>
  );
};

export default MatchingExercise;
```

```js eng4IT/frontend/src/components/SharedComponents.js
import React from 'react';
import { motion } from 'framer-motion';

const UsedTermsSection = ({ terms }) => (
  <div className="bg-dark-card rounded-2xl p-6 border border-gray-800">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-1">
          Использованные термины
        </h3>
        <p className="text-sm text-gray-400">
          Технические термины, встречающиеся в тексте
        </p>
      </div>
      <div className="bg-dark-lighter text-primary px-3 py-1 rounded-lg text-sm font-medium border border-gray-800">
        {Object.keys(terms).length} терминов
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(terms).map(([term, category]) => {
        const [mainCategory, subCategory] = category.split('->').map(s => s.trim());

        return (
          <motion.div
            key={term}
            className="bg-dark-lighter p-4 rounded-xl hover:border-primary border border-gray-800 transition-colors"
          >
            <h4 className="text-primary font-semibold mb-2">{term}</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-300">{mainCategory}</p>
              <p className="text-sm text-gray-500">{subCategory}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

const TranslationToggle = ({ enabled, onChange }) => (
  <div className="absolute top-4 right-4 z-50">
    <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-3 bg-dark-card border border-gray-800">
      <span className="text-sm text-gray-400 font-medium whitespace-nowrap">
        Перевод при наведении
      </span>
      <label className="relative inline-block w-11 h-6">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="hidden"
        />
        <div
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
            enabled ? 'bg-primary' : 'bg-gray-600'
          }`}
        >
          <div
            className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 top-0.5 left-0.5 ${
              enabled ? 'transform translate-x-5' : ''
            }`}
          />
        </div>
      </label>
    </div>
  </div>
);

export { UsedTermsSection, TranslationToggle };
```

```js eng4IT/frontend/src/components/StatisticsPanel.js
// eng4IT/frontend/src/components/StatisticsPanel.js
import React from 'react';
import { AreaChart, Card, Title, Text } from '@tremor/react';
import { motion } from 'framer-motion';

const StatisticsPanel = ({ statistics }) => {
  if (!statistics) return null;

  const { overview, category_progress, learning_curve } = statistics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Terms', value: overview.total_terms },
          { title: 'Favorites', value: overview.favorites },
          { title: 'Completed', value: overview.completed },
          { title: 'In Progress', value: overview.in_progress },
        ].map((item, index) => (
          <Card key={index} className="bg-dark-card border border-gray-800">
            <Title className="text-primary">{item.title}</Title>
            <Text className="text-3xl font-bold text-gray-200">{item.value}</Text>
          </Card>
        ))}
      </div>

      {/* Learning Progress Chart */}
      <Card className="bg-dark-card border border-gray-800">
        <Title className="text-primary mb-4">Learning Progress</Title>
        <AreaChart
          className="h-72"
          data={learning_curve}
          index="date"
          categories={['success_rate']}
          colors={['emerald']}
          valueFormatter={(number) => `${number.toFixed(1)}%`}
        />
      </Card>

      {/* Category Progress */}
      <Card className="bg-dark-card border border-gray-800">
        <Title className="text-primary mb-4">Progress by Category</Title>
        <div className="space-y-4">
          {category_progress.map((category, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-gray-200">
                <span>{category.category}</span>
                <span>{category.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.progress}%` }}
                  className="bg-primary h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatisticsPanel;
```

```js eng4IT/frontend/src/components/TermModal.js
// frontend/src/components/TermModal.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Volume2 } from "lucide-react";

const TermModal = ({ isOpen, onClose, term, translation, category }) => {
  const [explanation, setExplanation] = useState("");
  const [llmTranslation, setLlmTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentModel, setCurrentModel] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (text) => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      console.error("Speech synthesis error:", event);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/model/current",
        );
        setCurrentModel(response.data.model);
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    };

    if (isOpen) {
      fetchCurrentModel();
    }
  }, [isOpen]);

  const handleClose = () => {
    setExplanation("");
    setLlmTranslation("");
    setShowTranslation(false);
    onClose();
  };

  const getExplanation = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/explain-term",
        {
          term: term, // Используем term вместо termValue
          category,
        },
      );
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error("Error getting explanation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLlmTranslation = async () => {
    setIsTranslating(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/translate-term",
        {
          term: term, // Используем term вместо termValue
          explanation: explanation || "",
        },
      );
      setLlmTranslation(response.data.translation);
      setShowTranslation(true);
    } catch (error) {
      console.error("Error getting LLM translation:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Добавляем проверку на undefined
  if (!isOpen || !term) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>
        <div className="relative bg-dark-card border border-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-primary"
          >
            <X size={24} />
          </button>

          <h3 className="text-xl font-semibold text-primary mb-2">
            {typeof term === "object" ? term.original : term}
          </h3>

          {/* Кнопки управления */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => speak(term)}
              disabled={isPlaying}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                ${isPlaying ? "bg-primary/20 text-primary" : "bg-dark-lighter text-gray-400 hover:text-primary"}`}
            >
              <Volume2 size={16} className={isPlaying ? "animate-pulse" : ""} />
            </button>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                showTranslation
                  ? "bg-primary/20 text-primary"
                  : "bg-dark-lighter text-gray-400 hover:text-primary"
              }`}
            >
              {showTranslation ? "Скрыть перевод" : "Показать перевод"}
            </button>
            {explanation && (
              <button
                onClick={getLlmTranslation}
                disabled={isTranslating}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50"
              >
                {isTranslating ? "Перевод..." : "Перевести LLM"}
              </button>
            )}
          </div>

          {/* Переводы */}
          {showTranslation && (
            <div className="mb-4 space-y-2">
              {translation && (
                <div className="p-3 bg-dark-lighter rounded-lg">
                  <p className="text-sm text-primary/80 mb-1">
                    Базовый перевод:
                  </p>
                  <p className="text-gray-300">{translation}</p>
                </div>
              )}
              {llmTranslation && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary mb-1">Перевод LLM:</p>
                  <p className="text-gray-300">{llmTranslation}</p>
                </div>
              )}
            </div>
          )}

          {category && (
            <div className="mb-4">
              <span className="category-tag">{category}</span>
            </div>
          )}

          {/* Статистика изучения */}
          <div className="mb-4 p-3 bg-dark-lighter rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Попыток изучения</p>
                <p className="text-lg text-primary">{term.attempts || 0}</p>
              </div>
              {term.last_attempt && (
                <div>
                  <p className="text-sm text-gray-400">Последняя попытка</p>
                  <p className="text-lg text-primary">
                    {new Date(term.last_attempt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!explanation && (
            <button
              onClick={getExplanation}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-dark py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading
                ? "Загрузка..."
                : `Получить объяснение (${currentModel === "gemini" ? "Gemini" : "Ollama"})`}
            </button>
          )}

          {explanation && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-primary mb-2">
                Объяснение:
              </h4>
              <p className="text-gray-300 whitespace-pre-wrap">{explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermModal;
```

```js eng4IT/frontend/src/components/ThemeToggle.js
// eng4IT/frontend/src/components/ThemeToggle.js
import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-dark-card border border-gray-800
                 shadow-lg hover:border-primary transition-colors z-50"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <Sun className="w-6 h-6 text-primary" />
        ) : (
          <Moon className="w-6 h-6 text-primary" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
```

```js eng4IT/frontend/src/components/WordAssessment.js
import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const CardContent = ({ word, category }) => {
  const [mainCategory, subCategory] = category.split("->").map((s) => s.trim());

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h3 className="text-3xl font-bold text-primary mb-4 text-center">
        {word}
      </h3>
      <p className="text-gray-400 text-center mb-2">{mainCategory}</p>
      <p className="text-gray-500 text-sm text-center">{subCategory}</p>
    </div>
  );
};

const WordCard = ({ word, category, onSwipe, active, exitX }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);

  const leftIndicatorOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      onSwipe(
        info.offset.x > 0 ? "unknown" : "known",
        info.offset.x > 0 ? 300 : -300,
      );
    }
  };

  if (!active) return null;

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        x: exitX,
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.3 },
      }}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full"
    >
      <motion.div
        style={{ opacity: leftIndicatorOpacity }}
        className="absolute left-4 top-4 bg-primary text-dark px-3 py-1 rounded-lg z-10"
      >
        Yes
      </motion.div>

      <motion.div
        style={{ opacity: rightIndicatorOpacity }}
        className="absolute right-4 top-4 bg-red-500 text-white px-3 py-1 rounded-lg z-10"
      >
        No
      </motion.div>

      <div className="bg-dark-card border border-gray-800 p-8 rounded-2xl shadow-xl h-64 flex items-center justify-center">
        <CardContent word={word} category={category} />
      </div>
    </motion.div>
  );
};

const WordAssessment = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [setKnownWords] = useState([]);
  const [unknownWords, setUnknownWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exitX, setExitX] = useState(0);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get(`${API_URL}/assessment-words`);
        if (response.data.words && response.data.words.length > 0) {
          setWords(response.data.words);
          console.log("Fetched words:", response.data.words);
        } else {
          console.warn("No words received from API.");
        }
      } catch (error) {
        console.error("Error fetching assessment words:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWords();
  }, []);

  const handleSwipe = (direction, xValue) => {
    const currentWord = words[currentIndex];
    setExitX(xValue);

    if (direction === "known") {
      setKnownWords((prev) => [...prev, currentWord]);
    } else {
      setUnknownWords((prev) => [...prev, currentWord]);
    }

    if (currentIndex + 1 >= words.length) {
      setTimeout(handleAssessmentComplete, 300);
    } else {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 300);
    }
  };

  const handleButtonClick = (direction) => {
    const xValue = direction === "known" ? -300 : 300;
    handleSwipe(direction, xValue);
  };

  const handleAssessmentComplete = async () => {
    try {
      // Сохраняем только неизвестные слова
      await axios.post(`${API_URL}/assessment-results`, {
        unknownWords: unknownWords.map((word) => ({
          term: word.term,
          category: word.category,
        })),
      });

      // Перенаправляем на страницу с неизвестными словами
      navigate("/?tab=unknown-words");
    } catch (error) {
      console.error("Error saving assessment results:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-background">
        <div className="bg-dark-card border border-gray-800 p-8 rounded-2xl flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium text-primary">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center p-8">
      <div className="w-full max-w-md mx-auto">
        {/* Отображать сообщение, если нет слов */}
        {words.length === 0 && !isLoading && (
          <div className="text-center text-red-500">
            Нет доступных слов для оценки.
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
            Words Assessment
          </h1>
          <p className="text-center text-gray-400 mt-2">
            Свайпните влево если знаете слово, вправо если нет
          </p>
          <div className="text-center text-gray-500 mt-2">
            {currentIndex + 1} из {words.length}
          </div>
        </div>

        <div className="relative h-80">
          <AnimatePresence initial={false}>
            {words.map((word, index) => (
              <WordCard
                key={word.id}
                word={word.term}
                category={word.category}
                onSwipe={handleSwipe}
                active={index === currentIndex}
                exitX={exitX}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick("known")}
            className="bg-primary hover:bg-primary-hover text-dark px-6 py-2 rounded-xl transition-all duration-200"
          >
            Yes
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick("unknown")}
            className="bg-red-600 hover:bg-red-1000 text-white px-6 py-2 rounded-xl transition-all duration-200"
          >
            No
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default WordAssessment;
```

```js eng4IT/frontend/src/components/WordList.js
// eng4IT/frontend/src/components/WordList.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import axios from "axios"; // Добавляем импорт axios

const WordList = ({
  id, // Добавляем id в props
  word,
  translation,
  category,
  attempts,
  lastAttempt,
  progress,
  isFavorite,
  onClick,
  onFavoriteToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Функция для озвучивания слова
  const speak = (text) => {
    setIsPlaying(true);
    setError(null);

    // Создаем новый экземпляр SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Настраиваем параметры
    utterance.lang = "en-US"; // Устанавливаем английский язык
    utterance.rate = 0.9; // Немного замедляем скорость
    utterance.pitch = 1; // Стандартная высота тона

    // Обработчики событий
    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setError("Error speaking the word");
      console.error("Speech synthesis error:", event);
    };

    // Останавливаем текущее произношение, если оно есть
    window.speechSynthesis.cancel();

    // Запускаем произношение
    window.speechSynthesis.speak(utterance);
  };

  const handlePlaySound = (e) => {
    e.stopPropagation();
    speak(word);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      console.log("Toggling favorite for term ID:", id); // Добавляем лог
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: id,
        },
      );
      if (response.data.status === "success") {
        onFavoriteToggle(id); // Передаем id
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Error updating favorite status");
    }
  };

  const formattedDate = lastAttempt
    ? new Date(lastAttempt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="term-card cursor-pointer hover:scale-[1.02] transition-all duration-200 relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="term text-lg font-medium text-primary">{word}</h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlaySound}
              className={`text-gray-400 hover:text-primary transition-colors ${
                isPlaying ? "animate-pulse text-primary" : ""
              }`}
              disabled={isPlaying}
            >
              <Volume2 size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={`${
                isFavorite ? "text-yellow-500" : "text-gray-400"
              } hover:text-yellow-500 transition-colors`}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
          </div>
          <p className="translation text-gray-300">{translation}</p>
          {attempts > 0 && (
            <p className="text-sm text-gray-500">Attempts: {attempts}</p>
          )}
        </div>

        <div className="flex flex-col items-end">
          {category && (
            <span className="category-tag mb-2 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">
              {category}
            </span>
          )}
          {progress !== undefined && (
            <div className="w-24 bg-gray-700 rounded-full h-1 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          )}
          {lastAttempt && (
            <span className="text-xs text-gray-500">{formattedDate}</span>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-2 right-2 bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WordList;
```


contexts
```js eng4IT/frontend/src/contexts/ThemeContext.js
// eng4IT/frontend/src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```


```css eng4IT/frontend/src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
    --color-primary: #4ade80; /* Зелёный оттенок */
    --color-primary-hover: #22c55e; /* Более тёмный зелёный для hover */
    --color-background: #121212;
    --color-card: #1e1e1e; /* Изменено для улучшения видимости */
    --color-text: #e0e0e0;
    --color-text-secondary: #a0a0a0;
}

body {
    background-color: var(--color-background);
    color: var(--color-text);
}

.gradient-background {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    min-height: 100vh;
}

.glass-card {
    background: var(--color-card);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(197, 165, 114, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

.word-span {
    user-select: none;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-block;
    padding: 2px 4px;
    margin: -2px 0;
    border-radius: 4px;
    position: relative;
}

.word-span:hover {
    background-color: rgba(197, 165, 114, 0.2);
    color: var(--color-primary);
}

.word-span.selected {
    background-color: var(--color-primary);
    color: var(--color-background);
}

.word-span:hover:not(.selected) {
    color: var(--color-primary);
}

/* Обновленные стили для всплывающего перевода */
.translation-popup {
    background: var(--color-card);
    border: 1px solid var(--color-gray-800);
    color: var(--color-text);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary {
    background-color: var(--color-primary);
    color: var(--color-background);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s;
}

.hover\:scale-102:hover {
    transform: scale(1.02);
}

.card-wrong {
    border-color: #ef4444 !important;
}

@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-5px);
    }
    75% {
        transform: translateX(5px);
    }
}

@keyframes card-pop {
    0% {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
    }
    60% {
        transform: scale(1.05) translateY(-5px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.card-enter {
    animation: card-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.debug-info {
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.animate-shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.btn-primary:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
}

.title-gradient {
    background: linear-gradient(135deg, #7296c5 0%, #92e5e5 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-link {
    color: var(--color-text);
    opacity: 0.7;
    transition: all 0.2s;
}

.nav-link:hover {
    color: var(--color-primary);
    opacity: 1;
}

.nav-link.active {
    color: var(--color-primary);
    opacity: 1;
    border-bottom: 2px solid var(--color-primary);
}

.translation-toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: white;
    padding: 0.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 50;
}

/* Заголовки */
.page-title {
    font-size: 2rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--color-primary) 0%, #86efac 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
}

.page-subtitle {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
}

/* Карточки для всех разделов */
.term-card {
    background: var(--color-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.term-card:hover {
    transform: translateY(-2px);
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.1);
}

.term-card .term {
    color: var(--color-primary);
    font-size: 1.1rem;
    font-weight: 500;
}

.term-card .translation {
    color: var(--color-text);
}

.term-card .category {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
}

/* Кнопки в шапке */
.header-button {
    background: rgba(74, 222, 128, 0.1);
    color: var(--color-primary);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.header-button:hover {
    background: rgba(74, 222, 128, 0.2);
}

.header-button.active {
    background: var(--color-primary);
    color: var(--color-background);
}

/* Поле поиска */
.search-input {
    background: var(--color-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--color-text);
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
    margin-bottom: 2rem;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
}

/* Настройки */
.settings-section {
    background: var(--color-card);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.settings-title {
    color: var(--color-primary);
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 1rem;
}

.settings-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.settings-button {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
}

.settings-button:hover {
    background: rgba(255, 255, 255, 0.1);
}

.settings-button.active {
    background: var(--color-primary);
    color: var(--color-background);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.stat-card {
    background: var(--color-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
}

.term-metadata {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.term-metadata-icon {
    opacity: 0.5;
}

@keyframes confetti {
    0% {
        transform: rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: rotate(360deg);
        opacity: 0;
    }
}

.confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: confetti 1s ease-out forwards;
}

.stat-card {
    @apply bg-dark-card border border-gray-800 rounded-xl p-6 transition-all duration-200;
}

.stat-card:hover {
    @apply border-primary shadow-lg transform scale-[1.02];
}

/* Стили для графиков */
.tremor-Chart {
    @apply bg-transparent !important;
}

.tremor-Card {
    @apply bg-transparent border-gray-800 !important;
}

/* Анимации для списка слов */
.word-list-enter {
    opacity: 0;
    transform: translateY(20px);
}

.word-list-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition:
        opacity 300ms,
        transform 300ms;
}

.word-list-exit {
    opacity: 1;
}

.word-list-exit-active {
    opacity: 0;
    transform: translateY(-20px);
    transition:
        opacity 300ms,
        transform 300ms;
}

/* Стили для фильтров и поиска */
.filter-button {
    @apply px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
    bg-dark-lighter text-gray-400 hover:text-primary
    border border-gray-800 hover:border-primary;
}

.filter-button.active {
    @apply bg-primary-20 text-primary border-primary;
}

.search-input {
    @apply w-full bg-dark-card border border-gray-800 rounded-xl
    px-4 py-2 text-gray-200 placeholder-gray-500
    focus:border-primary focus:outline-none transition-colors;
}

/* Стили для прогресс-бара */
.progress-bar {
    @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress-bar-fill {
    @apply h-full bg-primary transition-all duration-300;
}

/* Стили для категорий */
.category-tree {
    @apply space-y-1;
}

.category-item {
    @apply flex items-center space-x-2 p-2 rounded-lg cursor-pointer
    hover:bg-gray-800 transition-colors;
}

.category-item.active {
    @apply bg-primary-20 text-primary;
}

/* Стили для статистики */
.stats-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-value {
    @apply text-3xl font-bold text-primary;
}

.stat-label {
    @apply text-sm text-gray-400;
}

/* Анимации для иконок */
@keyframes pulse-ring {
    0% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    80%,
    100% {
        transform: scale(1.3);
        opacity: 0;
    }
}

.icon-pulse::before {
    content: "";
    @apply absolute inset-0 rounded-full;
    animation: pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

/* Стили для режима сетки */
.grid-view {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}

.list-view {
    @apply space-y-4;
}

/* Стили для кнопок действий */
.action-button {
    @apply inline-flex items-center justify-center p-2
    rounded-lg transition-colors duration-200
    hover:bg-gray-800 text-gray-400 hover:text-primary;
}

.action-button.active {
    @apply bg-primary-20 text-primary;
}

/* Анимации для карточек при наведении */
.term-card {
    @apply transform-gpu transition-all duration-200;
}

.term-card:hover .term-actions {
    @apply opacity-100;
}

.term-actions {
    @apply absolute right-2 top-2 flex space-x-1 opacity-0
    transition-opacity duration-200;
}

/* Стили для модального окна */
.modal-backdrop {
    @apply fixed inset-0 bg-black/50 backdrop-blur-sm
    flex items-center justify-center z-50;
}

.modal-content {
    @apply bg-dark-card border border-gray-800 rounded-2xl
    p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto
    shadow-xl transform transition-all;
}

/* Стили для тегов категорий */
.category-tag {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
    bg-gray-800 text-gray-400 border border-gray-700
    transition-colors hover:border-primary hover:text-primary;
}

/* Стили для состояния загрузки */
.loading-skeleton {
    @apply animate-pulse bg-gray-800 rounded;
}

/* Стили для всплывающих подсказок */
.tooltip {
    @apply absolute z-50 px-2 py-1 text-xs rounded bg-gray-800
    text-gray-200 border border-gray-700 shadow-lg
    transition-opacity duration-200;
}

/* Стили для графиков статистики */
.chart-container {
    @apply bg-dark-card border border-gray-800 rounded-xl p-4
    transition-all duration-200 hover:border-primary;
}

.chart-title {
    @apply text-lg font-semibold text-primary mb-4;
}

/* Анимации для переключения вкладок */
.tab-content-enter {
    opacity: 0;
    transform: translateX(20px);
}

.tab-content-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition:
        opacity 300ms,
        transform 300ms;
}

.tab-content-exit {
    opacity: 1;
}

.tab-content-exit-active {
    opacity: 0;
    transform: translateX(-20px);
    transition:
        opacity 300ms,
        transform 300ms;
}

/* Стили для прогресса изучения */
.study-progress {
    @apply relative h-1.5 bg-gray-700 rounded-full overflow-hidden;
}

.study-progress-bar {
    @apply absolute left-0 top-0 h-full bg-primary
    transition-all duration-300 ease-out;
}

/* Стили для избранного */
.favorite-button {
    @apply text-gray-400 hover:text-yellow-500
    transition-colors duration-200;
}

.favorite-button.active {
    @apply text-yellow-500;
}

/* Адаптивные стили */
@media (max-width: 640px) {
    .stats-grid {
        @apply grid-cols-2;
    }

    .grid-view {
        @apply grid-cols-1;
    }
}

/* Темная тема */
.dark {
    --color-primary: #4ade80;
    --color-primary-hover: #22c55e;
    --color-background: #121212;
    --color-card: #1e1e1e;
    --color-text: #e0e0e0;
    --color-text-secondary: #a0a0a0;
}

/* Светлая тема */
:root {
    --color-primary: #4ade80;
    --color-primary-hover: #22c55e;
    --color-background: #f3f4f6;
    --color-card: #ffffff;
    --color-text: #1f2937;
    --color-text-secondary: #6b7280;
}

/* Темная тема */
.dark {
    --color-primary: #4ade80;
    --color-primary-hover: #22c55e;
    --color-background: #121212;
    --color-card: #1e1e1e;
    --color-text: #e0e0e0;
    --color-text-secondary: #a0a0a0;
}

/* Общие классы с использованием переменных */
.gradient-background {
    background: var(--color-background);
}

.glass-card {
    background: var(--color-card);
    border-color: var(--border-color);
}

/* Обновленные стили для текста */
.text-primary {
    color: var(--color-primary);
}

.text-secondary {
    color: var(--color-text-secondary);
}

/* Обновленные стили для карточек в светлой теме */
.light .term-card {
    background: var(--color-card);
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.light .term-card:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Адаптированные стили для компонентов в светлой теме */
.light .search-input {
    background: var(--color-card);
    border-color: #e5e7eb;
    color: var(--color-text);
}

.light .filter-button {
    background: var(--color-card);
    border-color: #e5e7eb;
    color: var(--color-text-secondary);
}

.light .category-tag {
    background: #f3f4f6;
    color: var(--color-text-secondary);
    border-color: #e5e7eb;
}

/* Адаптация для графиков и статистики */
.light .chart-container {
    background: var(--color-card);
    border-color: #e5e7eb;
}

.light .tremor-Card {
    background: var(--color-card) !important;
    border-color: #e5e7eb !important;
}

/* Анимации перехода между темами */
.theme-transition {
    transition:
        background-color 0.3s ease-in-out,
        color 0.3s ease-in-out,
        border-color 0.3s ease-in-out;
}
```

```js eng4IT/frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

```svg eng4IT/frontend/src/logo.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3"><g fill="#61DAFB"><path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z"/><circle cx="420.9" cy="296.5" r="45.7"/><path d="M520.5 78.1z"/></g></svg>
```

```js eng4IT/frontend/src/reportWebVitals.js
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
```

```js eng4IT/frontend/src/setupTests.js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
```

src/components
```js eng4IT/frontend/src/src/components/ThemeToggle.js
// eng4IT/frontend/src/components/ThemeToggle.js
import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-dark-card border border-gray-800
                 shadow-lg hover:border-primary transition-colors z-50"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <Sun className="w-6 h-6 text-primary" />
        ) : (
          <Moon className="w-6 h-6 text-primary" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
```



eng4IT/backend/app
```py eng4IT/backend/app/app.py
# backend/app/app.py
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import json
import logging
import os
import random

import requests

# В начале файла app.py после импортов
from database.db import AssessmentWord, ModelConfig, Scenario, Session, init_db
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from models.base import Category, LearningHistory, Subcategory, Term, UnknownTerm, StudySession
from services.gemini_service import GeminiService
from services.ollama_service import KnowledgeEvaluator
from services.translation_service import translator

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Включаем CORS для работы с React

WORDS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'words'
)
UNKNOWN_WORDS_FILE = os.path.join(WORDS_DIR, 'unknown_words.txt')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Создаем необходимые директории и файлы
if not os.path.exists(WORDS_DIR):
    os.makedirs(WORDS_DIR)
if not os.path.exists(UNKNOWN_WORDS_FILE):
    with open(UNKNOWN_WORDS_FILE, 'w', encoding='utf-8') as f:
        pass

# Инициализация сервисов
ollama_service = KnowledgeEvaluator(
    os.path.join(WORDS_DIR, 'categorized_words.md')
)
gemini_service = GeminiService(GEMINI_API_KEY)


def initialize_assessment_words():
    """Инициализация базы данных словами из файла."""
    session = Session()
    try:
        # Проверяем, есть ли уже слова в базе
        existing_count = session.query(AssessmentWord).count()
        if existing_count > 0:
            logger.info(f'Database already contains {existing_count} words')
            return

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        if not os.path.exists(words_file):
            logger.error('Words file not found')
            return

        current_category = None
        current_subcategory = None
        words_added = 0

        with open(words_file, 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if line.startswith('# '):
                    current_category = line[2:].strip()
                elif line.startswith('## '):
                    current_subcategory = line[3:].strip()
                elif line.startswith('- '):
                    word = line[2:].strip()
                    if current_category and current_subcategory:
                        # Проверяем существование термина перед добавлением
                        existing_term = session.query(Term).filter_by(term=word).first()
                        if not existing_term:
                            # Добавляем в AssessmentWord
                            assessment_word = AssessmentWord(
                                word=word,
                                category=f'{current_category} -> {current_subcategory}',
                            )
                            session.add(assessment_word)

                            # Добавляем в Term без перевода
                            term = Term(
                                term=word,
                                translation=word,  # Используем само слово как временный перевод
                                category=f'{current_category} -> {current_subcategory}',
                                term_metadata={
                                    'source': 'initial_load',
                                    'added_at': datetime.now().isoformat(),
                                }
                            )
                            session.add(term)
                            session.flush()

                            words_added += 1

        session.commit()
        logger.info(f'Added {words_added} words to database')

    except Exception as e:
        logger.error(f'Error initializing assessment words: {e}')
        session.rollback()
    finally:
        session.close()

# Инициализация базы данных словами
initialize_assessment_words()


def get_current_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            api_key = os.getenv('GEMINI_API_KEY')
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                has_api_key=bool(api_key),
            )
            session.add(config)
            session.commit()
        return config.current_model, os.getenv('GEMINI_API_KEY')
    finally:
        session.close()


def check_available_models():
    available_models = {
        'gemini': bool(os.getenv('GEMINI_API_KEY')),
        'ollama': False,  # По умолчанию недоступна
    }

    try:
        # Проверяем доступность Ollama
        response = requests.get('http://localhost:11434/api/tags')
        if response.status_code == 200:
            available_models['ollama'] = True
    except:
        pass

    return available_models


@app.route('/api/model/current', methods=['GET'])
def get_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
            session.commit()

        api_key = os.getenv('GEMINI_API_KEY')
        return jsonify(
            {
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': bool(api_key),
                'api_key': api_key if api_key else None,
            }
        )
    finally:
        session.close()


@app.route('/api/all-terms', methods=['GET'])
def get_all_terms():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            # Получаем все термины из базы данных
            terms = session.query(Term).all()

            # Формируем словарь с терминами
            terms_dict = {
                term.term: term.category
                for term in terms
            }

            if not terms_dict:
                logger.warning('No terms found in database')

            return jsonify(terms_dict)

        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error getting all terms: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain-term', methods=['POST'])
def explain_term():
    data = request.json
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    category = data.get('category')

    # Выбираем сервис в зависимости от текущей модели
    current_model, api_key = get_current_model()

    try:
        logger.info(f'Explaining term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for explanation')
            gemini_service = GeminiService(api_key)
            try:
                response = gemini_service.explain_term(term, category)
                explanation = response.strip()
                return jsonify({'explanation': explanation})
            except Exception as e:
                logger.error(f'Gemini explanation failed: {e}')
                # Возвращаем ошибку, если Gemini не сработал
                return jsonify(
                    {
                        'error': 'Failed to generate explanation with Gemini. Please check your API key or try again later.'
                    }
                ), 500
        else:
            # Если модель не Gemini или нет API ключа, возвращаем сообщение об ошибке
            return jsonify(
                {
                    'error': 'Gemini API key is required for term explanation. Please configure it in settings.'
                }
            ), 400

    except Exception as e:
        logger.error(f'Error explaining term: {e}')
        return jsonify({'error': 'Failed to generate explanation'}), 500


@app.route('/api/unknown-words', methods=['GET'])
def get_unknown_words():
    try:
        session = Session()
        try:
            unknown_terms = (
                session.query(Term, UnknownTerm)
                .join(UnknownTerm)
                .order_by(UnknownTerm.created_at.desc())
                .all()
            )

            words = [
                {
                    'id': term.id,
                    'original': term.term,
                    'translation': term.translation,
                    'category': term.category,
                    'attempts': unknown.attempts,
                    'is_favorite': term.is_favorite,  # Убедитесь, что это поле передается
                    'last_attempt': unknown.last_attempt.isoformat() if unknown.last_attempt else None,
                    'study_progress': term.study_progress
                }
                for term, unknown in unknown_terms
            ]

            logger.info(f"Returning words with favorites: {[(w['original'], w['is_favorite']) for w in words]}")
            return jsonify(words)
        finally:
            session.close()
    except Exception as e:
        logger.error(f'Error getting unknown words: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/set', methods=['POST'])
def set_model():
    data = request.json
    model_name = data.get('model')
    sub_model = data.get('sub_model')
    api_key = data.get('api_key')

    if model_name not in ['ollama', 'gemini']:
        return jsonify({'error': 'Invalid model name'}), 400

    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model=model_name,
                sub_model=sub_model,
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
        else:
            config.current_model = model_name
            config.sub_model = sub_model
            config.has_api_key = bool(os.getenv('GEMINI_API_KEY'))

        session.commit()
        return jsonify(
            {
                'status': 'success',
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': config.has_api_key,
            }
        )
    finally:
        session.close()


@app.route('/api/scenario', methods=['GET'])
def get_scenario():
    session = Session()
    try:
        scenario = (
            session.query(Scenario).order_by(Scenario.created_at.desc()).first()
        )

        if not scenario:
            words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
            selected_words, categories = ollama_service._select_random_words()

            current_model, _ = get_current_model()
            service = (
                gemini_service if current_model == 'gemini' else ollama_service
            )
            result = service.generate_evaluation_text(selected_words, categories)

            scenario = Scenario(
                text=result['text'], terms=json.dumps(result['categories'])
            )
            session.add(scenario)
            session.commit()

        return jsonify(
            {'text': scenario.text, 'categories': json.loads(scenario.terms)}
        )
    finally:
        session.close()


@app.route('/api/generate_new', methods=['POST'])
def generate_new():
    session = Session()
    try:
        current_model, api_key = get_current_model()
        logger.info(f'Generating new scenario with model: {current_model}')

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        evaluator = KnowledgeEvaluator(words_file)
        selected_words, categories = evaluator._select_random_words()

        result = None
        error_message = None

        try:
            if current_model == 'gemini' and api_key:
                logger.info('Using Gemini for generation')
                gemini_service = GeminiService(api_key)
                result = gemini_service.generate_evaluation_text(
                    selected_words, categories
                )
            else:
                logger.info('Using Ollama for generation')
                result = evaluator.generate_evaluation_text(
                    selected_words, categories
                )

            if not result or not result.get('text'):
                error_message = 'Empty result from generation service'

        except Exception as e:
            error_message = f'Generation error: {str(e)}'
            logger.error(error_message)

        if error_message:
            # Возвращаем информативное сообщение об ошибке
            return jsonify(
                {
                    'text': f'Service temporarily unavailable. {error_message}',
                    'categories': categories,
                    'error': error_message,
                }
            ), 503  # Service Unavailable

        new_scenario = Scenario(
            text=result['text'], terms=json.dumps(result['categories'])
        )
        session.add(new_scenario)
        session.commit()

        return jsonify(
            {
                'text': new_scenario.text,
                'categories': json.loads(new_scenario.terms),
            }
        )

    finally:
        session.close()


@app.route('/api/translate', methods=['POST'])
def translate_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'ru')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        translation = translator.translate(text, source_lang, target_lang)
        return jsonify({'translation': translation})

    except Exception as e:
        print(f'Translation error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/save_words', methods=['POST'])
def save_words():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            words = request.get_json()['words']
            if not words:
                return jsonify({'error': 'No words provided'}), 400

            for word_data in words:
                if 'original' in word_data and 'translation' in word_data:
                    term = Term(
                        term=word_data['original'],
                        translation=word_data['translation'],
                        category=word_data.get('category', 'Unknown'),
                        term_metadata={  # Изменено с metadata на term_metadata
                            'source': 'learning_interface',
                            'added_at': datetime.now().isoformat(),
                        },
                    )
                    session.add(term)
                    session.flush()

                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now(),
                    )
                    session.add(unknown_term)

            session.commit()
            return jsonify({'status': 'success'})

        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error saving words: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/assessment-words', methods=['GET'])
def get_assessment_words():
    try:
        session = Session()

        # Проверяем количество слов в базе
        total_words = session.query(AssessmentWord).count()
        if total_words == 0:
            # Если база пуста, пробуем заполнить её
            initialize_assessment_words()
            total_words = session.query(AssessmentWord).count()
            if total_words == 0:
                return jsonify(
                    {'error': 'No words available for assessment', 'words': []}
                ), 404

        # Получаем существующие неизвестные слова
        existing_words = set()
        if os.path.exists(UNKNOWN_WORDS_FILE):
            with open(UNKNOWN_WORDS_FILE, 'r', encoding='utf-8') as file:
                for line in file:
                    if ':::' in line:
                        word = line.split(':::')[0].strip()
                        existing_words.add(word)

        # Получаем слова из базы, которых нет в списке неизвестных
        available_words = session.query(AssessmentWord).all()
        filtered_words = [
            word for word in available_words if word.word not in existing_words
        ]

        if not filtered_words:
            return jsonify(
                {'message': 'All available words have been assessed', 'words': []}
            )

        # Выбираем случайные слова
        selected_words = random.sample(filtered_words, min(5, len(filtered_words)))

        words_response = [
            {'id': word.id, 'term': word.word, 'category': word.category}
            for word in selected_words
        ]

        return jsonify({'words': words_response})

    except Exception as e:
        logger.error(f'Error getting assessment words: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/assessment-results', methods=['POST'])
def save_assessment_results():
    session = Session()
    try:
        data = request.get_json()
        unknown_words = data.get('unknownWords', [])
        logger.info(f"Processing unknown words: {unknown_words}")

        words_added = 0

        for word in unknown_words:
            try:
                # Получаем перевод
                translation = translator.translate(word['term'], 'en', 'ru')
                logger.info(f"Got translation for {word['term']}: {translation}")
            except Exception as e:
                logger.error(f"Translation failed for {word['term']}: {e}")
                translation = word['term']

            try:
                # Проверяем существование термина
                existing_term = session.query(Term).filter_by(term=word['term']).first()

                if existing_term:
                    logger.info(f"Term already exists: {word['term']}")
                    # Проверяем, есть ли уже запись в UnknownTerm
                    unknown_exists = session.query(UnknownTerm).filter_by(term_id=existing_term.id).first()

                    if not unknown_exists:
                        # Если термин есть, но его нет в unknown_terms - добавляем
                        existing_term.translation = translation
                        unknown_term = UnknownTerm(
                            term_id=existing_term.id,
                            attempts=0,
                            last_attempt=datetime.now()
                        )
                        session.add(unknown_term)
                        words_added += 1
                else:
                    logger.info(f"Adding new term: {word['term']}")

                    # Создаем новый термин
                    term = Term(
                        term=word['term'],
                        translation=translation,  # Временно используем оригинал как перевод
                        category=word['category'],
                        term_metadata={
                            'source': 'assessment',
                            'added_at': datetime.now().isoformat(),
                        }
                    )
                    session.add(term)
                    session.flush()

                    # Создаем запись неизвестного термина
                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now()
                    )
                    session.add(unknown_term)
                    words_added += 1

            except Exception as e:
                logger.error(f"Error processing word {word['term']}: {e}")
                continue

        session.commit()
        logger.info(f"Successfully added {words_added} words to unknown terms")
        return jsonify({
            'status': 'success',
            'words_added': words_added
        })

    except Exception as e:
        logger.error(f'Error saving assessment results: {e}')
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/translate-term', methods=['POST'])
def translate_term():
    data = request.json
    logger.info(f'Received data for translation: {data}')
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    explanation = data.get('explanation', '')

    logger.info(f'Processing term: {term}, explanation: {explanation}')

    current_model, api_key = get_current_model()

    prompt = f"""
    Translate the following technical term and its explanation to Russian.
    Make the translation clear and professionally accurate.

    Term: {term} \n\n

    {f"Explanation: {explanation}" if explanation else ""}

    Format the response as:

    Term: [translated term] \n\n
    {"Explanation: [translated explanation]" if explanation else ""}
    """

    try:
        logger.info(f'Translating term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for translation')
            gemini_service = GeminiService(api_key)
            try:
                translation = gemini_service.translate_text(prompt)
            except Exception as e:
                logger.error(f'Gemini translation failed: {e}')
                # Fallback на Ollama
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                response = service.llm.invoke(prompt)
                translation = response.content
        else:
            # Используем Ollama
            logger.info('Using Ollama for translation')
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )
            response = service.llm.invoke(prompt)
            translation = response.content

        return jsonify({'translation': translation.strip()})
    except Exception as e:
        logger.error(f'Error translating term: {e}')
        return jsonify({'error': 'Failed to translate'}), 500


@app.route('/api/available-models', methods=['GET'])
def get_available_models():
    return jsonify(check_available_models())


@app.route('/api/categorize-words', methods=['POST'])
def categorize_words():
    data = request.json
    words = data.get('words', [])

    if not words:
        return jsonify({'error': 'No words provided'}), 400

    try:
        session = Session()
        # Получаем все категории и подкатегории из БД
        categories = session.query(Category).all()
        categories_dict = {}

        for category in categories:
            subcategories = [sub.name for sub in category.subcategories]
            categories_dict[category.name] = subcategories

        # Формируем текст с категориями для промпта
        categories_text = '\n'.join(
            [
                f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                for cat, subs in categories_dict.items()
            ]
        )

        # Если категорий нет, создаем базовые
        if not categories_dict:
            default_categories = [
                ('Programming', ['General', 'Algorithms', 'Data Structures']),
                ('Web Development', ['Frontend', 'Backend', 'APIs']),
                ('Databases', ['SQL', 'NoSQL', 'Design']),
            ]

            for cat_name, subcats in default_categories:
                category = Category(name=cat_name)
                session.add(category)
                session.flush()

                for subcat_name in subcats:
                    subcategory = Subcategory(
                        name=subcat_name, category_id=category.id
                    )
                    session.add(subcategory)

            session.commit()

            # Обновляем текст категорий
            categories_text = '\n'.join(
                [
                    f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                    for cat, subs in default_categories
                ]
            )

        prompt = f"""Given these existing categories and their subcategories:
        {categories_text}

        Please categorize the following words by assigning them to either existing or new categories.
        Words to categorize: {', '.join([w['original'] for w in words])}

        Return the results in the format:
        word1: Category -> Subcategory
        word2: Category -> Subcategory
        ...

        Important:
        - Use existing categories when possible
        - Create new categories only if really necessary
        - Always use the format "Category -> Subcategory"
        """

        # Получаем текущую модель и ключ API
        current_model, api_key = get_current_model()

        try:
            if current_model == 'gemini' and api_key:
                categorization = gemini_service.categorize_words(prompt)
            else:
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                categorization = service.categorize_words(prompt)

            # Парсим результат и добавляем новые категории если нужно
            categorized_words = []
            for word in words:
                word_category = None

                # Ищем категоризацию для текущего слова
                for line in categorization.strip().split('\n'):
                    if ':' in line and '->' in line:
                        cat_word, category = line.split(':', 1)
                        if cat_word.strip().lower() == word['original'].lower():
                            word_category = category.strip()
                            break

                if word_category and '->' in word_category:
                    cat_name, subcat_name = [
                        x.strip() for x in word_category.split('->')
                    ]

                    # Проверяем существование категории
                    category = (
                        session.query(Category).filter_by(name=cat_name).first()
                    )
                    if not category:
                        category = Category(name=cat_name)
                        session.add(category)
                        session.flush()

                    # Проверяем существование подкатегории
                    subcategory = (
                        session.query(Subcategory)
                        .filter_by(category_id=category.id, name=subcat_name)
                        .first()
                    )
                    if not subcategory:
                        subcategory = Subcategory(
                            name=subcat_name, category_id=category.id
                        )
                        session.add(subcategory)

                    word['category'] = f'{cat_name} -> {subcat_name}'
                else:
                    word['category'] = 'Programming -> General'

                categorized_words.append(word)

            session.commit()
            return jsonify({'words': categorized_words})

        except Exception as e:
            logger.error(f'Error during categorization: {e}')
            session.rollback()
            # В случае ошибки используем базовую категорию
            return jsonify(
                {
                    'words': [
                        {**w, 'category': 'Programming -> General'} for w in words
                    ]
                }
            )

    except Exception as e:
        logger.error(f'Error in categorize_words: {e}')
        if 'session' in locals():
            session.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        if 'session' in locals():
            session.close()


@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        session = Session()
        categories = session.query(Category).all()

        result = {}
        for category in categories:
            result[category.name] = [sub.name for sub in category.subcategories]

        return jsonify(result)

    except Exception as e:
        logger.error(f'Error getting categories: {e}')
        return jsonify({'error': str(e)}), 500

    finally:
        session.close()


@app.route('/api/chat-exercise', methods=['GET'])
def get_chat_exercise():
    try:
        session = Session()
        current_model, api_key = get_current_model()

        # Получаем неизвестные слова
        unknown_terms = session.query(Term).join(UnknownTerm).all()

        if current_model == 'gemini' and api_key:
            service = GeminiService(api_key)
        else:
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )

        # Генерируем диалог
        terms_for_dialogue = random.sample(
            unknown_terms, min(10, len(unknown_terms))
        )
        dialogue = service.generate_dialogue(terms_for_dialogue)

        return jsonify(dialogue)

    except Exception as e:
        logger.error(f'Error generating chat exercise: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/matching-pairs', methods=['GET'])
def get_matching_pairs():
    use_ai = request.args.get('useAI') == 'true'
    pairs_count = 15
    session = Session()
    try:
        # Получаем все термины
        terms = session.query(Term).all()

        # Если терминов мало, добавляем базовые
        if len(terms) < pairs_count:
            basic_terms = [
                {"term": "database", "translation": "база данных"},
                {"term": "algorithm", "translation": "алгоритм"},
                {"term": "framework", "translation": "фреймворк"},
                {"term": "interface", "translation": "интерфейс"},
                {"term": "variable", "translation": "переменная"},
                {"term": "function", "translation": "функция"},
                {"term": "array", "translation": "массив"},
                {"term": "string", "translation": "строка"},
                {"term": "object", "translation": "объект"},
                {"term": "class", "translation": "класс"},
                {"term": "method", "translation": "метод"},
                {"term": "property", "translation": "свойство"},
                {"term": "inheritance", "translation": "наследование"},
                {"term": "polymorphism", "translation": "полиморфизм"},
                {"term": "encapsulation", "translation": "инкапсуляция"},
                {"term": "abstraction", "translation": "абстракция"},
                {"term": "debugging", "translation": "отладка"},
                {"term": "compiler", "translation": "компилятор"},
                {"term": "runtime", "translation": "время выполнения"},
                {"term": "memory", "translation": "память"}
            ]
            for term_data in basic_terms:
                term = Term(
                    term=term_data["term"],
                    translation=term_data["translation"],
                    category="Programming -> General"
                )
                session.add(term)
            session.commit()
            terms = session.query(Term).all()

        # Выбираем 20 случайных терминов
        selected_terms = random.sample(terms, min(pairs_count, len(terms)))  # Убедитесь, что здесь 20

        # Формируем пары БЕЗ перемешивания
        pairs = [
            {
                'english': term.term,
                'russian': term.translation
            }
            for term in selected_terms
        ]

        if use_ai:
            try:
                current_model, api_key = get_current_model()
                if current_model == 'gemini' and api_key:
                    service = GeminiService(api_key)
                    result = service.improve_translations({'pairs': pairs}, pairs_count=pairs_count)
                    if result and 'english' in result and 'russian' in result:
                        return jsonify({
                            'english': result['english'],
                            'russian': result['russian']
                        })
            except Exception as e:
                logger.error(f'Error improving translations: {e}')

        return jsonify({
            'english': [p['english'] for p in pairs],
            'russian': [p['russian'] for p in pairs]
        })

    except Exception as e:
        logger.error(f'Error getting matching pairs: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/progress', methods=['POST'])
def update_progress():
    """Update study progress for a term"""
    data = request.json
    term_id = data.get('term_id')
    progress = data.get('progress')

    session = Session()
    try:
        term = session.query(Term).get(term_id)
        if not term:
            return jsonify({'error': 'Term not found'}), 404

        term.study_progress = progress
        term.last_reviewed = datetime.utcnow()
        term.review_count += 1

        # Add study session
        study_session = StudySession(
            term_id=term_id,
            success_rate=progress,
            time_spent=data.get('time_spent', 0),
            session_type=data.get('session_type', 'review'),
            session_metadata=data.get('metadata', {})
        )
        session.add(study_session)
        session.commit()

        return jsonify({'status': 'success', 'progress': progress})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/statistics', methods=['GET'])
def get_statistics():
    """Get learning statistics"""
    try:
        session = Session()
        # Получаем общую статистику
        total_terms = session.query(Term).count()
        favorites = session.query(Term).filter(Term.is_favorite == True).count()
        completed = session.query(Term).filter(Term.study_progress == 100).count()
        in_progress = session.query(Term).filter(
            Term.study_progress > 0,
            Term.study_progress < 100
        ).count()

        # Получаем прогресс по категориям
        category_progress = []
        categories = session.query(Term.category).distinct().all()
        for (category,) in categories:
            terms = session.query(Term).filter(Term.category == category).all()
            if terms:
                avg_progress = sum(term.study_progress or 0 for term in terms) / len(terms)
                category_progress.append({
                    'category': category,
                    'progress': float(avg_progress),
                    'count': len(terms)
                })

        # Получаем недавнюю активность
        recent_sessions = session.query(StudySession)\
            .order_by(StudySession.created_at.desc())\
            .limit(10)\
            .all()

        recent_activity = [
            {
                'date': session.created_at.isoformat(),
                'success_rate': session.success_rate,
                'type': session.session_type
            } for session in recent_sessions
        ]

        return jsonify({
            'overview': {
                'total_terms': total_terms,
                'favorites': favorites,
                'completed': completed,
                'in_progress': in_progress
            },
            'category_progress': category_progress,
            'recent_activity': recent_activity,
            'learning_curve': [] # Добавьте реальные данные если необходимо
        })
    except Exception as e:
        logger.error(f'Error getting statistics: {e}')
        return jsonify({
            'overview': {
                'total_terms': 0,
                'favorites': 0,
                'completed': 0,
                'in_progress': 0
            },
            'category_progress': [],
            'recent_activity': [],
            'learning_curve': []
        }), 200  # Возвращаем пустые данные вместо 500 ошибки
    finally:
        session.close()

@app.route('/api/categories/tree', methods=['GET'])
def get_category_tree():
    """Get category tree structure"""
    session = Session()
    try:
        def build_tree(parent_id=None):
            categories = session.query(Category)\
                .filter(Category.parent_id == parent_id)\
                .order_by(Category.order)\
                .all()

            return [
                {
                    'id': cat.id,
                    'name': cat.name,
                    'level': cat.level,
                    'metadata': cat.category_metadata,  # Обновлено здесь
                    'children': build_tree(cat.id)
                }
                for cat in categories
            ]

        tree = build_tree()
        return jsonify({'categories': tree})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    """Toggle favorite status for a term"""
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        logger.error("No term_id provided in request")
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            logger.error(f"Term not found with id: {term_id}")
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение is_favorite
        term.is_favorite = not term.is_favorite
        logger.info(f"Setting is_favorite to {term.is_favorite} for term {term_id}")

        # Сохраняем изменения
        session.commit()

        # Возвращаем обновленный статус
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.id
        })
    except Exception as e:
        session.rollback()
        logger.error(f'Error toggling favorite: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

# Перед app.run()
if __name__ == '__main__':
    # Инициализируем базу данных
    init_db()
    app.run(debug=True)
```

database
```py eng4IT/backend/app/database/__init__.py
```

```py eng4IT/backend/app/database/db.py
# backend/app/database/db.py

import datetime
import os
from contextlib import contextmanager

from models.base import (  # Добавьте импорт моделей
    Base,
    LearningHistory,
    Term,
    UnknownTerm,
)
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import sessionmaker

# Удалите эту строку, так как Base уже импортирован из models.base
# Base = declarative_base()


class Scenario(Base):
    __tablename__ = 'scenarios'

    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    terms = Column(JSON, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class AssessmentWord(Base):
    __tablename__ = 'assessment_words'

    id = Column(Integer, primary_key=True)
    word = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class ModelConfig(Base):
    __tablename__ = 'model_config'

    id = Column(Integer, primary_key=True)
    current_model = Column(String, nullable=False, default='gemini')
    sub_model = Column(String, nullable=False, default='gemini-1.5-flash')
    has_api_key = Column(Boolean, default=False)  # Just track if key exists
    updated_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    def to_dict(self):
        return {
            'current_model': self.current_model,
            'sub_model': self.sub_model,
            'has_api_key': bool(os.getenv('GEMINI_API_KEY')),
        }


@contextmanager
def get_session():
    session = Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """Initialize database and create all tables"""
    # Создаем директорию для базы данных, если её нет
    db_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    db_path = os.path.join(db_dir, 'scenarios.db')

    # Устанавливаем права доступа
    if os.path.exists(db_path):
        os.chmod(db_path, 0o666)

    engine = create_engine(f'sqlite:///{db_path}')

    # Создаем все таблицы
    Base.metadata.create_all(engine)

    # Создаем таблицы для моделей из models.base
    Term.__table__.create(engine, checkfirst=True)
    UnknownTerm.__table__.create(engine, checkfirst=True)
    LearningHistory.__table__.create(engine, checkfirst=True)

    return engine


# Инициализируем базу данных
engine = init_db()
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
```


models
```py eng4IT/backend/app/models/__init__.py
```

```py eng4IT/backend/app/models/base.py
# backend/app/models/base.py
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,  # Добавьте этот импорт
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref

Base = declarative_base()


class TimestampMixin:
    """Миксин для добавления полей времени создания и обновления"""

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )


class Term(Base, TimestampMixin):
    __tablename__ = 'terms'

    id = Column(Integer, primary_key=True)
    term = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)
    translation = Column(String)
    description = Column(String)
    examples = Column(JSON)
    related_terms = Column(JSON)
    term_metadata = Column(JSON)
    is_favorite = Column(Boolean, default=False)  # Убедитесь, что это поле определено только один раз
    pronunciation_url = Column(String)
    study_progress = Column(Integer, default=0)
    last_reviewed = Column(DateTime)
    review_count = Column(Integer, default=0)

class StudySession(Base, TimestampMixin):
    """Модель для отслеживания сессий изучения"""
    __tablename__ = 'study_sessions'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    success_rate = Column(Integer)  # 0-100%
    time_spent = Column(Integer)  # в секундах
    session_type = Column(String)  # 'review', 'test', 'practice'
    session_metadata = Column(JSON)


class KnownTerm(Base, TimestampMixin):
    """Модель для известных терминов"""

    __tablename__ = 'known_terms'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    learned_at = Column(DateTime, default=datetime.now)
    confidence_level = Column(Integer, default=0)  # Уровень уверенности в знании
    term_info = relationship('Term')


class UnknownTerm(Base, TimestampMixin):
    """Модель для неизвестных терминов"""

    __tablename__ = 'unknown_terms'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    attempts = Column(Integer, default=0)  # Количество попыток изучения
    last_attempt = Column(DateTime)
    term_info = relationship('Term')



class LearningHistory(Base, TimestampMixin):
    """История изучения терминов"""

    __tablename__ = 'learning_history'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    action = Column(String)  # 'learn', 'review', 'forget'
    history_metadata = Column(JSON)  # Переименовано с metadata на history_metadata


class Category(Base):
    """Расширенная модель категорий"""
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey('categories.id'))
    level = Column(Integer, default=0)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    category_metadata = Column(JSON)

    # Отношения для древовидной структуры
    children = relationship("Category",
        backref=backref('parent', remote_side=[id]),
        cascade="all, delete-orphan")

    # Добавляем связь с подкатегориями
    subcategories = relationship("Subcategory", back_populates="category")

class Subcategory(Base):
    __tablename__ = 'subcategories'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    created_at = Column(DateTime, default=datetime.now)
    category = relationship('Category', back_populates='subcategories')
```


scripts
```py eng4IT/backend/app/scripts/migrate_to_db.py
# backend/app/scripts/migrate_to_db.py

import json
import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging

from database.db import AssessmentWord, Base, ModelConfig, Scenario
from models.base import LearningHistory, Term, UnknownTerm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseMigrator:
    def __init__(self, db_path: str, data_dir: str):
        """
        Инициализация мигратора базы данных
        :param db_path: путь к файлу БД SQLite
        :param data_dir: директория с JSON файлами
        """
        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)  # Создаем все таблицы
        self.Session = sessionmaker(bind=self.engine)
        self.data_dir = data_dir

    def _load_json(self, filename: str) -> dict:
        """Загрузка данных из JSON файла"""
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            logger.warning(f'File not found: {file_path}')
            return {}
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _parse_datetime(self, datetime_str: str) -> datetime:
        """Преобразование строки даты/времени в объект datetime"""
        try:
            return datetime.fromisoformat(datetime_str)
        except ValueError:
            return datetime.now()

    def migrate_scenarios(self):
        """Миграция сценариев из JSON в БД"""
        session = self.Session()
        try:
            data = self._load_json('scenarios/scenarios.json')
            scenarios = data.get('scenarios', [])

            for scenario_data in scenarios:
                scenario = Scenario(
                    text=scenario_data['text'],
                    terms=scenario_data['terms'],
                    created_at=self._parse_datetime(scenario_data['created_at']),
                )
                session.add(scenario)

            session.commit()
            logger.info(f'Migrated {len(scenarios)} scenarios to database')
        except Exception as e:
            logger.error(f'Error migrating scenarios: {e}')
            session.rollback()
        finally:
            session.close()

    def migrate_terms(self):
        """Миграция терминов из JSON в БД"""
        session = self.Session()
        try:
            # Миграция всех терминов
            data = self._load_json('terms/all_terms.json')
            terms = data.get('terms', [])

            for term_data in terms:
                assessment_word = AssessmentWord(
                    word=term_data['word'],
                    category=term_data['category'],
                    created_at=self._parse_datetime(term_data.get('created_at')),
                )
                session.add(assessment_word)

            # Миграция неизвестных терминов
            unknown_data = self._load_json('terms/unknown_terms.json')
            unknown_terms = unknown_data.get('unknown_terms', [])

            for unknown_term_data in unknown_terms:
                term = Term(
                    term=unknown_term_data['term'],
                    translation=unknown_term_data['translation'],
                    category=unknown_term_data.get('category', 'Unknown'),
                    term_metadata={
                        'source': 'migration',
                        'added_at': unknown_term_data.get(
                            'added_at', datetime.now().isoformat()
                        ),
                    },
                )
                session.add(term)
                session.flush()  # Получаем ID термина

                unknown_term = UnknownTerm(
                    term_id=term.id,
                    attempts=unknown_term_data.get('attempts', 0),
                    last_attempt=self._parse_datetime(
                        unknown_term_data.get(
                            'last_attempt', datetime.now().isoformat()
                        )
                    ),
                )
                session.add(unknown_term)

                # Добавляем запись в историю изучения
                history = LearningHistory(
                    term_id=term.id,
                    action='migration',
                    history_metadata={
                        'migration_date': datetime.now().isoformat(),
                        'original_added_at': unknown_term_data.get('added_at'),
                    },
                )
                session.add(history)

            session.commit()
            logger.info(
                f'Migrated {len(terms)} assessment words and {len(unknown_terms)} unknown terms to database'
            )
        except Exception as e:
            logger.error(f'Error migrating terms: {e}')
            session.rollback()
        finally:
            session.close()

    def migrate_model_config(self):
        """Миграция конфигурации модели из JSON в БД"""
        session = self.Session()
        try:
            data = self._load_json('models/config.json')
            config_data = data.get('model_config')

            if config_data:
                config = ModelConfig(
                    current_model=config_data['current_model'],
                    sub_model=config_data['sub_model'],
                    gemini_api_key=config_data.get('gemini_api_key'),
                    updated_at=self._parse_datetime(config_data['updated_at']),
                )
                session.add(config)
                session.commit()
                logger.info('Migrated model configuration to database')
        except Exception as e:
            logger.error(f'Error migrating model config: {e}')
            session.rollback()
        finally:
            session.close()

    def migrate_all(self):
        """Миграция всех данных из JSON в БД"""
        logger.info('Starting database migration...')
        self.migrate_scenarios()
        self.migrate_terms()
        self.migrate_model_config()
        logger.info('Database migration completed!')


def main():
    # Пути к файлам
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(current_dir, 'database', 'scenarios.db')
    data_dir = os.path.join(os.path.dirname(current_dir), 'data')

    # Создаем и запускаем мигратор
    migrator = DatabaseMigrator(db_path, data_dir)
    migrator.migrate_all()


if __name__ == '__main__':
    main()
```

```py eng4IT/backend/app/scripts/migrate_to_json.py
# backend/app/scripts/migrate_to_json.py

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from datetime import datetime

from database.db import AssessmentWord, ModelConfig, Scenario
from models.base import Category, Term, UnknownTerm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class DataMigrator:
    def __init__(self, db_path: str, data_dir: str):
        """
        Инициализация мигратора
        :param db_path: путь к файлу БД SQLite
        :param data_dir: директория для JSON файлов
        """
        self.engine = create_engine(f'sqlite:///{db_path}')
        self.Session = sessionmaker(bind=self.engine)
        self.data_dir = data_dir
        self._ensure_directories()

    def _ensure_directories(self):
        """Создание необходимых директорий"""
        directories = ['scenarios', 'terms', 'models', 'categories']
        for dir_name in directories:
            dir_path = os.path.join(self.data_dir, dir_name)
            os.makedirs(dir_path, exist_ok=True)

    def _save_json(self, data: dict, filename: str):
        """Сохранение данных в JSON файл"""
        file_path = os.path.join(self.data_dir, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(
                data,
                f,
                ensure_ascii=False,
                indent=2,
                default=self._datetime_handler,
            )

    def _datetime_handler(self, obj):
        """Обработчик для сериализации datetime"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f'Object of type {type(obj)} is not JSON serializable')

    def migrate_scenarios(self):
        """Миграция сценариев"""
        session = self.Session()
        try:
            scenarios = session.query(Scenario).all()
            scenarios_data = []

            for scenario in scenarios:
                scenario_dict = {
                    'id': scenario.id,
                    'text': scenario.text,
                    'terms': scenario.terms,
                    'created_at': scenario.created_at,
                }
                scenarios_data.append(scenario_dict)

            self._save_json(
                {'scenarios': scenarios_data}, 'scenarios/scenarios.json'
            )
            print(f'Migrated {len(scenarios_data)} scenarios')

        finally:
            session.close()

    def migrate_terms(self):
        """Миграция терминов и категорий"""
        session = self.Session()
        try:
            # Миграция обычных терминов
            terms = session.query(Term).all()
            terms_data = []

            for term in terms:
                term_dict = {
                    'id': term.id,
                    'term': term.term,
                    'translation': term.translation,
                    'category': term.category,
                    'term_metadata': term.term_metadata,
                    'created_at': term.created_at,
                    'updated_at': term.updated_at,
                }
                terms_data.append(term_dict)

            self._save_json({'terms': terms_data}, 'terms/all_terms.json')
            print(f'Migrated {len(terms_data)} terms')

            # Миграция неизвестных терминов
            unknown_terms = session.query(UnknownTerm).all()
            unknown_terms_data = []

            for term in unknown_terms:
                term_dict = {
                    'id': term.id,
                    'term_id': term.term_id,
                    'attempts': term.attempts,
                    'last_attempt': term.last_attempt,
                    'created_at': term.created_at,
                }
                unknown_terms_data.append(term_dict)

            self._save_json(
                {'unknown_terms': unknown_terms_data}, 'terms/unknown_terms.json'
            )
            print(f'Migrated {len(unknown_terms_data)} unknown terms')

            # Миграция категорий
            categories = session.query(Category).all()
            categories_data = {}

            for category in categories:
                categories_data[category.name] = {
                    'id': category.id,
                    'created_at': category.created_at,
                    'subcategories': [
                        {
                            'id': sub.id,
                            'name': sub.name,
                            'created_at': sub.created_at,
                        }
                        for sub in category.subcategories
                    ],
                }

            self._save_json(categories_data, 'categories/categories.json')
            print(f'Migrated {len(categories_data)} categories')

            # Миграция слов для оценки
            assessment_words = session.query(AssessmentWord).all()
            assessment_data = []

            for word in assessment_words:
                word_dict = {
                    'id': word.id,
                    'word': word.word,
                    'category': word.category,
                    'created_at': word.created_at,
                }
                assessment_data.append(word_dict)

            self._save_json(
                {'assessment_words': assessment_data},
                'terms/assessment_words.json',
            )
            print(f'Migrated {len(assessment_data)} assessment words')

        finally:
            session.close()

    def migrate_model_config(self):
        """Миграция настроек моделей"""
        session = self.Session()
        try:
            config = session.query(ModelConfig).first()
            if config:
                config_data = {
                    'current_model': config.current_model,
                    'sub_model': config.sub_model,
                    'gemini_api_key': config.gemini_api_key,
                    'updated_at': config.updated_at,
                }
                self._save_json(
                    {'model_config': config_data}, 'models/config.json'
                )
                print('Migrated model configuration')

        finally:
            session.close()

    def migrate_all(self):
        """Миграция всех данных"""
        print('Starting data migration...')
        self.migrate_scenarios()
        self.migrate_terms()
        self.migrate_model_config()
        print('Data migration completed!')


def main():
    # Пути к файлам
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(current_dir, 'database', 'scenarios.db')
    data_dir = os.path.join(os.path.dirname(current_dir), 'data')

    # Создаем и запускаем мигратор
    migrator = DataMigrator(db_path, data_dir)
    migrator.migrate_all()


if __name__ == '__main__':
    main()
```

```py eng4IT/backend/app/scripts/test_gemini.py
import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')
promtp = 'Hellow, how are u?'
response = model.generate_content(promtp)
print(response.text)
```


services
```py eng4IT/backend/app/services/__init__.py
```

```py eng4IT/backend/app/services/constants.py
GENERATION_CONFIG = {
    'temperature': 0.7,
    'top_p': 0.8,
    'top_k': 40,
    'max_output_tokens': 200,
}
```

```py eng4IT/backend/app/services/data_service.py
import json
import os
from typing import Dict

from models.base import KnownTerm, LearningHistory, Term, UnknownTerm
from sqlalchemy.orm import Session


class DataService:
    """Сервис для работы с данными и синхронизации между БД и JSON"""

    def __init__(self, db_session: Session, data_dir: str):
        self.db = db_session
        self.data_dir = data_dir
        self._ensure_data_dirs()

    def _ensure_data_dirs(self):
        """Создаёт необходимые директории для данных"""
        dirs = ['terms', 'scenarios', 'models']
        for dir_name in dirs:
            dir_path = os.path.join(self.data_dir, dir_name)
            os.makedirs(dir_path, exist_ok=True)

    def _save_to_json(self, data: dict, filename: str):
        """Сохраняет данные в JSON файл"""
        file_path = os.path.join(self.data_dir, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _load_from_json(self, filename: str) -> dict:
        """Загружает данные из JSON файла"""
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            return {}
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def sync_terms(self):
        """Синхронизирует термины между БД и JSON"""
        # Получаем все термины из БД
        all_terms = self.db.query(Term).all()
        known_terms = self.db.query(KnownTerm).all()
        unknown_terms = self.db.query(UnknownTerm).all()

        # Формируем структуры данных для JSON
        terms_data = {
            'all_terms': [self._term_to_dict(term) for term in all_terms],
            'known_terms': [
                self._known_term_to_dict(term) for term in known_terms
            ],
            'unknown_terms': [
                self._unknown_term_to_dict(term) for term in unknown_terms
            ],
        }

        # Сохраняем в JSON
        self._save_to_json(terms_data['all_terms'], 'terms/all_terms.json')
        self._save_to_json(terms_data['known_terms'], 'terms/known_terms.json')
        self._save_to_json(terms_data['unknown_terms'], 'terms/unknown_terms.json')

    def add_term(self, term_data: Dict) -> Term:
        """Добавляет новый термин"""
        term = Term(**term_data)
        self.db.add(term)
        self.db.commit()
        self.sync_terms()
        return term

    def mark_term_as_known(self, term_id: int, confidence_level: int = 1):
        """Отмечает термин как изученный"""
        known_term = KnownTerm(term_id=term_id, confidence_level=confidence_level)
        self.db.add(known_term)

        # Добавляем запись в историю
        history = LearningHistory(
            term_id=term_id,
            action='learn',
            metadata={'confidence_level': confidence_level},
        )
        self.db.add(history)

        self.db.commit()
        self.sync_terms()

    def mark_term_as_unknown(self, term_id: int):
        """Отмечает термин как неизвестный"""
        unknown_term = UnknownTerm(term_id=term_id)
        self.db.add(unknown_term)

        history = LearningHistory(term_id=term_id, action='forget', metadata={})
        self.db.add(history)

        self.db.commit()
        self.sync_terms()

    @staticmethod
    def _term_to_dict(term: Term) -> Dict:
        """Конвертирует Term в словарь"""
        return {
            'id': term.id,
            'term': term.term,
            'category': term.category,
            'translation': term.translation,
            'description': term.description,
            'examples': term.examples,
            'related_terms': term.related_terms,
            'metadata': term.metadata,
            'created_at': term.created_at.isoformat(),
            'updated_at': term.updated_at.isoformat(),
        }

    @staticmethod
    def _known_term_to_dict(known_term: KnownTerm) -> Dict:
        """Конвертирует KnownTerm в словарь"""
        return {
            'id': known_term.id,
            'term_id': known_term.term_id,
            'learned_at': known_term.learned_at.isoformat(),
            'confidence_level': known_term.confidence_level,
            'term_info': DataService._term_to_dict(known_term.term_info),
        }

    @staticmethod
    def _unknown_term_to_dict(unknown_term: UnknownTerm) -> Dict:
        """Конвертирует UnknownTerm в словарь"""
        return {
            'id': unknown_term.id,
            'term_id': unknown_term.term_id,
            'attempts': unknown_term.attempts,
            'last_attempt': unknown_term.last_attempt.isoformat()
            if unknown_term.last_attempt
            else None,
            'term_info': DataService._term_to_dict(unknown_term.term_info),
        }
```

```py eng4IT/backend/app/services/gemini_service.py
# backend/app/services/gemini_service.py

# Standard library imports
import json
import logging
from typing import Dict, List

# Third-party imports
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


class GeminiService:
    def __init__(self, api_key: str):
        """Инициализация Gemini сервиса."""
        if not api_key:
            raise ValueError('API key is required')

        self.api_key = api_key
        genai.configure(api_key=api_key)
        # Используем только gemini-1.5-flash
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info('GeminiService initialized')

    def generate_evaluation_text(
        self, words: List[str], categories: Dict[str, str], **kwargs
    ) -> Dict:
        """Генерация текста с использованием Gemini."""
        prompt = (
            "Generate a short technical scenario (90-150 words) that naturally "
            f"incorporates these technical terms: {', '.join(words)}.\n"
            "The scenario should be challenging but realistic, suitable for evaluating "
            "technical knowledge. Focus on practical application in a work situation."
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 200,
                },
            )

            if response and response.text:
                return {'text': response.text.strip(), 'categories': categories}
            raise Exception('Empty response from Gemini')

        except Exception as e:
            logger.error(f'Error generating evaluation text with Gemini: {e}')
            return {
                'text': f"Unable to generate scenario. Selected terms: {', '.join(words)}.",
                'categories': categories,
            }

    def explain_term(self, term: str, category: str = None) -> str:
        """Объяснение термина."""
        prompt = f"""
        Explain the technical term '{term}' in simple terms.
        {f"This term belongs to the category: {category}" if category else ""}

        Provide a clear and concise explanation that would help a developer understand:
        1. What it is
        2. When it's used
        3. Why it's important

        Keep the explanation under 100 words and focus on practical understanding.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 200,
                },
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            return response.text.strip()

        except Exception as e:
            logger.error(f'Error explaining term with Gemini: {e}')
            return f'Failed to explain term: {str(e)}'

    def translate_text(self, prompt: str) -> str:
        """Перевод текста."""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 400,
                },
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            return response.text.strip()

        except Exception as e:
            logger.error(f'Error translating with Gemini: {e}')
            raise

    def categorize_words(self, prompt: str) -> str:
        """Categorize words using Gemini."""
        try:
            response = self.get_model(
                'gemini-1.5-pro'
            ).generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,  # Используем низкую температуру для более точной категоризации
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 1000,
                },
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            return response.text.strip()

        except Exception as e:
            logger.error(f'Error categorizing words with Gemini: {e}')
            raise

    def generate_dialogue(self, terms):
        try:
            terms_list = [t.term for t in terms]
            prompt = f"""
            Create a technical chat dialogue between colleagues using these terms: {', '.join(terms_list)}

            VERY IMPORTANT:
            1. Preserve spaces in compound terms (e.g., "lazy loading" should remain "lazy loading", not "lazyloading")
            2. When providing words array, keep compound terms as separate elements (e.g., ["lazy", "loading"] not ["lazyloading"])
            3. The correctAnswer must exactly match the message text
            4. All compound terms must keep their spaces in all places they appear

            Format example:
            {{
                "steps": [
                    {{
                        "messages": [
                            {{
                                "isUser": false,
                                "text": "Have you implemented lazy loading for the images?",
                                "translation": "Вы реализовали ленивую загрузку для изображений?"
                            }},
                            {{
                                "isUser": true,
                                "text": "Yes, I've implemented lazy loading now.",
                                "translation": "Да, я реализовал ленивую загрузку."
                            }}
                        ],
                        "words": ["lazy", "loading", "implemented", "now"],
                        "correctAnswer": "Yes, I've implemented lazy loading now."
                    }}
                ]
            }}

            Requirements:
            - Keep all spaces in compound terms
            - Split compound terms into separate words in the words array
            - Ensure exact match between correctAnswer and message text
            - Professional or Semi-Proffesional context
            - 2-3 dialogue steps, short messages about 1 sentence
            """

            # Установим более низкую температуру для более предсказуемых результатов
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,  # Снижаем температуру
                    'top_p': 0.95,
                    'top_k': 40,
                    'max_output_tokens': 1000,
                }
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            # Очищаем и подготавливаем текст для парсинга JSON
            text = response.text.strip()
            # Находим первую открывающую и последнюю закрывающую скобки
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = text[start:end]
            else:
                raise ValueError('No valid JSON structure found in response')

            try:
                data = json.loads(json_str)
            except json.JSONDecodeError as e:
                logger.error(f'JSON decode error: {e}\nResponse text: {text}')
                raise

            # Валидация и очистка данных
            if not isinstance(data, dict) or 'steps' not in data:
                raise ValueError('Invalid JSON structure: missing steps')

            # Очищаем и валидируем каждый шаг
            cleaned_steps = []
            for step in data['steps']:
                if not isinstance(step, dict):
                    continue

                # Проверяем обязательные поля
                if not all(key in step for key in ['messages', 'words', 'correctAnswer']):
                    continue

                # Очищаем слова
                clean_words = [w for w in step['words'] if w and isinstance(w, str) and w.strip()]

                # Очищаем сообщения
                clean_messages = []
                for msg in step['messages']:
                    if isinstance(msg, dict) and all(key in msg for key in ['isUser', 'text', 'translation']):
                        clean_messages.append({
                            'isUser': bool(msg['isUser']),
                            'text': msg['text'].strip(),
                            'translation': msg['translation'].strip()
                        })

                if clean_messages and clean_words:
                    cleaned_step = {
                        'messages': clean_messages,
                        'words': clean_words,
                        'correctAnswer': step['correctAnswer'].strip()
                    }
                    cleaned_steps.append(cleaned_step)

            if not cleaned_steps:
                raise ValueError('No valid steps after cleaning')

            return {'steps': cleaned_steps}

        except Exception as e:
            logger.error(f'Error in generate_dialogue: {e}')
            # В случае ошибки возвращаем базовый диалог
            return self._fallback_dialogue()

    def _fallback_dialogue(self):
        """Возвращает базовый диалог в случае ошибки."""
        return {
            'steps': [
                {
                    'messages': [
                        {
                            'isUser': False,
                            'text': 'Could not generate dialogue',
                            'translation': 'Не удалось сгенерировать диалог',
                        },
                        {
                            'isUser': True,
                            'text': 'Please try again later',
                            'translation': 'Пожалуйста, попробуйте позже',
                        },
                    ],
                    'words': ['error', 'try', 'later'],
                    'correctAnswer': 'Please try again later',
                }
            ]
        }

    def get_model(self, model_name='gemini-1.5-pro'):
        """Get specific Gemini model"""
        try:
            return genai.GenerativeModel(model_name)
        except Exception as e:
            logger.error(f'Error getting model {model_name}: {e}')
            return self.model


    def improve_translations(self, pairs_data, pairs_count = 15):
        """
        Улучшает переводы пар слов с помощью Gemini.

        Args:
            pairs_data: словарь с парами для перевода
        Returns:
            dict: улучшенные пары переводов
        """
        try:
            # Формируем текст пар для промпта
            pairs_text = "\n".join([f"{p['english']} - {p['russian']}" for p in pairs_data['pairs']])

            prompt = f"""
            Improve these English-Russian translation pairs and return in JSON format.
            Make translations more natural and technically accurate.
            Original pairs:
            {pairs_text}

            Requirements:
            1. Keep technical terms precise
            2. Make Russian translations natural and professional
            3. Return exactly {pairs_count} pairs
            4. Format response strictly as JSON:
            {{
                "english": ["word1", "word2", "word3", "word4", "word5"],
                "russian": ["перевод1", "перевод2", "перевод3", "перевод4", "перевод5"]
            }}
            """

            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 1000,
                }
            )

            # Извлекаем JSON из ответа
            text = response.text.strip()
            # Находим начало и конец JSON
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = text[start:end]
                result = json.loads(json_str)

                # Проверяем структуру ответа
                if isinstance(result, dict) and 'english' in result and 'russian' in result:
                    return {
                        'english': result['english'],
                        'russian': result['russian']
                    }

            raise ValueError('Invalid response format')

        except Exception as e:
            logger.error(f'Error in improve_translations: {e}')
            # Возвращаем исходные пары в правильном формате
            original_pairs = pairs_data['pairs']
            return {
                'english': [p['english'] for p in original_pairs],
                'russian': [p['russian'] for p in original_pairs]
            }
```

```py eng4IT/backend/app/services/ollama_service.py
import json
import logging
import os
import random
from typing import Dict, List, Tuple

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Проверяем доступность langchain
try:
    from langchain.prompts import PromptTemplate
    from langchain_community.llms import Ollama

    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    logger.warning('Langchain not available, using basic template formatting')


class KnowledgeEvaluator:
    def __init__(self, words_file: str, base_url: str = 'http://localhost:11434'):
        """Инициализация оценщика знаний."""
        self.words_file = words_file
        # Добавляем значения по умолчанию для categories
        self.categories = {
            'Programming Basics': {
                'Algorithms': [],
                'Data Structures': [],
                'General': [],
            },
            'Web Development': {'Frontend': [], 'Backend': [], 'APIs': []},
        }

        # Пытаемся загрузить слова из файла
        try:
            loaded_categories = self._load_words_from_file(words_file)
            if loaded_categories:
                self.categories = loaded_categories
        except Exception as e:
            logger.warning(
                f'Could not load words from file: {e}. Using default categories.'
            )

        self.base_url = base_url
        self.llm = None

        # Пытаемся инициализировать Ollama
        if LANGCHAIN_AVAILABLE:
            try:
                self.llm = Ollama(model='llama2', base_url=base_url)
                self.llm.invoke('test')
            except Exception as e:
                logger.warning(f'Could not initialize Ollama: {e}')
                self.llm = None

    def _load_words_from_file(
        self, filepath: str
    ) -> Dict[str, Dict[str, List[str]]]:
        """Загружает слова из markdown файла."""
        categories = {}
        current_category = None
        current_subcategory = None

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('# '):
                        current_category = line[2:].strip()
                        categories[current_category] = {}
                    elif line.startswith('## '):
                        current_subcategory = line[3:].strip()
                        if current_category:
                            categories[current_category][current_subcategory] = []
                    elif line.startswith('- '):
                        word = line[2:].strip()
                        if current_category and current_subcategory:
                            categories[current_category][
                                current_subcategory
                            ].append(word)
        except Exception as e:
            logger.error(f'Error loading words file: {e}')
            return {}

        return categories

    def _select_random_words(
        self, num_words: int = 5
    ) -> Tuple[List[str], Dict[str, str]]:
        """Выбирает случайные слова из категорий."""
        all_words = []
        word_categories = {}

        # Добавляем базовые слова если нет других
        if not any(
            words
            for subcat in self.categories.values()
            for words in subcat.values()
        ):
            base_words = ['algorithm', 'database', 'API', 'framework', 'function']
            for word in base_words:
                all_words.append(word)
                word_categories[word] = 'Programming -> General'
        else:
            for category, subcategories in self.categories.items():
                for subcategory, words in subcategories.items():
                    for word in words:
                        all_words.append(word)
                        word_categories[word] = f'{category} -> {subcategory}'

        # Выбираем случайные слова
        if all_words:
            selected_words = random.sample(
                all_words, min(num_words, len(all_words))
            )
        else:
            selected_words = [
                'algorithm',
                'database',
                'API',
                'framework',
                'function',
            ][:num_words]

        selected_categories = {
            word: word_categories.get(word, 'Programming -> General')
            for word in selected_words
        }

        return selected_words, selected_categories

    def _format_prompt(self, words: List[str]) -> str:
        """Форматирует промпт для генерации текста."""
        template = (
            'Generate a short technical scenario (90-150 words) that naturally '
            'incorporates these technical terms: {words}.\n'
            'The scenario should be challenging but realistic, suitable for evaluating '
            'technical knowledge. Focus on practical application in a work situation.'
        )

        if LANGCHAIN_AVAILABLE:
            prompt = PromptTemplate(template=template, input_variables=['words'])
            return prompt.format(words=', '.join(words))
        else:
            return template.format(words=', '.join(words))

    def generate_evaluation_text(
        self, words: List[str], categories: Dict[str, str]
    ) -> Dict:
        """Генерация текста для оценки."""
        try:
            if self.llm:
                # Используем Ollama через langchain если доступно
                prompt = self._format_prompt(words)
                response = self.llm.invoke(prompt)
                text = (
                    response.content
                    if hasattr(response, 'content')
                    else str(response)
                )
            else:
                # Используем прямой запрос к API Ollama если langchain недоступен
                try:
                    response = requests.post(
                        f'{self.base_url}/api/generate',
                        json={
                            'model': 'llama3:instruct',
                            'prompt': self._format_prompt(words),
                        },
                    )
                    if response.status_code == 200:
                        text = response.json().get('response', '')
                    else:
                        raise Exception(
                            f'Ollama API error: {response.status_code}'
                        )
                except Exception as e:
                    logger.error(f'Error using Ollama API directly: {e}')
                    # Возвращаем базовый текст если все методы недоступны
                    text = (
                        f"This is a placeholder text for evaluation. "
                        f"The following terms need to be learned: {', '.join(words)}. "
                        "Please use Gemini model for actual text generation."
                    )

            # Очищаем текст от маркеров
            text = text.replace('```', '').strip()
            text = text.replace('scenario', '').strip()
            text = text.replace('Scenario:', '').strip()
            text = text.replace('Scenario', '').strip()

            return {'text': text, 'categories': categories}
        except Exception as e:
            logger.error(f'Error generating evaluation text: {e}')
            return {
                'text': 'Failed to generate scenario',
                'categories': categories,
            }

    def categorize_words(self, prompt: str) -> str:
        """Categorize words using Ollama."""
        try:
            if self.llm is None:
                try:
                    self.llm = Ollama(model='llama3.2', base_url=self.base_url)
                except Exception as e:
                    logger.error(f'Failed to initialize Ollama: {e}')
                    return self._fallback_categorization(prompt)

            # Добавляем инструкции для более точного форматирования
            enhanced_prompt = f"""{prompt}

    Important: Format each response strictly as:
    word: Category -> Subcategory

    For example:
    database: Databases -> SQL
    api: Web Development -> REST
    algorithm: Programming -> Data Structures

    Use existing categories when possible, create new ones only when necessary.
    Always include both Category and Subcategory separated by ' -> '."""

            response = self.llm.invoke(enhanced_prompt)
            result = (
                response.content if hasattr(response, 'content') else str(response)
            )

            # Проверяем формат ответа
            lines = result.strip().split('\n')
            formatted_lines = []

            for line in lines:
                if ':' in line and '->' in line:
                    word, category = line.split(':', 1)
                    category = category.strip()
                    word = word.strip()

                    # Проверяем правильность формата категории
                    if ' -> ' in category:
                        formatted_lines.append(f'{word}: {category}')
                    else:
                        # Если формат неправильный, используем базовую категорию
                        formatted_lines.append(f'{word}: Programming -> General')

            if not formatted_lines:
                return self._fallback_categorization(prompt)

            return '\n'.join(formatted_lines)

        except Exception as e:
            logger.error(f'Error categorizing words with Ollama: {e}')
            return self._fallback_categorization(prompt)

    def _fallback_categorization(self, prompt: str) -> str:
        """Базовая категоризация, когда LLM недоступен."""
        # Извлекаем слова из промпта
        words = []
        for line in prompt.split('\n'):
            if 'Words to categorize:' in line:
                words = line.split(':')[1].strip().split(', ')
                break

        # Возвращаем базовую категоризацию
        return '\n'.join([f'{word}: Programming -> General' for word in words])

    def generate_dialogue(self, terms):
        """Генерация диалога через Ollama."""
        prompt = f"""
        Create a technical chat dialogue between colleagues using these terms: {', '.join([t.term for t in terms])}

        Requirements:
        - Format as JSON with steps array
        - Each step must have messages array and words array
        - Do not include spaces or empty strings as words
        - Ensure all words are meaningful and non-empty
        - Professional context
        - Include translations
        """

        try:
            response = self.llm.invoke(prompt)
            content = response.content if hasattr(response, 'content') else str(response)
            data = json.loads(content)

            # Очищаем слова в каждом шаге
            for step in data['steps']:
                step['words'] = [w for w in step['words'] if w and w.strip()]
                step['correctAnswer'] = step['correctAnswer'].strip()

            return data

        except Exception as e:
            logger.error(f'Error generating dialogue with Ollama: {e}')
            return self._fallback_dialogue()

    def _fallback_dialogue(self):
        return {
            'steps': [
                {
                    'messages': [
                        {
                            'isUser': False,
                            'text': 'Could not generate dialogue',
                            'translation': 'Не удалось сгенерировать диалог',
                        },
                        {
                            'isUser': True,
                            'text': 'Please try again later',
                            'translation': 'Пожалуйста, попробуйте позже',
                        },
                    ],
                    'words': ['try', 'again', 'later'],
                    'correctAnswer': 'Please try again later',
                }
            ]
        }
```

```py eng4IT/backend/app/services/translation_service.py
import logging
import os

import requests
from google.cloud import translate_v2 as translate

# Опциональные импорты для Helsinki-NLP
try:
    import torch
    from transformers import MarianMTModel, MarianTokenizer

    HELSINKI_NLP_AVAILABLE = True
except ImportError:
    HELSINKI_NLP_AVAILABLE = False

logger = logging.getLogger(__name__)


class TranslationService:
    def __init__(self):
        self.translation_methods = []

        # Инициализация Helsinki-NLP если доступен
        if HELSINKI_NLP_AVAILABLE:
            try:
                self.device = torch.device(
                    'cuda' if torch.cuda.is_available() else 'cpu'
                )
                self.default_model_name = 'Helsinki-NLP/opus-mt-en-ru'
                self.initialize_helsinki_model()
                self.translation_methods.append('helsinki')
                logger.info(f'Helsinki-NLP model initialized on {self.device}')
            except Exception as e:
                logger.warning(f'Could not initialize Helsinki-NLP: {e}')

        # Инициализация Google Cloud Translation
        try:
            self.client = translate.Client()
            self.translation_methods.append('google')
            logger.info('Google Cloud Translation initialized')
        except Exception as e:
            logger.warning(f'Could not initialize Google Cloud Translation: {e}')
            self.client = None

        # Всегда добавляем базовый метод как fallback
        self.translation_methods.append('basic')
        logger.info(
            f"Available translation methods: {', '.join(self.translation_methods)}"
        )

    def initialize_helsinki_model(self):
        """Инициализация модели Helsinki-NLP."""
        if not HELSINKI_NLP_AVAILABLE:
            return

        try:
            cache_dir = os.path.join(os.path.dirname(__file__), 'model_cache')
            os.makedirs(cache_dir, exist_ok=True)

            self.default_tokenizer = MarianTokenizer.from_pretrained(
                self.default_model_name, cache_dir=cache_dir
            )

            self.default_model = MarianMTModel.from_pretrained(
                self.default_model_name, cache_dir=cache_dir
            ).to(self.device)

        except Exception as e:
            logger.error(f'Error initializing Helsinki-NLP model: {e}')
            raise

    def translate(
        self, text: str, source_lang: str = 'en', target_lang: str = 'ru'
    ) -> str:
        """Перевести текст, используя доступные методы в порядке приоритета."""
        if not text.strip():
            return ''

        for method in self.translation_methods:
            try:
                if method == 'helsinki' and HELSINKI_NLP_AVAILABLE:
                    inputs = self.default_tokenizer(
                        text, return_tensors='pt', padding=True
                    ).to(self.device)

                    translated = self.default_model.generate(**inputs)
                    result = self.default_tokenizer.decode(
                        translated[0], skip_special_tokens=True
                    )
                    return result

                elif method == 'google' and self.client:
                    result = self.client.translate(
                        text,
                        target_language=target_lang,
                        source_language=source_lang,
                    )
                    return result['translatedText']

                elif method == 'basic':
                    return self._basic_translation(text, source_lang, target_lang)

            except Exception as e:
                logger.error(f'Error with {method} translation: {e}')
                continue

        return text  # Возвращаем оригинальный текст, если все методы не сработали

    def _basic_translation(
        self, text: str, source_lang: str, target_lang: str
    ) -> str:
        """Базовый метод перевода через публичное API."""
        try:
            url = 'https://api.mymemory.translated.net/get'
            params = {'q': text, 'langpair': f'{source_lang}|{target_lang}'}
            response = requests.get(url, params=params)
            data = response.json()

            if response.status_code == 200 and data['responseStatus'] == 200:
                return data['responseData']['translatedText']

            raise Exception('Translation API error')

        except Exception as e:
            logger.error(f'Basic translation error: {str(e)}')
            return text


# Создание глобального экземпляра сервиса
try:
    translator = TranslationService()
    logger.info('Translation service initialized successfully')
except Exception as e:
    logger.error(f'Failed to initialize translation service: {e}')
    raise
```


```py eng4IT/backend/app/test_gemini_service.py
# test_gemini_service.py
import json
import os
import unittest

from dotenv import load_dotenv
from services.gemini_service import GeminiService


class TestGeminiService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Инициализация сервиса перед всеми тестами."""
        load_dotenv()
        cls.api_key = os.getenv('GEMINI_API_KEY')
        if not cls.api_key:
            raise ValueError('GEMINI_API_KEY not found in environment variables')
        cls.service = GeminiService(cls.api_key)

    def test_initialization(self):
        """Тест инициализации сервиса."""
        # Проверка с правильным ключом
        service = GeminiService(self.api_key)
        self.assertIsNotNone(service.model)

        # Проверка с пустым ключом
        with self.assertRaises(ValueError):
            GeminiService('')

    def test_generate_evaluation_text(self):
        """Тест генерации текста."""
        words = ['API', 'database']
        categories = {'API': 'Web', 'database': 'DB'}

        result = self.service.generate_evaluation_text(words, categories)

        # Проверяем структуру ответа
        self.assertIsInstance(result, dict)
        self.assertIn('text', result)
        self.assertIn('categories', result)

        # Проверяем содержимое
        self.assertIsInstance(result['text'], str)
        self.assertTrue(len(result['text']) > 0)
        self.assertEqual(result['categories'], categories)

    def test_explain_term(self):
        """Тест объяснения термина."""
        # Тест без категории
        explanation = self.service.explain_term('API')
        self.assertIsInstance(explanation, str)
        self.assertTrue(len(explanation) > 0)

        # Тест с категорией
        explanation_with_category = self.service.explain_term(
            'API', 'Web Development'
        )
        self.assertIsInstance(explanation_with_category, str)
        self.assertTrue(len(explanation_with_category) > 0)

    def test_translate_text(self):
        """Тест перевода текста."""
        # Простой текст
        result = self.service.translate_text('Translate to Russian: Hello, world!')
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)

        # Технический текст
        tech_text = 'Translate to Russian: API (Application Programming Interface) is a set of rules.'
        tech_result = self.service.translate_text(tech_text)
        self.assertIsInstance(tech_result, str)
        self.assertTrue(len(tech_result) > 0)

    def test_categorize_words(self):
        """Тест категоризации слов."""
        prompt = """
        Given these categories:
        - Programming -> General
        - Web Development -> Frontend

        Please categorize: API, database
        """

        try:
            result = self.service.categorize_words(prompt)
            self.assertIsInstance(result, str)
            self.assertTrue(len(result) > 0)
            # Проверяем, что результат содержит ожидаемые слова
            self.assertTrue('API' in result)
            self.assertTrue('database' in result)
        except Exception as e:
            self.fail(f'categorize_words raised {type(e)} unexpectedly!')

    def test_generate_dialogue(self):
        """Тест генерации диалога."""

        # Создаем мок-объект для термина
        class MockTerm:
            def __init__(self, term):
                self.term = term

        terms = [MockTerm('API'), MockTerm('database')]

        try:
            result = self.service.generate_dialogue(terms)

            # Проверяем структуру JSON
            self.assertIsInstance(result, dict)
            self.assertIn('steps', result)
            self.assertIsInstance(result['steps'], list)

            if result['steps']:  # Если есть шаги
                step = result['steps'][0]
                self.assertIn('messages', step)
                self.assertIn('words', step)
                self.assertIn('correctAnswer', step)
        except json.JSONDecodeError:
            self.fail('generate_dialogue returned invalid JSON')
        except Exception as e:
            self.fail(f'generate_dialogue raised {type(e)} unexpectedly!')

    def test_error_handling(self):
        """Тест обработки ошибок."""
        # Тест с пустым списком слов
        result = self.service.generate_evaluation_text([], {})
        self.assertIn('text', result)
        self.assertIn('categories', result)

        # Тест с некорректным промптом
        with self.assertRaises(Exception):
            self.service.translate_text('')


if __name__ == '__main__':
    unittest.main(verbosity=2)
```




нужно починить функционал добавления незнакомого слова в Избранное, можешь задать мне конкретные вопросы чтобы понять

Давайте разберем проблему по шагам. Мне нужно понять следующее:

1. При добавлении слова в избранное, что происходит на фронтенде? Вы видите какую-то ошибку в консоли браузера?

2. Какие компоненты участвуют в этом процессе? По коду вижу, что это:
- WordList компонент
- Dashboard компонент
- API endpoint /api/terms/favorite на бэкенде

3. Правильно ли отрабатывает запрос к бэкенду? Приходит ли term_id корректно?

4. Когда пользователь нажимает на звездочку:
   - Отображается ли визуально изменение состояния?
   - Сохраняется ли это состояние после перезагрузки страницы?

5. В модели Term на бэкенде есть поле is_favorite. Корректно ли оно обновляется в базе данных?

Ответы на эти вопросы помогут мне точнее определить, где может быть проблема.

1) я открываю вкладку Незнакомые слова, нажимаю на звездочку на каком нибудь слове, она заполняется желтым, дальше я нажимаю в строке фильтров на кнопку Избранное, и слово не появляется в списке, в консоли ошибок нет, и если обновить страницу, то выделение звездочки пропадает
2) да, это верно
3) вот что я вижу в консоли в браузере Toggling favorite for term ID: 357 WordList.js:61
Toggling favorite for term: 357 Dashboard.js:160
Toggling favorite for term ID: 357 WordList.js:61
Toggling favorite for term: 357 Dashboard.js:160
Toggling favorite for term ID: 357 WordList.js:61
Toggling favorite for term: 357 Dashboard.js:160
4) - да
- нет
5) да

Спасибо за подробные ответы. Теперь я вижу несколько потенциальных проблем:

1. В компоненте Dashboard у вас есть функция `handleFavoriteToggle`:

```javascript
const handleFavoriteToggle = async (termId) => {
    try {
      console.log("Toggling favorite for term:", termId); // Добавляем лог
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        },
      );

      if (response.data.status === "success") {
        // Обновляем состояние только для конкретного слова
        setUnknownWords((prevWords) =>
          prevWords.map((word) =>
            word.id === termId
              ? { ...word, is_favorite: !word.is_favorite }
              : word,
          ),
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
};
```

Проблема в том, что состояние обновляется локально, но при обновлении списка слов (например, при переключении фильтров) это состояние не сохраняется.

Давайте исправим это:

1. В Dashboard.js добавьте новое состояние для отслеживания избранных слов:

```javascript
const [favoriteIds, setFavoriteIds] = useState(new Set());
```

2. Измените функцию handleFavoriteToggle:

```javascript
const handleFavoriteToggle = async (termId) => {
    try {
      console.log("Toggling favorite for term:", termId);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        }
      );

      if (response.data.status === "success") {
        setUnknownWords((prevWords) =>
          prevWords.map((word) =>
            word.id === termId
              ? { ...word, is_favorite: !word.is_favorite }
              : word
          )
        );

        // Обновляем список избранных ID
        setFavoriteIds((prev) => {
          const newIds = new Set(prev);
          if (response.data.is_favorite) {
            newIds.add(termId);
          } else {
            newIds.delete(termId);
          }
          return newIds;
        });

        // Перезагружаем список слов если открыт фильтр избранного
        if (filters.showFavorites) {
          fetchUnknownWords();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
};
```

3. Измените функцию fetchUnknownWords в Dashboard.js:

```javascript
const fetchUnknownWords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/unknown-words"
      );
      const words = response.data;

      // Обновляем состояние избранных ID при загрузке слов
      const favorites = new Set(
        words.filter(word => word.is_favorite).map(word => word.id)
      );
      setFavoriteIds(favorites);

      setUnknownWords(words);
    } catch (error) {
      console.error("Error fetching unknown words:", error);
    }
};
```

4. В бэкенде (app.py) обновите endpoint /api/terms/favorite:

```python
@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    """Toggle favorite status for a term"""
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        logger.error("No term_id provided in request")
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            logger.error(f"Term not found with id: {term_id}")
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение is_favorite
        term.is_favorite = not term.is_favorite
        logger.info(f"Setting is_favorite to {term.is_favorite} for term {term_id}")

        # Сохраняем изменения
        session.commit()

        # Возвращаем обновленный статус
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.id
        })
    except Exception as e:
        session.rollback()
        logger.error(f'Error toggling favorite: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
```

5. В WordList.js убедитесь, что isFavorite правильно передается и используется:

```javascript
const WordList = ({
  id,
  word,
  translation,
  category,
  attempts,
  lastAttempt,
  progress,
  isFavorite,
  onClick,
  onFavoriteToggle
}) => {
  // ... остальной код ...

  return (
    <motion.div>
      {/* ... остальной код ... */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleFavoriteClick}
        className={`${
          isFavorite ? "text-yellow-500" : "text-gray-400"
        } hover:text-yellow-500 transition-colors`}
      >
        <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
      </motion.button>
      {/* ... остальной код ... */}
    </motion.div>
  );
};
```

Эти изменения должны решить проблему с сохранением состояния избранного и обновлением списка при использовании фильтров. Попробуйте внести эти изменения и дайте знать, если проблема останется.

```js eng4IT/frontend/src/components/WordList.js
// eng4IT/frontend/src/components/WordList.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import axios from "axios"; // Добавляем импорт axios

const WordList = ({
  id,
  word,
  translation,
  category,
  attempts,
  lastAttempt,
  progress,
  isFavorite,
  onClick,
  onFavoriteToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Функция для озвучивания слова
  const speak = (text) => {
    setIsPlaying(true);
    setError(null);

    // Создаем новый экземпляр SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Настраиваем параметры
    utterance.lang = "en-US"; // Устанавливаем английский язык
    utterance.rate = 0.9; // Немного замедляем скорость
    utterance.pitch = 1; // Стандартная высота тона

    // Обработчики событий
    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setError("Error speaking the word");
      console.error("Speech synthesis error:", event);
    };

    // Останавливаем текущее произношение, если оно есть
    window.speechSynthesis.cancel();

    // Запускаем произношение
    window.speechSynthesis.speak(utterance);
  };

  const handlePlaySound = (e) => {
    e.stopPropagation();
    speak(word);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      console.log("Toggling favorite for term ID:", id); // Добавляем лог
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: id,
        },
      );
      if (response.data.status === "success") {
        onFavoriteToggle(id); // Передаем id
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Error updating favorite status");
    }
  };

  const formattedDate = lastAttempt
    ? new Date(lastAttempt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="term-card cursor-pointer hover:scale-[1.02] transition-all duration-200 relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="term text-lg font-medium text-primary">{word}</h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlaySound}
              className={`text-gray-400 hover:text-primary transition-colors ${
                isPlaying ? "animate-pulse text-primary" : ""
              }`}
              disabled={isPlaying}
            >
              <Volume2 size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={`${
                isFavorite ? "text-yellow-500" : "text-gray-400"
              } hover:text-yellow-500 transition-colors`}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
          </div>
          <p className="translation text-gray-300">{translation}</p>
          {attempts > 0 && (
            <p className="text-sm text-gray-500">Attempts: {attempts}</p>
          )}
        </div>

        <div className="flex flex-col items-end">
          {category && (
            <span className="category-tag mb-2 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">
              {category}
            </span>
          )}
          {progress !== undefined && (
            <div className="w-24 bg-gray-700 rounded-full h-1 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          )}
          {lastAttempt && (
            <span className="text-xs text-gray-500">{formattedDate}</span>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-2 right-2 bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WordList;
```

```js eng4IT/frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  SortAsc,
  Eye,
  EyeOff,
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Shuffle,
  Star,
  Layout,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

import TermModal from "./TermModal";
import WordList from "./WordList";
import StatisticsPanel from "./StatisticsPanel";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "tasks",
  );
  const [currentModel, setCurrentModel] = useState("ollama");
  const [subModel, setSubModel] = useState({
    ollama: "llama3.2",
    gemini: "gemini-1.5-flash",
  });
  const [apiKey, setApiKey] = useState("");
  const [originalApiKey, setOriginalApiKey] = useState("");
  const [unknownWords, setUnknownWords] = useState([]);
  const [allTerms, setAllTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelOptions] = useState({
    // Убираем setModelOptions
    ollama: false,
    gemini: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState("");
  const [useAI, setUseAI] = useState(
    () => localStorage.getItem("matchingUseAI") === "true",
  );
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    showFavorites: false,
    progressFilter: "all",
    categoryFilter: "all",
  });
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch current model settings
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/model/current",
        );
        setCurrentModel(response.data.model);

        if (response.data.model === "ollama") {
          setSubModel((prev) => ({ ...prev, ollama: response.data.sub_model }));
        } else {
          setSubModel((prev) => ({ ...prev, gemini: response.data.sub_model }));
        }

        if (response.data.has_api_key && response.data.api_key) {
          setOriginalApiKey(response.data.api_key);
          setApiKey(response.data.api_key);
          setDisplayedApiKey("*".repeat(response.data.api_key.length));
        } else {
          setOriginalApiKey("");
          setApiKey("");
          setDisplayedApiKey("");
        }
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    };

    fetchCurrentModel();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Используем Promise.all для параллельной загрузки данных
        const [wordsRes, statsRes, categoriesRes, termsRes] = await Promise.all(
          [
            axios.get("http://localhost:5000/api/unknown-words"),
            axios.get("http://localhost:5000/api/terms/statistics"),
            axios.get("http://localhost:5000/api/categories/tree"),
            axios.get("http://localhost:5000/api/all-terms"),
          ],
        );

        setUnknownWords(wordsRes.data);
        setStatistics(statsRes.data);
        setCategories(categoriesRes.data.categories);
        setAllTerms(termsRes.data);

        console.log("Loaded terms:", termsRes.data); // Добавим для отладки
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUnknownWords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/unknown-words",
      );
      const words = response.data;

      // Обновляем состояние избранных ID при загрузке слов
      const favorites = new Set(
        words.filter((word) => word.is_favorite).map((word) => word.id),
      );
      setFavoriteIds(favorites);

      setUnknownWords(words);
    } catch (error) {
      console.error("Error fetching unknown words:", error);
    }
  };

  const fetchAllTerms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all-terms");
      console.log("Fetched terms:", response.data); // Добавим для отладки
      if (response.data) {
        setAllTerms(response.data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const handleFavoriteToggle = async (termId) => {
    try {
      console.log("Toggling favorite for term:", termId);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        },
      );

      if (response.data.status === "success") {
        setUnknownWords((prevWords) =>
          prevWords.map((word) =>
            word.id === termId
              ? { ...word, is_favorite: !word.is_favorite }
              : word,
          ),
        );

        // Обновляем список избранных ID
        setFavoriteIds((prev) => {
          const newIds = new Set(prev);
          if (response.data.is_favorite) {
            newIds.add(termId);
          } else {
            newIds.delete(termId);
          }
          return newIds;
        });

        // Перезагружаем список слов если открыт фильтр избранного
        if (filters.showFavorites) {
          fetchUnknownWords();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTermClick = (word) => {
    setSelectedTerm({
      term: word.original,
      translation: word.translation,
      category: word.category,
      attempts: word.attempts,
      last_attempt: word.last_attempt,
    });
    setIsModalOpen(true);
  };

  const handleModelChange = useCallback(
    async (model) => {
      try {
        const data = {
          model,
          sub_model: model === "ollama" ? subModel.ollama : subModel.gemini,
          api_key: apiKey !== "********" ? apiKey : undefined,
        };

        const response = await axios.post(
          "http://localhost:5000/api/model/set",
          data,
        );
        if (response.data.status === "success") {
          setCurrentModel(model);
        }
      } catch (error) {
        console.error("Error setting model:", error);
      }
    },
    [subModel, apiKey],
  );

  const handleSubModelChange = async (newSubModel) => {
    try {
      const updatedSubModel = {
        ...subModel,
        [currentModel]: newSubModel,
      };
      setSubModel(updatedSubModel);

      const data = {
        model: currentModel,
        sub_model: newSubModel,
        api_key: apiKey,
      };

      await axios.post("http://localhost:5000/api/model/set", data);
    } catch (error) {
      console.error("Error setting sub-model:", error);
    }
  };

  const handleApiKeyChange = async (newApiKey) => {
    if (!newApiKey) return;

    try {
      const data = {
        model: currentModel,
        sub_model:
          currentModel === "ollama" ? subModel.ollama : subModel.gemini,
        api_key: newApiKey,
      };

      const response = await axios.post(
        "http://localhost:5000/api/model/set",
        data,
      );
      if (response.data.status === "success") {
        setOriginalApiKey(newApiKey);
        setApiKey(newApiKey);
        setDisplayedApiKey("*".repeat(newApiKey.length));
        setShowApiKey(false);
      }
    } catch (error) {
      console.error("Error setting API key:", error);
    }
  };

  useEffect(() => {
    if (showApiKey) {
      setDisplayedApiKey(originalApiKey || apiKey);
    } else {
      setDisplayedApiKey(
        apiKey.startsWith("*") ? apiKey : "*".repeat(apiKey.length),
      );
    }
  }, [showApiKey, originalApiKey, apiKey]);

  useEffect(() => {
    if (activeTab === "unknown-words") {
      fetchUnknownWords();
    }
  }, [activeTab, filters.showFavorites]);

  // Filter and sort words
  const filteredWords = unknownWords.filter((word) => {
    if (!word) return false;

    // Проверяем фильтр избранного
    if (filters.showFavorites && !word.is_favorite) {
      return false;
    }

    // Остальные фильтры
    if (
      filters.categoryFilter !== "all" &&
      word.category !== filters.categoryFilter
    ) {
      return false;
    }

    if (filters.progressFilter !== "all") {
      if (
        filters.progressFilter === "completed" &&
        word.study_progress !== 100
      ) {
        return false;
      }
      if (
        filters.progressFilter === "in-progress" &&
        (word.study_progress === 0 || word.study_progress === 100)
      ) {
        return false;
      }
      if (
        filters.progressFilter === "not-started" &&
        word.study_progress !== 0
      ) {
        return false;
      }
    }

    // Поиск по тексту
    const searchQuery = searchTerm.toLowerCase();
    return (
      (word.original && word.original.toLowerCase().includes(searchQuery)) ||
      (word.translation && word.translation.toLowerCase().includes(searchQuery))
    );
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortType) {
      case "alphabetical":
        return a.term.localeCompare(b.term);
      case "progress":
        return (b.study_progress || 0) - (a.study_progress || 0);
      case "category":
        return a.category.localeCompare(b.category);
      default: // 'newest'
        return new Date(b.last_attempt || 0) - new Date(a.last_attempt || 0);
    }
  });

  const renderUnknownWordsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Незнакомые слова
          </h2>
          <p className="text-sm text-gray-400">
            Всего слов: {filteredWords.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="header-button"
          >
            <Layout size={16} />
          </button>

          <button
            onClick={() => setSortType("newest")}
            className={`header-button ${sortType === "newest" ? "active" : ""}`}
          >
            <Clock size={16} />
            <span>Новые</span>
          </button>

          <button
            onClick={() => setSortType("alphabetical")}
            className={`header-button ${sortType === "alphabetical" ? "active" : ""}`}
          >
            <SortAsc size={16} />
            <span>По алфавиту</span>
          </button>

          <button
            onClick={() =>
              setFilters((f) => ({ ...f, showFavorites: !f.showFavorites }))
            }
            className={`header-button ${filters.showFavorites ? "active" : ""}`}
          >
            <Star size={16} />
            <span>Избранное</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск слов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.progressFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, progressFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Весь прогресс</option>
          <option value="completed">Изучены</option>
          <option value="in-progress">В процессе</option>
          <option value="not-started">Не начаты</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedWords.map((word, index) => (
            <WordList
              key={word.id || index}
              id={word.id} // Убедитесь, что передаете id
              word={word.original}
              translation={word.translation}
              category={word.category}
              attempts={word.attempts}
              lastAttempt={word.last_attempt}
              progress={word.study_progress}
              isFavorite={word.is_favorite}
              onClick={() => {
                if (word && word.original) {
                  setSelectedTerm(word);
                  setIsModalOpen(true);
                }
              }}
              onFavoriteToggle={() => handleFavoriteToggle(word.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="max-w-2xl mx-auto">
      <div className="settings-section">
        <h2 className="settings-title">Настройки генерации</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-primary mb-2">Основная модель</label>
            <div className="settings-group">
              <button
                onClick={() => handleModelChange("ollama")}
                className={`settings-button ${
                  currentModel === "ollama" ? "active" : ""
                }`}
                disabled={!modelOptions.ollama}
              >
                Ollama
              </button>
              <button
                onClick={() => handleModelChange("gemini")}
                className={`settings-button ${
                  currentModel === "gemini" ? "active" : ""
                }`}
              >
                Gemini
              </button>
            </div>
          </div>
          <div>
            <label className="block text-primary mb-2">
              {currentModel === "ollama" ? "Модель Ollama" : "Версия Gemini"}
            </label>
            <select
              value={
                currentModel === "ollama" ? subModel.ollama : subModel.gemini
              }
              onChange={(e) => handleSubModelChange(e.target.value)}
              className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {currentModel === "ollama" ? (
                <option value="llama3.2">Llama 3.2</option>
              ) : (
                <>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-flash-8b">
                    Gemini 1.5 Flash 8B
                  </option>
                </>
              )}
            </select>
          </div>
          {currentModel === "gemini" && (
            <div>
              <label className="block text-primary mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={showApiKey ? apiKey : displayedApiKey}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setApiKey(newValue);
                      setDisplayedApiKey(newValue);
                    }}
                    placeholder="Введите API ключ Gemini"
                    className="w-full bg-dark border border-gray-700 text-text px-4 py-2 pr-10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  onClick={() => handleApiKeyChange(apiKey)}
                  disabled={!apiKey || apiKey === displayedApiKey}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark rounded-lg transition-colors disabled:opacity-50"
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTermBase = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">База терминов</h2>
          <p className="text-sm text-gray-400">
            Все доступные технические термины
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск терминов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.categoryFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, categoryFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Все категории</option>
          {Object.values(categories).map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Добавим проверку на наличие терминов */}
      {Object.keys(allTerms).length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Термины загружаются...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(allTerms)
            .filter(([term, category]) => {
              const termLower = term.toLowerCase();
              const searchLower = searchTerm.toLowerCase();
              const categoryMatch =
                filters.categoryFilter === "all" ||
                category === filters.categoryFilter;

              return categoryMatch && termLower.includes(searchLower);
            })
            .map(([term, category], index) => (
              <div
                key={index}
                className="bg-dark-card border border-gray-800 p-4 rounded-xl hover:border-primary transition-colors"
              >
                <h3 className="text-primary font-medium mb-2">{term}</h3>
                <p className="text-sm text-gray-400">{category}</p>
              </div>
            ))}
        </div>
      )}

      {/* Добавим отладочную информацию */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-dark-card rounded-xl">
          <p className="text-gray-400">Debug Info:</p>
          <p>Terms count: {Object.keys(allTerms).length}</p>
          <p>Categories count: {Object.keys(categories).length}</p>
        </div>
      )}
    </div>
  );

  const renderTasksContent = () => (
    <div className="text-center py-12">
      <h2 className="page-title">Изучение технических терминов</h2>
      <p className="page-subtitle">
        Практикуйтесь в чтении технических текстов и изучайте новые термины
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/assessment"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <ClipboardCheck size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Оценка знаний</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Проверьте свое знание технических терминов
          </p>
        </Link>

        <Link
          to="/learning"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Практика чтения</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Читайте технические тексты в контексте
          </p>
        </Link>

        <Link
          to="/chat-exercise"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Чат с коллегой</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Практикуйте технический английский в диалоге
          </p>
        </Link>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group relative">
          <div
            className="absolute top-4 right-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group/ai">
              <button
                className="w-10 h-5 bg-gray-700 rounded-full flex items-center relative"
                onClick={() => {
                  const newValue = !useAI;
                  setUseAI(newValue);
                  localStorage.setItem("matchingUseAI", newValue);
                }}
              >
                <div
                  className={`absolute w-3 h-3 rounded-full transition-all duration-200 ${
                    useAI
                      ? "translate-x-6 bg-primary"
                      : "translate-x-1 bg-gray-400"
                  }`}
                />
              </button>
              <span className="absolute right-0 top-[-30px] opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap bg-dark-card px-2 py-1 rounded text-xs text-gray-400 border border-gray-700">
                Улучшение перевода с ИИ
              </span>
            </div>
          </div>

          <Link to="/matching">
            <div className="text-primary mb-3">
              <Shuffle size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Найти пару</h3>
            <p className="text-gray-400 text-sm group-hover:text-gray-300">
              Сопоставьте слова с их переводами
            </p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl shadow-xl p-6">
          <div className="border-b border-gray-800 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`${activeTab === "tasks" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Задания
              </button>
              <button
                onClick={() => setActiveTab("unknown-words")}
                className={`${activeTab === "unknown-words" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Незнакомые слова
              </button>
              <button
                onClick={() => setActiveTab("term-base")}
                className={`${activeTab === "term-base" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                База терминов
              </button>
              <button
                onClick={() => setActiveTab("statistics")}
                className={`${activeTab === "statistics" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Статистика
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`${activeTab === "settings" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Настройки
              </button>
            </nav>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "unknown-words" && renderUnknownWordsContent()}
              {activeTab === "statistics" && (
                <StatisticsPanel statistics={statistics} />
              )}
              {activeTab === "tasks" && renderTasksContent()}
              {activeTab === "term-base" && renderTermBase()}
              {activeTab === "settings" && renderSettingsContent()}
            </>
          )}
        </div>
      </div>

      <TermModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        term={selectedTerm?.original} // Изменено с term на original
        translation={selectedTerm?.translation}
        category={selectedTerm?.category}
      />
    </div>
  );
};

export default Dashboard;
```


ничего не изменилось

Похоже, я нашел основную проблему. В `/api/terms/favorite` мы получаем ответ от сервера, но не используем обновленное значение `is_favorite` должным образом. Давайте изменим код:

1. В Dashboard.js изменяем функцию handleFavoriteToggle:

```javascript
const handleFavoriteToggle = async (termId) => {
  try {
    console.log("Toggling favorite for term:", termId);
    const response = await axios.post(
      "http://localhost:5000/api/terms/favorite",
      {
        term_id: termId,
      }
    );

    if (response.data.status === "success") {
      // Обновляем состояние с использованием значения из ответа сервера
      setUnknownWords((prevWords) =>
        prevWords.map((word) =>
          word.id === termId
            ? { ...word, is_favorite: response.data.is_favorite }
            : word
        )
      );

      // Если включен фильтр избранного, обновляем список
      if (filters.showFavorites) {
        fetchUnknownWords();
      }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
  }
};
```

2. В app.py убедитесь, что функция toggle_favorite выглядит так:

```python
@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    """Toggle favorite status for a term"""
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        logger.error("No term_id provided in request")
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            logger.error(f"Term not found with id: {term_id}")
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение is_favorite
        term.is_favorite = not term.is_favorite
        logger.info(f"Setting is_favorite to {term.is_favorite} for term {term_id}")

        # Сохраняем изменения
        session.commit()

        # Возвращаем обновленный статус
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.id
        })
    except Exception as e:
        session.rollback()
        logger.error(f'Error toggling favorite: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
```

3. В WordList.js изменяем обработку клика по звёздочке:

```javascript
const handleFavoriteClick = async (e) => {
  e.stopPropagation();
  try {
    console.log("Toggling favorite for term ID:", id);
    const response = await axios.post(
      "http://localhost:5000/api/terms/favorite",
      {
        term_id: id,
      }
    );
    if (response.data.status === "success") {
      // Передаем id термина в родительский компонент
      onFavoriteToggle(id);
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    setError("Error updating favorite status");
  }
};
```

4. В функции fetchUnknownWords в Dashboard.js добавьте логирование:

```javascript
const fetchUnknownWords = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/unknown-words");
    console.log("Fetched words:", response.data); // Добавляем для отладки
    setUnknownWords(response.data);
  } catch (error) {
    console.error("Error fetching unknown words:", error);
  }
};
```

5. В Dashboard.js измените условие фильтрации для избранных слов:

```javascript
const filteredWords = unknownWords.filter((word) => {
  if (!word) return false;

  // Проверяем фильтр избранного
  if (filters.showFavorites && !word.is_favorite) {
    return false;
  }

  // ... остальные условия фильтрации ...
});
```

Эти изменения должны исправить проблему с сохранением состояния избранного и фильтрацией. После внесения изменений:

1. Убедитесь, что backend правильно возвращает обновленное значение is_favorite
2. Проверьте в консоли браузера, что значения корректно обновляются
3. Попробуйте добавить слово в избранное и включить фильтр по избранным

Если проблема все еще сохраняется, посмотрите в консоли браузера ответ от сервера при добавлении в избранное и убедитесь, что приходят правильные данные.

```js eng4IT/frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  SortAsc,
  Eye,
  EyeOff,
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Shuffle,
  Star,
  Layout,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

import TermModal from "./TermModal";
import WordList from "./WordList";
import StatisticsPanel from "./StatisticsPanel";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "tasks",
  );
  const [currentModel, setCurrentModel] = useState("ollama");
  const [subModel, setSubModel] = useState({
    ollama: "llama3.2",
    gemini: "gemini-1.5-flash",
  });
  const [apiKey, setApiKey] = useState("");
  const [originalApiKey, setOriginalApiKey] = useState("");
  const [unknownWords, setUnknownWords] = useState([]);
  const [allTerms, setAllTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelOptions] = useState({
    // Убираем setModelOptions
    ollama: false,
    gemini: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState("");
  const [useAI, setUseAI] = useState(
    () => localStorage.getItem("matchingUseAI") === "true",
  );
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    showFavorites: false,
    progressFilter: "all",
    categoryFilter: "all",
  });
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch current model settings
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/model/current",
        );
        setCurrentModel(response.data.model);

        if (response.data.model === "ollama") {
          setSubModel((prev) => ({ ...prev, ollama: response.data.sub_model }));
        } else {
          setSubModel((prev) => ({ ...prev, gemini: response.data.sub_model }));
        }

        if (response.data.has_api_key && response.data.api_key) {
          setOriginalApiKey(response.data.api_key);
          setApiKey(response.data.api_key);
          setDisplayedApiKey("*".repeat(response.data.api_key.length));
        } else {
          setOriginalApiKey("");
          setApiKey("");
          setDisplayedApiKey("");
        }
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    };

    fetchCurrentModel();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Используем Promise.all для параллельной загрузки данных
        const [wordsRes, statsRes, categoriesRes, termsRes] = await Promise.all(
          [
            axios.get("http://localhost:5000/api/unknown-words"),
            axios.get("http://localhost:5000/api/terms/statistics"),
            axios.get("http://localhost:5000/api/categories/tree"),
            axios.get("http://localhost:5000/api/all-terms"),
          ],
        );

        setUnknownWords(wordsRes.data);
        setStatistics(statsRes.data);
        setCategories(categoriesRes.data.categories);
        setAllTerms(termsRes.data);

        console.log("Loaded terms:", termsRes.data); // Добавим для отладки
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUnknownWords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/unknown-words",
      );
      console.log("Fetched words:", response.data); // Добавляем для отладки
      setUnknownWords(response.data);
    } catch (error) {
      console.error("Error fetching unknown words:", error);
    }
  };

  const fetchAllTerms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all-terms");
      console.log("Fetched terms:", response.data); // Добавим для отладки
      if (response.data) {
        setAllTerms(response.data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const handleFavoriteToggle = async (termId) => {
    try {
      console.log("Toggling favorite for term:", termId);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        },
      );

      if (response.data.status === "success") {
        // Обновляем состояние с использованием значения из ответа сервера
        setUnknownWords((prevWords) =>
          prevWords.map((word) =>
            word.id === termId
              ? { ...word, is_favorite: response.data.is_favorite }
              : word,
          ),
        );

        // Если включен фильтр избранного, обновляем список
        if (filters.showFavorites) {
          fetchUnknownWords();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTermClick = (word) => {
    setSelectedTerm({
      term: word.original,
      translation: word.translation,
      category: word.category,
      attempts: word.attempts,
      last_attempt: word.last_attempt,
    });
    setIsModalOpen(true);
  };

  const handleModelChange = useCallback(
    async (model) => {
      try {
        const data = {
          model,
          sub_model: model === "ollama" ? subModel.ollama : subModel.gemini,
          api_key: apiKey !== "********" ? apiKey : undefined,
        };

        const response = await axios.post(
          "http://localhost:5000/api/model/set",
          data,
        );
        if (response.data.status === "success") {
          setCurrentModel(model);
        }
      } catch (error) {
        console.error("Error setting model:", error);
      }
    },
    [subModel, apiKey],
  );

  const handleSubModelChange = async (newSubModel) => {
    try {
      const updatedSubModel = {
        ...subModel,
        [currentModel]: newSubModel,
      };
      setSubModel(updatedSubModel);

      const data = {
        model: currentModel,
        sub_model: newSubModel,
        api_key: apiKey,
      };

      await axios.post("http://localhost:5000/api/model/set", data);
    } catch (error) {
      console.error("Error setting sub-model:", error);
    }
  };

  const handleApiKeyChange = async (newApiKey) => {
    if (!newApiKey) return;

    try {
      const data = {
        model: currentModel,
        sub_model:
          currentModel === "ollama" ? subModel.ollama : subModel.gemini,
        api_key: newApiKey,
      };

      const response = await axios.post(
        "http://localhost:5000/api/model/set",
        data,
      );
      if (response.data.status === "success") {
        setOriginalApiKey(newApiKey);
        setApiKey(newApiKey);
        setDisplayedApiKey("*".repeat(newApiKey.length));
        setShowApiKey(false);
      }
    } catch (error) {
      console.error("Error setting API key:", error);
    }
  };

  useEffect(() => {
    if (showApiKey) {
      setDisplayedApiKey(originalApiKey || apiKey);
    } else {
      setDisplayedApiKey(
        apiKey.startsWith("*") ? apiKey : "*".repeat(apiKey.length),
      );
    }
  }, [showApiKey, originalApiKey, apiKey]);

  useEffect(() => {
    if (activeTab === "unknown-words") {
      fetchUnknownWords();
    }
  }, [activeTab, filters.showFavorites]);

  // Filter and sort words
  const filteredWords = unknownWords.filter((word) => {
    if (!word) return false;

    // Проверяем фильтр избранного
    if (filters.showFavorites && !word.is_favorite) {
      return false;
    }

    // Остальные фильтры
    if (
      filters.categoryFilter !== "all" &&
      word.category !== filters.categoryFilter
    ) {
      return false;
    }

    if (filters.progressFilter !== "all") {
      if (
        filters.progressFilter === "completed" &&
        word.study_progress !== 100
      ) {
        return false;
      }
      if (
        filters.progressFilter === "in-progress" &&
        (word.study_progress === 0 || word.study_progress === 100)
      ) {
        return false;
      }
      if (
        filters.progressFilter === "not-started" &&
        word.study_progress !== 0
      ) {
        return false;
      }
    }

    // Поиск по тексту
    const searchQuery = searchTerm.toLowerCase();
    return (
      (word.original && word.original.toLowerCase().includes(searchQuery)) ||
      (word.translation && word.translation.toLowerCase().includes(searchQuery))
    );
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortType) {
      case "alphabetical":
        return a.term.localeCompare(b.term);
      case "progress":
        return (b.study_progress || 0) - (a.study_progress || 0);
      case "category":
        return a.category.localeCompare(b.category);
      default: // 'newest'
        return new Date(b.last_attempt || 0) - new Date(a.last_attempt || 0);
    }
  });

  const renderUnknownWordsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Незнакомые слова
          </h2>
          <p className="text-sm text-gray-400">
            Всего слов: {filteredWords.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="header-button"
          >
            <Layout size={16} />
          </button>

          <button
            onClick={() => setSortType("newest")}
            className={`header-button ${sortType === "newest" ? "active" : ""}`}
          >
            <Clock size={16} />
            <span>Новые</span>
          </button>

          <button
            onClick={() => setSortType("alphabetical")}
            className={`header-button ${sortType === "alphabetical" ? "active" : ""}`}
          >
            <SortAsc size={16} />
            <span>По алфавиту</span>
          </button>

          <button
            onClick={() =>
              setFilters((f) => ({ ...f, showFavorites: !f.showFavorites }))
            }
            className={`header-button ${filters.showFavorites ? "active" : ""}`}
          >
            <Star size={16} />
            <span>Избранное</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск слов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.progressFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, progressFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Весь прогресс</option>
          <option value="completed">Изучены</option>
          <option value="in-progress">В процессе</option>
          <option value="not-started">Не начаты</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedWords.map((word, index) => (
            <WordList
              key={word.id || index}
              id={word.id} // Убедитесь, что передаете id
              word={word.original}
              translation={word.translation}
              category={word.category}
              attempts={word.attempts}
              lastAttempt={word.last_attempt}
              progress={word.study_progress}
              isFavorite={word.is_favorite}
              onClick={() => {
                if (word && word.original) {
                  setSelectedTerm(word);
                  setIsModalOpen(true);
                }
              }}
              onFavoriteToggle={() => handleFavoriteToggle(word.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="max-w-2xl mx-auto">
      <div className="settings-section">
        <h2 className="settings-title">Настройки генерации</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-primary mb-2">Основная модель</label>
            <div className="settings-group">
              <button
                onClick={() => handleModelChange("ollama")}
                className={`settings-button ${
                  currentModel === "ollama" ? "active" : ""
                }`}
                disabled={!modelOptions.ollama}
              >
                Ollama
              </button>
              <button
                onClick={() => handleModelChange("gemini")}
                className={`settings-button ${
                  currentModel === "gemini" ? "active" : ""
                }`}
              >
                Gemini
              </button>
            </div>
          </div>
          <div>
            <label className="block text-primary mb-2">
              {currentModel === "ollama" ? "Модель Ollama" : "Версия Gemini"}
            </label>
            <select
              value={
                currentModel === "ollama" ? subModel.ollama : subModel.gemini
              }
              onChange={(e) => handleSubModelChange(e.target.value)}
              className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {currentModel === "ollama" ? (
                <option value="llama3.2">Llama 3.2</option>
              ) : (
                <>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-flash-8b">
                    Gemini 1.5 Flash 8B
                  </option>
                </>
              )}
            </select>
          </div>
          {currentModel === "gemini" && (
            <div>
              <label className="block text-primary mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={showApiKey ? apiKey : displayedApiKey}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setApiKey(newValue);
                      setDisplayedApiKey(newValue);
                    }}
                    placeholder="Введите API ключ Gemini"
                    className="w-full bg-dark border border-gray-700 text-text px-4 py-2 pr-10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  onClick={() => handleApiKeyChange(apiKey)}
                  disabled={!apiKey || apiKey === displayedApiKey}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark rounded-lg transition-colors disabled:opacity-50"
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTermBase = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">База терминов</h2>
          <p className="text-sm text-gray-400">
            Все доступные технические термины
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск терминов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.categoryFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, categoryFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Все категории</option>
          {Object.values(categories).map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Добавим проверку на наличие терминов */}
      {Object.keys(allTerms).length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Термины загружаются...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(allTerms)
            .filter(([term, category]) => {
              const termLower = term.toLowerCase();
              const searchLower = searchTerm.toLowerCase();
              const categoryMatch =
                filters.categoryFilter === "all" ||
                category === filters.categoryFilter;

              return categoryMatch && termLower.includes(searchLower);
            })
            .map(([term, category], index) => (
              <div
                key={index}
                className="bg-dark-card border border-gray-800 p-4 rounded-xl hover:border-primary transition-colors"
              >
                <h3 className="text-primary font-medium mb-2">{term}</h3>
                <p className="text-sm text-gray-400">{category}</p>
              </div>
            ))}
        </div>
      )}

      {/* Добавим отладочную информацию */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-dark-card rounded-xl">
          <p className="text-gray-400">Debug Info:</p>
          <p>Terms count: {Object.keys(allTerms).length}</p>
          <p>Categories count: {Object.keys(categories).length}</p>
        </div>
      )}
    </div>
  );

  const renderTasksContent = () => (
    <div className="text-center py-12">
      <h2 className="page-title">Изучение технических терминов</h2>
      <p className="page-subtitle">
        Практикуйтесь в чтении технических текстов и изучайте новые термины
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/assessment"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <ClipboardCheck size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Оценка знаний</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Проверьте свое знание технических терминов
          </p>
        </Link>

        <Link
          to="/learning"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Практика чтения</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Читайте технические тексты в контексте
          </p>
        </Link>

        <Link
          to="/chat-exercise"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Чат с коллегой</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Практикуйте технический английский в диалоге
          </p>
        </Link>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group relative">
          <div
            className="absolute top-4 right-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group/ai">
              <button
                className="w-10 h-5 bg-gray-700 rounded-full flex items-center relative"
                onClick={() => {
                  const newValue = !useAI;
                  setUseAI(newValue);
                  localStorage.setItem("matchingUseAI", newValue);
                }}
              >
                <div
                  className={`absolute w-3 h-3 rounded-full transition-all duration-200 ${
                    useAI
                      ? "translate-x-6 bg-primary"
                      : "translate-x-1 bg-gray-400"
                  }`}
                />
              </button>
              <span className="absolute right-0 top-[-30px] opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap bg-dark-card px-2 py-1 rounded text-xs text-gray-400 border border-gray-700">
                Улучшение перевода с ИИ
              </span>
            </div>
          </div>

          <Link to="/matching">
            <div className="text-primary mb-3">
              <Shuffle size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Найти пару</h3>
            <p className="text-gray-400 text-sm group-hover:text-gray-300">
              Сопоставьте слова с их переводами
            </p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl shadow-xl p-6">
          <div className="border-b border-gray-800 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`${activeTab === "tasks" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Задания
              </button>
              <button
                onClick={() => setActiveTab("unknown-words")}
                className={`${activeTab === "unknown-words" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Незнакомые слова
              </button>
              <button
                onClick={() => setActiveTab("term-base")}
                className={`${activeTab === "term-base" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                База терминов
              </button>
              <button
                onClick={() => setActiveTab("statistics")}
                className={`${activeTab === "statistics" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Статистика
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`${activeTab === "settings" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Настройки
              </button>
            </nav>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "unknown-words" && renderUnknownWordsContent()}
              {activeTab === "statistics" && (
                <StatisticsPanel statistics={statistics} />
              )}
              {activeTab === "tasks" && renderTasksContent()}
              {activeTab === "term-base" && renderTermBase()}
              {activeTab === "settings" && renderSettingsContent()}
            </>
          )}
        </div>
      </div>

      <TermModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        term={selectedTerm?.original} // Изменено с term на original
        translation={selectedTerm?.translation}
        category={selectedTerm?.category}
      />
    </div>
  );
};

export default Dashboard;
```

```js eng4IT/frontend/src/components/WordList.js
// eng4IT/frontend/src/components/WordList.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import axios from "axios"; // Добавляем импорт axios

const WordList = ({
  id,
  word,
  translation,
  category,
  attempts,
  lastAttempt,
  progress,
  isFavorite,
  onClick,
  onFavoriteToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Функция для озвучивания слова
  const speak = (text) => {
    setIsPlaying(true);
    setError(null);

    // Создаем новый экземпляр SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Настраиваем параметры
    utterance.lang = "en-US"; // Устанавливаем английский язык
    utterance.rate = 0.9; // Немного замедляем скорость
    utterance.pitch = 1; // Стандартная высота тона

    // Обработчики событий
    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setError("Error speaking the word");
      console.error("Speech synthesis error:", event);
    };

    // Останавливаем текущее произношение, если оно есть
    window.speechSynthesis.cancel();

    // Запускаем произношение
    window.speechSynthesis.speak(utterance);
  };

  const handlePlaySound = (e) => {
    e.stopPropagation();
    speak(word);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      console.log("Toggling favorite for term ID:", id);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: id,
        },
      );
      if (response.data.status === "success") {
        // Передаем id термина в родительский компонент
        onFavoriteToggle(id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Error updating favorite status");
    }
  };

  const formattedDate = lastAttempt
    ? new Date(lastAttempt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="term-card cursor-pointer hover:scale-[1.02] transition-all duration-200 relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="term text-lg font-medium text-primary">{word}</h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlaySound}
              className={`text-gray-400 hover:text-primary transition-colors ${
                isPlaying ? "animate-pulse text-primary" : ""
              }`}
              disabled={isPlaying}
            >
              <Volume2 size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={`${
                isFavorite ? "text-yellow-500" : "text-gray-400"
              } hover:text-yellow-500 transition-colors`}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
          </div>
          <p className="translation text-gray-300">{translation}</p>
          {attempts > 0 && (
            <p className="text-sm text-gray-500">Attempts: {attempts}</p>
          )}
        </div>

        <div className="flex flex-col items-end">
          {category && (
            <span className="category-tag mb-2 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">
              {category}
            </span>
          )}
          {progress !== undefined && (
            <div className="w-24 bg-gray-700 rounded-full h-1 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          )}
          {lastAttempt && (
            <span className="text-xs text-gray-500">{formattedDate}</span>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-2 right-2 bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WordList;
```


теперь звездочка даже перестала выделяться...

Давайте проверим логи и исправим проблему. Добавьте дополнительные console.log в нужных местах:

1. В WordList.js после получения ответа от сервера:

```javascript
const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
        console.log("Toggling favorite for term ID:", id);
        const response = await axios.post(
            "http://localhost:5000/api/terms/favorite",
            {
                term_id: id,
            },
        );
        console.log("Server response:", response.data); // Добавляем лог
        if (response.data.status === "success") {
            // Передаем id термина в родительский компонент
            onFavoriteToggle(id);
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        setError("Error updating favorite status");
    }
};
```

2. В Dashboard.js в handleFavoriteToggle:

```javascript
const handleFavoriteToggle = async (termId) => {
    try {
        console.log("Dashboard - Toggling favorite for term:", termId);
        const response = await axios.post(
            "http://localhost:5000/api/terms/favorite",
            {
                term_id: termId,
            },
        );
        console.log("Dashboard - Server response:", response.data); // Добавляем лог

        if (response.data.status === "success") {
            console.log("Dashboard - Before update:", unknownWords); // Добавляем лог
            setUnknownWords((prevWords) =>
                prevWords.map((word) => {
                    if (word.id === termId) {
                        console.log("Dashboard - Updating word:", word.id, response.data.is_favorite); // Добавляем лог
                        return { ...word, is_favorite: response.data.is_favorite };
                    }
                    return word;
                }),
            );
            // Если включен фильтр избранного, обновляем список
            if (filters.showFavorites) {
                fetchUnknownWords();
            }
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
    }
};
```

Также проверьте на бэкенде в app.py, что эндпоинт /api/terms/favorite возвращает правильные данные:

```python
@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    """Toggle favorite status for a term"""
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        logger.error("No term_id provided in request")
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            logger.error(f"Term not found with id: {term_id}")
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение is_favorite
        term.is_favorite = not term.is_favorite
        logger.info(f"Setting is_favorite to {term.is_favorite} for term {term_id}")

        # Сохраняем изменения
        session.commit()

        # Возвращаем обновленный статус и ID
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.

```js eng4IT/frontend/src/components/WordList.js
// eng4IT/frontend/src/components/WordList.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import axios from "axios"; // Добавляем импорт axios

const WordList = ({
  id,
  word,
  translation,
  category,
  attempts,
  lastAttempt,
  progress,
  isFavorite,
  onClick,
  onFavoriteToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Функция для озвучивания слова
  const speak = (text) => {
    setIsPlaying(true);
    setError(null);

    // Создаем новый экземпляр SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Настраиваем параметры
    utterance.lang = "en-US"; // Устанавливаем английский язык
    utterance.rate = 0.9; // Немного замедляем скорость
    utterance.pitch = 1; // Стандартная высота тона

    // Обработчики событий
    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setError("Error speaking the word");
      console.error("Speech synthesis error:", event);
    };

    // Останавливаем текущее произношение, если оно есть
    window.speechSynthesis.cancel();

    // Запускаем произношение
    window.speechSynthesis.speak(utterance);
  };

  const handlePlaySound = (e) => {
    e.stopPropagation();
    speak(word);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      console.log("Toggling favorite for term ID:", id);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: id,
        },
      );
      console.log("Server response:", response.data); // Добавляем лог
      if (response.data.status === "success") {
        // Передаем id термина в родительский компонент
        onFavoriteToggle(id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Error updating favorite status");
    }
  };

  const formattedDate = lastAttempt
    ? new Date(lastAttempt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="term-card cursor-pointer hover:scale-[1.02] transition-all duration-200 relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="term text-lg font-medium text-primary">{word}</h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlaySound}
              className={`text-gray-400 hover:text-primary transition-colors ${
                isPlaying ? "animate-pulse text-primary" : ""
              }`}
              disabled={isPlaying}
            >
              <Volume2 size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={`${
                isFavorite ? "text-yellow-500" : "text-gray-400"
              } hover:text-yellow-500 transition-colors`}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
          </div>
          <p className="translation text-gray-300">{translation}</p>
          {attempts > 0 && (
            <p className="text-sm text-gray-500">Attempts: {attempts}</p>
          )}
        </div>

        <div className="flex flex-col items-end">
          {category && (
            <span className="category-tag mb-2 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">
              {category}
            </span>
          )}
          {progress !== undefined && (
            <div className="w-24 bg-gray-700 rounded-full h-1 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          )}
          {lastAttempt && (
            <span className="text-xs text-gray-500">{formattedDate}</span>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-2 right-2 bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WordList;
```

```js eng4IT/frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  SortAsc,
  Eye,
  EyeOff,
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Shuffle,
  Star,
  Layout,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

import TermModal from "./TermModal";
import WordList from "./WordList";
import StatisticsPanel from "./StatisticsPanel";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "tasks",
  );
  const [currentModel, setCurrentModel] = useState("ollama");
  const [subModel, setSubModel] = useState({
    ollama: "llama3.2",
    gemini: "gemini-1.5-flash",
  });
  const [apiKey, setApiKey] = useState("");
  const [originalApiKey, setOriginalApiKey] = useState("");
  const [unknownWords, setUnknownWords] = useState([]);
  const [allTerms, setAllTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelOptions] = useState({
    // Убираем setModelOptions
    ollama: false,
    gemini: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState("");
  const [useAI, setUseAI] = useState(
    () => localStorage.getItem("matchingUseAI") === "true",
  );
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    showFavorites: false,
    progressFilter: "all",
    categoryFilter: "all",
  });
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch current model settings
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/model/current",
        );
        setCurrentModel(response.data.model);

        if (response.data.model === "ollama") {
          setSubModel((prev) => ({ ...prev, ollama: response.data.sub_model }));
        } else {
          setSubModel((prev) => ({ ...prev, gemini: response.data.sub_model }));
        }

        if (response.data.has_api_key && response.data.api_key) {
          setOriginalApiKey(response.data.api_key);
          setApiKey(response.data.api_key);
          setDisplayedApiKey("*".repeat(response.data.api_key.length));
        } else {
          setOriginalApiKey("");
          setApiKey("");
          setDisplayedApiKey("");
        }
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    };

    fetchCurrentModel();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Используем Promise.all для параллельной загрузки данных
        const [wordsRes, statsRes, categoriesRes, termsRes] = await Promise.all(
          [
            axios.get("http://localhost:5000/api/unknown-words"),
            axios.get("http://localhost:5000/api/terms/statistics"),
            axios.get("http://localhost:5000/api/categories/tree"),
            axios.get("http://localhost:5000/api/all-terms"),
          ],
        );

        setUnknownWords(wordsRes.data);
        setStatistics(statsRes.data);
        setCategories(categoriesRes.data.categories);
        setAllTerms(termsRes.data);

        console.log("Loaded terms:", termsRes.data); // Добавим для отладки
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUnknownWords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/unknown-words",
      );
      console.log("Fetched words:", response.data); // Добавляем для отладки
      setUnknownWords(response.data);
    } catch (error) {
      console.error("Error fetching unknown words:", error);
    }
  };

  const fetchAllTerms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all-terms");
      console.log("Fetched terms:", response.data); // Добавим для отладки
      if (response.data) {
        setAllTerms(response.data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const handleFavoriteToggle = async (termId) => {
    try {
      console.log("Dashboard - Toggling favorite for term:", termId);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        },
      );
      console.log("Dashboard - Server response:", response.data); // Добавляем лог

      if (response.data.status === "success") {
        console.log("Dashboard - Before update:", unknownWords); // Добавляем лог
        setUnknownWords((prevWords) =>
          prevWords.map((word) => {
            if (word.id === termId) {
              console.log(
                "Dashboard - Updating word:",
                word.id,
                response.data.is_favorite,
              ); // Добавляем лог
              return { ...word, is_favorite: response.data.is_favorite };
            }
            return word;
          }),
        );
        // Если включен фильтр избранного, обновляем список
        if (filters.showFavorites) {
          fetchUnknownWords();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTermClick = (word) => {
    setSelectedTerm({
      term: word.original,
      translation: word.translation,
      category: word.category,
      attempts: word.attempts,
      last_attempt: word.last_attempt,
    });
    setIsModalOpen(true);
  };

  const handleModelChange = useCallback(
    async (model) => {
      try {
        const data = {
          model,
          sub_model: model === "ollama" ? subModel.ollama : subModel.gemini,
          api_key: apiKey !== "********" ? apiKey : undefined,
        };

        const response = await axios.post(
          "http://localhost:5000/api/model/set",
          data,
        );
        if (response.data.status === "success") {
          setCurrentModel(model);
        }
      } catch (error) {
        console.error("Error setting model:", error);
      }
    },
    [subModel, apiKey],
  );

  const handleSubModelChange = async (newSubModel) => {
    try {
      const updatedSubModel = {
        ...subModel,
        [currentModel]: newSubModel,
      };
      setSubModel(updatedSubModel);

      const data = {
        model: currentModel,
        sub_model: newSubModel,
        api_key: apiKey,
      };

      await axios.post("http://localhost:5000/api/model/set", data);
    } catch (error) {
      console.error("Error setting sub-model:", error);
    }
  };

  const handleApiKeyChange = async (newApiKey) => {
    if (!newApiKey) return;

    try {
      const data = {
        model: currentModel,
        sub_model:
          currentModel === "ollama" ? subModel.ollama : subModel.gemini,
        api_key: newApiKey,
      };

      const response = await axios.post(
        "http://localhost:5000/api/model/set",
        data,
      );
      if (response.data.status === "success") {
        setOriginalApiKey(newApiKey);
        setApiKey(newApiKey);
        setDisplayedApiKey("*".repeat(newApiKey.length));
        setShowApiKey(false);
      }
    } catch (error) {
      console.error("Error setting API key:", error);
    }
  };

  useEffect(() => {
    if (showApiKey) {
      setDisplayedApiKey(originalApiKey || apiKey);
    } else {
      setDisplayedApiKey(
        apiKey.startsWith("*") ? apiKey : "*".repeat(apiKey.length),
      );
    }
  }, [showApiKey, originalApiKey, apiKey]);

  useEffect(() => {
    if (activeTab === "unknown-words") {
      fetchUnknownWords();
    }
  }, [activeTab, filters.showFavorites]);

  // Filter and sort words
  const filteredWords = unknownWords.filter((word) => {
    if (!word) return false;

    // Проверяем фильтр избранного
    if (filters.showFavorites && !word.is_favorite) {
      return false;
    }

    // Остальные фильтры
    if (
      filters.categoryFilter !== "all" &&
      word.category !== filters.categoryFilter
    ) {
      return false;
    }

    if (filters.progressFilter !== "all") {
      if (
        filters.progressFilter === "completed" &&
        word.study_progress !== 100
      ) {
        return false;
      }
      if (
        filters.progressFilter === "in-progress" &&
        (word.study_progress === 0 || word.study_progress === 100)
      ) {
        return false;
      }
      if (
        filters.progressFilter === "not-started" &&
        word.study_progress !== 0
      ) {
        return false;
      }
    }

    // Поиск по тексту
    const searchQuery = searchTerm.toLowerCase();
    return (
      (word.original && word.original.toLowerCase().includes(searchQuery)) ||
      (word.translation && word.translation.toLowerCase().includes(searchQuery))
    );
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortType) {
      case "alphabetical":
        return a.term.localeCompare(b.term);
      case "progress":
        return (b.study_progress || 0) - (a.study_progress || 0);
      case "category":
        return a.category.localeCompare(b.category);
      default: // 'newest'
        return new Date(b.last_attempt || 0) - new Date(a.last_attempt || 0);
    }
  });

  const renderUnknownWordsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Незнакомые слова
          </h2>
          <p className="text-sm text-gray-400">
            Всего слов: {filteredWords.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="header-button"
          >
            <Layout size={16} />
          </button>

          <button
            onClick={() => setSortType("newest")}
            className={`header-button ${sortType === "newest" ? "active" : ""}`}
          >
            <Clock size={16} />
            <span>Новые</span>
          </button>

          <button
            onClick={() => setSortType("alphabetical")}
            className={`header-button ${sortType === "alphabetical" ? "active" : ""}`}
          >
            <SortAsc size={16} />
            <span>По алфавиту</span>
          </button>

          <button
            onClick={() =>
              setFilters((f) => ({ ...f, showFavorites: !f.showFavorites }))
            }
            className={`header-button ${filters.showFavorites ? "active" : ""}`}
          >
            <Star size={16} />
            <span>Избранное</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск слов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.progressFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, progressFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Весь прогресс</option>
          <option value="completed">Изучены</option>
          <option value="in-progress">В процессе</option>
          <option value="not-started">Не начаты</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedWords.map((word, index) => (
            <WordList
              key={word.id || index}
              id={word.id} // Убедитесь, что передаете id
              word={word.original}
              translation={word.translation}
              category={word.category}
              attempts={word.attempts}
              lastAttempt={word.last_attempt}
              progress={word.study_progress}
              isFavorite={word.is_favorite}
              onClick={() => {
                if (word && word.original) {
                  setSelectedTerm(word);
                  setIsModalOpen(true);
                }
              }}
              onFavoriteToggle={() => handleFavoriteToggle(word.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="max-w-2xl mx-auto">
      <div className="settings-section">
        <h2 className="settings-title">Настройки генерации</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-primary mb-2">Основная модель</label>
            <div className="settings-group">
              <button
                onClick={() => handleModelChange("ollama")}
                className={`settings-button ${
                  currentModel === "ollama" ? "active" : ""
                }`}
                disabled={!modelOptions.ollama}
              >
                Ollama
              </button>
              <button
                onClick={() => handleModelChange("gemini")}
                className={`settings-button ${
                  currentModel === "gemini" ? "active" : ""
                }`}
              >
                Gemini
              </button>
            </div>
          </div>
          <div>
            <label className="block text-primary mb-2">
              {currentModel === "ollama" ? "Модель Ollama" : "Версия Gemini"}
            </label>
            <select
              value={
                currentModel === "ollama" ? subModel.ollama : subModel.gemini
              }
              onChange={(e) => handleSubModelChange(e.target.value)}
              className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {currentModel === "ollama" ? (
                <option value="llama3.2">Llama 3.2</option>
              ) : (
                <>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-flash-8b">
                    Gemini 1.5 Flash 8B
                  </option>
                </>
              )}
            </select>
          </div>
          {currentModel === "gemini" && (
            <div>
              <label className="block text-primary mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={showApiKey ? apiKey : displayedApiKey}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setApiKey(newValue);
                      setDisplayedApiKey(newValue);
                    }}
                    placeholder="Введите API ключ Gemini"
                    className="w-full bg-dark border border-gray-700 text-text px-4 py-2 pr-10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  onClick={() => handleApiKeyChange(apiKey)}
                  disabled={!apiKey || apiKey === displayedApiKey}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark rounded-lg transition-colors disabled:opacity-50"
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTermBase = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">База терминов</h2>
          <p className="text-sm text-gray-400">
            Все доступные технические термины
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск терминов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.categoryFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, categoryFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Все категории</option>
          {Object.values(categories).map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Добавим проверку на наличие терминов */}
      {Object.keys(allTerms).length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Термины загружаются...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(allTerms)
            .filter(([term, category]) => {
              const termLower = term.toLowerCase();
              const searchLower = searchTerm.toLowerCase();
              const categoryMatch =
                filters.categoryFilter === "all" ||
                category === filters.categoryFilter;

              return categoryMatch && termLower.includes(searchLower);
            })
            .map(([term, category], index) => (
              <div
                key={index}
                className="bg-dark-card border border-gray-800 p-4 rounded-xl hover:border-primary transition-colors"
              >
                <h3 className="text-primary font-medium mb-2">{term}</h3>
                <p className="text-sm text-gray-400">{category}</p>
              </div>
            ))}
        </div>
      )}

      {/* Добавим отладочную информацию */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-dark-card rounded-xl">
          <p className="text-gray-400">Debug Info:</p>
          <p>Terms count: {Object.keys(allTerms).length}</p>
          <p>Categories count: {Object.keys(categories).length}</p>
        </div>
      )}
    </div>
  );

  const renderTasksContent = () => (
    <div className="text-center py-12">
      <h2 className="page-title">Изучение технических терминов</h2>
      <p className="page-subtitle">
        Практикуйтесь в чтении технических текстов и изучайте новые термины
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/assessment"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <ClipboardCheck size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Оценка знаний</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Проверьте свое знание технических терминов
          </p>
        </Link>

        <Link
          to="/learning"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Практика чтения</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Читайте технические тексты в контексте
          </p>
        </Link>

        <Link
          to="/chat-exercise"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Чат с коллегой</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Практикуйте технический английский в диалоге
          </p>
        </Link>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group relative">
          <div
            className="absolute top-4 right-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group/ai">
              <button
                className="w-10 h-5 bg-gray-700 rounded-full flex items-center relative"
                onClick={() => {
                  const newValue = !useAI;
                  setUseAI(newValue);
                  localStorage.setItem("matchingUseAI", newValue);
                }}
              >
                <div
                  className={`absolute w-3 h-3 rounded-full transition-all duration-200 ${
                    useAI
                      ? "translate-x-6 bg-primary"
                      : "translate-x-1 bg-gray-400"
                  }`}
                />
              </button>
              <span className="absolute right-0 top-[-30px] opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap bg-dark-card px-2 py-1 rounded text-xs text-gray-400 border border-gray-700">
                Улучшение перевода с ИИ
              </span>
            </div>
          </div>

          <Link to="/matching">
            <div className="text-primary mb-3">
              <Shuffle size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Найти пару</h3>
            <p className="text-gray-400 text-sm group-hover:text-gray-300">
              Сопоставьте слова с их переводами
            </p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl shadow-xl p-6">
          <div className="border-b border-gray-800 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`${activeTab === "tasks" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Задания
              </button>
              <button
                onClick={() => setActiveTab("unknown-words")}
                className={`${activeTab === "unknown-words" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Незнакомые слова
              </button>
              <button
                onClick={() => setActiveTab("term-base")}
                className={`${activeTab === "term-base" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                База терминов
              </button>
              <button
                onClick={() => setActiveTab("statistics")}
                className={`${activeTab === "statistics" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Статистика
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`${activeTab === "settings" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Настройки
              </button>
            </nav>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "unknown-words" && renderUnknownWordsContent()}
              {activeTab === "statistics" && (
                <StatisticsPanel statistics={statistics} />
              )}
              {activeTab === "tasks" && renderTasksContent()}
              {activeTab === "term-base" && renderTermBase()}
              {activeTab === "settings" && renderSettingsContent()}
            </>
          )}
        </div>
      </div>

      <TermModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        term={selectedTerm?.original} // Изменено с term на original
        translation={selectedTerm?.translation}
        category={selectedTerm?.category}
      />
    </div>
  );
};

export default Dashboard;
```

Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools react-dom.development.js:29895
Loaded terms:
Object { "ACID properties": "Data Engineering -> Data Storage", "API endpoint": "MLOps -> Model Deployment", "API gateway": "DevOps -> Cloud Computing", "AVL tree": "Programming Basics -> Algorithms and data structures", AWS: "DevOps -> Cloud Computing", CNN: "Machine Learning -> Computer Vision", DOM: "Web Development -> Frontend", Docker: "DevOps -> Containerization and Orchestration", ETL: "Data Engineering -> Big Data", "GitLab CI": "DevOps -> CI/CD", … }
Dashboard.js:120
Fetched words:
Array(4) [ {…}, {…}, {…}, {…} ]
Dashboard.js:136
Toggling favorite for term ID: 357 WordList.js:61
Server response:
Object { is_favorite: true, status: "success", term_id: 357 }
WordList.js:68
Dashboard - Toggling favorite for term: 357 Dashboard.js:157
Dashboard - Server response:
Object { is_favorite: false, status: "success", term_id: 357 }
Dashboard.js:164
Dashboard - Before update:
Array(4) [ {…}, {…}, {…}, {…} ]
Dashboard.js:167
Dashboard - Updating word: 357 false Dashboard.js:171
Fetched words:
Array(4) [ {…}, {…}, {…}, {…} ]
Dashboard.js:136

```py eng4IT/backend/app/app.py
# backend/app/app.py
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import json
import logging
import os
import random

import requests

# В начале файла app.py после импортов
from database.db import AssessmentWord, ModelConfig, Scenario, Session, init_db
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from models.base import Category, LearningHistory, Subcategory, Term, UnknownTerm, StudySession
from services.gemini_service import GeminiService
from services.ollama_service import KnowledgeEvaluator
from services.translation_service import translator

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Включаем CORS для работы с React

WORDS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'words'
)
UNKNOWN_WORDS_FILE = os.path.join(WORDS_DIR, 'unknown_words.txt')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Создаем необходимые директории и файлы
if not os.path.exists(WORDS_DIR):
    os.makedirs(WORDS_DIR)
if not os.path.exists(UNKNOWN_WORDS_FILE):
    with open(UNKNOWN_WORDS_FILE, 'w', encoding='utf-8') as f:
        pass

# Инициализация сервисов
ollama_service = KnowledgeEvaluator(
    os.path.join(WORDS_DIR, 'categorized_words.md')
)
gemini_service = GeminiService(GEMINI_API_KEY)


def initialize_assessment_words():
    """Инициализация базы данных словами из файла."""
    session = Session()
    try:
        # Проверяем, есть ли уже слова в базе
        existing_count = session.query(AssessmentWord).count()
        if existing_count > 0:
            logger.info(f'Database already contains {existing_count} words')
            return

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        if not os.path.exists(words_file):
            logger.error('Words file not found')
            return

        current_category = None
        current_subcategory = None
        words_added = 0

        with open(words_file, 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if line.startswith('# '):
                    current_category = line[2:].strip()
                elif line.startswith('## '):
                    current_subcategory = line[3:].strip()
                elif line.startswith('- '):
                    word = line[2:].strip()
                    if current_category and current_subcategory:
                        # Проверяем существование термина перед добавлением
                        existing_term = session.query(Term).filter_by(term=word).first()
                        if not existing_term:
                            # Добавляем в AssessmentWord
                            assessment_word = AssessmentWord(
                                word=word,
                                category=f'{current_category} -> {current_subcategory}',
                            )
                            session.add(assessment_word)

                            # Добавляем в Term без перевода
                            term = Term(
                                term=word,
                                translation=word,  # Используем само слово как временный перевод
                                category=f'{current_category} -> {current_subcategory}',
                                term_metadata={
                                    'source': 'initial_load',
                                    'added_at': datetime.now().isoformat(),
                                }
                            )
                            session.add(term)
                            session.flush()

                            words_added += 1

        session.commit()
        logger.info(f'Added {words_added} words to database')

    except Exception as e:
        logger.error(f'Error initializing assessment words: {e}')
        session.rollback()
    finally:
        session.close()

# Инициализация базы данных словами
initialize_assessment_words()


def get_current_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            api_key = os.getenv('GEMINI_API_KEY')
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                has_api_key=bool(api_key),
            )
            session.add(config)
            session.commit()
        return config.current_model, os.getenv('GEMINI_API_KEY')
    finally:
        session.close()


def check_available_models():
    available_models = {
        'gemini': bool(os.getenv('GEMINI_API_KEY')),
        'ollama': False,  # По умолчанию недоступна
    }

    try:
        # Проверяем доступность Ollama
        response = requests.get('http://localhost:11434/api/tags')
        if response.status_code == 200:
            available_models['ollama'] = True
    except:
        pass

    return available_models


@app.route('/api/model/current', methods=['GET'])
def get_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
            session.commit()

        api_key = os.getenv('GEMINI_API_KEY')
        return jsonify(
            {
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': bool(api_key),
                'api_key': api_key if api_key else None,
            }
        )
    finally:
        session.close()


@app.route('/api/all-terms', methods=['GET'])
def get_all_terms():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            # Получаем все термины из базы данных
            terms = session.query(Term).all()

            # Формируем словарь с терминами
            terms_dict = {
                term.term: term.category
                for term in terms
            }

            if not terms_dict:
                logger.warning('No terms found in database')

            return jsonify(terms_dict)

        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error getting all terms: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain-term', methods=['POST'])
def explain_term():
    data = request.json
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    category = data.get('category')

    # Выбираем сервис в зависимости от текущей модели
    current_model, api_key = get_current_model()

    try:
        logger.info(f'Explaining term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for explanation')
            gemini_service = GeminiService(api_key)
            try:
                response = gemini_service.explain_term(term, category)
                explanation = response.strip()
                return jsonify({'explanation': explanation})
            except Exception as e:
                logger.error(f'Gemini explanation failed: {e}')
                # Возвращаем ошибку, если Gemini не сработал
                return jsonify(
                    {
                        'error': 'Failed to generate explanation with Gemini. Please check your API key or try again later.'
                    }
                ), 500
        else:
            # Если модель не Gemini или нет API ключа, возвращаем сообщение об ошибке
            return jsonify(
                {
                    'error': 'Gemini API key is required for term explanation. Please configure it in settings.'
                }
            ), 400

    except Exception as e:
        logger.error(f'Error explaining term: {e}')
        return jsonify({'error': 'Failed to generate explanation'}), 500


@app.route('/api/unknown-words', methods=['GET'])
def get_unknown_words():
    try:
        session = Session()
        try:
            unknown_terms = (
                session.query(Term, UnknownTerm)
                .join(UnknownTerm)
                .order_by(UnknownTerm.created_at.desc())
                .all()
            )

            words = [
                {
                    'id': term.id,
                    'original': term.term,
                    'translation': term.translation,
                    'category': term.category,
                    'attempts': unknown.attempts,
                    'is_favorite': term.is_favorite,  # Убедитесь, что это поле передается
                    'last_attempt': unknown.last_attempt.isoformat() if unknown.last_attempt else None,
                    'study_progress': term.study_progress
                }
                for term, unknown in unknown_terms
            ]

            logger.info(f"Returning words with favorites: {[(w['original'], w['is_favorite']) for w in words]}")
            return jsonify(words)
        finally:
            session.close()
    except Exception as e:
        logger.error(f'Error getting unknown words: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/set', methods=['POST'])
def set_model():
    data = request.json
    model_name = data.get('model')
    sub_model = data.get('sub_model')
    api_key = data.get('api_key')

    if model_name not in ['ollama', 'gemini']:
        return jsonify({'error': 'Invalid model name'}), 400

    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model=model_name,
                sub_model=sub_model,
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
        else:
            config.current_model = model_name
            config.sub_model = sub_model
            config.has_api_key = bool(os.getenv('GEMINI_API_KEY'))

        session.commit()
        return jsonify(
            {
                'status': 'success',
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': config.has_api_key,
            }
        )
    finally:
        session.close()


@app.route('/api/scenario', methods=['GET'])
def get_scenario():
    session = Session()
    try:
        scenario = (
            session.query(Scenario).order_by(Scenario.created_at.desc()).first()
        )

        if not scenario:
            words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
            selected_words, categories = ollama_service._select_random_words()

            current_model, _ = get_current_model()
            service = (
                gemini_service if current_model == 'gemini' else ollama_service
            )
            result = service.generate_evaluation_text(selected_words, categories)

            scenario = Scenario(
                text=result['text'], terms=json.dumps(result['categories'])
            )
            session.add(scenario)
            session.commit()

        return jsonify(
            {'text': scenario.text, 'categories': json.loads(scenario.terms)}
        )
    finally:
        session.close()


@app.route('/api/generate_new', methods=['POST'])
def generate_new():
    session = Session()
    try:
        current_model, api_key = get_current_model()
        logger.info(f'Generating new scenario with model: {current_model}')

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        evaluator = KnowledgeEvaluator(words_file)
        selected_words, categories = evaluator._select_random_words()

        result = None
        error_message = None

        try:
            if current_model == 'gemini' and api_key:
                logger.info('Using Gemini for generation')
                gemini_service = GeminiService(api_key)
                result = gemini_service.generate_evaluation_text(
                    selected_words, categories
                )
            else:
                logger.info('Using Ollama for generation')
                result = evaluator.generate_evaluation_text(
                    selected_words, categories
                )

            if not result or not result.get('text'):
                error_message = 'Empty result from generation service'

        except Exception as e:
            error_message = f'Generation error: {str(e)}'
            logger.error(error_message)

        if error_message:
            # Возвращаем информативное сообщение об ошибке
            return jsonify(
                {
                    'text': f'Service temporarily unavailable. {error_message}',
                    'categories': categories,
                    'error': error_message,
                }
            ), 503  # Service Unavailable

        new_scenario = Scenario(
            text=result['text'], terms=json.dumps(result['categories'])
        )
        session.add(new_scenario)
        session.commit()

        return jsonify(
            {
                'text': new_scenario.text,
                'categories': json.loads(new_scenario.terms),
            }
        )

    finally:
        session.close()


@app.route('/api/translate', methods=['POST'])
def translate_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'ru')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        translation = translator.translate(text, source_lang, target_lang)
        return jsonify({'translation': translation})

    except Exception as e:
        print(f'Translation error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/save_words', methods=['POST'])
def save_words():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            words = request.get_json()['words']
            if not words:
                return jsonify({'error': 'No words provided'}), 400

            for word_data in words:
                if 'original' in word_data and 'translation' in word_data:
                    term = Term(
                        term=word_data['original'],
                        translation=word_data['translation'],
                        category=word_data.get('category', 'Unknown'),
                        term_metadata={  # Изменено с metadata на term_metadata
                            'source': 'learning_interface',
                            'added_at': datetime.now().isoformat(),
                        },
                    )
                    session.add(term)
                    session.flush()

                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now(),
                    )
                    session.add(unknown_term)

            session.commit()
            return jsonify({'status': 'success'})

        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error saving words: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/assessment-words', methods=['GET'])
def get_assessment_words():
    try:
        session = Session()

        # Проверяем количество слов в базе
        total_words = session.query(AssessmentWord).count()
        if total_words == 0:
            # Если база пуста, пробуем заполнить её
            initialize_assessment_words()
            total_words = session.query(AssessmentWord).count()
            if total_words == 0:
                return jsonify(
                    {'error': 'No words available for assessment', 'words': []}
                ), 404

        # Получаем существующие неизвестные слова
        existing_words = set()
        if os.path.exists(UNKNOWN_WORDS_FILE):
            with open(UNKNOWN_WORDS_FILE, 'r', encoding='utf-8') as file:
                for line in file:
                    if ':::' in line:
                        word = line.split(':::')[0].strip()
                        existing_words.add(word)

        # Получаем слова из базы, которых нет в списке неизвестных
        available_words = session.query(AssessmentWord).all()
        filtered_words = [
            word for word in available_words if word.word not in existing_words
        ]

        if not filtered_words:
            return jsonify(
                {'message': 'All available words have been assessed', 'words': []}
            )

        # Выбираем случайные слова
        selected_words = random.sample(filtered_words, min(5, len(filtered_words)))

        words_response = [
            {'id': word.id, 'term': word.word, 'category': word.category}
            for word in selected_words
        ]

        return jsonify({'words': words_response})

    except Exception as e:
        logger.error(f'Error getting assessment words: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/assessment-results', methods=['POST'])
def save_assessment_results():
    session = Session()
    try:
        data = request.get_json()
        unknown_words = data.get('unknownWords', [])
        logger.info(f"Processing unknown words: {unknown_words}")

        words_added = 0

        for word in unknown_words:
            try:
                # Получаем перевод
                translation = translator.translate(word['term'], 'en', 'ru')
                logger.info(f"Got translation for {word['term']}: {translation}")
            except Exception as e:
                logger.error(f"Translation failed for {word['term']}: {e}")
                translation = word['term']

            try:
                # Проверяем существование термина
                existing_term = session.query(Term).filter_by(term=word['term']).first()

                if existing_term:
                    logger.info(f"Term already exists: {word['term']}")
                    # Проверяем, есть ли уже запись в UnknownTerm
                    unknown_exists = session.query(UnknownTerm).filter_by(term_id=existing_term.id).first()

                    if not unknown_exists:
                        # Если термин есть, но его нет в unknown_terms - добавляем
                        existing_term.translation = translation
                        unknown_term = UnknownTerm(
                            term_id=existing_term.id,
                            attempts=0,
                            last_attempt=datetime.now()
                        )
                        session.add(unknown_term)
                        words_added += 1
                else:
                    logger.info(f"Adding new term: {word['term']}")

                    # Создаем новый термин
                    term = Term(
                        term=word['term'],
                        translation=translation,  # Временно используем оригинал как перевод
                        category=word['category'],
                        term_metadata={
                            'source': 'assessment',
                            'added_at': datetime.now().isoformat(),
                        }
                    )
                    session.add(term)
                    session.flush()

                    # Создаем запись неизвестного термина
                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now()
                    )
                    session.add(unknown_term)
                    words_added += 1

            except Exception as e:
                logger.error(f"Error processing word {word['term']}: {e}")
                continue

        session.commit()
        logger.info(f"Successfully added {words_added} words to unknown terms")
        return jsonify({
            'status': 'success',
            'words_added': words_added
        })

    except Exception as e:
        logger.error(f'Error saving assessment results: {e}')
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/translate-term', methods=['POST'])
def translate_term():
    data = request.json
    logger.info(f'Received data for translation: {data}')
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    explanation = data.get('explanation', '')

    logger.info(f'Processing term: {term}, explanation: {explanation}')

    current_model, api_key = get_current_model()

    prompt = f"""
    Translate the following technical term and its explanation to Russian.
    Make the translation clear and professionally accurate.

    Term: {term} \n\n

    {f"Explanation: {explanation}" if explanation else ""}

    Format the response as:

    Term: [translated term] \n\n
    {"Explanation: [translated explanation]" if explanation else ""}
    """

    try:
        logger.info(f'Translating term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for translation')
            gemini_service = GeminiService(api_key)
            try:
                translation = gemini_service.translate_text(prompt)
            except Exception as e:
                logger.error(f'Gemini translation failed: {e}')
                # Fallback на Ollama
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                response = service.llm.invoke(prompt)
                translation = response.content
        else:
            # Используем Ollama
            logger.info('Using Ollama for translation')
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )
            response = service.llm.invoke(prompt)
            translation = response.content

        return jsonify({'translation': translation.strip()})
    except Exception as e:
        logger.error(f'Error translating term: {e}')
        return jsonify({'error': 'Failed to translate'}), 500


@app.route('/api/available-models', methods=['GET'])
def get_available_models():
    return jsonify(check_available_models())


@app.route('/api/categorize-words', methods=['POST'])
def categorize_words():
    data = request.json
    words = data.get('words', [])

    if not words:
        return jsonify({'error': 'No words provided'}), 400

    try:
        session = Session()
        # Получаем все категории и подкатегории из БД
        categories = session.query(Category).all()
        categories_dict = {}

        for category in categories:
            subcategories = [sub.name for sub in category.subcategories]
            categories_dict[category.name] = subcategories

        # Формируем текст с категориями для промпта
        categories_text = '\n'.join(
            [
                f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                for cat, subs in categories_dict.items()
            ]
        )

        # Если категорий нет, создаем базовые
        if not categories_dict:
            default_categories = [
                ('Programming', ['General', 'Algorithms', 'Data Structures']),
                ('Web Development', ['Frontend', 'Backend', 'APIs']),
                ('Databases', ['SQL', 'NoSQL', 'Design']),
            ]

            for cat_name, subcats in default_categories:
                category = Category(name=cat_name)
                session.add(category)
                session.flush()

                for subcat_name in subcats:
                    subcategory = Subcategory(
                        name=subcat_name, category_id=category.id
                    )
                    session.add(subcategory)

            session.commit()

            # Обновляем текст категорий
            categories_text = '\n'.join(
                [
                    f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                    for cat, subs in default_categories
                ]
            )

        prompt = f"""Given these existing categories and their subcategories:
        {categories_text}

        Please categorize the following words by assigning them to either existing or new categories.
        Words to categorize: {', '.join([w['original'] for w in words])}

        Return the results in the format:
        word1: Category -> Subcategory
        word2: Category -> Subcategory
        ...

        Important:
        - Use existing categories when possible
        - Create new categories only if really necessary
        - Always use the format "Category -> Subcategory"
        """

        # Получаем текущую модель и ключ API
        current_model, api_key = get_current_model()

        try:
            if current_model == 'gemini' and api_key:
                categorization = gemini_service.categorize_words(prompt)
            else:
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                categorization = service.categorize_words(prompt)

            # Парсим результат и добавляем новые категории если нужно
            categorized_words = []
            for word in words:
                word_category = None

                # Ищем категоризацию для текущего слова
                for line in categorization.strip().split('\n'):
                    if ':' in line and '->' in line:
                        cat_word, category = line.split(':', 1)
                        if cat_word.strip().lower() == word['original'].lower():
                            word_category = category.strip()
                            break

                if word_category and '->' in word_category:
                    cat_name, subcat_name = [
                        x.strip() for x in word_category.split('->')
                    ]

                    # Проверяем существование категории
                    category = (
                        session.query(Category).filter_by(name=cat_name).first()
                    )
                    if not category:
                        category = Category(name=cat_name)
                        session.add(category)
                        session.flush()

                    # Проверяем существование подкатегории
                    subcategory = (
                        session.query(Subcategory)
                        .filter_by(category_id=category.id, name=subcat_name)
                        .first()
                    )
                    if not subcategory:
                        subcategory = Subcategory(
                            name=subcat_name, category_id=category.id
                        )
                        session.add(subcategory)

                    word['category'] = f'{cat_name} -> {subcat_name}'
                else:
                    word['category'] = 'Programming -> General'

                categorized_words.append(word)

            session.commit()
            return jsonify({'words': categorized_words})

        except Exception as e:
            logger.error(f'Error during categorization: {e}')
            session.rollback()
            # В случае ошибки используем базовую категорию
            return jsonify(
                {
                    'words': [
                        {**w, 'category': 'Programming -> General'} for w in words
                    ]
                }
            )

    except Exception as e:
        logger.error(f'Error in categorize_words: {e}')
        if 'session' in locals():
            session.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        if 'session' in locals():
            session.close()


@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        session = Session()
        categories = session.query(Category).all()

        result = {}
        for category in categories:
            result[category.name] = [sub.name for sub in category.subcategories]

        return jsonify(result)

    except Exception as e:
        logger.error(f'Error getting categories: {e}')
        return jsonify({'error': str(e)}), 500

    finally:
        session.close()


@app.route('/api/chat-exercise', methods=['GET'])
def get_chat_exercise():
    try:
        session = Session()
        current_model, api_key = get_current_model()

        # Получаем неизвестные слова
        unknown_terms = session.query(Term).join(UnknownTerm).all()

        if current_model == 'gemini' and api_key:
            service = GeminiService(api_key)
        else:
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )

        # Генерируем диалог
        terms_for_dialogue = random.sample(
            unknown_terms, min(10, len(unknown_terms))
        )
        dialogue = service.generate_dialogue(terms_for_dialogue)

        return jsonify(dialogue)

    except Exception as e:
        logger.error(f'Error generating chat exercise: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/matching-pairs', methods=['GET'])
def get_matching_pairs():
    use_ai = request.args.get('useAI') == 'true'
    pairs_count = 15
    session = Session()
    try:
        # Получаем все термины
        terms = session.query(Term).all()

        # Если терминов мало, добавляем базовые
        if len(terms) < pairs_count:
            basic_terms = [
                {"term": "database", "translation": "база данных"},
                {"term": "algorithm", "translation": "алгоритм"},
                {"term": "framework", "translation": "фреймворк"},
                {"term": "interface", "translation": "интерфейс"},
                {"term": "variable", "translation": "переменная"},
                {"term": "function", "translation": "функция"},
                {"term": "array", "translation": "массив"},
                {"term": "string", "translation": "строка"},
                {"term": "object", "translation": "объект"},
                {"term": "class", "translation": "класс"},
                {"term": "method", "translation": "метод"},
                {"term": "property", "translation": "свойство"},
                {"term": "inheritance", "translation": "наследование"},
                {"term": "polymorphism", "translation": "полиморфизм"},
                {"term": "encapsulation", "translation": "инкапсуляция"},
                {"term": "abstraction", "translation": "абстракция"},
                {"term": "debugging", "translation": "отладка"},
                {"term": "compiler", "translation": "компилятор"},
                {"term": "runtime", "translation": "время выполнения"},
                {"term": "memory", "translation": "память"}
            ]
            for term_data in basic_terms:
                term = Term(
                    term=term_data["term"],
                    translation=term_data["translation"],
                    category="Programming -> General"
                )
                session.add(term)
            session.commit()
            terms = session.query(Term).all()

        # Выбираем 20 случайных терминов
        selected_terms = random.sample(terms, min(pairs_count, len(terms)))  # Убедитесь, что здесь 20

        # Формируем пары БЕЗ перемешивания
        pairs = [
            {
                'english': term.term,
                'russian': term.translation
            }
            for term in selected_terms
        ]

        if use_ai:
            try:
                current_model, api_key = get_current_model()
                if current_model == 'gemini' and api_key:
                    service = GeminiService(api_key)
                    result = service.improve_translations({'pairs': pairs}, pairs_count=pairs_count)
                    if result and 'english' in result and 'russian' in result:
                        return jsonify({
                            'english': result['english'],
                            'russian': result['russian']
                        })
            except Exception as e:
                logger.error(f'Error improving translations: {e}')

        return jsonify({
            'english': [p['english'] for p in pairs],
            'russian': [p['russian'] for p in pairs]
        })

    except Exception as e:
        logger.error(f'Error getting matching pairs: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/progress', methods=['POST'])
def update_progress():
    """Update study progress for a term"""
    data = request.json
    term_id = data.get('term_id')
    progress = data.get('progress')

    session = Session()
    try:
        term = session.query(Term).get(term_id)
        if not term:
            return jsonify({'error': 'Term not found'}), 404

        term.study_progress = progress
        term.last_reviewed = datetime.utcnow()
        term.review_count += 1

        # Add study session
        study_session = StudySession(
            term_id=term_id,
            success_rate=progress,
            time_spent=data.get('time_spent', 0),
            session_type=data.get('session_type', 'review'),
            session_metadata=data.get('metadata', {})
        )
        session.add(study_session)
        session.commit()

        return jsonify({'status': 'success', 'progress': progress})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/statistics', methods=['GET'])
def get_statistics():
    """Get learning statistics"""
    try:
        session = Session()
        # Получаем общую статистику
        total_terms = session.query(Term).count()
        favorites = session.query(Term).filter(Term.is_favorite == True).count()
        completed = session.query(Term).filter(Term.study_progress == 100).count()
        in_progress = session.query(Term).filter(
            Term.study_progress > 0,
            Term.study_progress < 100
        ).count()

        # Получаем прогресс по категориям
        category_progress = []
        categories = session.query(Term.category).distinct().all()
        for (category,) in categories:
            terms = session.query(Term).filter(Term.category == category).all()
            if terms:
                avg_progress = sum(term.study_progress or 0 for term in terms) / len(terms)
                category_progress.append({
                    'category': category,
                    'progress': float(avg_progress),
                    'count': len(terms)
                })

        # Получаем недавнюю активность
        recent_sessions = session.query(StudySession)\
            .order_by(StudySession.created_at.desc())\
            .limit(10)\
            .all()

        recent_activity = [
            {
                'date': session.created_at.isoformat(),
                'success_rate': session.success_rate,
                'type': session.session_type
            } for session in recent_sessions
        ]

        return jsonify({
            'overview': {
                'total_terms': total_terms,
                'favorites': favorites,
                'completed': completed,
                'in_progress': in_progress
            },
            'category_progress': category_progress,
            'recent_activity': recent_activity,
            'learning_curve': [] # Добавьте реальные данные если необходимо
        })
    except Exception as e:
        logger.error(f'Error getting statistics: {e}')
        return jsonify({
            'overview': {
                'total_terms': 0,
                'favorites': 0,
                'completed': 0,
                'in_progress': 0
            },
            'category_progress': [],
            'recent_activity': [],
            'learning_curve': []
        }), 200  # Возвращаем пустые данные вместо 500 ошибки
    finally:
        session.close()

@app.route('/api/categories/tree', methods=['GET'])
def get_category_tree():
    """Get category tree structure"""
    session = Session()
    try:
        def build_tree(parent_id=None):
            categories = session.query(Category)\
                .filter(Category.parent_id == parent_id)\
                .order_by(Category.order)\
                .all()

            return [
                {
                    'id': cat.id,
                    'name': cat.name,
                    'level': cat.level,
                    'metadata': cat.category_metadata,  # Обновлено здесь
                    'children': build_tree(cat.id)
                }
                for cat in categories
            ]

        tree = build_tree()
        return jsonify({'categories': tree})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    """Toggle favorite status for a term"""
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        logger.error("No term_id provided in request")
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            logger.error(f"Term not found with id: {term_id}")
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение is_favorite
        term.is_favorite = not term.is_favorite
        logger.info(f"Setting is_favorite to {term.is_favorite} for term {term_id}")

        # Сохраняем изменения
        session.commit()

        # Возвращаем обновленный статус
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.id
        })
    except Exception as e:
        session.rollback()
        logger.error(f'Error toggling favorite: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

# Перед app.run()
if __name__ == '__main__':
    # Инициализируем базу данных
    init_db()
    app.run(debug=True)
```



Посмотрев на логи и код, я вижу несоответствие в ответах между сервером и клиентом.

1. В WordList.js приходит `Server response: { is_favorite: true, status: "success", term_id: 357 }`
2. Но в Dashboard.js приходит `Server response: { is_favorite: false, status: "success", term_id: 357 }`

Это происходит потому, что состояния не синхронизируются правильно. Давайте исправим:

1. В WordList.js:
```javascript
const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      console.log("Toggling favorite for term ID:", id);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: id,
        }
      );

      if (response.data.status === "success") {
        // Вызываем callback с новым значением is_favorite
        onFavoriteToggle(response.data.term_id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Error updating favorite status");
    }
};
```

2. В Dashboard.js изменим handleFavoriteToggle:
```javascript
const handleFavoriteToggle = async (termId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        }
      );

      if (response.data.status === "success") {
        // Обновляем состояние только для этого термина
        const newFavoriteStatus = response.data.is_favorite;

        setUnknownWords((prevWords) =>
          prevWords.map((word) =>
            word.id === termId
              ? { ...word, is_favorite: newFavoriteStatus }
              : word
          )
        );

        // Перезагружаем список если включен фильтр избранного
        if (filters.showFavorites) {
          await fetchUnknownWords();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
};
```

3. В app.py (обновим логирование):
```python
@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение
        term.is_favorite = not term.is_favorite
        session.commit()

        logger.info(f"Updated term {term_id} is_favorite to: {term.is_favorite}")

        # Возвращаем обновленное значение
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.id
        })

    except Exception as e:
        session.rollback()
        logger.error(f'Error toggling favorite: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()
```

Эти изменения должны:
1. Обеспечить корректную передачу состояния is_favorite от сервера к клиенту
2. Синхронизировать состояние между WordList и Dashboard
3. Правильно обновлять UI при изменении избранного статуса
4. Корректно работать с фильтром избранного

После внесения изменений состояние избранного должно сохраняться и корректно отображаться в интерфейсе.

```py eng4IT/backend/app/app.py
# backend/app/app.py
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import json
import logging
import os
import random

import requests

# В начале файла app.py после импортов
from database.db import AssessmentWord, ModelConfig, Scenario, Session, init_db
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from models.base import Category, LearningHistory, Subcategory, Term, UnknownTerm, StudySession
from services.gemini_service import GeminiService
from services.ollama_service import KnowledgeEvaluator
from services.translation_service import translator

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Включаем CORS для работы с React

WORDS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'words'
)
UNKNOWN_WORDS_FILE = os.path.join(WORDS_DIR, 'unknown_words.txt')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Создаем необходимые директории и файлы
if not os.path.exists(WORDS_DIR):
    os.makedirs(WORDS_DIR)
if not os.path.exists(UNKNOWN_WORDS_FILE):
    with open(UNKNOWN_WORDS_FILE, 'w', encoding='utf-8') as f:
        pass

# Инициализация сервисов
ollama_service = KnowledgeEvaluator(
    os.path.join(WORDS_DIR, 'categorized_words.md')
)
gemini_service = GeminiService(GEMINI_API_KEY)


def initialize_assessment_words():
    """Инициализация базы данных словами из файла."""
    session = Session()
    try:
        # Проверяем, есть ли уже слова в базе
        existing_count = session.query(AssessmentWord).count()
        if existing_count > 0:
            logger.info(f'Database already contains {existing_count} words')
            return

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        if not os.path.exists(words_file):
            logger.error('Words file not found')
            return

        current_category = None
        current_subcategory = None
        words_added = 0

        with open(words_file, 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if line.startswith('# '):
                    current_category = line[2:].strip()
                elif line.startswith('## '):
                    current_subcategory = line[3:].strip()
                elif line.startswith('- '):
                    word = line[2:].strip()
                    if current_category and current_subcategory:
                        # Проверяем существование термина перед добавлением
                        existing_term = session.query(Term).filter_by(term=word).first()
                        if not existing_term:
                            # Добавляем в AssessmentWord
                            assessment_word = AssessmentWord(
                                word=word,
                                category=f'{current_category} -> {current_subcategory}',
                            )
                            session.add(assessment_word)

                            # Добавляем в Term без перевода
                            term = Term(
                                term=word,
                                translation=word,  # Используем само слово как временный перевод
                                category=f'{current_category} -> {current_subcategory}',
                                term_metadata={
                                    'source': 'initial_load',
                                    'added_at': datetime.now().isoformat(),
                                }
                            )
                            session.add(term)
                            session.flush()

                            words_added += 1

        session.commit()
        logger.info(f'Added {words_added} words to database')

    except Exception as e:
        logger.error(f'Error initializing assessment words: {e}')
        session.rollback()
    finally:
        session.close()

# Инициализация базы данных словами
initialize_assessment_words()


def get_current_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            api_key = os.getenv('GEMINI_API_KEY')
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                has_api_key=bool(api_key),
            )
            session.add(config)
            session.commit()
        return config.current_model, os.getenv('GEMINI_API_KEY')
    finally:
        session.close()


def check_available_models():
    available_models = {
        'gemini': bool(os.getenv('GEMINI_API_KEY')),
        'ollama': False,  # По умолчанию недоступна
    }

    try:
        # Проверяем доступность Ollama
        response = requests.get('http://localhost:11434/api/tags')
        if response.status_code == 200:
            available_models['ollama'] = True
    except:
        pass

    return available_models


@app.route('/api/model/current', methods=['GET'])
def get_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
            session.commit()

        api_key = os.getenv('GEMINI_API_KEY')
        return jsonify(
            {
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': bool(api_key),
                'api_key': api_key if api_key else None,
            }
        )
    finally:
        session.close()


@app.route('/api/all-terms', methods=['GET'])
def get_all_terms():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            # Получаем все термины из базы данных
            terms = session.query(Term).all()

            # Формируем словарь с терминами
            terms_dict = {
                term.term: term.category
                for term in terms
            }

            if not terms_dict:
                logger.warning('No terms found in database')

            return jsonify(terms_dict)

        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error getting all terms: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain-term', methods=['POST'])
def explain_term():
    data = request.json
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    category = data.get('category')

    # Выбираем сервис в зависимости от текущей модели
    current_model, api_key = get_current_model()

    try:
        logger.info(f'Explaining term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for explanation')
            gemini_service = GeminiService(api_key)
            try:
                response = gemini_service.explain_term(term, category)
                explanation = response.strip()
                return jsonify({'explanation': explanation})
            except Exception as e:
                logger.error(f'Gemini explanation failed: {e}')
                # Возвращаем ошибку, если Gemini не сработал
                return jsonify(
                    {
                        'error': 'Failed to generate explanation with Gemini. Please check your API key or try again later.'
                    }
                ), 500
        else:
            # Если модель не Gemini или нет API ключа, возвращаем сообщение об ошибке
            return jsonify(
                {
                    'error': 'Gemini API key is required for term explanation. Please configure it in settings.'
                }
            ), 400

    except Exception as e:
        logger.error(f'Error explaining term: {e}')
        return jsonify({'error': 'Failed to generate explanation'}), 500


@app.route('/api/unknown-words', methods=['GET'])
def get_unknown_words():
    try:
        session = Session()
        try:
            unknown_terms = (
                session.query(Term, UnknownTerm)
                .join(UnknownTerm)
                .order_by(UnknownTerm.created_at.desc())
                .all()
            )

            words = [
                {
                    'id': term.id,
                    'original': term.term,
                    'translation': term.translation,
                    'category': term.category,
                    'attempts': unknown.attempts,
                    'is_favorite': term.is_favorite,  # Убедитесь, что это поле передается
                    'last_attempt': unknown.last_attempt.isoformat() if unknown.last_attempt else None,
                    'study_progress': term.study_progress
                }
                for term, unknown in unknown_terms
            ]

            logger.info(f"Returning words with favorites: {[(w['original'], w['is_favorite']) for w in words]}")
            return jsonify(words)
        finally:
            session.close()
    except Exception as e:
        logger.error(f'Error getting unknown words: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/set', methods=['POST'])
def set_model():
    data = request.json
    model_name = data.get('model')
    sub_model = data.get('sub_model')
    api_key = data.get('api_key')

    if model_name not in ['ollama', 'gemini']:
        return jsonify({'error': 'Invalid model name'}), 400

    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model=model_name,
                sub_model=sub_model,
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
        else:
            config.current_model = model_name
            config.sub_model = sub_model
            config.has_api_key = bool(os.getenv('GEMINI_API_KEY'))

        session.commit()
        return jsonify(
            {
                'status': 'success',
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': config.has_api_key,
            }
        )
    finally:
        session.close()


@app.route('/api/scenario', methods=['GET'])
def get_scenario():
    session = Session()
    try:
        scenario = (
            session.query(Scenario).order_by(Scenario.created_at.desc()).first()
        )

        if not scenario:
            words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
            selected_words, categories = ollama_service._select_random_words()

            current_model, _ = get_current_model()
            service = (
                gemini_service if current_model == 'gemini' else ollama_service
            )
            result = service.generate_evaluation_text(selected_words, categories)

            scenario = Scenario(
                text=result['text'], terms=json.dumps(result['categories'])
            )
            session.add(scenario)
            session.commit()

        return jsonify(
            {'text': scenario.text, 'categories': json.loads(scenario.terms)}
        )
    finally:
        session.close()


@app.route('/api/generate_new', methods=['POST'])
def generate_new():
    session = Session()
    try:
        current_model, api_key = get_current_model()
        logger.info(f'Generating new scenario with model: {current_model}')

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        evaluator = KnowledgeEvaluator(words_file)
        selected_words, categories = evaluator._select_random_words()

        result = None
        error_message = None

        try:
            if current_model == 'gemini' and api_key:
                logger.info('Using Gemini for generation')
                gemini_service = GeminiService(api_key)
                result = gemini_service.generate_evaluation_text(
                    selected_words, categories
                )
            else:
                logger.info('Using Ollama for generation')
                result = evaluator.generate_evaluation_text(
                    selected_words, categories
                )

            if not result or not result.get('text'):
                error_message = 'Empty result from generation service'

        except Exception as e:
            error_message = f'Generation error: {str(e)}'
            logger.error(error_message)

        if error_message:
            # Возвращаем информативное сообщение об ошибке
            return jsonify(
                {
                    'text': f'Service temporarily unavailable. {error_message}',
                    'categories': categories,
                    'error': error_message,
                }
            ), 503  # Service Unavailable

        new_scenario = Scenario(
            text=result['text'], terms=json.dumps(result['categories'])
        )
        session.add(new_scenario)
        session.commit()

        return jsonify(
            {
                'text': new_scenario.text,
                'categories': json.loads(new_scenario.terms),
            }
        )

    finally:
        session.close()


@app.route('/api/translate', methods=['POST'])
def translate_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'ru')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        translation = translator.translate(text, source_lang, target_lang)
        return jsonify({'translation': translation})

    except Exception as e:
        print(f'Translation error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/save_words', methods=['POST'])
def save_words():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            words = request.get_json()['words']
            if not words:
                return jsonify({'error': 'No words provided'}), 400

            for word_data in words:
                if 'original' in word_data and 'translation' in word_data:
                    term = Term(
                        term=word_data['original'],
                        translation=word_data['translation'],
                        category=word_data.get('category', 'Unknown'),
                        term_metadata={  # Изменено с metadata на term_metadata
                            'source': 'learning_interface',
                            'added_at': datetime.now().isoformat(),
                        },
                    )
                    session.add(term)
                    session.flush()

                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now(),
                    )
                    session.add(unknown_term)

            session.commit()
            return jsonify({'status': 'success'})

        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error saving words: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/assessment-words', methods=['GET'])
def get_assessment_words():
    try:
        session = Session()

        # Проверяем количество слов в базе
        total_words = session.query(AssessmentWord).count()
        if total_words == 0:
            # Если база пуста, пробуем заполнить её
            initialize_assessment_words()
            total_words = session.query(AssessmentWord).count()
            if total_words == 0:
                return jsonify(
                    {'error': 'No words available for assessment', 'words': []}
                ), 404

        # Получаем существующие неизвестные слова
        existing_words = set()
        if os.path.exists(UNKNOWN_WORDS_FILE):
            with open(UNKNOWN_WORDS_FILE, 'r', encoding='utf-8') as file:
                for line in file:
                    if ':::' in line:
                        word = line.split(':::')[0].strip()
                        existing_words.add(word)

        # Получаем слова из базы, которых нет в списке неизвестных
        available_words = session.query(AssessmentWord).all()
        filtered_words = [
            word for word in available_words if word.word not in existing_words
        ]

        if not filtered_words:
            return jsonify(
                {'message': 'All available words have been assessed', 'words': []}
            )

        # Выбираем случайные слова
        selected_words = random.sample(filtered_words, min(5, len(filtered_words)))

        words_response = [
            {'id': word.id, 'term': word.word, 'category': word.category}
            for word in selected_words
        ]

        return jsonify({'words': words_response})

    except Exception as e:
        logger.error(f'Error getting assessment words: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/assessment-results', methods=['POST'])
def save_assessment_results():
    session = Session()
    try:
        data = request.get_json()
        unknown_words = data.get('unknownWords', [])
        logger.info(f"Processing unknown words: {unknown_words}")

        words_added = 0

        for word in unknown_words:
            try:
                # Получаем перевод
                translation = translator.translate(word['term'], 'en', 'ru')
                logger.info(f"Got translation for {word['term']}: {translation}")
            except Exception as e:
                logger.error(f"Translation failed for {word['term']}: {e}")
                translation = word['term']

            try:
                # Проверяем существование термина
                existing_term = session.query(Term).filter_by(term=word['term']).first()

                if existing_term:
                    logger.info(f"Term already exists: {word['term']}")
                    # Проверяем, есть ли уже запись в UnknownTerm
                    unknown_exists = session.query(UnknownTerm).filter_by(term_id=existing_term.id).first()

                    if not unknown_exists:
                        # Если термин есть, но его нет в unknown_terms - добавляем
                        existing_term.translation = translation
                        unknown_term = UnknownTerm(
                            term_id=existing_term.id,
                            attempts=0,
                            last_attempt=datetime.now()
                        )
                        session.add(unknown_term)
                        words_added += 1
                else:
                    logger.info(f"Adding new term: {word['term']}")

                    # Создаем новый термин
                    term = Term(
                        term=word['term'],
                        translation=translation,  # Временно используем оригинал как перевод
                        category=word['category'],
                        term_metadata={
                            'source': 'assessment',
                            'added_at': datetime.now().isoformat(),
                        }
                    )
                    session.add(term)
                    session.flush()

                    # Создаем запись неизвестного термина
                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now()
                    )
                    session.add(unknown_term)
                    words_added += 1

            except Exception as e:
                logger.error(f"Error processing word {word['term']}: {e}")
                continue

        session.commit()
        logger.info(f"Successfully added {words_added} words to unknown terms")
        return jsonify({
            'status': 'success',
            'words_added': words_added
        })

    except Exception as e:
        logger.error(f'Error saving assessment results: {e}')
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/translate-term', methods=['POST'])
def translate_term():
    data = request.json
    logger.info(f'Received data for translation: {data}')
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    explanation = data.get('explanation', '')

    logger.info(f'Processing term: {term}, explanation: {explanation}')

    current_model, api_key = get_current_model()

    prompt = f"""
    Translate the following technical term and its explanation to Russian.
    Make the translation clear and professionally accurate.

    Term: {term} \n\n

    {f"Explanation: {explanation}" if explanation else ""}

    Format the response as:

    Term: [translated term] \n\n
    {"Explanation: [translated explanation]" if explanation else ""}
    """

    try:
        logger.info(f'Translating term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for translation')
            gemini_service = GeminiService(api_key)
            try:
                translation = gemini_service.translate_text(prompt)
            except Exception as e:
                logger.error(f'Gemini translation failed: {e}')
                # Fallback на Ollama
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                response = service.llm.invoke(prompt)
                translation = response.content
        else:
            # Используем Ollama
            logger.info('Using Ollama for translation')
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )
            response = service.llm.invoke(prompt)
            translation = response.content

        return jsonify({'translation': translation.strip()})
    except Exception as e:
        logger.error(f'Error translating term: {e}')
        return jsonify({'error': 'Failed to translate'}), 500


@app.route('/api/available-models', methods=['GET'])
def get_available_models():
    return jsonify(check_available_models())


@app.route('/api/categorize-words', methods=['POST'])
def categorize_words():
    data = request.json
    words = data.get('words', [])

    if not words:
        return jsonify({'error': 'No words provided'}), 400

    try:
        session = Session()
        # Получаем все категории и подкатегории из БД
        categories = session.query(Category).all()
        categories_dict = {}

        for category in categories:
            subcategories = [sub.name for sub in category.subcategories]
            categories_dict[category.name] = subcategories

        # Формируем текст с категориями для промпта
        categories_text = '\n'.join(
            [
                f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                for cat, subs in categories_dict.items()
            ]
        )

        # Если категорий нет, создаем базовые
        if not categories_dict:
            default_categories = [
                ('Programming', ['General', 'Algorithms', 'Data Structures']),
                ('Web Development', ['Frontend', 'Backend', 'APIs']),
                ('Databases', ['SQL', 'NoSQL', 'Design']),
            ]

            for cat_name, subcats in default_categories:
                category = Category(name=cat_name)
                session.add(category)
                session.flush()

                for subcat_name in subcats:
                    subcategory = Subcategory(
                        name=subcat_name, category_id=category.id
                    )
                    session.add(subcategory)

            session.commit()

            # Обновляем текст категорий
            categories_text = '\n'.join(
                [
                    f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                    for cat, subs in default_categories
                ]
            )

        prompt = f"""Given these existing categories and their subcategories:
        {categories_text}

        Please categorize the following words by assigning them to either existing or new categories.
        Words to categorize: {', '.join([w['original'] for w in words])}

        Return the results in the format:
        word1: Category -> Subcategory
        word2: Category -> Subcategory
        ...

        Important:
        - Use existing categories when possible
        - Create new categories only if really necessary
        - Always use the format "Category -> Subcategory"
        """

        # Получаем текущую модель и ключ API
        current_model, api_key = get_current_model()

        try:
            if current_model == 'gemini' and api_key:
                categorization = gemini_service.categorize_words(prompt)
            else:
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                categorization = service.categorize_words(prompt)

            # Парсим результат и добавляем новые категории если нужно
            categorized_words = []
            for word in words:
                word_category = None

                # Ищем категоризацию для текущего слова
                for line in categorization.strip().split('\n'):
                    if ':' in line and '->' in line:
                        cat_word, category = line.split(':', 1)
                        if cat_word.strip().lower() == word['original'].lower():
                            word_category = category.strip()
                            break

                if word_category and '->' in word_category:
                    cat_name, subcat_name = [
                        x.strip() for x in word_category.split('->')
                    ]

                    # Проверяем существование категории
                    category = (
                        session.query(Category).filter_by(name=cat_name).first()
                    )
                    if not category:
                        category = Category(name=cat_name)
                        session.add(category)
                        session.flush()

                    # Проверяем существование подкатегории
                    subcategory = (
                        session.query(Subcategory)
                        .filter_by(category_id=category.id, name=subcat_name)
                        .first()
                    )
                    if not subcategory:
                        subcategory = Subcategory(
                            name=subcat_name, category_id=category.id
                        )
                        session.add(subcategory)

                    word['category'] = f'{cat_name} -> {subcat_name}'
                else:
                    word['category'] = 'Programming -> General'

                categorized_words.append(word)

            session.commit()
            return jsonify({'words': categorized_words})

        except Exception as e:
            logger.error(f'Error during categorization: {e}')
            session.rollback()
            # В случае ошибки используем базовую категорию
            return jsonify(
                {
                    'words': [
                        {**w, 'category': 'Programming -> General'} for w in words
                    ]
                }
            )

    except Exception as e:
        logger.error(f'Error in categorize_words: {e}')
        if 'session' in locals():
            session.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        if 'session' in locals():
            session.close()


@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        session = Session()
        categories = session.query(Category).all()

        result = {}
        for category in categories:
            result[category.name] = [sub.name for sub in category.subcategories]

        return jsonify(result)

    except Exception as e:
        logger.error(f'Error getting categories: {e}')
        return jsonify({'error': str(e)}), 500

    finally:
        session.close()


@app.route('/api/chat-exercise', methods=['GET'])
def get_chat_exercise():
    try:
        session = Session()
        current_model, api_key = get_current_model()

        # Получаем неизвестные слова
        unknown_terms = session.query(Term).join(UnknownTerm).all()

        if current_model == 'gemini' and api_key:
            service = GeminiService(api_key)
        else:
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )

        # Генерируем диалог
        terms_for_dialogue = random.sample(
            unknown_terms, min(10, len(unknown_terms))
        )
        dialogue = service.generate_dialogue(terms_for_dialogue)

        return jsonify(dialogue)

    except Exception as e:
        logger.error(f'Error generating chat exercise: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/matching-pairs', methods=['GET'])
def get_matching_pairs():
    use_ai = request.args.get('useAI') == 'true'
    pairs_count = 15
    session = Session()
    try:
        # Получаем все термины
        terms = session.query(Term).all()

        # Если терминов мало, добавляем базовые
        if len(terms) < pairs_count:
            basic_terms = [
                {"term": "database", "translation": "база данных"},
                {"term": "algorithm", "translation": "алгоритм"},
                {"term": "framework", "translation": "фреймворк"},
                {"term": "interface", "translation": "интерфейс"},
                {"term": "variable", "translation": "переменная"},
                {"term": "function", "translation": "функция"},
                {"term": "array", "translation": "массив"},
                {"term": "string", "translation": "строка"},
                {"term": "object", "translation": "объект"},
                {"term": "class", "translation": "класс"},
                {"term": "method", "translation": "метод"},
                {"term": "property", "translation": "свойство"},
                {"term": "inheritance", "translation": "наследование"},
                {"term": "polymorphism", "translation": "полиморфизм"},
                {"term": "encapsulation", "translation": "инкапсуляция"},
                {"term": "abstraction", "translation": "абстракция"},
                {"term": "debugging", "translation": "отладка"},
                {"term": "compiler", "translation": "компилятор"},
                {"term": "runtime", "translation": "время выполнения"},
                {"term": "memory", "translation": "память"}
            ]
            for term_data in basic_terms:
                term = Term(
                    term=term_data["term"],
                    translation=term_data["translation"],
                    category="Programming -> General"
                )
                session.add(term)
            session.commit()
            terms = session.query(Term).all()

        # Выбираем 20 случайных терминов
        selected_terms = random.sample(terms, min(pairs_count, len(terms)))  # Убедитесь, что здесь 20

        # Формируем пары БЕЗ перемешивания
        pairs = [
            {
                'english': term.term,
                'russian': term.translation
            }
            for term in selected_terms
        ]

        if use_ai:
            try:
                current_model, api_key = get_current_model()
                if current_model == 'gemini' and api_key:
                    service = GeminiService(api_key)
                    result = service.improve_translations({'pairs': pairs}, pairs_count=pairs_count)
                    if result and 'english' in result and 'russian' in result:
                        return jsonify({
                            'english': result['english'],
                            'russian': result['russian']
                        })
            except Exception as e:
                logger.error(f'Error improving translations: {e}')

        return jsonify({
            'english': [p['english'] for p in pairs],
            'russian': [p['russian'] for p in pairs]
        })

    except Exception as e:
        logger.error(f'Error getting matching pairs: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/progress', methods=['POST'])
def update_progress():
    """Update study progress for a term"""
    data = request.json
    term_id = data.get('term_id')
    progress = data.get('progress')

    session = Session()
    try:
        term = session.query(Term).get(term_id)
        if not term:
            return jsonify({'error': 'Term not found'}), 404

        term.study_progress = progress
        term.last_reviewed = datetime.utcnow()
        term.review_count += 1

        # Add study session
        study_session = StudySession(
            term_id=term_id,
            success_rate=progress,
            time_spent=data.get('time_spent', 0),
            session_type=data.get('session_type', 'review'),
            session_metadata=data.get('metadata', {})
        )
        session.add(study_session)
        session.commit()

        return jsonify({'status': 'success', 'progress': progress})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/statistics', methods=['GET'])
def get_statistics():
    """Get learning statistics"""
    try:
        session = Session()
        # Получаем общую статистику
        total_terms = session.query(Term).count()
        favorites = session.query(Term).filter(Term.is_favorite == True).count()
        completed = session.query(Term).filter(Term.study_progress == 100).count()
        in_progress = session.query(Term).filter(
            Term.study_progress > 0,
            Term.study_progress < 100
        ).count()

        # Получаем прогресс по категориям
        category_progress = []
        categories = session.query(Term.category).distinct().all()
        for (category,) in categories:
            terms = session.query(Term).filter(Term.category == category).all()
            if terms:
                avg_progress = sum(term.study_progress or 0 for term in terms) / len(terms)
                category_progress.append({
                    'category': category,
                    'progress': float(avg_progress),
                    'count': len(terms)
                })

        # Получаем недавнюю активность
        recent_sessions = session.query(StudySession)\
            .order_by(StudySession.created_at.desc())\
            .limit(10)\
            .all()

        recent_activity = [
            {
                'date': session.created_at.isoformat(),
                'success_rate': session.success_rate,
                'type': session.session_type
            } for session in recent_sessions
        ]

        return jsonify({
            'overview': {
                'total_terms': total_terms,
                'favorites': favorites,
                'completed': completed,
                'in_progress': in_progress
            },
            'category_progress': category_progress,
            'recent_activity': recent_activity,
            'learning_curve': [] # Добавьте реальные данные если необходимо
        })
    except Exception as e:
        logger.error(f'Error getting statistics: {e}')
        return jsonify({
            'overview': {
                'total_terms': 0,
                'favorites': 0,
                'completed': 0,
                'in_progress': 0
            },
            'category_progress': [],
            'recent_activity': [],
            'learning_curve': []
        }), 200  # Возвращаем пустые данные вместо 500 ошибки
    finally:
        session.close()

@app.route('/api/categories/tree', methods=['GET'])
def get_category_tree():
    """Get category tree structure"""
    session = Session()
    try:
        def build_tree(parent_id=None):
            categories = session.query(Category)\
                .filter(Category.parent_id == parent_id)\
                .order_by(Category.order)\
                .all()

            return [
                {
                    'id': cat.id,
                    'name': cat.name,
                    'level': cat.level,
                    'metadata': cat.category_metadata,  # Обновлено здесь
                    'children': build_tree(cat.id)
                }
                for cat in categories
            ]

        tree = build_tree()
        return jsonify({'categories': tree})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение
        term.is_favorite = not term.is_favorite
        session.commit()

        logger.info(f"Updated term {term_id} is_favorite to: {term.is_favorite}")

        # Возвращаем обновленное значение
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.id
        })

    except Exception as e:
        session.rollback()
        logger.error(f'Error toggling favorite: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


# Перед app.run()
if __name__ == '__main__':
    # Инициализируем базу данных
    init_db()
    app.run(debug=True)
```

```js eng4IT/frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  SortAsc,
  Eye,
  EyeOff,
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Shuffle,
  Star,
  Layout,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AnimatePresence } from "framer-motion";

import TermModal from "./TermModal";
import WordList from "./WordList";
import StatisticsPanel from "./StatisticsPanel";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "tasks",
  );
  const [currentModel, setCurrentModel] = useState("ollama");
  const [subModel, setSubModel] = useState({
    ollama: "llama3.2",
    gemini: "gemini-1.5-flash",
  });
  const [apiKey, setApiKey] = useState("");
  const [originalApiKey, setOriginalApiKey] = useState("");
  const [unknownWords, setUnknownWords] = useState([]);
  const [allTerms, setAllTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelOptions] = useState({
    // Убираем setModelOptions
    ollama: false,
    gemini: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState("");
  const [useAI, setUseAI] = useState(
    () => localStorage.getItem("matchingUseAI") === "true",
  );
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    showFavorites: false,
    progressFilter: "all",
    categoryFilter: "all",
  });
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch current model settings
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/model/current",
        );
        setCurrentModel(response.data.model);

        if (response.data.model === "ollama") {
          setSubModel((prev) => ({ ...prev, ollama: response.data.sub_model }));
        } else {
          setSubModel((prev) => ({ ...prev, gemini: response.data.sub_model }));
        }

        if (response.data.has_api_key && response.data.api_key) {
          setOriginalApiKey(response.data.api_key);
          setApiKey(response.data.api_key);
          setDisplayedApiKey("*".repeat(response.data.api_key.length));
        } else {
          setOriginalApiKey("");
          setApiKey("");
          setDisplayedApiKey("");
        }
      } catch (error) {
        console.error("Error fetching model:", error);
      }
    };

    fetchCurrentModel();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Используем Promise.all для параллельной загрузки данных
        const [wordsRes, statsRes, categoriesRes, termsRes] = await Promise.all(
          [
            axios.get("http://localhost:5000/api/unknown-words"),
            axios.get("http://localhost:5000/api/terms/statistics"),
            axios.get("http://localhost:5000/api/categories/tree"),
            axios.get("http://localhost:5000/api/all-terms"),
          ],
        );

        setUnknownWords(wordsRes.data);
        setStatistics(statsRes.data);
        setCategories(categoriesRes.data.categories);
        setAllTerms(termsRes.data);

        console.log("Loaded terms:", termsRes.data); // Добавим для отладки
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchUnknownWords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/unknown-words",
      );
      console.log("Fetched words:", response.data); // Добавляем для отладки
      setUnknownWords(response.data);
    } catch (error) {
      console.error("Error fetching unknown words:", error);
    }
  };

  const fetchAllTerms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all-terms");
      console.log("Fetched terms:", response.data); // Добавим для отладки
      if (response.data) {
        setAllTerms(response.data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const handleFavoriteToggle = async (termId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: termId,
        },
      );

      if (response.data.status === "success") {
        // Обновляем состояние только для этого термина
        const newFavoriteStatus = response.data.is_favorite;

        setUnknownWords((prevWords) =>
          prevWords.map((word) =>
            word.id === termId
              ? { ...word, is_favorite: newFavoriteStatus }
              : word,
          ),
        );

        // Перезагружаем список если включен фильтр избранного
        if (filters.showFavorites) {
          await fetchUnknownWords();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleTermClick = (word) => {
    setSelectedTerm({
      term: word.original,
      translation: word.translation,
      category: word.category,
      attempts: word.attempts,
      last_attempt: word.last_attempt,
    });
    setIsModalOpen(true);
  };

  const handleModelChange = useCallback(
    async (model) => {
      try {
        const data = {
          model,
          sub_model: model === "ollama" ? subModel.ollama : subModel.gemini,
          api_key: apiKey !== "********" ? apiKey : undefined,
        };

        const response = await axios.post(
          "http://localhost:5000/api/model/set",
          data,
        );
        if (response.data.status === "success") {
          setCurrentModel(model);
        }
      } catch (error) {
        console.error("Error setting model:", error);
      }
    },
    [subModel, apiKey],
  );

  const handleSubModelChange = async (newSubModel) => {
    try {
      const updatedSubModel = {
        ...subModel,
        [currentModel]: newSubModel,
      };
      setSubModel(updatedSubModel);

      const data = {
        model: currentModel,
        sub_model: newSubModel,
        api_key: apiKey,
      };

      await axios.post("http://localhost:5000/api/model/set", data);
    } catch (error) {
      console.error("Error setting sub-model:", error);
    }
  };

  const handleApiKeyChange = async (newApiKey) => {
    if (!newApiKey) return;

    try {
      const data = {
        model: currentModel,
        sub_model:
          currentModel === "ollama" ? subModel.ollama : subModel.gemini,
        api_key: newApiKey,
      };

      const response = await axios.post(
        "http://localhost:5000/api/model/set",
        data,
      );
      if (response.data.status === "success") {
        setOriginalApiKey(newApiKey);
        setApiKey(newApiKey);
        setDisplayedApiKey("*".repeat(newApiKey.length));
        setShowApiKey(false);
      }
    } catch (error) {
      console.error("Error setting API key:", error);
    }
  };

  useEffect(() => {
    if (showApiKey) {
      setDisplayedApiKey(originalApiKey || apiKey);
    } else {
      setDisplayedApiKey(
        apiKey.startsWith("*") ? apiKey : "*".repeat(apiKey.length),
      );
    }
  }, [showApiKey, originalApiKey, apiKey]);

  useEffect(() => {
    if (activeTab === "unknown-words") {
      fetchUnknownWords();
    }
  }, [activeTab, filters.showFavorites]);

  // Filter and sort words
  const filteredWords = unknownWords.filter((word) => {
    if (!word) return false;

    // Проверяем фильтр избранного
    if (filters.showFavorites && !word.is_favorite) {
      return false;
    }

    // Остальные фильтры
    if (
      filters.categoryFilter !== "all" &&
      word.category !== filters.categoryFilter
    ) {
      return false;
    }

    if (filters.progressFilter !== "all") {
      if (
        filters.progressFilter === "completed" &&
        word.study_progress !== 100
      ) {
        return false;
      }
      if (
        filters.progressFilter === "in-progress" &&
        (word.study_progress === 0 || word.study_progress === 100)
      ) {
        return false;
      }
      if (
        filters.progressFilter === "not-started" &&
        word.study_progress !== 0
      ) {
        return false;
      }
    }

    // Поиск по тексту
    const searchQuery = searchTerm.toLowerCase();
    return (
      (word.original && word.original.toLowerCase().includes(searchQuery)) ||
      (word.translation && word.translation.toLowerCase().includes(searchQuery))
    );
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    switch (sortType) {
      case "alphabetical":
        return a.term.localeCompare(b.term);
      case "progress":
        return (b.study_progress || 0) - (a.study_progress || 0);
      case "category":
        return a.category.localeCompare(b.category);
      default: // 'newest'
        return new Date(b.last_attempt || 0) - new Date(a.last_attempt || 0);
    }
  });

  const renderUnknownWordsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Незнакомые слова
          </h2>
          <p className="text-sm text-gray-400">
            Всего слов: {filteredWords.length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="header-button"
          >
            <Layout size={16} />
          </button>

          <button
            onClick={() => setSortType("newest")}
            className={`header-button ${sortType === "newest" ? "active" : ""}`}
          >
            <Clock size={16} />
            <span>Новые</span>
          </button>

          <button
            onClick={() => setSortType("alphabetical")}
            className={`header-button ${sortType === "alphabetical" ? "active" : ""}`}
          >
            <SortAsc size={16} />
            <span>По алфавиту</span>
          </button>

          <button
            onClick={() =>
              setFilters((f) => ({ ...f, showFavorites: !f.showFavorites }))
            }
            className={`header-button ${filters.showFavorites ? "active" : ""}`}
          >
            <Star size={16} />
            <span>Избранное</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск слов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.progressFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, progressFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Весь прогресс</option>
          <option value="completed">Изучены</option>
          <option value="in-progress">В процессе</option>
          <option value="not-started">Не начаты</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedWords.map((word, index) => (
            <WordList
              key={word.id || index}
              id={word.id} // Убедитесь, что передаете id
              word={word.original}
              translation={word.translation}
              category={word.category}
              attempts={word.attempts}
              lastAttempt={word.last_attempt}
              progress={word.study_progress}
              isFavorite={word.is_favorite}
              onClick={() => {
                if (word && word.original) {
                  setSelectedTerm(word);
                  setIsModalOpen(true);
                }
              }}
              onFavoriteToggle={() => handleFavoriteToggle(word.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="max-w-2xl mx-auto">
      <div className="settings-section">
        <h2 className="settings-title">Настройки генерации</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-primary mb-2">Основная модель</label>
            <div className="settings-group">
              <button
                onClick={() => handleModelChange("ollama")}
                className={`settings-button ${
                  currentModel === "ollama" ? "active" : ""
                }`}
                disabled={!modelOptions.ollama}
              >
                Ollama
              </button>
              <button
                onClick={() => handleModelChange("gemini")}
                className={`settings-button ${
                  currentModel === "gemini" ? "active" : ""
                }`}
              >
                Gemini
              </button>
            </div>
          </div>
          <div>
            <label className="block text-primary mb-2">
              {currentModel === "ollama" ? "Модель Ollama" : "Версия Gemini"}
            </label>
            <select
              value={
                currentModel === "ollama" ? subModel.ollama : subModel.gemini
              }
              onChange={(e) => handleSubModelChange(e.target.value)}
              className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {currentModel === "ollama" ? (
                <option value="llama3.2">Llama 3.2</option>
              ) : (
                <>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-flash-8b">
                    Gemini 1.5 Flash 8B
                  </option>
                </>
              )}
            </select>
          </div>
          {currentModel === "gemini" && (
            <div>
              <label className="block text-primary mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={showApiKey ? apiKey : displayedApiKey}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setApiKey(newValue);
                      setDisplayedApiKey(newValue);
                    }}
                    placeholder="Введите API ключ Gemini"
                    className="w-full bg-dark border border-gray-700 text-text px-4 py-2 pr-10 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  >
                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <button
                  onClick={() => handleApiKeyChange(apiKey)}
                  disabled={!apiKey || apiKey === displayedApiKey}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark rounded-lg transition-colors disabled:opacity-50"
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTermBase = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">База терминов</h2>
          <p className="text-sm text-gray-400">
            Все доступные технические термины
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск терминов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        <select
          value={filters.categoryFilter}
          onChange={(e) =>
            setFilters((f) => ({ ...f, categoryFilter: e.target.value }))
          }
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Все категории</option>
          {Object.values(categories).map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Добавим проверку на наличие терминов */}
      {Object.keys(allTerms).length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Термины загружаются...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(allTerms)
            .filter(([term, category]) => {
              const termLower = term.toLowerCase();
              const searchLower = searchTerm.toLowerCase();
              const categoryMatch =
                filters.categoryFilter === "all" ||
                category === filters.categoryFilter;

              return categoryMatch && termLower.includes(searchLower);
            })
            .map(([term, category], index) => (
              <div
                key={index}
                className="bg-dark-card border border-gray-800 p-4 rounded-xl hover:border-primary transition-colors"
              >
                <h3 className="text-primary font-medium mb-2">{term}</h3>
                <p className="text-sm text-gray-400">{category}</p>
              </div>
            ))}
        </div>
      )}

      {/* Добавим отладочную информацию */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-dark-card rounded-xl">
          <p className="text-gray-400">Debug Info:</p>
          <p>Terms count: {Object.keys(allTerms).length}</p>
          <p>Categories count: {Object.keys(categories).length}</p>
        </div>
      )}
    </div>
  );

  const renderTasksContent = () => (
    <div className="text-center py-12">
      <h2 className="page-title">Изучение технических терминов</h2>
      <p className="page-subtitle">
        Практикуйтесь в чтении технических текстов и изучайте новые термины
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/assessment"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <ClipboardCheck size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Оценка знаний</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Проверьте свое знание технических терминов
          </p>
        </Link>

        <Link
          to="/learning"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Практика чтения</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Читайте технические тексты в контексте
          </p>
        </Link>

        <Link
          to="/chat-exercise"
          className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group"
        >
          <div className="text-primary mb-3">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">Чат с коллегой</h3>
          <p className="text-gray-400 text-sm group-hover:text-gray-300">
            Практикуйте технический английский в диалоге
          </p>
        </Link>

        <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-primary transition-colors group relative">
          <div
            className="absolute top-4 right-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group/ai">
              <button
                className="w-10 h-5 bg-gray-700 rounded-full flex items-center relative"
                onClick={() => {
                  const newValue = !useAI;
                  setUseAI(newValue);
                  localStorage.setItem("matchingUseAI", newValue);
                }}
              >
                <div
                  className={`absolute w-3 h-3 rounded-full transition-all duration-200 ${
                    useAI
                      ? "translate-x-6 bg-primary"
                      : "translate-x-1 bg-gray-400"
                  }`}
                />
              </button>
              <span className="absolute right-0 top-[-30px] opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap bg-dark-card px-2 py-1 rounded text-xs text-gray-400 border border-gray-700">
                Улучшение перевода с ИИ
              </span>
            </div>
          </div>

          <Link to="/matching">
            <div className="text-primary mb-3">
              <Shuffle size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Найти пару</h3>
            <p className="text-gray-400 text-sm group-hover:text-gray-300">
              Сопоставьте слова с их переводами
            </p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl shadow-xl p-6">
          <div className="border-b border-gray-800 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`${activeTab === "tasks" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Задания
              </button>
              <button
                onClick={() => setActiveTab("unknown-words")}
                className={`${activeTab === "unknown-words" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Незнакомые слова
              </button>
              <button
                onClick={() => setActiveTab("term-base")}
                className={`${activeTab === "term-base" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                База терминов
              </button>
              <button
                onClick={() => setActiveTab("statistics")}
                className={`${activeTab === "statistics" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Статистика
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`${activeTab === "settings" ? "nav-link active" : "nav-link"} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Настройки
              </button>
            </nav>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "unknown-words" && renderUnknownWordsContent()}
              {activeTab === "statistics" && (
                <StatisticsPanel statistics={statistics} />
              )}
              {activeTab === "tasks" && renderTasksContent()}
              {activeTab === "term-base" && renderTermBase()}
              {activeTab === "settings" && renderSettingsContent()}
            </>
          )}
        </div>
      </div>

      <TermModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        term={selectedTerm?.original} // Изменено с term на original
        translation={selectedTerm?.translation}
        category={selectedTerm?.category}
      />
    </div>
  );
};

export default Dashboard;
```

```js eng4IT/frontend/src/components/WordList.js
// eng4IT/frontend/src/components/WordList.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";
import axios from "axios"; // Добавляем импорт axios

const WordList = ({
  id,
  word,
  translation,
  category,
  attempts,
  lastAttempt,
  progress,
  isFavorite,
  onClick,
  onFavoriteToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Функция для озвучивания слова
  const speak = (text) => {
    setIsPlaying(true);
    setError(null);

    // Создаем новый экземпляр SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Настраиваем параметры
    utterance.lang = "en-US"; // Устанавливаем английский язык
    utterance.rate = 0.9; // Немного замедляем скорость
    utterance.pitch = 1; // Стандартная высота тона

    // Обработчики событий
    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      setError("Error speaking the word");
      console.error("Speech synthesis error:", event);
    };

    // Останавливаем текущее произношение, если оно есть
    window.speechSynthesis.cancel();

    // Запускаем произношение
    window.speechSynthesis.speak(utterance);
  };

  const handlePlaySound = (e) => {
    e.stopPropagation();
    speak(word);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      console.log("Toggling favorite for term ID:", id);
      const response = await axios.post(
        "http://localhost:5000/api/terms/favorite",
        {
          term_id: id,
        },
      );

      if (response.data.status === "success") {
        // Вызываем callback с новым значением is_favorite
        onFavoriteToggle(response.data.term_id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Error updating favorite status");
    }
  };

  const formattedDate = lastAttempt
    ? new Date(lastAttempt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="term-card cursor-pointer hover:scale-[1.02] transition-all duration-200 relative"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="term text-lg font-medium text-primary">{word}</h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlaySound}
              className={`text-gray-400 hover:text-primary transition-colors ${
                isPlaying ? "animate-pulse text-primary" : ""
              }`}
              disabled={isPlaying}
            >
              <Volume2 size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={`${
                isFavorite ? "text-yellow-500" : "text-gray-400"
              } hover:text-yellow-500 transition-colors`}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </motion.button>
          </div>
          <p className="translation text-gray-300">{translation}</p>
          {attempts > 0 && (
            <p className="text-sm text-gray-500">Attempts: {attempts}</p>
          )}
        </div>

        <div className="flex flex-col items-end">
          {category && (
            <span className="category-tag mb-2 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">
              {category}
            </span>
          )}
          {progress !== undefined && (
            <div className="w-24 bg-gray-700 rounded-full h-1 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          )}
          {lastAttempt && (
            <span className="text-xs text-gray-500">{formattedDate}</span>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-2 right-2 bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WordList;
```


не работает
