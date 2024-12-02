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

  // Разделение категории на основную и подкатегорию
  const [mainCategory, subCategory] = category
    ? category.split("->").map((s) => s.trim())
    : ["", ""];

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

          {/* Категории */}
          {mainCategory && (
            <div className="mb-2">
              <span className="category-tag mr-2 px-2 py-1 bg-gray-800 rounded-lg text-xs text-gray-400">
                {mainCategory}
              </span>
            </div>
          )}
          {subCategory && (
            <div className="mb-2">
              <span className="subcategory-tag px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300">
                {subCategory}
              </span>
            </div>
          )}

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
