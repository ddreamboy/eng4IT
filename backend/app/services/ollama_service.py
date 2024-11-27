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
        self.categories = self._load_words_from_file(words_file)
        self.base_url = base_url

        if LANGCHAIN_AVAILABLE:
            try:
                self.llm = Ollama(model='llama3:instruct', base_url=base_url)
            except Exception as e:
                logger.warning(f'Could not initialize Ollama: {e}')
                self.llm = None
        else:
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
        """Выбирает случайные слова из всех категорий и возвращает их категории."""
        all_words = []
        word_categories = {}

        for category, subcategories in self.categories.items():
            for subcategory, words in subcategories.items():
                for word in words:
                    all_words.append(word)
                    word_categories[word] = f'{category} -> {subcategory}'

        selected_words = random.sample(all_words, min(num_words, len(all_words)))
        selected_categories = {
            word: word_categories[word] for word in selected_words
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


if __name__ == '__main__':
    words_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'words',
        'categorized_words.md',
    )
    evaluator = KnowledgeEvaluator(words_file)
    selected_words, categories = evaluator._select_random_words()
    result = evaluator.generate_evaluation_text(selected_words, categories)

    print('\nГенерированный текст:')
    print('-' * 80)
    print(result['text'])
    print('-' * 80)
    print('\nИспользованные термины и их категории:')
    for word, category in result['categories'].items():
        print(f'- {word}: {category}')
