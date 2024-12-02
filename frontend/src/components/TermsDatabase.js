// frontend/src/components/TermsDatabase.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddTermModal from "./AddTermModal";
import { Plus, Star } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const TermsDatabase = () => {
  const [terms, setTerms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState({});

  // Получение терминов из БД
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(`${API_URL}/terms`);
        setTerms(response.data.terms);
      } catch (err) {
        console.error("Ошибка при получении терминов:", err);
      }
    };

    fetchTerms();
  }, []);

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

    fetchCategories();
  }, []);

  // Обработка добавления нового термина
  const handleTermAdded = (newTerm) => {
    setTerms((prev) => [...prev, newTerm]);
  };

  // Обработка добавления термина в Незнакомые слова
  const handleAddToUnknown = async (termId) => {
    try {
      await axios.post(`${API_URL}/unknown-words`, { term_id: termId });
      alert("Термин добавлен в Незнакомые слова.");
    } catch (err) {
      console.error("Ошибка при добавлении в Незнакомые слова:", err);
      alert("Не удалось добавить термин в Незнакомые слова.");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto bg-dark-card border border-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary">База терминов</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-primary hover:bg-primary-hover text-dark px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Добавить термин
          </button>
        </div>

        {/* Таблица с терминов */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-300">Термин</th>
                <th className="px-4 py-2 text-left text-gray-300">Категория</th>
                <th className="px-4 py-2 text-left text-gray-300">
                  Подкатегория
                </th>
                <th className="px-4 py-2 text-center text-gray-300">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {terms.map((term) => (
                <tr key={term.id} className="border-t border-gray-700">
                  <td className="px-4 py-2 text-gray-200">{term.term}</td>
                  <td className="px-4 py-2 text-gray-300">
                    {term.category.split("->")[0].trim()}
                  </td>
                  <td className="px-4 py-2 text-gray-300">
                    {term.category.split("->")[1].trim()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleAddToUnknown(term.id)}
                      className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      <Star size={16} className="mr-1" />В Незнакомые
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Модальное окно для добавления термина */}
        <AddTermModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTermAdded={handleTermAdded}
        />
      </div>
    </div>
  );
};

export default TermsDatabase;
