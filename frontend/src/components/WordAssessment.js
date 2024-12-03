import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
  >
    <div className="glass-card p-8 rounded-2xl flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-lg font-medium text-primary">
        Сохранение результатов...
      </span>
    </div>
  </motion.div>
);

const WordAssessment = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownWords, setKnownWords] = useState([]);
  const [unknownWords, setUnknownWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exitX, setExitX] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    // Защита от повторных быстрых кликов
    if (isProcessing) return;
    setIsProcessing(true);

    const currentWord = words[currentIndex];
    setExitX(xValue);

    if (direction === "known") {
      setKnownWords((prev) => [...prev, currentWord]);
    } else {
      setUnknownWords((prev) => [...prev, currentWord]);
    }

    if (currentIndex + 1 >= words.length) {
      setIsSaving(true);
      setTimeout(handleAssessmentComplete, 300);
    } else {
      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, words.length - 1));
        setIsProcessing(false);
      }, 300);
    }
  };

  const handleButtonClick = (direction) => {
    const xValue = direction === "known" ? -300 : 300;
    handleSwipe(direction, xValue);
  };

  const handleAssessmentComplete = async () => {
    try {
      await axios.post(`${API_URL}/assessment-results`, {
        unknownWords: unknownWords.map((word) => ({
          term: word.term,
          category: word.category,
        })),
      });

      // Добавим небольшую задержку перед редиректом
      setTimeout(() => {
        setIsSaving(false);
        navigate("/?tab=unknown-words");
      }, 1000);
    } catch (error) {
      console.error("Error saving assessment results:", error);
      setIsSaving(false);
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
    <div className="min-h-screen gradient-background px-4 py-6 md:p-8">
      <AnimatePresence>{isSaving && <LoadingOverlay />}</AnimatePresence>
      <div className="max-w-4xl mx-auto">
        {/* Кнопка "На главную" */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-primary mb-8"
        >
          <ArrowLeft className="mr-2" size={20} />
          на главную
        </Link>
        <div className="w-full max-w-md mx-auto">
          {/* Остальной контент */}
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

          <div className="relative h-64 md:h-80">
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
    </div>
  );
};

export default WordAssessment;
