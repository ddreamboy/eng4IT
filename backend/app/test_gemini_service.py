# test_gemini_service.py
import json
import os
import unittest

from dotenv import load_dotenv
from services.gemini_service import GeminiService


class TestGeminiService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Инициализация сервиса перед всеми тестами."""
        load_dotenv()
        cls.api_key = os.getenv('GEMINI_API_KEY')
        if not cls.api_key:
            raise ValueError('GEMINI_API_KEY not found in environment variables')
        cls.service = GeminiService(cls.api_key)

    def test_initialization(self):
        """Тест инициализации сервиса."""
        # Проверка с правильным ключом
        service = GeminiService(self.api_key)
        self.assertIsNotNone(service.model)

        # Проверка с пустым ключом
        with self.assertRaises(ValueError):
            GeminiService('')

    def test_generate_evaluation_text(self):
        """Тест генерации текста."""
        words = ['API', 'database']
        categories = {'API': 'Web', 'database': 'DB'}

        result = self.service.generate_evaluation_text(words, categories)

        # Проверяем структуру ответа
        self.assertIsInstance(result, dict)
        self.assertIn('text', result)
        self.assertIn('categories', result)

        # Проверяем содержимое
        self.assertIsInstance(result['text'], str)
        self.assertTrue(len(result['text']) > 0)
        self.assertEqual(result['categories'], categories)

    def test_explain_term(self):
        """Тест объяснения термина."""
        # Тест без категории
        explanation = self.service.explain_term('API')
        self.assertIsInstance(explanation, str)
        self.assertTrue(len(explanation) > 0)

        # Тест с категорией
        explanation_with_category = self.service.explain_term(
            'API', 'Web Development'
        )
        self.assertIsInstance(explanation_with_category, str)
        self.assertTrue(len(explanation_with_category) > 0)

    def test_translate_text(self):
        """Тест перевода текста."""
        # Простой текст
        result = self.service.translate_text('Translate to Russian: Hello, world!')
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)

        # Технический текст
        tech_text = 'Translate to Russian: API (Application Programming Interface) is a set of rules.'
        tech_result = self.service.translate_text(tech_text)
        self.assertIsInstance(tech_result, str)
        self.assertTrue(len(tech_result) > 0)

    def test_categorize_words(self):
        """Тест категоризации слов."""
        prompt = """
        Given these categories:
        - Programming -> General
        - Web Development -> Frontend

        Please categorize: API, database
        """

        try:
            result = self.service.categorize_words(prompt)
            self.assertIsInstance(result, str)
            self.assertTrue(len(result) > 0)
            # Проверяем, что результат содержит ожидаемые слова
            self.assertTrue('API' in result)
            self.assertTrue('database' in result)
        except Exception as e:
            self.fail(f'categorize_words raised {type(e)} unexpectedly!')

    def test_generate_dialogue(self):
        """Тест генерации диалога."""

        # Создаем мок-объект для термина
        class MockTerm:
            def __init__(self, term):
                self.term = term

        terms = [MockTerm('API'), MockTerm('database')]

        try:
            result = self.service.generate_dialogue(terms)

            # Проверяем структуру JSON
            self.assertIsInstance(result, dict)
            self.assertIn('steps', result)
            self.assertIsInstance(result['steps'], list)

            if result['steps']:  # Если есть шаги
                step = result['steps'][0]
                self.assertIn('messages', step)
                self.assertIn('words', step)
                self.assertIn('correctAnswer', step)
        except json.JSONDecodeError:
            self.fail('generate_dialogue returned invalid JSON')
        except Exception as e:
            self.fail(f'generate_dialogue raised {type(e)} unexpectedly!')

    def test_error_handling(self):
        """Тест обработки ошибок."""
        # Тест с пустым списком слов
        result = self.service.generate_evaluation_text([], {})
        self.assertIn('text', result)
        self.assertIn('categories', result)

        # Тест с некорректным промптом
        with self.assertRaises(Exception):
            self.service.translate_text('')


if __name__ == '__main__':
    unittest.main(verbosity=2)
