import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { calculateSuccessRate } from "../utils/statistics";
import { useExerciseTimer } from "../hooks/useExerciseTimer";

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
  const [isSaving, setIsSaving] = useState(false);
  const getTimeSpent = useExerciseTimer(); // Оставляем этот хук

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
      saveStatistics(); // Вызываем сохранение статистики при завершении
    }
  };

  // Изменим обработку правильного сопоставления
  const handleCardClick = (word, isEnglish) => {
    const normalizedWord = typeof word === "string" ? word.toLowerCase() : "";

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
        // Найти соответствующую пару по английскому слову
        const matchedPairData = allPairs.find(
          (pair) => pair.english.toLowerCase() === newSelectedPair.english,
        );

        if (matchedPairData) {
          // Добавлена проверка
          const matchedPair = {
            id: matchedPairData.id,
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
        {typeof word === "string" ? word.toLowerCase() : JSON.stringify(word)}
      </span>
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
        <p className="text-gray-300 mb-2">
          Правильных ответов: {score} из {allPairs.length}
        </p>
        {isSaving && <p className="text-gray-400">Сохранение результатов...</p>}
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

  // Добавляем функцию сохранения статистики
  const saveStatistics = async () => {
    setIsSaving(true);
    try {
      const timeSpent = getTimeSpent();
      const successRate = calculateSuccessRate(
        matchedPairs.map((pair) => ({
          isCorrect: true, // Пара сопоставлена правильно
          attempts: 1, // Можно добавить подсчёт попыток
        })),
      );

      await axios.post(
        "http://localhost:5000/api/exercises/matching/complete",
        {
          results: matchedPairs.map((pair) => ({
            term_id: pair.id,
            success_rate: successRate,
            attempts: 1,
            correct_matches: score,
            total_matches: allPairs.length,
          })),
          time_spent: timeSpent,
        },
      );
    } catch (error) {
      console.error("Ошибка при сохранении статистики:", error);
      // Можно добавить уведомление об ошибке
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="min-h-screen gradient-background py-8 matching-exercise">
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

        <div className="matching-exercise-grid">
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
