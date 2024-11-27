import logging
import os
import requests
from google.cloud import translate_v2 as translate

# Опциональные импорты для Helsinki-NLP
try:
    import torch
    from transformers import MarianMTModel, MarianTokenizer
    HELSINKI_NLP_AVAILABLE = True
except ImportError:
    HELSINKI_NLP_AVAILABLE = False

logger = logging.getLogger(__name__)

class TranslationService:
    def __init__(self):
        self.translation_methods = []

        # Инициализация Helsinki-NLP если доступен
        if HELSINKI_NLP_AVAILABLE:
            try:
                self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
                self.default_model_name = 'Helsinki-NLP/opus-mt-en-ru'
                self.initialize_helsinki_model()
                self.translation_methods.append('helsinki')
                logger.info(f"Helsinki-NLP model initialized on {self.device}")
            except Exception as e:
                logger.warning(f"Could not initialize Helsinki-NLP: {e}")

        # Инициализация Google Cloud Translation
        try:
            self.client = translate.Client()
            self.translation_methods.append('google')
            logger.info("Google Cloud Translation initialized")
        except Exception as e:
            logger.warning(f"Could not initialize Google Cloud Translation: {e}")
            self.client = None

        # Всегда добавляем базовый метод как fallback
        self.translation_methods.append('basic')
        logger.info(f"Available translation methods: {', '.join(self.translation_methods)}")

    def initialize_helsinki_model(self):
        """Инициализация модели Helsinki-NLP."""
        if not HELSINKI_NLP_AVAILABLE:
            return

        try:
            cache_dir = os.path.join(os.path.dirname(__file__), 'model_cache')
            os.makedirs(cache_dir, exist_ok=True)

            self.default_tokenizer = MarianTokenizer.from_pretrained(
                self.default_model_name,
                cache_dir=cache_dir
            )

            self.default_model = MarianMTModel.from_pretrained(
                self.default_model_name,
                cache_dir=cache_dir
            ).to(self.device)

        except Exception as e:
            logger.error(f"Error initializing Helsinki-NLP model: {e}")
            raise

    def translate(self, text: str, source_lang: str = 'en', target_lang: str = 'ru') -> str:
        """Перевести текст, используя доступные методы в порядке приоритета."""
        if not text.strip():
            return ""

        for method in self.translation_methods:
            try:
                if method == 'helsinki' and HELSINKI_NLP_AVAILABLE:
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

                elif method == 'google' and self.client:
                    result = self.client.translate(
                        text,
                        target_language=target_lang,
                        source_language=source_lang
                    )
                    return result['translatedText']

                elif method == 'basic':
                    return self._basic_translation(text, source_lang, target_lang)

            except Exception as e:
                logger.error(f"Error with {method} translation: {e}")
                continue

        return text  # Возвращаем оригинальный текст, если все методы не сработали

    def _basic_translation(self, text: str, source_lang: str, target_lang: str) -> str:
        """Базовый метод перевода через публичное API."""
        try:
            url = "https://api.mymemory.translated.net/get"
            params = {
                'q': text,
                'langpair': f'{source_lang}|{target_lang}'
            }
            response = requests.get(url, params=params)
            data = response.json()

            if response.status_code == 200 and data['responseStatus'] == 200:
                return data['responseData']['translatedText']

            raise Exception("Translation API error")

        except Exception as e:
            logger.error(f"Basic translation error: {str(e)}")
            return text

# Создание глобального экземпляра сервиса
try:
    translator = TranslationService()
    logger.info("Translation service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize translation service: {e}")
    raise
