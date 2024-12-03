// frontend/src/components/AddTermModal.js
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import ErrorModal from "./ErrorModal";

const AddTermModal = ({ isOpen, onClose, onTermAdded }) => {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [subcategorySuggestions, setSubcategorySuggestions] = useState([]);
  const [allCategories, setAllCategories] = useState({});
  const [error, setError] = useState({ show: false, message: "" });

  useEffect(() => {
    // Получаем все категории при открытии модала
    if (isOpen) {
      axios
        .get("http://localhost:5000/api/categories")
        .then((response) => {
          setAllCategories(response.data);
        })
        .catch((error) => {
          console.error("Error fetching categories:", error);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (category) {
      const filtered = Object.keys(allCategories).filter((cat) =>
        cat.toLowerCase().includes(category.toLowerCase()),
      );
      setCategorySuggestions(filtered);
    } else {
      setCategorySuggestions([]);
    }
  }, [category, allCategories]);

  useEffect(() => {
    if (subcategory && category) {
      const subcats = allCategories[category] || [];
      const filtered = subcats.filter((sub) =>
        sub.toLowerCase().includes(subcategory.toLowerCase()),
      );
      setSubcategorySuggestions(filtered);
    } else {
      setSubcategorySuggestions([]);
    }
  }, [subcategory, category, allCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!term.trim() || !category.trim() || !subcategory.trim()) {
      setError({
        show: true,
        message: "Все поля должны быть заполнены",
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/terms/add", {
        term: term.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
      });

      if (response.data.status === "success") {
        onTermAdded();
        onClose();
        // Сброс полей
        setTerm("");
        setCategory("");
        setSubcategory("");
      }
    } catch (error) {
      console.error("Error adding term:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Произошла ошибка при добавлении термина";
      setError({
        show: true,
        message: errorMessage,
      });
    }
  };

  const closeErrorModal = () => {
    setError({ show: false, message: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto px-4">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-dark-card p-4 md:p-6 rounded-xl w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-semibold mb-4 text-primary">
            Добавить термин
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Поле Термин */}
            <div>
              <label className="block text-primary mb-1">Термин</label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                required
                className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Поле Категория */}
            <div>
              <label className="block text-primary mb-1">Категория</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                list="category-list"
                className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <datalist id="category-list">
                {categorySuggestions.map((cat, idx) => (
                  <option key={idx} value={cat} />
                ))}
              </datalist>
            </div>

            {/* Поле Подкатегория */}
            <div>
              <label className="block text-primary mb-1">Подкатегория</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                required
                list="subcategory-list"
                className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                disabled={!category}
              />
              <datalist id="subcategory-list">
                {subcategorySuggestions.map((sub, idx) => (
                  <option key={idx} value={sub} />
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg"
            >
              Сохранить
            </button>
          </form>
        </div>
      </div>
      {/* Добавляем модальное окно ошибки */}
      <ErrorModal
        isOpen={error.show}
        onClose={closeErrorModal}
        message={error.message}
      />
    </div>
  );
};

export default AddTermModal;
