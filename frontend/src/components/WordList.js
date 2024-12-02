// eng4IT/frontend/src/components/WordList.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Star } from "lucide-react";

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

  // Разделение категории на основную и подкатегорию
  const [mainCategory, subCategory] = category
    ? category.split("->").map((s) => s.trim())
    : ["", ""];

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

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle(id);
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
          {mainCategory && (
            <span className="category-tag mb-1 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">
              {mainCategory}
            </span>
          )}
          {subCategory && (
            <span className="subcategory-tag px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300">
              {subCategory}
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
