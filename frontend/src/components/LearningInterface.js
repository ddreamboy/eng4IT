// Path: frontend/src/components/LearningInterface.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { UsedTermsSection, TranslationToggle } from './SharedComponents';

const API_URL = 'http://localhost:5000/api';

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
  >
    <div className="glass-card p-8 rounded-2xl flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-lg font-medium text-primary">Генерация текста...</span>
      <span className="text-gray-400">Это может занять несколько секунд</span>
    </div>
  </motion.div>
);

const TranslationPopup = ({ text, position }) => {
  if (!position) return null;
  
  return (
    <div
      className="fixed z-50 px-3 py-1 text-sm bg-dark-card rounded shadow-lg pointer-events-none transform -translate-x-1/2 text-gray-200 border border-gray-700"
      style={{
        left: position.x,
        top: position.y + 20,
        opacity: text ? 1 : 0,
        transition: 'opacity 0.2s ease'
      }}
    >
      {text}
    </div>
  );
};

const LearningInterface = () => {
  const [scenario, setScenario] = useState('');
  const [categories, setCategories] = useState({});
  const [selectedWords, setSelectedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [translationPopup, setTranslationPopup] = useState({ text: '', position: null });
  const [translationEnabled, setTranslationEnabled] = useState(() => {
    const saved = localStorage.getItem('translationEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Кэш переводов для оптимизации
  const [translationsCache] = useState(new Map());

  // Добавляем использование хука
  const navigate = useNavigate();

  // Add new refs after existing state declarations
  const translationTimeoutRef = useRef(null);
  const lastTranslatedWordRef = useRef('');
  const translationCacheRef = useRef(new Map());
  const startWordRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('translationEnabled', JSON.stringify(translationEnabled));
  }, [translationEnabled]);

  const fetchScenario = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/scenario`);
      setScenario(response.data.text);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching scenario:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchScenario();
  }, [fetchScenario]);

  const cleanWord = useCallback((word) => {
    return word.trim().replace(/^[.,!?()"\s]+|[.,!?()"\s]+$/g, '');
  }, []);

  const isValidWord = useCallback((word) => {
    const cleanedWord = cleanWord(word);
    return cleanedWord.length > 0 && 
           /[a-zA-Z]/.test(cleanedWord) && 
           !['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for'].includes(cleanedWord.toLowerCase());
  }, [cleanWord]);

  const translateWord = useCallback(async (word) => {
    const cleanedWord = cleanWord(word);
    
    // Проверяем кэш
    if (translationsCache.has(cleanedWord)) {
      return translationsCache.get(cleanedWord);
    }

    try {
      const response = await axios.post(`${API_URL}/translate`, {
        text: cleanedWord,
        source_lang: 'en',
        target_lang: 'ru'
      });
      const translation = response.data.translation;
      
      // Сохраняем в кэш
      translationsCache.set(cleanedWord, translation);
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return 'Перевод недоступен';
    }
  }, [cleanWord, translationsCache]);

  const selectWordsBetween = useCallback((startElement, endElement) => {
    if (!startElement || !endElement) return;
    
    const spans = Array.from(document.querySelectorAll('.word-span'));
    const startIndex = spans.indexOf(startElement);
    const endIndex = spans.indexOf(endElement);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    // Очищаем предыдущее выделение
    currentSelection.forEach(span => span.classList.remove('selected'));
    
    const selectedSpans = spans.slice(start, end + 1);
    const meaningfulWords = selectedSpans.filter(span => {
      const word = cleanWord(span.textContent).toLowerCase();
      return !['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for'].includes(word);
    });

    if (meaningfulWords.length > 4) return;

    selectedSpans.forEach(span => span.classList.add('selected'));
    setCurrentSelection(selectedSpans);
  }, [cleanWord, currentSelection]);

  const addToSelectedWords = useCallback(async () => {
    if (currentSelection.length === 0) return;
    
    const phrase = currentSelection
      .map(span => cleanWord(span.textContent))
      .filter(word => isValidWord(word))
      .join(' ');

    if (phrase && !selectedWords.some(w => w.original === phrase)) {
      const translation = await translateWord(phrase);
      setSelectedWords(prev => [...prev, { original: phrase, translation }]);
    }

    // Очищаем выделение
    currentSelection.forEach(span => span.classList.remove('selected'));
    setCurrentSelection([]);
  }, [currentSelection, selectedWords, cleanWord, isValidWord, translateWord]);

  const handleMouseMove = useCallback((e) => {
    if (isSelecting && e.target.classList.contains('word-span')) {
      selectWordsBetween(startWordRef.current, e.target);
      return;
    }

    if (!translationEnabled) {
      setTranslationPopup({ text: '', position: null });
      return;
    }

    if (e.target.classList.contains('word-span')) {
      const word = cleanWord(e.target.textContent);
      
      if (lastTranslatedWordRef.current === word) {
        return;
      }

      if (isValidWord(word)) {
        setTranslationPopup(prev => ({
          ...prev,
          position: { x: e.clientX, y: e.clientY }
        }));

        if (translationTimeoutRef.current) {
          clearTimeout(translationTimeoutRef.current);
        }

        translationTimeoutRef.current = setTimeout(async () => {
          if (translationCacheRef.current.has(word)) {
            setTranslationPopup(prev => ({
              text: translationCacheRef.current.get(word),
              position: prev.position
            }));
          } else {
            const translation = await translateWord(word);
            translationCacheRef.current.set(word, translation);
            setTranslationPopup(prev => ({
              text: translation,
              position: prev.position
            }));
          }
          lastTranslatedWordRef.current = word;
        }, 500);
      }
    } else {
      setTranslationPopup({ text: '', position: null });
      lastTranslatedWordRef.current = '';
    }
  }, [translationEnabled, isSelecting, cleanWord, isValidWord, translateWord, selectWordsBetween]);

  const handleMouseDown = useCallback((e) => {
    if (!e.target.classList.contains('word-span')) return;

    setIsSelecting(true);
    startWordRef.current = e.target;
    
    currentSelection.forEach(span => span.classList.remove('selected'));
    setCurrentSelection([]);
    
    selectWordsBetween(e.target, e.target);
  }, [selectWordsBetween, currentSelection]);

  const handleMouseUp = useCallback(async () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    if (currentSelection.length > 0) {
      const phrase = currentSelection
        .map(span => cleanWord(span.textContent))
        .filter(word => isValidWord(word))
        .join(' ');

      if (phrase && !selectedWords.some(w => w.original === phrase)) {
        const translation = await translateWord(phrase);
        setSelectedWords(prev => [...prev, { original: phrase, translation }]);
      }
    }

    currentSelection.forEach(span => span.classList.remove('selected'));
    setCurrentSelection([]);
    startWordRef.current = null;
  }, [isSelecting, currentSelection, selectedWords, cleanWord, isValidWord, translateWord]);

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
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      console.error('Error generating new scenario:', error);
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
        { words: selectedWords }
      );
  
      // 2. Проверяем ответ и обрабатываем категоризированные слова
      if (categorizationResponse.data && Array.isArray(categorizationResponse.data.words)) {
        const categorizedWords = categorizationResponse.data.words;
        
        // 3. Сохраняем слова с присвоенными категориями
        await axios.post(`${API_URL}/save_words`, {
          words: categorizedWords.map(word => ({
            original: word.original || word.term,
            translation: word.translation,
            category: word.category // Теперь каждое слово имеет свою категорию
          }))
        });
      } else {
        throw new Error('Invalid categorization response format');
      }
  
      // 4. Перенаправляем на дашборд
      navigate('/?tab=unknown-words');
    } catch (error) {
      console.error('Error handling next:', error);
      // Добавьте обработку ошибок для пользователя
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background relative">
      <AnimatePresence>
        {(isLoading || isSaving) && <LoadingOverlay />}
      </AnimatePresence>

      <TranslationToggle 
        enabled={translationEnabled}
        onChange={setTranslationEnabled}
      />

      <TranslationPopup {...translationPopup} />
      {/* Добавляем навигацию */}
      <nav className="bg-dark-card/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-4 text-gray-400 hover:text-primary transition-colors">
                На главную
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
            Technical Terms
          </h1>
          <button
            onClick={handleGenerateNew}
            disabled={isLoading}
            className="px-6 py-2 rounded-xl bg-dark-card border border-gray-800 text-gray-300 hover:text-primary hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Генерация...' : 'Сгенерировать новый текст'}
          </button>
        </div>

        <div className="bg-dark-card rounded-2xl p-8 mb-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Technical Text</h2>
            <button
              onClick={handleNext}
              disabled={isSaving || isLoading}
              className={`px-6 py-2 rounded-xl transition-all duration-200 ${
                isSaving || isLoading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-dark'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Сохранение...</span>
                </div>
              ) : (
                'Далее'
              )}
            </button>
          </div>
          <div
            className="text-gray-300 leading-relaxed select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isSelecting) {
                setIsSelecting(false);
                currentSelection.forEach(span => span.classList.remove('selected'));
                setCurrentSelection([]);
                startWordRef.current = null;
              }
              setTranslationPopup({ text: '', position: null });
            }}
          >
            {scenario.split(' ').map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="word-span cursor-pointer px-1 py-0.5 rounded transition-colors duration-150 hover:text-primary"
                data-word={word}
              >
                {word}{' '}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-dark-card rounded-2xl p-8 mb-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-primary mb-4">Незнакомые слова</h2>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {selectedWords.map(({ original, translation }) => (
                <motion.div
                  key={original}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-dark-lighter border border-gray-800 text-gray-300 px-4 py-2 rounded-xl flex items-center space-x-2 group hover:border-primary transition-colors"
                >
                  <span>{original}</span>
                  <span className="text-sm text-primary/80 ml-2">{translation}</span>
                  <button
                    onClick={() => setSelectedWords(words => words.filter(w => w.original !== original))}
                    className="text-gray-500 hover:text-primary ml-2"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <UsedTermsSection terms={categories} />
      </div>
    </div>
  );
};

export default LearningInterface;