# backend/app/services/gemini_service.py

# Standard library imports
import json
import logging
from typing import Dict, List

# Third-party imports
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


class GeminiService:
    def __init__(self, api_key: str):
        """Инициализация Gemini сервиса."""
        if not api_key:
            raise ValueError('API key is required')

        self.api_key = api_key
        genai.configure(api_key=api_key)
        # Используем только gemini-1.5-flash
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info('GeminiService initialized')

    def generate_evaluation_text(
        self, words: List[str], categories: Dict[str, str], **kwargs
    ) -> Dict:
        """Генерация текста с использованием Gemini."""
        prompt = (
            "Generate a short technical scenario (90-150 words) that naturally "
            f"incorporates these technical terms: {', '.join(words)}.\n"
            "The scenario should be challenging but realistic, suitable for evaluating "
            "technical knowledge. Focus on practical application in a work situation."
        )

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 200,
                },
            )

            if response and response.text:
                return {'text': response.text.strip(), 'categories': categories}
            raise Exception('Empty response from Gemini')

        except Exception as e:
            logger.error(f'Error generating evaluation text with Gemini: {e}')
            return {
                'text': f"Unable to generate scenario. Selected terms: {', '.join(words)}.",
                'categories': categories,
            }

    def explain_term(self, term: str, category: str = None) -> str:
        """Объяснение термина."""
        prompt = f"""
        Explain the technical term '{term}' in simple terms.
        {f"This term belongs to the category: {category}" if category else ""}

        Provide a clear and concise explanation that would help a developer understand:
        1. What it is
        2. When it's used
        3. Why it's important

        Keep the explanation under 100 words and focus on practical understanding.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 200,
                },
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            return response.text.strip()

        except Exception as e:
            logger.error(f'Error explaining term with Gemini: {e}')
            return f'Failed to explain term: {str(e)}'

    def translate_text(self, prompt: str) -> str:
        """Перевод текста."""
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 400,
                },
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            return response.text.strip()

        except Exception as e:
            logger.error(f'Error translating with Gemini: {e}')
            raise

    def categorize_words(self, prompt: str) -> str:
        """Categorize words using Gemini."""
        try:
            response = self.get_model(
                'gemini-1.5-pro'
            ).generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,  # Используем низкую температуру для более точной категоризации
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 1000,
                },
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            return response.text.strip()

        except Exception as e:
            logger.error(f'Error categorizing words with Gemini: {e}')
            raise

    def generate_dialogue(self, terms):
        try:
            terms_list = [t.term for t in terms]
            prompt = f"""
            Create a technical chat dialogue between colleagues using these terms: {', '.join(terms_list)}

            VERY IMPORTANT:
            1. Preserve spaces in compound terms (e.g., "lazy loading" should remain "lazy loading", not "lazyloading")
            2. When providing words array, keep compound terms as separate elements (e.g., ["lazy", "loading"] not ["lazyloading"])
            3. The correctAnswer must exactly match the message text
            4. All compound terms must keep their spaces in all places they appear

            Format example:
            {{
                "steps": [
                    {{
                        "messages": [
                            {{
                                "isUser": false,
                                "text": "Have you implemented lazy loading for the images?",
                                "translation": "Вы реализовали ленивую загрузку для изображений?"
                            }},
                            {{
                                "isUser": true,
                                "text": "Yes, I've implemented lazy loading now.",
                                "translation": "Да, я реализовал ленивую загрузку."
                            }}
                        ],
                        "words": ["lazy", "loading", "implemented", "now"],
                        "correctAnswer": "Yes, I've implemented lazy loading now."
                    }}
                ]
            }}

            Requirements:
            - Keep all spaces in compound terms
            - Split compound terms into separate words in the words array
            - Ensure exact match between correctAnswer and message text
            - Professional or Semi-Proffesional context
            - 2-3 dialogue steps, short messages about 1 sentence
            """

            # Установим более низкую температуру для более предсказуемых результатов
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,  # Снижаем температуру
                    'top_p': 0.95,
                    'top_k': 40,
                    'max_output_tokens': 1000,
                }
            )

            if not response or not response.text:
                raise Exception('Empty response from Gemini')

            # Очищаем и подготавливаем текст для парсинга JSON
            text = response.text.strip()
            # Находим первую открывающую и последнюю закрывающую скобки
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = text[start:end]
            else:
                raise ValueError('No valid JSON structure found in response')

            try:
                data = json.loads(json_str)
            except json.JSONDecodeError as e:
                logger.error(f'JSON decode error: {e}\nResponse text: {text}')
                raise

            # Валидация и очистка данных
            if not isinstance(data, dict) or 'steps' not in data:
                raise ValueError('Invalid JSON structure: missing steps')

            # Очищаем и валидируем каждый шаг
            cleaned_steps = []
            for step in data['steps']:
                if not isinstance(step, dict):
                    continue

                # Проверяем обязательные поля
                if not all(key in step for key in ['messages', 'words', 'correctAnswer']):
                    continue

                # Очищаем слова
                clean_words = [w for w in step['words'] if w and isinstance(w, str) and w.strip()]

                # Очищаем сообщения
                clean_messages = []
                for msg in step['messages']:
                    if isinstance(msg, dict) and all(key in msg for key in ['isUser', 'text', 'translation']):
                        clean_messages.append({
                            'isUser': bool(msg['isUser']),
                            'text': msg['text'].strip(),
                            'translation': msg['translation'].strip()
                        })

                if clean_messages and clean_words:
                    cleaned_step = {
                        'messages': clean_messages,
                        'words': clean_words,
                        'correctAnswer': step['correctAnswer'].strip()
                    }
                    cleaned_steps.append(cleaned_step)

            if not cleaned_steps:
                raise ValueError('No valid steps after cleaning')

            return {'steps': cleaned_steps}

        except Exception as e:
            logger.error(f'Error in generate_dialogue: {e}')
            # В случае ошибки возвращаем базовый диалог
            return self._fallback_dialogue()

    def _fallback_dialogue(self):
        """Возвращает базовый диалог в случае ошибки."""
        return {
            'steps': [
                {
                    'messages': [
                        {
                            'isUser': False,
                            'text': 'Could not generate dialogue',
                            'translation': 'Не удалось сгенерировать диалог',
                        },
                        {
                            'isUser': True,
                            'text': 'Please try again later',
                            'translation': 'Пожалуйста, попробуйте позже',
                        },
                    ],
                    'words': ['error', 'try', 'later'],
                    'correctAnswer': 'Please try again later',
                }
            ]
        }

    def get_model(self, model_name='gemini-1.5-pro'):
        """Get specific Gemini model"""
        try:
            return genai.GenerativeModel(model_name)
        except Exception as e:
            logger.error(f'Error getting model {model_name}: {e}')
            return self.model


    def improve_translations(self, pairs_data, pairs_count = 15):
        """
        Улучшает переводы пар слов с помощью Gemini.

        Args:
            pairs_data: словарь с парами для перевода
        Returns:
            dict: улучшенные пары переводов
        """
        try:
            # Формируем текст пар для промпта
            pairs_text = "\n".join([f"{p['english']} - {p['russian']}" for p in pairs_data['pairs']])

            prompt = f"""
            Improve these English-Russian translation pairs and return in JSON format.
            Make translations more natural and technically accurate.
            Original pairs:
            {pairs_text}

            Requirements:
            1. Keep technical terms precise
            2. Make Russian translations natural and professional
            3. Return exactly {pairs_count} pairs
            4. Format response strictly as JSON:
            {{
                "english": ["word1", "word2", "word3", "word4", "word5"],
                "russian": ["перевод1", "перевод2", "перевод3", "перевод4", "перевод5"]
            }}
            """

            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 1000,
                }
            )

            # Извлекаем JSON из ответа
            text = response.text.strip()
            # Находим начало и конец JSON
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = text[start:end]
                result = json.loads(json_str)

                # Проверяем структуру ответа
                if isinstance(result, dict) and 'english' in result and 'russian' in result:
                    return {
                        'english': result['english'],
                        'russian': result['russian']
                    }

            raise ValueError('Invalid response format')

        except Exception as e:
            logger.error(f'Error in improve_translations: {e}')
            # Возвращаем исходные пары в правильном формате
            original_pairs = pairs_data['pairs']
            return {
                'english': [p['english'] for p in original_pairs],
                'russian': [p['russian'] for p in original_pairs]
            }
