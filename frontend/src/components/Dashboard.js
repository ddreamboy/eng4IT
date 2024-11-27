import React, { useState, useEffect, useCallback } from 'react';
import { Clock, SortAsc } from 'lucide-react'; // Восстановлены необходимые импортируемые компоненты
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
// import { AlignJustify, SortAsc } from 'lucide-react'; // Удален AlignJustify
import TermModal from './TermModal';

const WordList = ({ word, translation, category, onClick }) => (
  <div 
    className="term-card cursor-pointer hover:scale-[1.02] transition-transform"
    onClick={onClick}
  >
    <div className="flex justify-between items-start">
      <div>
        <h4 className="term">{word}</h4>
        <p className="translation">{translation}</p>
      </div>
      {category && (
        <span className="category-tag">
          {category}
        </span>
      )}
    </div>
  </div>
);

// Удалите неиспользуемые константы
// const SortButton = ... // Удалено
// const ModelSelector = ... // Удалено

const Dashboard = () => {
  // Было
  // const [searchParams, setSearchParams] = useSearchParams();
  
  // Стало
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'tasks');
  const [currentModel, setCurrentModel] = useState('ollama');
  const [subModel, setSubModel] = useState({
    ollama: 'llama3.2',
    gemini: 'gemini-1.5-flash'
  });
  const [apiKey, setApiKey] = useState('');
  const [unknownWords, setUnknownWords] = useState([]);
  const [allTerms, setAllTerms] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest'); // 'newest', 'alphabetical'
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelOptions, setModelOptions] = useState({ ollama: false, gemini: true });

  // В компоненте Dashboard
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Получаем текущие настройки при загрузке
  useEffect(() => {
    const fetchCurrentModel = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/model/current');
        setCurrentModel(response.data.model);
        
        // Обновляем подмодели в зависимости от текущей модели
        if (response.data.model === 'ollama') {
          setSubModel(prev => ({ ...prev, ollama: response.data.sub_model }));
        } else {
          setSubModel(prev => ({ ...prev, gemini: response.data.sub_model }));
        }
        
        if (response.data.has_api_key) {
          setApiKey('********');
        }
      } catch (error) {
        console.error('Error fetching model:', error);
      }
    };
    
    fetchCurrentModel();
  }, []);

  const fetchUnknownWords = async () => {
    try {
      // Читаем файл unknown_words.txt через API
      const response = await axios.get('http://localhost:5000/api/unknown-words');
      setUnknownWords(response.data);
    } catch (error) {
      console.error('Error fetching unknown words:', error);
    }
  };

  const fetchAllTerms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/all-terms');
      setAllTerms(response.data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const handleTermClick = (term, translation, category) => {
    setSelectedTerm({ term, translation, category });
    setIsModalOpen(true);
  };

  const sortedUnknownWords = [...unknownWords].sort((a, b) => {
    if (sortType === 'alphabetical') {
      return a.original.localeCompare(b.original);
    }
    // По умолчанию сортируем по новизне (в обратном порядке)
    return -1;
  });

  const handleModelChange = useCallback(async (model) => {
    try {
      const data = {
        model,
        sub_model: model === 'ollama' ? subModel.ollama : subModel.gemini,
        api_key: apiKey
      };
      
      await axios.post('http://localhost:5000/api/model/set', data);
      setCurrentModel(model);
    } catch (error) {
      console.error('Error setting model:', error);
    }
  }, [subModel, apiKey]);

  const handleSubModelChange = async (newSubModel) => {
    try {
      const updatedSubModel = {
        ...subModel,
        [currentModel]: newSubModel
      };
      setSubModel(updatedSubModel);

      const data = {
        model: currentModel,
        sub_model: newSubModel,
        api_key: apiKey
      };
      
      await axios.post('http://localhost:5000/api/model/set', data);
    } catch (error) {
      console.error('Error setting sub-model:', error);
    }
  };

  const handleApiKeyChange = async (newApiKey) => {
    try {
      const data = {
        model: currentModel,
        sub_model: currentModel === 'ollama' ? subModel.ollama : subModel.gemini,
        api_key: newApiKey
      };
      
      await axios.post('http://localhost:5000/api/model/set', data);
      setApiKey(newApiKey);
    } catch (error) {
      console.error('Error setting API key:', error);
    }
  };

  const filteredTerms = Object.entries(allTerms).filter(([term]) => 
    term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // В начале компонента Dashboard добавляем эффекты для загрузки данных
  useEffect(() => {
    if (activeTab === 'unknown-words') {
      fetchUnknownWords();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'all-terms') {
      fetchAllTerms();
    }
  }, [activeTab]);

  useEffect(() => {
    const checkAvailableModels = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/available-models');
        const availableModels = response.data;
        
        if (!availableModels.ollama && currentModel === 'ollama') {
          handleModelChange('gemini');
        }
        
        setModelOptions(availableModels);
      } catch (error) {
        console.error('Error checking available models:', error);
      }
    };
    
    checkAvailableModels();
  }, [currentModel, handleModelChange]);

  const renderUnknownWordsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary">
          Незнакомые слова
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortType('newest')}
            className={`header-button ${sortType === 'newest' ? 'active' : ''}`}
          >
            <Clock size={16} />
            <span>Новые</span>
          </button>
          <button
            onClick={() => setSortType('alphabetical')}
            className={`header-button ${sortType === 'alphabetical' ? 'active' : ''}`}
          >
            <SortAsc size={16} />
            <span>По алфавиту</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedUnknownWords.map((word, index) => (
          <WordList 
            key={index}
            word={word.original}
            translation={word.translation}
            onClick={() => handleTermClick(word.original, word.translation, word.category)}
          />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'unknown-words':
        return renderUnknownWordsContent();

      case 'all-terms':
        return (
          <div>
            <input
              type="text"
              placeholder="Поиск терминов..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTerms.map(([term, category], index) => (
                <div key={index} className="term-card">
                  <div className="term">{term}</div>
                  <div className="category">{category}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="settings-section">
              <h2 className="settings-title">Настройки генерации</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-primary mb-2">
                    Основная модель
                  </label>
                  <div className="settings-group">
                    <button
                      onClick={() => handleModelChange('ollama')}
                      className={`settings-button ${currentModel === 'ollama' ? 'active' : ''}`}
                      disabled={!modelOptions.ollama}
                    >
                      Ollama
                    </button>
                    <button
                      onClick={() => handleModelChange('gemini')}
                      className={`settings-button ${currentModel === 'gemini' ? 'active' : ''}`}
                    >
                      Gemini
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-primary mb-2">
                    {currentModel === 'ollama' ? 'Модель Ollama' : 'Версия Gemini'}
                  </label>
                  <select
                    value={subModel}
                    onChange={(e) => handleSubModelChange(e.target.value)}
                    className="w-full bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {currentModel === 'ollama' ? (
                      <option value="llama3.2">Llama 3.2</option>
                    ) : (
                      <>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</option>
                      </>
                    )}
                  </select>
                </div>
                {currentModel === 'gemini' && (
                  <div>
                    <label className="block text-primary mb-2">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder="Введите API ключ Gemini"
                        className="flex-1 bg-dark border border-gray-700 text-text px-4 py-2 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={() => handleApiKeyChange(apiKey)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-dark rounded-lg transition-colors"
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

      default: // tasks tab
        return (
          <div className="text-center py-12">
            <h2 className="page-title">
              Изучение технических терминов
            </h2>
            <p className="page-subtitle">
              Практикуйтесь в чтении технических текстов и изучайте новые термины
            </p>
            <Link
              to="/learning"
              className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-hover text-dark font-medium rounded-xl transition-all duration-200"
            >
              Начать практику
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl shadow-xl p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`${
                  activeTab === 'tasks'
                    ? 'nav-link active'
                    : 'nav-link'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Задания
              </button>
              <button
                onClick={() => setActiveTab('unknown-words')}
                className={`${
                  activeTab === 'unknown-words'
                    ? 'nav-link active'
                    : 'nav-link'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Незнакомые слова
              </button>
              <button
                onClick={() => setActiveTab('all-terms')}
                className={`${
                  activeTab === 'all-terms'
                    ? 'nav-link active'
                    : 'nav-link'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                База терминов
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'nav-link active'
                    : 'nav-link'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Настройки
              </button>
            </nav>
          </div>
          {renderContent()}
        </div>
      </div>
      <TermModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        term={selectedTerm?.term}
        translation={selectedTerm?.translation}
        category={selectedTerm?.category}
      />
    </div>
  );
};

export default Dashboard;