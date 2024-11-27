import React from "react";

const TranslationOptions = ({ translations, onSelect }) => {
  if (!translations || translations.length === 0) {
    return null; // Возвращаем null, если translations не определен или пуст
  }

  return (
    <div className="translation-options">
      {translations.map((translation, index) => (
        <button
          key={index}
          className="translation-option"
          onClick={() => onSelect(translation)}
        >
          {translation}
        </button>
      ))}
    </div>
  );
};

export default TranslationOptions;
