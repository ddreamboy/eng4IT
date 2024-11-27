
// frontend/src/components/WordList.js

import React from 'react';

const WordList = ({ word, translation, category, attempts, lastAttempt, onClick }) => {
  const formattedDate = lastAttempt 
    ? new Date(lastAttempt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div 
      className="term-card cursor-pointer hover:scale-[1.02] transition-transform"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="term">{word}</h4>
          <p className="translation">{translation}</p>
          {attempts > 0 && (
            <p className="text-sm text-gray-500">
              Попыток изучения: {attempts}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          {category && (
            <span className="category-tag mb-2">
              {category}
            </span>
          )}
          {lastAttempt && (
            <span className="text-xs text-gray-500">
              {formattedDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordList;