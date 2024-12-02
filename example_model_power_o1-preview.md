Claude 3.5 Sonnet и фикс отображения избранных слов в интерфейсе (спойлер: решение в 1 промпт)

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



я открываю вкладку Незнакомые слова, нажимаю на звездочку на каком нибудь слове, она заполняется желтым, дальше я нажимаю в строке фильтров на кнопку Избранное, и слово не появляется в списке, в консоли ошибок нет, и если обновить страницу, то выделение звездочки пропадает

The issue you're experiencing is due to duplicate API calls when toggling the favorite status of a word. Specifically, both the `WordList` component and the `Dashboard` component are making axios POST requests to the `/api/terms/favorite` endpoint, causing the favorite status to toggle twice and effectively negate the change. As a result, when you refresh the page, the favorite status reverts to its original state, and the favorite filter doesn't show the word.

**Solution:**

To resolve this, you need to ensure that only one API call is made when toggling the favorite status. Here's how you can fix the code:

1. **Remove the axios call from `WordList.js`**:
   In your `WordList.js` component, the `handleFavoriteClick` function currently makes an axios POST request. You should remove this API call and instead delegate the action to the parent component (`Dashboard`) via the `onFavoriteToggle` prop.

   **Updated `handleFavoriteClick` in `WordList.js`:**

   ```jsx
   const handleFavoriteClick = (e) => {
     e.stopPropagation();
     onFavoriteToggle(id);
   };
   ```

2. **Adjust the `onFavoriteToggle` prop in `WordList.js`**:
   When rendering the `WordList` component in `Dashboard.js`, pass the `handleFavoriteToggle` function directly without wrapping it in another function.

   **Updated usage of `WordList` in `Dashboard.js`:**

   ```jsx
   <WordList
     key={word.id || index}
     id={word.id}
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
     onFavoriteToggle={handleFavoriteToggle} // Pass the function directly
   />
   ```

3. **Update `handleFavoriteToggle` in `Dashboard.js`**:
   Ensure that `handleFavoriteToggle` accepts a `termId` and makes the axios POST request. Update the state of `unknownWords` with the new favorite status returned from the backend.

   **Updated `handleFavoriteToggle` in `Dashboard.js`:**

   ```jsx
   const handleFavoriteToggle = async (termId) => {
     try {
       console.log("Toggling favorite for term ID:", termId);
       const response = await axios.post(
         "http://localhost:5000/api/terms/favorite",
         {
           term_id: termId,
         },
       );

       if (response.data.status === "success") {
         const newFavoriteStatus = response.data.is_favorite;

         setUnknownWords((prevWords) =>
           prevWords.map((word) =>
             word.id === termId
               ? { ...word, is_favorite: newFavoriteStatus }
               : word,
           ),
         );

         // Reload the list if the favorites filter is active
         if (filters.showFavorites) {
           await fetchUnknownWords();
         }
       }
     } catch (error) {
       console.error("Error toggling favorite:", error);
     }
   };
   ```

4. **Remove or adjust any unnecessary code**:
   Ensure that there are no other unnecessary axios calls or state updates that might interfere with the favorite toggling functionality.

**Explanation:**

By making these changes, the favorite status will be toggled only once when the star icon is clicked. The state in the `Dashboard` component will be updated accordingly, and the favorite status will persist after refreshing the page. Additionally, the word will correctly appear when you apply the favorites filter because the `unknownWords` state now accurately reflects the favorited words.

**Note:**

- Ensure that the backend endpoint `/api/terms/favorite` is functioning correctly and returns the updated favorite status (`is_favorite`) in the response.
- If you have any caching mechanisms or state management libraries (like Redux), make sure they are updated to reflect these changes.
- Test the functionality thoroughly to confirm that the favorite status updates correctly in all scenarios.

This should resolve the issue you're experiencing with favoriting words in your application.
