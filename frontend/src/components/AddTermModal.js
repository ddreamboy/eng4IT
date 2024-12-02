// frontend/src/components/AddTermModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { X, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const AddTermModal = ({ isOpen, onClose, onTermAdded }) => {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [categories, setCategories] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Получение существующих категорий и подкатегорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data.categories);
      } catch (err) {
        console.error("Ошибка при получении категорий:", err);
      }
    };

    if (isOpen) {
      fetchCategories();
      // Сброс полей при открытии модального окна
      setTerm("");
      setCategory("");
      setSubcategory("");
      setError("");
    }
  }, [isOpen]);

  // Обработка выбора основной категории
  const handleMainCategoryChange = (e) => {
    setCategory(e.target.value);
    setSubcategory(""); // Сброс подкатегории при смене основной категории
  };

  // Обработка генерации категории
  const handleGenerateCategory = async () => {
    if (!term.trim()) {
      setError("Пожалуйста, введите термин для генерации категории.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/categorize-words`, {
        words: [{ original: term.trim() }],
      });

      const categorizedWord = response.data.words[0];
      if (categorizedWord && categorizedWord.category) {
        const [genCategory, genSubcategory] = categorizedWord.category
          .split("->")
          .map((s) => s.trim());
        setCategory(genCategory);
        setSubcategory(genSubcategory);
      } else {
        setError("Не удалось сгенерировать категорию.");
      }
    } catch (err) {
      console.error("Ошибка при генерации категории:", err);
      setError("Ошибка при генерации категории.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Обработка сохранения нового термина
  const handleSave = async () => {
    if (!term.trim()) {
      setError("Термин не может быть пустым.");
      return;
    }

    if (!category.trim()) {
      setError("Категория не может быть пустой.");
      return;
    }

    if (!subcategory.trim()) {
      setError("Подкатегория не может быть пустой.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/terms`, {
        term: term.trim(),
        category: `${category.trim()} -> ${subcategory.trim()}`,
      });

      if (response.data.success) {
        onTermAdded(response.data.term); // Обновляем список терминов в родительском компоненте
        onClose(); // Закрываем модальное окно
      } else {
        setError(response.data.message || "Ошибка при сохранении термина.");
      }
    } catch (err) {
      console.error("Ошибка при сохранении термина:", err);
      setError("Ошибка при сохранении термина.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-dark-card border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-primary"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold text-primary mb-4">
          Добавить Термин
        </h2>

        {error && (
          <div className="bg-red-500/10 text-red-500 text-sm px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Термин</label>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-primary"
            placeholder="Введите термин"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Категория</label>
          <select
            value={category}
            onChange={handleMainCategoryChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-primary"
          >
            <option value="">Выберите или введите категорию</option>
            {Object.keys(categories).map((mainCat, index) => (
              <option key={index} value={mainCat}>
                {mainCat}
              </option>
            ))}
          </select>
          {/* Поле для ввода новой категории */}
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-primary"
            placeholder="Или введите новую категорию"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Подкатегория</label>
          {category ? (
            <>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-primary"
              >
                <option value="">Выберите подкатегорию</option>
                {categories[category] &&
                  categories[category].map((subCat, idx) => (
                    <option key={idx} value={subCat}>
                      {subCat}
                    </option>
                  ))}
              </select>
              {/* Поле для ввода новой подкатегории */}
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-primary"
                placeholder="Или введите новую подкатегорию"
              />
            </>
          ) : (
            <p className="text-gray-400">
              Сначала выберите или введите категорию.
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleGenerateCategory}
            disabled={isGenerating || !term.trim()}
            className={`flex items-center bg-primary hover:bg-primary-hover text-dark px-4 py-2 rounded-lg transition-colors ${
              isGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isGenerating ? (
              "Генерация..."
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            Генерировать категорию
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary-hover text-dark px-6 py-2 rounded-lg transition-colors"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTermModal;
