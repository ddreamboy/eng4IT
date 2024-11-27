// frontend/src/components/TermModal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const TermModal = ({ isOpen, onClose, term, translation, category }) => {
  const [explanation, setExplanation] = useState('');
  const [llmTranslation, setLlmTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentModel, setCurrentModel] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/model/current');
        setCurrentModel(response.data.model);
      } catch (error) {
        console.error('Error fetching model:', error);
      }
    };
    
    if (isOpen) {
      fetchCurrentModel();
    }
  }, [isOpen]);

  const handleClose = () => {
    setExplanation('');
    setLlmTranslation('');
    setShowTranslation(false);
    onClose();
  };

  const getExplanation = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/explain-term', {
        term,
        category
      });
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error('Error getting explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLlmTranslation = async () => {
    setIsTranslating(true);
    try {
      const response = await axios.post('http://localhost:5000/api/translate-term', {
        term,
        explanation: explanation || ''
      });
      setLlmTranslation(response.data.translation);
      setShowTranslation(true);
    } catch (error) {
      console.error('Error getting LLM translation:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={handleClose}></div>
        <div className="relative bg-dark-card border border-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-primary"
          >
            <X size={24} />
          </button>

          <h3 className="text-xl font-semibold text-primary mb-2">{term}</h3>
          
          {/* Кнопки управления */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                showTranslation 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-dark-lighter text-gray-400 hover:text-primary'
              }`}
            >
              {showTranslation ? 'Скрыть перевод' : 'Показать перевод'}
            </button>
            {explanation && (
              <button
                onClick={getLlmTranslation}
                disabled={isTranslating}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50"
              >
                {isTranslating ? 'Перевод...' : 'Перевести LLM'}
              </button>
            )}
          </div>

          {/* Переводы */}
          {showTranslation && (
            <div className="mb-4 space-y-2">
              {translation && (
                <div className="p-3 bg-dark-lighter rounded-lg">
                  <p className="text-sm text-primary/80 mb-1">Базовый перевод:</p>
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

          {category && (
            <div className="mb-4">
              <span className="category-tag">
                {category}
              </span>
            </div>
          )}

          {!explanation && (
            <button
              onClick={getExplanation}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-dark py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Загрузка...' : `Получить объяснение (${currentModel === 'gemini' ? 'Gemini' : 'Ollama'})`}
            </button>
          )}

          {explanation && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-primary mb-2">Объяснение:</h4>
              <p className="text-gray-300 whitespace-pre-wrap">{explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermModal;