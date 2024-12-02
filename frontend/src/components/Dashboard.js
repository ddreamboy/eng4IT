import React, { useState, useEffect, useCallback, useMemo } from "react";
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
// Удалили импорт StatisticsPanel, так как вкладка удалена

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
    ollama: false,
    gemini: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState("");
  const [useAI, setUseAI] = useState(
    () => localStorage.getItem("matchingUseAI") === "true",
  );
  // Удалили состояние statistics, так как вкладка удалена
  const [viewMode, setViewMode] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    showFavorites: false,
    progressFilter: "all",
    mainCategoryFilter: "all",
    subCategoryFilter: "all",
  });

  // Загрузка всех данных
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [wordsRes, termsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/unknown-words"),
          axios.get("http://localhost:5000/api/all-terms"),
        ]);

        setUnknownWords(wordsRes.data);
        setAllTerms(termsRes.data);

        console.log("Loaded terms:", termsRes.data); // Для отладки
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Обновление активной вкладки при изменении параметров URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Получение текущих настроек модели
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

  const fetchUnknownWords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/unknown-words",
      );
      console.log("Fetched words:", response.data); // Для отладки
      setUnknownWords(response.data);
    } catch (error) {
      console.error("Error fetching unknown words:", error);
    }
  };

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

        // Перезагрузка списка, если фильтр избранных активен
        if (filters.showFavorites) {
          await fetchUnknownWords();
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
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

  // Управление отображением API ключа
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

  // Фильтрация и сортировка слов
  const filteredWords = useMemo(() => {
    return unknownWords.filter((word) => {
      if (!word) return false;

      // Проверяем фильтр избранного
      if (filters.showFavorites && !word.is_favorite) {
        return false;
      }

      // Разделяем категорию на основную и подкатегорию
      const [mainCategory, subCategory] = word.category
        .split("->")
        .map((s) => s.trim());

      // Фильтрация по основной категории
      if (
        filters.mainCategoryFilter !== "all" &&
        mainCategory !== filters.mainCategoryFilter
      ) {
        return false;
      }

      // Фильтрация по подкатегории
      if (filters.subCategoryFilter !== "all") {
        if (subCategory !== filters.subCategoryFilter) {
          return false;
        }
      }

      // Фильтрация по прогрессу изучения
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
        (word.translation &&
          word.translation.toLowerCase().includes(searchQuery))
      );
    });
  }, [unknownWords, filters, searchTerm]);

  const categories = useMemo(() => {
    const mapping = {};

    Object.values(allTerms).forEach((categoryStr) => {
      const [main, sub] = categoryStr.split("->").map((s) => s.trim());
      if (main && sub) {
        if (!mapping[main]) {
          mapping[main] = new Set();
        }
        mapping[main].add(sub);
      }
    });

    // Преобразуем Set в массив и сортируем
    const sortedMapping = {};
    Object.keys(mapping)
      .sort()
      .forEach((main) => {
        sortedMapping[main] = Array.from(mapping[main]).sort();
      });

    return sortedMapping;
  }, [allTerms]);

  const mainCategories = useMemo(() => Object.keys(categories), [categories]);

  const sortedWords = useMemo(() => {
    return [...filteredWords].sort((a, b) => {
      switch (sortType) {
        case "alphabetical":
          const aOriginal = a.original || "";
          const bOriginal = b.original || "";
          return aOriginal.localeCompare(bOriginal);
        case "progress":
          return (b.study_progress || 0) - (a.study_progress || 0);
        case "category":
          return a.category.localeCompare(b.category);
        default: // 'newest'
          return new Date(b.last_attempt || 0) - new Date(a.last_attempt || 0);
      }
    });
  }, [filteredWords, sortType]);

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
          {/* Переключатель режима отображения */}
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="header-button"
          >
            <Layout size={16} />
          </button>

          {/* Фильтры сортировки */}
          <button
            onClick={() => setSortType("newest")}
            className={`header-button ${sortType === "newest" ? "active" : ""}`}
          >
            <Clock size={16} />
            <span>Новые</span>
          </button>

          <button
            onClick={() => setSortType("alphabetical")}
            className={`header-button ${
              sortType === "alphabetical" ? "active" : ""
            }`}
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
          placeholder="Поиск терминов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200 focus:border-primary focus:outline-none"
        />

        {/* Основной Dropdown для Категорий */}
        <select
          value={filters.mainCategoryFilter}
          onChange={(e) => {
            setFilters((f) => ({
              ...f,
              mainCategoryFilter: e.target.value,
              subCategoryFilter: "all",
            }));
          }}
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Все категории</option>
          {mainCategories.map((mainCat, index) => (
            <option key={index} value={mainCat}>
              {mainCat}
            </option>
          ))}
        </select>

        {/* Второй Dropdown для Подкатегорий */}
        {filters.mainCategoryFilter !== "all" && (
          <select
            value={filters.subCategoryFilter}
            onChange={(e) =>
              setFilters((f) => ({ ...f, subCategoryFilter: e.target.value }))
            }
            className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
          >
            <option value="all">Все подкатегории</option>
            {categories[filters.mainCategoryFilter].map((subCat, idx) => (
              <option key={idx} value={subCat}>
                {subCat}
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${viewMode === "grid" ? "md:grid-cols-3" : "md:grid-cols-1"}`}
      >
        <AnimatePresence>
          {sortedWords.map((word) => (
            <WordList
              key={word.id} // Используем только word.id, предполагая его уникальность
              id={word.id}
              word={
                typeof word.original === "string"
                  ? word.original
                  : JSON.stringify(word.original)
              }
              translation={
                typeof word.translation === "string"
                  ? word.translation
                  : JSON.stringify(word.translation)
              }
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
              onFavoriteToggle={handleFavoriteToggle} // Передаем функцию напрямую
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
                className={`settings-button ${currentModel === "ollama" ? "active" : ""}`}
                disabled={!modelOptions.ollama}
              >
                Ollama
              </button>
              <button
                onClick={() => handleModelChange("gemini")}
                className={`settings-button ${currentModel === "gemini" ? "active" : ""}`}
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

        {/* Основной Dropdown для Категорий */}
        <select
          value={filters.mainCategoryFilter}
          onChange={(e) => {
            setFilters((f) => ({
              ...f,
              mainCategoryFilter: e.target.value,
              subCategoryFilter: "all",
            }));
          }}
          className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
        >
          <option value="all">Все категории</option>
          {mainCategories.map((mainCat, index) => (
            <option key={index} value={mainCat}>
              {mainCat}
            </option>
          ))}
        </select>

        {/* Второй Dropdown для Подкатегорий */}
        {filters.mainCategoryFilter !== "all" && (
          <select
            value={filters.subCategoryFilter}
            onChange={(e) =>
              setFilters((f) => ({ ...f, subCategoryFilter: e.target.value }))
            }
            className="bg-dark-card border border-gray-800 rounded-xl px-4 py-2 text-gray-200"
          >
            <option value="all">Все подкатегории</option>
            {categories[filters.mainCategoryFilter].map((subCat, idx) => (
              <option key={idx} value={subCat}>
                {subCat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Обновите фильтрацию при отображении терминов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(allTerms)
          .filter(([term, category]) => {
            // Разделяем категорию на основную и подкатегорию
            const [mainCat, subCat] = category.split("->").map((s) => s.trim());

            // Фильтрация по основной категории
            if (
              filters.mainCategoryFilter !== "all" &&
              mainCat !== filters.mainCategoryFilter
            ) {
              return false;
            }

            // Фильтрация по подкатегории
            if (
              filters.subCategoryFilter !== "all" &&
              subCat !== filters.subCategoryFilter
            ) {
              return false;
            }

            // Поиск по термину
            const searchLower = searchTerm.toLowerCase();
            return term.toLowerCase().includes(searchLower);
          })
          .map(([term, category]) => {
            const [mainCat, subCat] = category.split("->").map((s) => s.trim());
            return (
              <div
                key={term}
                className="bg-dark-card border border-gray-800 p-4 rounded-xl hover:border-primary transition-colors"
              >
                <h3 className="text-primary font-medium mb-2">{term}</h3>
                <p className="text-sm text-gray-400">{mainCat}</p>
                <p className="text-sm text-gray-300">{subCat}</p>
              </div>
            );
          })}
      </div>

      {/* Отладочная информация */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-dark-card rounded-xl">
          <p className="text-gray-400">Debug Info:</p>
          <p>Terms count: {Object.keys(allTerms).length}</p>
          <p>Categories count: {categories.length}</p>
          <pre className="text-xs text-gray-400 overflow-auto">
            {JSON.stringify(allTerms, null, 2)}
          </pre>
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

  console.log("Categories:", categories);
  console.log("All Terms:", allTerms);
  console.log("Unknown Words:", unknownWords);

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
              {/* Удалили кнопку "Статистика" */}
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
              {/* Удалили условие для вкладки "Статистика" */}
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
        term={selectedTerm?.original}
        translation={selectedTerm?.translation}
        category={selectedTerm?.category}
      />
    </div>
  );
};

export default Dashboard;
