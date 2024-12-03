// Path: frontend/src/components/LearningInterface.js

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { UsedTermsSection, TranslationToggle } from "./SharedComponents";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = "http://localhost:5000/api";

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
        Генерация текста...
      </span>
      <span className="text-gray-400">Это может занять несколько секунд</span>
    </div>
  </motion.div>
);

const TranslationPopup = ({ text, position }) => {
  const { theme } = useTheme();

  if (!position) return null;

  return (
    <div
      className={`fixed z-50 px-3 py-1 text-sm rounded shadow-lg pointer-events-none transform -translate-x-1/2 border ${
        theme === "light"
          ? "bg-white border-gray-200 text-gray-800"
          : "bg-dark-card border-gray-700 text-gray-800"
      }`}
      style={{
        left: position.x,
        top: position.y + 20,
        opacity: text ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      {text}
    </div>
  );
};

const LearningInterface = () => {
  const [scenario, setScenario] = useState("");
  const [categories, setCategories] = useState({});
  const [selectedWords, setSelectedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [translationPopup, setTranslationPopup] = useState({
    text: "",
    position: null,
  });
  const [translationEnabled, setTranslationEnabled] = useState(() => {
    const saved = localStorage.getItem("translationEnabled");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSaving, setIsSaving] = useState(false);
  const { theme } = useTheme();

  // Кэш переводов для оптимизации
  const [translationsCache] = useState(new Map());

  // Добавляем использование хука
  const navigate = useNavigate();

  // Add new refs after existing state declarations
  const translationTimeoutRef = useRef(null);
  const lastTranslatedWordRef = useRef("");
  const translationCacheRef = useRef(new Map());
  const startWordRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      "translationEnabled",
      JSON.stringify(translationEnabled),
    );
  }, [translationEnabled]);

  const fetchScenario = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/scenario`);
      setScenario(response.data.text);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching scenario:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchScenario();
  }, [fetchScenario]);

  const cleanWord = useCallback((word) => {
    return word.trim().replace(/^[.,!?()"\s]+|[.,!?()"\s]+$/g, "");
  }, []);

  const isValidWord = useCallback(
    (word) => {
      const cleanedWord = cleanWord(word);
      return (
        cleanedWord.length > 0 &&
        /[a-zA-Z]/.test(cleanedWord) &&
        !["a", "an", "the", "in", "on", "at", "to", "for"].includes(
          cleanedWord.toLowerCase(),
        )
      );
    },
    [cleanWord],
  );

  const translateWord = useCallback(
    async (word) => {
      const cleanedWord = cleanWord(word);

      // Проверяем кэш
      if (translationsCache.has(cleanedWord)) {
        return translationsCache.get(cleanedWord);
      }

      try {
        const response = await axios.post(`${API_URL}/translate`, {
          text: cleanedWord,
          source_lang: "en",
          target_lang: "ru",
        });
        const translation = response.data.translation;

        // Сохраняем в кэш
        translationsCache.set(cleanedWord, translation);
        return translation;
      } catch (error) {
        console.error("Translation error:", error);
        return "Перевод недоступен";
      }
    },
    [cleanWord, translationsCache],
  );

  const selectWordsBetween = useCallback(
    (startElement, endElement) => {
      if (!startElement || !endElement) return;

      const spans = Array.from(document.querySelectorAll(".word-span"));
      const startIndex = spans.indexOf(startElement);
      const endIndex = spans.indexOf(endElement);

      if (startIndex === -1 || endIndex === -1) return;

      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);

      // Очищаем предыдущее выделение
      currentSelection.forEach((span) => span.classList.remove("selected"));

      const selectedSpans = spans.slice(start, end + 1);
      const meaningfulWords = selectedSpans.filter((span) => {
        const word = cleanWord(span.textContent).toLowerCase();
        return !["a", "an", "the", "in", "on", "at", "to", "for"].includes(
          word,
        );
      });

      if (meaningfulWords.length > 4) return;

      selectedSpans.forEach((span) => span.classList.add("selected"));
      setCurrentSelection(selectedSpans);
    },
    [cleanWord, currentSelection],
  );

  const addToSelectedWords = useCallback(async () => {
    if (currentSelection.length === 0) return;

    const phrase = currentSelection
      .map((span) => cleanWord(span.textContent))
      .filter((word) => isValidWord(word))
      .join(" ");

    if (phrase && !selectedWords.some((w) => w.original === phrase)) {
      const translation = await translateWord(phrase);
      setSelectedWords((prev) => [...prev, { original: phrase, translation }]);
    }

    // Очищаем выделение
    currentSelection.forEach((span) => span.classList.remove("selected"));
    setCurrentSelection([]);
  }, [currentSelection, selectedWords, cleanWord, isValidWord, translateWord]);

  const handleMouseMove = useCallback(
    (e) => {
      if (isSelecting && e.target.classList.contains("word-span")) {
        selectWordsBetween(startWordRef.current, e.target);
        return;
      }

      if (!translationEnabled) {
        setTranslationPopup({ text: "", position: null });
        return;
      }

      if (e.target.classList.contains("word-span")) {
        const word = cleanWord(e.target.textContent);

        if (lastTranslatedWordRef.current === word) {
          return;
        }

        if (isValidWord(word)) {
          setTranslationPopup((prev) => ({
            ...prev,
            position: { x: e.clientX, y: e.clientY },
          }));

          if (translationTimeoutRef.current) {
            clearTimeout(translationTimeoutRef.current);
          }

          translationTimeoutRef.current = setTimeout(async () => {
            if (translationCacheRef.current.has(word)) {
              setTranslationPopup((prev) => ({
                text: translationCacheRef.current.get(word),
                position: prev.position,
              }));
            } else {
              const translation = await translateWord(word);
              translationCacheRef.current.set(word, translation);
              setTranslationPopup((prev) => ({
                text: translation,
                position: prev.position,
              }));
            }
            lastTranslatedWordRef.current = word;
          }, 500);
        }
      } else {
        setTranslationPopup({ text: "", position: null });
        lastTranslatedWordRef.current = "";
      }
    },
    [
      translationEnabled,
      isSelecting,
      cleanWord,
      isValidWord,
      translateWord,
      selectWordsBetween,
    ],
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (!e.target.classList.contains("word-span")) return;

      setIsSelecting(true);
      startWordRef.current = e.target;

      currentSelection.forEach((span) => span.classList.remove("selected"));
      setCurrentSelection([]);

      selectWordsBetween(e.target, e.target);
    },
    [selectWordsBetween, currentSelection],
  );

  const handleMouseUp = useCallback(async () => {
    if (!isSelecting) return;

    setIsSelecting(false);
    if (currentSelection.length > 0) {
      const phrase = currentSelection
        .map((span) => cleanWord(span.textContent))
        .filter((word) => isValidWord(word))
        .join(" ");

      if (phrase && !selectedWords.some((w) => w.original === phrase)) {
        const translation = await translateWord(phrase);
        setSelectedWords((prev) => [
          ...prev,
          { original: phrase, translation },
        ]);
      }
    }

    currentSelection.forEach((span) => span.classList.remove("selected"));
    setCurrentSelection([]);
    startWordRef.current = null;
  }, [
    isSelecting,
    currentSelection,
    selectedWords,
    cleanWord,
    isValidWord,
    translateWord,
  ]);

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
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error generating new scenario:", error);
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
        { words: selectedWords },
      );

      // 2. Проверяем ответ и обрабатываем категоризированные слова
      if (
        categorizationResponse.data &&
        Array.isArray(categorizationResponse.data.words)
      ) {
        const categorizedWords = categorizationResponse.data.words;

        // 3. Сохраняем слова с присвоенными категориями
        await axios.post(`${API_URL}/save_words`, {
          words: categorizedWords.map((word) => ({
            original: word.original || word.term,
            translation: word.translation,
            category: word.category, // Теперь каждое слово имеет свою категорию
          })),
        });
      } else {
        throw new Error("Invalid categorization response format");
      }

      // 4. Перенаправляем на дашборд
      navigate("/?tab=unknown-words");
    } catch (error) {
      console.error("Error handling next:", error);
      // Добавьте обработку ошибок для пользователя
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background py-8">
      <AnimatePresence>
        {(isLoading || isSaving) && <LoadingOverlay />}
      </AnimatePresence>

      <TranslationPopup {...translationPopup} />
      <div className="max-w-4xl mx-auto px-6">
        {/* Кнопка "На главную" в стиле других компонентов */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-primary mb-8"
        >
          <ArrowLeft className="mr-2" size={20} />
          на главную
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
            Technical Terms
          </h1>

          {/* Контейнер для чекбокса и кнопки */}
          <div className="flex items-center gap-4">
            {/* Чекбокс перевода */}
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
                theme === "light"
                  ? "bg-white border-gray-200 text-gray-700"
                  : "bg-dark-card border-gray-800 text-gray-300"
              }`}
            >
              <span className="text-sm font-medium whitespace-nowrap">
                Перевод при наведении
              </span>
              <label className="relative inline-block w-11 h-6">
                <input
                  type="checkbox"
                  checked={translationEnabled}
                  onChange={(e) => setTranslationEnabled(e.target.checked)}
                  className="hidden"
                />
                <div
                  className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                    translationEnabled ? "bg-primary" : "bg-gray-400"
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 top-0.5 left-0.5 ${
                      translationEnabled ? "transform translate-x-5" : ""
                    }`}
                  />
                </div>
              </label>
            </div>

            {/* Кнопка генерации */}
            <button
              onClick={handleGenerateNew}
              disabled={isLoading}
              className={`px-6 py-2 rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === "light"
                  ? "bg-white border-gray-200 text-gray-700 hover:border-primary hover:text-primary"
                  : "bg-dark-card border-gray-800 text-gray-300 hover:border-primary hover:text-primary"
              }`}
            >
              {isLoading ? "Генерация..." : "Сгенерировать новый текст"}
            </button>
          </div>
        </div>

        {/* Текст */}
        <div
          className={`rounded-2xl p-8 mb-6 border ${
            theme === "light"
              ? "bg-white border-gray-200 text-gray-700"
              : "bg-dark-card border-gray-800 text-gray-300"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">
              Technical Text
            </h2>
            <button
              onClick={handleNext}
              disabled={isSaving || isLoading}
              className={`px-6 py-2 rounded-xl transition-all duration-200 ${
                isSaving || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover text-dark"
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Сохранение...</span>
                </div>
              ) : (
                "Далее"
              )}
            </button>
          </div>

          {/* Сгенерированный текст */}
          <div
            className={`leading-relaxed select-none ${
              theme === "light" ? "text-gray-700" : "text-gray-300"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isSelecting) {
                setIsSelecting(false);
                currentSelection.forEach((span) =>
                  span.classList.remove("selected"),
                );
                setCurrentSelection([]);
                startWordRef.current = null;
              }
              setTranslationPopup({ text: "", position: null });
            }}
          >
            {scenario.split(" ").map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="word-span cursor-pointer px-1 py-0.5 rounded transition-colors duration-150 hover:text-primary"
                data-word={word}
              >
                {word}{" "}
              </span>
            ))}
          </div>
        </div>

        {/* Незнакомые слова */}
        <div
          className={`rounded-2xl p-8 mb-6 border ${
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-dark-card border-gray-800"
          }`}
        >
          <h2 className="text-xl font-semibold text-primary mb-4">
            Незнакомые слова
          </h2>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {selectedWords.map(({ original, translation }) => (
                <motion.div
                  key={original}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={`px-4 py-2 rounded-xl flex items-center space-x-2 group border transition-colors ${
                    theme === "light"
                      ? "bg-white border-gray-200 hover:border-primary"
                      : "bg-dark-lighter border-gray-800 hover:border-primary"
                  }`}
                >
                  <span
                    className={
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }
                  >
                    {original}
                  </span>
                  <span className="text-sm text-primary/80 ml-2">
                    {translation}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedWords((words) =>
                        words.filter((w) => w.original !== original),
                      )
                    }
                    className="text-gray-500 hover:text-primary ml-2"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Использованные термины */}
        <div
          className={`rounded-2xl p-6 border ${
            theme === "light"
              ? "bg-white border-gray-200"
              : "bg-dark-card border-gray-800"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-1">
                Использованные термины
              </h3>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Технические термины, встречающиеся в тексте
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                theme === "light"
                  ? "bg-gray-50 text-primary border-gray-200"
                  : "bg-dark-lighter text-primary border-gray-800"
              }`}
            >
              {Object.keys(categories).length} терминов
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categories).map(([term, category]) => {
              const [mainCategory, subCategory] = category
                .split("->")
                .map((s) => s.trim());

              return (
                <motion.div
                  key={term}
                  className={`p-4 rounded-xl border transition-colors ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-200 hover:border-primary"
                      : "bg-dark-lighter border-gray-800 hover:border-primary"
                  }`}
                >
                  <h4 className="text-primary font-semibold mb-2">{term}</h4>
                  <div className="space-y-1">
                    <p
                      className={
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }
                    >
                      {mainCategory}
                    </p>
                    <p
                      className={
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }
                    >
                      {subCategory}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
