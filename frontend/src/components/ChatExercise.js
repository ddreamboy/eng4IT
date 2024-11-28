import React, { useState, useEffect } from "react";
import { MessageSquare, Volume2, Languages, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Добавляем AnimatePresence
import axios from "axios";

const HintMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute bottom-full left-0 right-0 mb-2 px-4 py-2 bg-zinc-800 rounded-lg shadow-lg"
  >
    {message.split("\n").map((line, index) => (
      <p key={index} className="text-sm text-zinc-300">
        {line}
      </p>
    ))}
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

  const fetchDialogue = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/chat-exercise",
      );
      setDialogue(response.data);
    } catch (error) {
      console.error("Error fetching dialogue:", error);
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
      const keyWords = dialogue.steps[currentStep].words || [];

      // Формируем начальный массив выбранных слов
      const initialSelected = words.map((word, idx) => {
        // Оставляем первое и последнее слово
        if (idx === 0 || idx === words.length - 1) {
          return word;
        }
        // Показываем некоторые не-ключевые слова
        if (!keyWords.includes(word) && Math.random() < 0.45) {
          return word;
        }
        return null;
      });

      // Собираем слова для угадывания
      const wordsToGuess = words.filter((word, idx) => {
        return initialSelected[idx] === null;
      });

      // Добавляем запутывающие слова
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
        .filter((word) => !words.includes(word))
        .sort(() => Math.random() - 0.6)
        .slice(0, 3);

      // Формируем финальный набор слов
      const availableWordsSet = new Set([...wordsToGuess, ...extraWords]);

      setSelectedWords(initialSelected);
      setAvailableWords([...availableWordsSet]);
    }
  }, [dialogue, currentStep]);

  // Обработка выбора слова
  const handleWordSelect = (word) => {
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
      setAttemptCount(0); // Сбрасываем счетчик попыток
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
        }
      }, 3000);
    } else {
      setIncorrectWords(wrongPositions);
      setAttemptCount((prev) => prev + 1); // Увеличиваем счетчик попыток

      // Показываем кнопку подсказки после двух неудачных попыток
      if (attemptCount + 1 >= 2) {
        setShowHintButton(true);
      }

      setTimeout(() => {
        setIncorrectWords([]);
        setIsCorrect(null);
        setHint(null);
      }, 2000);
    }
  };

  if (!dialogue) {
    return <div>Loading...</div>;
  }

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

  return (
    <div className="max-w-2xl mx-auto p-6">
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
              {hint && <HintMessage message={hint} />}
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
                    : "Проверить"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatExercise;
