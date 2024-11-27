# backend/app/services/gemini_service.py

# Standard library imports
import os
import logging
import asyncio
from concurrent.futures import TimeoutError
from typing import List, Dict

# Third-party imports
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self, api_key: str):
        '''Инициализация Gemini сервиса.'''
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.models = {
            'gemini-1.5-pro': genai.GenerativeModel('gemini-1.5-pro'),
            'gemini-1.5-flash': genai.GenerativeModel('gemini-1.5-flash'),
            'gemini-1.5-flash-8b': genai.GenerativeModel('gemini-1.5-flash-8b')
        }
        
    def get_model(self, model_name: str):
        return self.models.get(model_name, self.models['gemini-1.5-flash'])
        
    def generate_evaluation_text(self, words: List[str], categories: Dict[str, str], model_name: str = 'gemini-1.5-pro', timeout: int = 10) -> Dict:
        '''Генерация текста с использованием выбранной модели Gemini.'''
        prompt = (
            "Generate a short technical scenario (90-150 words) that naturally "
            f"incorporates these technical terms: {', '.join(words)}.\n"
            "The scenario should be challenging but realistic, suitable for evaluating "
            "technical knowledge. Focus on practical application in a work situation."
        )
        
        try:
            model = self.get_model(model_name)
            response = model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 200,
                }
            )
            
            if not response or not response.text:
                logger.error("Empty response from Gemini")
                raise Exception("Empty response from Gemini")
                
            text = response.text.strip()
            logger.info(f"Generated text: {text}")
            
            return {
                "text": text,
                "categories": categories
            }
        except Exception as e:
            logger.error(f"Error generating evaluation text with Gemini: {e}")
            # В случае ошибки возвращаем запасной вариант через Ollama
            logger.info("Falling back to Ollama")
            from .ollama_service import KnowledgeEvaluator
            evaluator = KnowledgeEvaluator(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'words', 'categorized_words.md'))
            return evaluator.generate_evaluation_text(words, categories)

    def explain_term(self, term: str, category: str = None, model_name: str = None) -> str:
        '''Объяснение термина с использованием выбранной модели Gemini.'''
        prompt = f"""
        Explain the technical term '{term}' in simple terms.
        If provided, this term belongs to the category: {category}
        
        Provide a clear and concise explanation that would help a developer understand:
        1. What it is
        2. When it's used
        3. Why it's important
        
        Keep the explanation under 100 words and focus on practical understanding.
        """
        
        try:
            model = self.get_model(model_name) if model_name else self.get_model('gemini-1.5-pro')
            
            response = model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 200,
                }
            )
            
            if not response or not response.text:
                raise Exception("Empty response from Gemini")
                
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error explaining term with Gemini: {e}")
            raise

    def translate_text(self, prompt: str, model_name: str = None) -> str:
        '''Перевод текста с использованием выбранной модели Gemini.'''
        try:
            model = self.get_model(model_name) if model_name else self.get_model('gemini-1.5-flash')
            
            response = model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,  # Меньшая температура для более точного перевода
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 400,
                }
            )
            
            if not response or not response.text:
                raise Exception("Empty response from Gemini")
                
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error translating with Gemini: {e}")
            raise