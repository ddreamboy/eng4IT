# backend/app/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from services.ollama_service import KnowledgeEvaluator
from services.gemini_service import GeminiService
from services.translation_service import translator
from database.db import Session, Scenario, AssessmentWord, ModelConfig
import json
import os
import random
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Включаем CORS для работы с React

WORDS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'words')
UNKNOWN_WORDS_FILE = os.path.join(WORDS_DIR, 'unknown_words.txt')
GEMINI_API_KEY = ''

# Создаем необходимые директории и файлы
if not os.path.exists(WORDS_DIR):
    os.makedirs(WORDS_DIR)
if not os.path.exists(UNKNOWN_WORDS_FILE):
    with open(UNKNOWN_WORDS_FILE, 'w', encoding='utf-8') as f:
        pass
    
# Инициализация сервисов
ollama_service = KnowledgeEvaluator(os.path.join(WORDS_DIR, 'categorized_words.md'))
gemini_service = GeminiService(GEMINI_API_KEY)


def get_current_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            return None, None
        return config.current_model, config.gemini_api_key
    finally:
        session.close()
        

@app.route('/api/model/current', methods=['GET'])
def get_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            # Создаем конфигурацию по умолчанию
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                gemini_api_key=None
            )
            session.add(config)
            session.commit()
            
        return jsonify({
            'model': config.current_model,
            'sub_model': config.sub_model,
            'has_api_key': bool(config.gemini_api_key)
        })
    finally:
        session.close()


@app.route('/api/all-terms', methods=['GET'])
def get_all_terms():
    logger.info("Request received: %s", request.path)
    try:
        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        terms = {}
        
        if not os.path.exists(words_file):
            return jsonify({'error': 'Words file not found'}), 404
                
        current_category = None
        current_subcategory = None
        
        with open(words_file, 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if line.startswith('# '):
                    current_category = line[2:]
                elif line.startswith('## '):
                    current_subcategory = line[3:]
                elif line.startswith('- '):
                    term = line[2:]
                    if current_category and current_subcategory:
                        terms[term] = f"{current_category} -> {current_subcategory}"
        
        if not terms:
            logger.warning("No terms found in the file")
                
        return jsonify(terms)
    except Exception as e:
        logger.error(f"Error getting all terms: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain-term', methods=['POST'])
def explain_term():
    data = request.json
    term = data.get('term')
    category = data.get('category')
    
    # Выбираем сервис в зависимости от текущей модели
    current_model, api_key = get_current_model()
    
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
        logger.info(f"Explaining term {term} using {current_model}")

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info("Using Gemini for explanation")
            gemini_service = GeminiService(api_key)
            try:
                response = gemini_service.explain_term(term, category)
                explanation = response.strip()
            except Exception as e:
                logger.error(f"Gemini explanation failed: {e}")
                # Если Gemini не сработал, используем Ollama как fallback
                service = KnowledgeEvaluator(os.path.join(WORDS_DIR, 'categorized_words.md'))
                response = service.llm.invoke(prompt)
                explanation = response.content
        else:
            # Используем Ollama
            logger.info("Using Ollama for explanation")
            service = KnowledgeEvaluator(os.path.join(WORDS_DIR, 'categorized_words.md'))
            response = service.llm.invoke(prompt)
            explanation = response.content

        return jsonify({
            'explanation': explanation.strip()
        })
    except Exception as e:
        logger.error(f"Error explaining term: {e}")
        return jsonify({
            'error': 'Failed to generate explanation'
        }), 500


@app.route('/api/unknown-words', methods=['GET'])
def get_unknown_words():
    try:
        words = []
        with open(UNKNOWN_WORDS_FILE, 'r', encoding='utf-8') as file:
            for line in file:
                if ':::' in line:
                    original, translation = line.strip().split(':::')
                    words.append({
                        'original': original,
                        'translation': translation
                    })
        return jsonify(words)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/set', methods=['POST'])
def set_model():
    data = request.json
    model_name = data.get('model')
    sub_model = data.get('sub_model')
    api_key = data.get('api_key')
    
    if model_name not in ['ollama', 'gemini']:
        return jsonify({'error': 'Invalid model name'}), 400
        
    # Устанавливаем значения по умолчанию для подмоделей
    if not sub_model:
        sub_model = 'llama3.2' if model_name == 'ollama' else 'gemini-1.5-pro'
        
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model=model_name,
                sub_model=sub_model,
                gemini_api_key=api_key if model_name == 'gemini' else None
            )
            session.add(config)
        else:
            config.current_model = model_name
            config.sub_model = sub_model
            if model_name == 'gemini' and api_key:
                config.gemini_api_key = api_key
        
        session.commit()
        return jsonify({'status': 'success'})
    finally:
        session.close()


@app.route('/api/scenario', methods=['GET'])
def get_scenario():
    session = Session()
    try:
        scenario = session.query(Scenario).order_by(Scenario.created_at.desc()).first()
        
        if not scenario:
            words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
            selected_words, categories = ollama_service._select_random_words()
            
            # Выбор сервиса генерации на основе текущей модели
            service = gemini_service if get_current_model() == 'gemini' else ollama_service
            result = service.generate_evaluation_text(selected_words, categories)
            
            scenario = Scenario(
                text=result['text'],
                terms=json.dumps(result['categories'])
            )
            session.add(scenario)
            session.commit()
        
        return jsonify({
            'text': scenario.text,
            'categories': json.loads(scenario.terms)
        })
    finally:
        session.close()

@app.route('/api/generate_new', methods=['POST'])
def generate_new():
    session = Session()
    try:
        current_model, api_key = get_current_model()
        logger.info(f"Generating new scenario with model: {current_model}")
        
        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        evaluator = KnowledgeEvaluator(words_file)
        selected_words, categories = evaluator._select_random_words()
        
        try:
            if current_model == 'gemini' and api_key:
                # Используем Gemini с таймаутом
                logger.info("Using Gemini for generation")
                gemini_service = GeminiService(api_key)
                result = gemini_service.generate_evaluation_text(selected_words, categories)
            else:
                # Используем Ollama
                logger.info("Using Ollama for generation")
                result = evaluator.generate_evaluation_text(selected_words, categories)
                
            logger.info(f"Generation result: {result}")
            
            if not result or not result.get('text'):
                raise Exception("Empty result from generation service")
                
            new_scenario = Scenario(
                text=result['text'],
                terms=json.dumps(result['categories'])
            )
            session.add(new_scenario)
            session.commit()
            
            return jsonify({
                'text': new_scenario.text,
                'categories': json.loads(new_scenario.terms)
            })
            
        except Exception as e:
            logger.error(f"Error during generation: {e}")
            # В случае ошибки возвращаем стандартный текст
            return jsonify({
                'text': "An error occurred while generating the scenario. Please try again.",
                'categories': categories
            }), 500
            
    finally:
        session.close()

@app.route('/api/translate', methods=['POST'])
def translate_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'ru')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        translation = translator.translate(text, source_lang, target_lang)
        return jsonify({'translation': translation})
        
    except Exception as e:
        print(f"Translation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save_words', methods=['POST'])
def save_words():
    logger.info("Request received: %s", request.path)
    try:
        words = request.get_json()['words']
        if not words:
            return jsonify({'error': 'No words provided'}), 400
                
        with open(UNKNOWN_WORDS_FILE, 'a', encoding='utf-8') as file:
            for word_data in words:
                if 'original' in word_data and 'translation' in word_data:
                    file.write(f"{word_data['original']}:::{word_data['translation']}\n")
                        
        return jsonify({'status': 'success'})
    except Exception as e:
        logger.error(f"Error saving words: {e}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/assessment-words', methods=['GET'])
def get_assessment_words():
    try:
        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        session = Session()
        
        # Проверяем, есть ли уже слова в базе
        existing_words = session.query(AssessmentWord).all()
        
        if not existing_words:
            # Если слов нет, парсим их из файла и добавляем в базу
            with open(words_file, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # Парсим markdown и собираем слова из разных категорий
            categories = {}
            current_category = None
            subcategory = None
            
            for line in content.split('\n'):
                if line.startswith('# '):
                    current_category = line[2:].strip()
                    categories[current_category] = {}
                elif line.startswith('## '):
                    subcategory = line[3:].strip()
                    categories[current_category][subcategory] = []
                elif line.startswith('- '):
                    word = line[2:].strip()
                    if current_category and subcategory:
                        # Добавляем слово в базу данных
                        assessment_word = AssessmentWord(
                            word=word,
                            category=f"{current_category}/{subcategory}"
                        )
                        session.add(assessment_word)
            
            session.commit()
            existing_words = session.query(AssessmentWord).all()
        
        # Выбираем 10 случайных слов
        selected_words = random.sample(existing_words, min(21, len(existing_words)))
        
        # Форматируем ответ
        words_response = [
            {
                "id": word.id,
                "term": word.word,
                "category": word.category
            }
            for word in selected_words
        ]
        
        return jsonify({"words": words_response})
    
    except Exception as e:
        print(f"Error getting assessment words: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/assessment-results', methods=['POST'])
def save_assessment_results():
    try:
        data = request.get_json()
        unknown_words = data.get('unknownWords', [])
        
        # Сохраняем неизвестные слова в файл
        if unknown_words:
            with open(UNKNOWN_WORDS_FILE, 'a', encoding='utf-8') as file:
                for word in unknown_words:
                    translation = translator.translate(word['term'], 'en', 'ru')
                    file.write(f"{word['term']}:::{translation}\n")
        
        return jsonify({"status": "success"})
    
    except Exception as e:
        print(f"Error saving assessment results: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/translate-term', methods=['POST'])
def translate_term():
    data = request.json
    term = data.get('term')
    explanation = data.get('explanation', '')
    
    current_model, api_key = get_current_model()
    
    prompt = f"""
    Translate the following technical term and its explanation to Russian.
    Make the translation clear and professionally accurate.
    
    Term: {term} \n\n
    
    {f"Explanation: {explanation}" if explanation else ""}
    
    Format the response as:
    Term: [translated term] \n\n
    {f"Explanation: [translated explanation]" if explanation else ""}
    """
    
    try:
        logger.info(f"Translating term {term} using {current_model}")
        
        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info("Using Gemini for translation")
            gemini_service = GeminiService(api_key)
            try:
                translation = gemini_service.translate_text(prompt)
            except Exception as e:
                logger.error(f"Gemini translation failed: {e}")
                # Fallback на Ollama
                service = KnowledgeEvaluator(os.path.join(WORDS_DIR, 'categorized_words.md'))
                response = service.llm.invoke(prompt)
                translation = response.content
        else:
            # Используем Ollama
            logger.info("Using Ollama for translation")
            service = KnowledgeEvaluator(os.path.join(WORDS_DIR, 'categorized_words.md'))
            response = service.llm.invoke(prompt)
            translation = response.content
        
        return jsonify({
            'translation': translation.strip()
        })
    except Exception as e:
        logger.error(f"Error translating term: {e}")
        return jsonify({
            'error': 'Failed to translate'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)