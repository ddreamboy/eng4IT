import json
import logging
import os
import random
from typing import Dict, List, Tuple

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Проверяем доступность langchain
try:
    from langchain.prompts import PromptTemplate
    from langchain_community.llms import Ollama

    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    logger.warning('Langchain not available, using basic template formatting')


class KnowledgeEvaluator:
    def __init__(self, words_file: str, base_url: str = 'http://localhost:11434'):
        """Инициализация оценщика знаний."""
        self.words_file = words_file
        # Добавляем значения по умолчанию для categories
        self.categories = {
            'Programming Basics': {
                'Algorithms': [],
                'Data Structures': [],
                'General': [],
            },
            'Web Development': {'Frontend': [], 'Backend': [], 'APIs': []},
        }

        # Пытаемся загрузить слова из файла
        try:
            loaded_categories = self._load_words_from_file(words_file)
            if loaded_categories:
                self.categories = loaded_categories
        except Exception as e:
            logger.warning(
                f'Could not load words from file: {e}. Using default categories.'
            )

        self.base_url = base_url
        self.llm = None

        # Пытаемся инициализировать Ollama
        if LANGCHAIN_AVAILABLE:
            try:
                self.llm = Ollama(model='llama2', base_url=base_url)
                self.llm.invoke('test')
            except Exception as e:
                logger.warning(f'Could not initialize Ollama: {e}')
                self.llm = None

    def _load_words_from_file(
        self, filepath: str
    ) -> Dict[str, Dict[str, List[str]]]:
        """Загружает слова из markdown файла."""
        categories = {}
        current_category = None
        current_subcategory = None

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('# '):
                        current_category = line[2:].strip()
                        categories[current_category] = {}
                    elif line.startswith('## '):
                        current_subcategory = line[3:].strip()
                        if current_category:
                            categories[current_category][current_subcategory] = []
                    elif line.startswith('- '):
                        word = line[2:].strip()
                        if current_category and current_subcategory:
                            categories[current_category][
                                current_subcategory
                            ].append(word)
        except Exception as e:
            logger.error(f'Error loading words file: {e}')
            return {}

        return categories

    def _select_random_words(
        self, num_words: int = 5
    ) -> Tuple[List[str], Dict[str, str]]:
        """Выбирает случайные слова из категорий."""
        all_words = []
        word_categories = {}

        # Добавляем базовые слова если нет других
        if not any(
            words
            for subcat in self.categories.values()
            for words in subcat.values()
        ):
            base_words = ['algorithm', 'database', 'API', 'framework', 'function']
            for word in base_words:
                all_words.append(word)
                word_categories[word] = 'Programming -> General'
        else:
            for category, subcategories in self.categories.items():
                for subcategory, words in subcategories.items():
                    for word in words:
                        all_words.append(word)
                        word_categories[word] = f'{category} -> {subcategory}'

        # Выбираем случайные слова
        if all_words:
            selected_words = random.sample(
                all_words, min(num_words, len(all_words))
            )
        else:
            selected_words = [
                'algorithm',
                'database',
                'API',
                'framework',
                'function',
            ][:num_words]

        selected_categories = {
            word: word_categories.get(word, 'Programming -> General')
            for word in selected_words
        }

        return selected_words, selected_categories

    def _format_prompt(self, words: List[str]) -> str:
        """Форматирует промпт для генерации текста."""
        template = (
            'Generate a short technical scenario (90-150 words) that naturally '
            'incorporates these technical terms: {words}.\n'
            'The scenario should be challenging but realistic, suitable for evaluating '
            'technical knowledge. Focus on practical application in a work situation.'
        )

        if LANGCHAIN_AVAILABLE:
            prompt = PromptTemplate(template=template, input_variables=['words'])
            return prompt.format(words=', '.join(words))
        else:
            return template.format(words=', '.join(words))

    def generate_evaluation_text(
        self, words: List[str], categories: Dict[str, str]
    ) -> Dict:
        """Генерация текста для оценки."""
        try:
            if self.llm:
                # Используем Ollama через langchain если доступно
                prompt = self._format_prompt(words)
                response = self.llm.invoke(prompt)
                text = (
                    response.content
                    if hasattr(response, 'content')
                    else str(response)
                )
            else:
                # Используем прямой запрос к API Ollama если langchain недоступен
                try:
                    response = requests.post(
                        f'{self.base_url}/api/generate',
                        json={
                            'model': 'llama3:instruct',
                            'prompt': self._format_prompt(words),
                        },
                    )
                    if response.status_code == 200:
                        text = response.json().get('response', '')
                    else:
                        raise Exception(
                            f'Ollama API error: {response.status_code}'
                        )
                except Exception as e:
                    logger.error(f'Error using Ollama API directly: {e}')
                    # Возвращаем базовый текст если все методы недоступны
                    text = (
                        f"This is a placeholder text for evaluation. "
                        f"The following terms need to be learned: {', '.join(words)}. "
                        "Please use Gemini model for actual text generation."
                    )

            # Очищаем текст от маркеров
            text = text.replace('```', '').strip()
            text = text.replace('scenario', '').strip()
            text = text.replace('Scenario:', '').strip()
            text = text.replace('Scenario', '').strip()

            return {'text': text, 'categories': categories}
        except Exception as e:
            logger.error(f'Error generating evaluation text: {e}')
            return {
                'text': 'Failed to generate scenario',
                'categories': categories,
            }

    def categorize_words(self, prompt: str) -> str:
        """Categorize words using Ollama."""
        try:
            if self.llm is None:
                try:
                    self.llm = Ollama(model='llama3.2', base_url=self.base_url)
                except Exception as e:
                    logger.error(f'Failed to initialize Ollama: {e}')
                    return self._fallback_categorization(prompt)

            # Добавляем инструкции для более точного форматирования
            enhanced_prompt = f"""{prompt}

    Important: Format each response strictly as:
    word: Category -> Subcategory

    For example:
    database: Databases -> SQL
    api: Web Development -> REST
    algorithm: Programming -> Data Structures

    Use existing categories when possible, create new ones only when necessary.
    Always include both Category and Subcategory separated by ' -> '."""

            response = self.llm.invoke(enhanced_prompt)
            result = (
                response.content if hasattr(response, 'content') else str(response)
            )

            # Проверяем формат ответа
            lines = result.strip().split('\n')
            formatted_lines = []

            for line in lines:
                if ':' in line and '->' in line:
                    word, category = line.split(':', 1)
                    category = category.strip()
                    word = word.strip()

                    # Проверяем правильность формата категории
                    if ' -> ' in category:
                        formatted_lines.append(f'{word}: {category}')
                    else:
                        # Если формат неправильный, используем базовую категорию
                        formatted_lines.append(f'{word}: Programming -> General')

            if not formatted_lines:
                return self._fallback_categorization(prompt)

            return '\n'.join(formatted_lines)

        except Exception as e:
            logger.error(f'Error categorizing words with Ollama: {e}')
            return self._fallback_categorization(prompt)

    def _fallback_categorization(self, prompt: str) -> str:
        """Базовая категоризация, когда LLM недоступен."""
        # Извлекаем слова из промпта
        words = []
        for line in prompt.split('\n'):
            if 'Words to categorize:' in line:
                words = line.split(':')[1].strip().split(', ')
                break

        # Возвращаем базовую категоризацию
        return '\n'.join([f'{word}: Programming -> General' for word in words])

    def generate_dialogue(self, terms):
        """Генерация диалога через Ollama."""
        prompt = f"""
        Create a technical chat dialogue between colleagues using these terms: {', '.join([t.term for t in terms])}

        Requirements:
        - Format as JSON with steps array
        - Each step must have messages array and words array
        - Do not include spaces or empty strings as words
        - Ensure all words are meaningful and non-empty
        - Professional context
        - Include translations
        """

        try:
            response = self.llm.invoke(prompt)
            content = response.content if hasattr(response, 'content') else str(response)
            data = json.loads(content)

            # Очищаем слова в каждом шаге
            for step in data['steps']:
                step['words'] = [w for w in step['words'] if w and w.strip()]
                step['correctAnswer'] = step['correctAnswer'].strip()

            return data

        except Exception as e:
            logger.error(f'Error generating dialogue with Ollama: {e}')
            return self._fallback_dialogue()

    def _fallback_dialogue(self):
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
                    'words': ['try', 'again', 'later'],
                    'correctAnswer': 'Please try again later',
                }
            ]
        }
