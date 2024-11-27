# backend/app/services/translation_service.py

import torch
import logging
import nltk
from transformers import MarianMTModel, MarianTokenizer
import os

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler('translation.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class TranslationService:
    def __init__(self):
        # Настройка CUDA
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logging.info(f"Using device: {self.device}")

        # Загрузка необходимых данных NLTK
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
            nltk.download('omw-1.4')

        # Инициализация базовой модели
        self.default_model_name = 'Helsinki-NLP/opus-mt-en-ru'
        self.initialize_default_model()

    def initialize_default_model(self):
        """Инициализация модели перевода."""
        try:
            cache_dir = os.path.join(os.path.dirname(__file__), 'model_cache')
            os.makedirs(cache_dir, exist_ok=True)
            
            logging.info("Loading tokenizer...")
            self.default_tokenizer = MarianTokenizer.from_pretrained(
                self.default_model_name,
                cache_dir=cache_dir
            )
            
            logging.info("Loading model...")
            self.default_model = MarianMTModel.from_pretrained(
                self.default_model_name,
                cache_dir=cache_dir
            ).to(self.device)
            
            logging.info("Model and tokenizer loaded successfully")
            
        except Exception as e:
            logging.error(f"Error initializing model: {e}")
            self.default_model = None
            self.default_tokenizer = None
            raise

    def translate(self, text: str, source_lang: str = 'en', target_lang: str = 'ru') -> str:
        """Перевести текст на целевой язык."""
        try:
            if not self.default_model or not self.default_tokenizer:
                return "Translation service not initialized properly"

            # Проверяем, что текст не пустой
            if not text.strip():
                return ""

            # Токенизация и перевод
            inputs = self.default_tokenizer(
                text, 
                return_tensors="pt", 
                padding=True
            ).to(self.device)
            
            translated = self.default_model.generate(**inputs)
            result = self.default_tokenizer.decode(
                translated[0], 
                skip_special_tokens=True
            )

            return result

        except Exception as e:
            logging.error(f"Translation error: {str(e)}")
            return f"Translation error occurred"

# Создание глобального экземпляра сервиса
try:
    translator = TranslationService()
    logging.info("Translation service initialized successfully")
except Exception as e:
    logging.error(f"Failed to initialize translation service: {e}")
    raise