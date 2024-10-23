from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import json
import os
import logging
from deep_translator import GoogleTranslator
from tqdm import tqdm

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

logger = logging.getLogger(__name__)

class TextPreprocessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.keywords = []
        self.translations = {}
        self.load_keywords()
        self.load_translations()
        self.translator = GoogleTranslator(source='en', target='ru')

    def get_words(self, text):
        words = word_tokenize(text.lower())
        words = [word for word in words if word.isalnum() and word not in self.stop_words and len(word) > 2]
        return words

    def get_keywords(self, text=None):
        if text and not self.keywords:
            words = self.get_words(text)
            word_freq = Counter(words)
            avg_freq = sum(word_freq.values()) / len(word_freq)
            self.keywords = [word for word, freq in word_freq.items() if freq > avg_freq]
            self.save_keywords()
        return self.keywords

    def save_keywords(self):
        with open('keywords.json', 'w', encoding='utf-8') as f:
            json.dump(self.keywords, f, ensure_ascii=False, indent=2)
        logger.info(f"Сохранено {len(self.keywords)} ключевых слов")

    def load_keywords(self):
        if os.path.exists('keywords.json'):
            with open('keywords.json', 'r', encoding='utf-8') as f:
                self.keywords = json.load(f)
            logger.info(f"Загружено {len(self.keywords)} ключевых слов")

    def translate_keywords(self):
        logger.info("Начало перевода ключевых слов")
        untranslated = [word for word in self.keywords if word not in self.translations]
        total_words = len(untranslated)

        if total_words == 0:
            logger.info("Все слова уже переведены")
            return

        for i, word in enumerate(tqdm(untranslated, desc="Перевод слов")):
            try:
                translation = self.translator.translate(word)
                self.translations[word] = translation
            except Exception as e:
                logger.error(f"Ошибка при переводе слова '{word}': {e}")

            if (i + 1) % 100 == 0:  # Сохраняем каждые 100 слов
                self.save_translations()
                logger.info(f"Обработано {i+1}/{total_words} слов")

        self.save_translations()
        logger.info(f"Перевод завершен. Всего переведено {len(self.translations)} слов")

    def save_translations(self):
        with open('translations.json', 'w', encoding='utf-8') as f:
            json.dump(self.translations, f, ensure_ascii=False, indent=2)

    def load_translations(self):
        if os.path.exists('translations.json'):
            with open('translations.json', 'r', encoding='utf-8') as f:
                self.translations = json.load(f)
            logger.info(f"Загружено {len(self.translations)} переводов")

    def remove_stopwords(self, text):
        words = word_tokenize(text)
        return ' '.join([word for word in words if word.lower() not in self.stop_words])
