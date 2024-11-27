import React from 'react';
import { motion } from 'framer-motion';

const UsedTermsSection = ({ terms }) => (
  <div className="bg-dark-card rounded-2xl p-6 border border-gray-800">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-1">
          Использованные термины
        </h3>
        <p className="text-sm text-gray-400">
          Технические термины, встречающиеся в тексте
        </p>
      </div>
      <div className="bg-dark-lighter text-primary px-3 py-1 rounded-lg text-sm font-medium border border-gray-800">
        {Object.keys(terms).length} терминов
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(terms).map(([term, category]) => {
        const [mainCategory, subCategory] = category.split('->').map(s => s.trim());
        
        return (
          <motion.div
            key={term}
            className="bg-dark-lighter p-4 rounded-xl hover:border-primary border border-gray-800 transition-colors"
          >
            <h4 className="text-primary font-semibold mb-2">{term}</h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-300">{mainCategory}</p>
              <p className="text-sm text-gray-500">{subCategory}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

const TranslationToggle = ({ enabled, onChange }) => (
  <div className="absolute top-4 right-4 z-50">
    <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-3 bg-dark-card border border-gray-800">
      <span className="text-sm text-gray-400 font-medium whitespace-nowrap">
        Перевод при наведении
      </span>
      <label className="relative inline-block w-11 h-6">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="hidden"
        />
        <div 
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
            enabled ? 'bg-primary' : 'bg-gray-600'
          }`}
        >
          <div 
            className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 top-0.5 left-0.5 ${
              enabled ? 'transform translate-x-5' : ''
            }`}
          />
        </div>
      </label>
    </div>
  </div>
);

export { UsedTermsSection, TranslationToggle };