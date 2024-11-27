import os
import random
import asyncio
from typing import List, Dict
import markdown
import logging
from langchain.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from flask import Flask, render_template, request, jsonify

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KnowledgeEvaluator:
    def __init__(self, words_file: str, base_url: str = "http://localhost:11434"):
        """Инициализация оценщика знаний."""
        self.llm = ChatOllama(model="llama3:instruct", base_url=base_url)
        self.categories = self._load_words_from_file(words_file)
        
    def _load_words_from_file(self, filepath: str) -> Dict[str, Dict[str, List[str]]]:
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
                            categories[current_category][current_subcategory].append(word)
        except Exception as e:
            logger.error(f"Error loading words file: {e}")
            return {}
            
        return categories

    def _select_random_words(self, num_words: int = 5) -> tuple[List[str], Dict[str, str]]:
        """Выбирает случайные слова из всех категорий и возвращает их категории."""
        all_words = []
        word_categories = {}  # Словарь для хранения категорий слов
        
        for category, subcategories in self.categories.items():
            for subcategory, words in subcategories.items():
                for word in words:
                    all_words.append(word)
                    word_categories[word] = f"{category} -> {subcategory}"
        
        selected_words = random.sample(all_words, min(num_words, len(all_words)))
        selected_categories = {word: word_categories[word] for word in selected_words}
        
        return selected_words, selected_categories

    def generate_evaluation_text(self, words: List[str], categories: Dict[str, str]) -> Dict:
        prompt = PromptTemplate(
            template=(
                "STRICT FORMAT FOR ANSWER: ```\n scenario \n```\n"
                "Generate a short technical scenario (90-150 words) that naturally "
                "incorporates these technical terms: {words}.\n"
                "The scenario should be challenging but realistic, suitable for evaluating "
                "technical knowledge. Focus on practical application in a work situation.\n"
                "Terms to include: {words}"
            ),
            input_variables=["words"]
        )
        
        try:
            response = self.llm.invoke(
                prompt.format(words=", ".join(words))
            )
            # Очищаем текст от маркеров и слова "scenario"
            text = response.content.strip()
            text = text.replace("```", "").strip()
            text = text.replace("scenario", "").strip()
            text = text.replace("Scenario:", "").strip()
            text = text.replace("Scenario", "").strip()
            return {
                "text": text,  # Изменено с "scenario" на "text"
                "categories": categories
            }
        except Exception as e:
            logger.error(f"Error generating evaluation text: {e}")
            return {
                "text": "Failed to generate scenario",  # Добавлен текст по умолчанию
                "categories": categories
            }

async def main():
    words_file = r'Q:\PythonProjects\ENGY\words\categorized_words.md'
    evaluator = KnowledgeEvaluator(words_file)
    selected_words, categories = evaluator._select_random_words()
    result = await evaluator.generate_evaluation_text(selected_words, categories)
    
    if "error" not in result:
        print("\nГенерированный текст:")
        print("-" * 80)
        print(result["text"])
        print("-" * 80)
        print("\nИспользованные термины и их категории:")
        for word, category in result["categories"].items():
            print(f"- {word}: {category}")
    else:
        print("Ошибка:", result["error"])

if __name__ == "__main__":
    asyncio.run(main())