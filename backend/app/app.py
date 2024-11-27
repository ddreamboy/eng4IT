# backend/app/app.py

import datetime
import json
import logging
import os
import random

import requests

# В начале файла app.py после импортов
from database.db import AssessmentWord, ModelConfig, Scenario, Session, init_db
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from models.base import LearningHistory, Term, UnknownTerm
from services.gemini_service import GeminiService
from services.ollama_service import KnowledgeEvaluator
from services.translation_service import translator

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Включаем CORS для работы с React

WORDS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'words'
)
UNKNOWN_WORDS_FILE = os.path.join(WORDS_DIR, 'unknown_words.txt')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Создаем необходимые директории и файлы
if not os.path.exists(WORDS_DIR):
    os.makedirs(WORDS_DIR)
if not os.path.exists(UNKNOWN_WORDS_FILE):
    with open(UNKNOWN_WORDS_FILE, 'w', encoding='utf-8') as f:
        pass

# Инициализация сервисов
ollama_service = KnowledgeEvaluator(
    os.path.join(WORDS_DIR, 'categorized_words.md')
)
gemini_service = GeminiService(GEMINI_API_KEY)


def initialize_assessment_words():
    """Инициализация базы данных словами из файла."""
    session = Session()
    try:
        # Проверяем, есть ли уже слова в базе
        existing_count = session.query(AssessmentWord).count()
        if existing_count > 0:
            logger.info(f'Database already contains {existing_count} words')
            return

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        if not os.path.exists(words_file):
            logger.error('Words file not found')
            return

        current_category = None
        current_subcategory = None
        words_added = 0

        with open(words_file, 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if line.startswith('# '):
                    current_category = line[2:].strip()
                elif line.startswith('## '):
                    current_subcategory = line[3:].strip()
                elif line.startswith('- '):
                    word = line[2:].strip()
                    if current_category and current_subcategory:
                        assessment_word = AssessmentWord(
                            word=word,
                            category=f'{current_category} -> {current_subcategory}',
                        )
                        session.add(assessment_word)
                        words_added += 1

        session.commit()
        logger.info(f'Added {words_added} words to assessment database')

    except Exception as e:
        logger.error(f'Error initializing assessment words: {e}')
        session.rollback()
    finally:
        session.close()


# Инициализация базы данных словами
initialize_assessment_words()


def get_current_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            # Если конфигурации нет, создаем с Gemini по умолчанию
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-pro',
                gemini_api_key=os.getenv('GEMINI_API_KEY'),
            )
            session.add(config)
            session.commit()
        return config.current_model, config.gemini_api_key
    finally:
        session.close()


def check_available_models():
    available_models = {
        'gemini': bool(os.getenv('GEMINI_API_KEY')),
        'ollama': False,  # По умолчанию недоступна
    }

    try:
        # Проверяем доступность Ollama
        response = requests.get('http://localhost:11434/api/tags')
        if response.status_code == 200:
            available_models['ollama'] = True
    except:
        pass

    return available_models


@app.route('/api/model/current', methods=['GET'])
def get_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                gemini_api_key=None,
            )
            session.add(config)
            session.commit()

        # Добавляем проверку на наличие ключа
        api_key = config.gemini_api_key if config.gemini_api_key else None
        has_api_key = bool(api_key)

        return jsonify(
            {
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': has_api_key,
                'api_key': api_key,  # Передаем реальный ключ
            }
        )
    finally:
        session.close()


@app.route('/api/all-terms', methods=['GET'])
def get_all_terms():
    logger.info('Request received: %s', request.path)
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
                        terms[term] = (
                            f'{current_category} -> {current_subcategory}'
                        )

        if not terms:
            logger.warning('No terms found in the file')

        return jsonify(terms)
    except Exception as e:
        logger.error(f'Error getting all terms: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain-term', methods=['POST'])
def explain_term():
    data = request.json
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    category = data.get('category')

    # Выбираем сервис в зависимости от текущей модели
    current_model, api_key = get_current_model()

    try:
        logger.info(f'Explaining term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for explanation')
            gemini_service = GeminiService(api_key)
            try:
                response = gemini_service.explain_term(term, category)
                explanation = response.strip()
                return jsonify({'explanation': explanation})
            except Exception as e:
                logger.error(f'Gemini explanation failed: {e}')
                # Возвращаем ошибку, если Gemini не сработал
                return jsonify(
                    {
                        'error': 'Failed to generate explanation with Gemini. Please check your API key or try again later.'
                    }
                ), 500
        else:
            # Если модель не Gemini или нет API ключа, возвращаем сообщение об ошибке
            return jsonify(
                {
                    'error': 'Gemini API key is required for term explanation. Please configure it in settings.'
                }
            ), 400

    except Exception as e:
        logger.error(f'Error explaining term: {e}')
        return jsonify({'error': 'Failed to generate explanation'}), 500


@app.route('/api/unknown-words', methods=['GET'])
def get_unknown_words():
    try:
        session = Session()
        try:
            unknown_terms = (
                session.query(Term, UnknownTerm)
                .join(UnknownTerm)
                .order_by(UnknownTerm.created_at.desc())
                .all()
            )

            words = [
                {
                    'original': term.term,
                    'translation': term.translation,
                    'category': term.category,
                    'attempts': unknown.attempts,
                    'last_attempt': unknown.last_attempt.isoformat()
                    if unknown.last_attempt
                    else None,
                }
                for term, unknown in unknown_terms
            ]

            return jsonify(words)
        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error getting unknown words: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/set', methods=['POST'])
def set_model():
    data = request.json
    model_name = data.get('model')
    sub_model = data.get('sub_model')
    api_key = data.get('api_key')

    if model_name not in ['ollama', 'gemini']:
        return jsonify({'error': 'Invalid model name'}), 400

    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            config = ModelConfig(
                current_model=model_name,
                sub_model=sub_model,
                gemini_api_key=api_key
                if model_name == 'gemini' and api_key
                else None,
            )
            session.add(config)
        else:
            config.current_model = model_name
            config.sub_model = sub_model
            if model_name == 'gemini':
                # Если ключ не предоставлен или пустой, устанавливаем его как None
                config.gemini_api_key = api_key if api_key else None
            else:
                # Если текущая модель не 'gemini', очищаем ключ
                config.gemini_api_key = None

        session.commit()
        return jsonify(
            {
                'status': 'success',
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': bool(config.gemini_api_key),
                'api_key': config.gemini_api_key,  # Возвращаем актуальный ключ
            }
        )
    finally:
        session.close()


@app.route('/api/scenario', methods=['GET'])
def get_scenario():
    session = Session()
    try:
        scenario = (
            session.query(Scenario).order_by(Scenario.created_at.desc()).first()
        )

        if not scenario:
            words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
            selected_words, categories = ollama_service._select_random_words()

            current_model, _ = get_current_model()
            service = (
                gemini_service if current_model == 'gemini' else ollama_service
            )
            result = service.generate_evaluation_text(selected_words, categories)

            scenario = Scenario(
                text=result['text'], terms=json.dumps(result['categories'])
            )
            session.add(scenario)
            session.commit()

        return jsonify(
            {'text': scenario.text, 'categories': json.loads(scenario.terms)}
        )
    finally:
        session.close()


@app.route('/api/generate_new', methods=['POST'])
def generate_new():
    session = Session()
    try:
        current_model, api_key = get_current_model()
        logger.info(f'Generating new scenario with model: {current_model}')

        words_file = os.path.join(WORDS_DIR, 'categorized_words.md')
        evaluator = KnowledgeEvaluator(words_file)
        selected_words, categories = evaluator._select_random_words()

        try:
            if current_model == 'gemini' and api_key:
                # Используем Gemini с таймаутом
                logger.info('Using Gemini for generation')
                gemini_service = GeminiService(api_key)
                result = gemini_service.generate_evaluation_text(
                    selected_words, categories
                )
            else:
                # Используем Ollama
                logger.info('Using Ollama for generation')
                result = evaluator.generate_evaluation_text(
                    selected_words, categories
                )

            logger.info(f'Generation result: {result}')

            if not result or not result.get('text'):
                raise Exception('Empty result from generation service')

            new_scenario = Scenario(
                text=result['text'], terms=json.dumps(result['categories'])
            )
            session.add(new_scenario)
            session.commit()

            return jsonify(
                {
                    'text': new_scenario.text,
                    'categories': json.loads(new_scenario.terms),
                }
            )

        except Exception as e:
            logger.error(f'Error during generation: {e}')
            # В случае ошибки возвращаем стандартный текст
            return jsonify(
                {
                    'text': 'An error occurred while generating the scenario. Please try again.',
                    'categories': categories,
                }
            ), 500

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
        print(f'Translation error: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/save_words', methods=['POST'])
def save_words():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            words = request.get_json()['words']
            if not words:
                return jsonify({'error': 'No words provided'}), 400

            for word_data in words:
                if 'original' in word_data and 'translation' in word_data:
                    term = Term(
                        term=word_data['original'],
                        translation=word_data['translation'],
                        category=word_data.get('category', 'Unknown'),
                        term_metadata={  # Изменено с metadata на term_metadata
                            'source': 'learning_interface',
                            'added_at': datetime.datetime.now().isoformat(),
                        },
                    )
                    session.add(term)
                    session.flush()

                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.datetime.now(),
                    )
                    session.add(unknown_term)

            session.commit()
            return jsonify({'status': 'success'})

        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    except Exception as e:
        logger.error(f'Error saving words: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/assessment-words', methods=['GET'])
def get_assessment_words():
    try:
        session = Session()

        # Проверяем количество слов в базе
        total_words = session.query(AssessmentWord).count()
        if total_words == 0:
            # Если база пуста, пробуем заполнить её
            initialize_assessment_words()
            total_words = session.query(AssessmentWord).count()
            if total_words == 0:
                return jsonify(
                    {'error': 'No words available for assessment', 'words': []}
                ), 404

        # Получаем существующие неизвестные слова
        existing_words = set()
        if os.path.exists(UNKNOWN_WORDS_FILE):
            with open(UNKNOWN_WORDS_FILE, 'r', encoding='utf-8') as file:
                for line in file:
                    if ':::' in line:
                        word = line.split(':::')[0].strip()
                        existing_words.add(word)

        # Получаем слова из базы, которых нет в списке неизвестных
        available_words = session.query(AssessmentWord).all()
        filtered_words = [
            word for word in available_words if word.word not in existing_words
        ]

        if not filtered_words:
            return jsonify(
                {'message': 'All available words have been assessed', 'words': []}
            )

        # Выбираем случайные слова
        selected_words = random.sample(filtered_words, min(5, len(filtered_words)))

        words_response = [
            {'id': word.id, 'term': word.word, 'category': word.category}
            for word in selected_words
        ]

        return jsonify({'words': words_response})

    except Exception as e:
        logger.error(f'Error getting assessment words: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/assessment-results', methods=['POST'])
def save_assessment_results():
    session = Session()
    try:
        data = request.get_json()
        unknown_words = data.get('unknownWords', [])

        for word in unknown_words:
            try:
                # Получаем перевод
                translation = translator.translate(word['term'], 'en', 'ru')

                # Создаем запись термина
                term = Term(
                    term=word['term'],
                    translation=translation,
                    category=word['category'],
                    term_metadata={
                        'source': 'assessment',
                        'added_at': datetime.datetime.now().isoformat(),
                    },
                )
                session.add(term)
                session.flush()

                # Создаем запись неизвестного термина
                unknown_term = UnknownTerm(
                    term_id=term.id,
                    attempts=0,
                    last_attempt=datetime.datetime.now(),
                )
                session.add(unknown_term)

                # Добавляем запись в историю
                history = LearningHistory(
                    term_id=term.id,
                    action='assessment_unknown',
                    history_metadata={
                        'assessment_date': datetime.datetime.now().isoformat()
                    },
                )
                session.add(history)

            except Exception as e:
                logger.error(f"Error processing word {word['term']}: {e}")
                session.rollback()  # Откатываем транзакцию для этого слова
                continue

        session.commit()
        return jsonify({'status': 'success'})

    except Exception as e:
        logger.error(f'Error saving assessment results: {e}')
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/translate-term', methods=['POST'])
def translate_term():
    data = request.json
    logger.info(f'Received data for translation: {data}')
    term = data.get('term')
    if isinstance(term, dict):
        term = term.get('original', '')
    explanation = data.get('explanation', '')

    logger.info(f'Processing term: {term}, explanation: {explanation}')

    current_model, api_key = get_current_model()

    prompt = f"""
    Translate the following technical term and its explanation to Russian.
    Make the translation clear and professionally accurate.

    Term: {term} \n\n

    {f"Explanation: {explanation}" if explanation else ""}

    Format the response as:

    Term: [translated term] \n\n
    {"Explanation: [translated explanation]" if explanation else ""}
    """

    try:
        logger.info(f'Translating term {term} using {current_model}')

        if current_model == 'gemini' and api_key:
            # Используем Gemini
            logger.info('Using Gemini for translation')
            gemini_service = GeminiService(api_key)
            try:
                translation = gemini_service.translate_text(prompt)
            except Exception as e:
                logger.error(f'Gemini translation failed: {e}')
                # Fallback на Ollama
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                response = service.llm.invoke(prompt)
                translation = response.content
        else:
            # Используем Ollama
            logger.info('Using Ollama for translation')
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )
            response = service.llm.invoke(prompt)
            translation = response.content

        return jsonify({'translation': translation.strip()})
    except Exception as e:
        logger.error(f'Error translating term: {e}')
        return jsonify({'error': 'Failed to translate'}), 500


@app.route('/api/available-models', methods=['GET'])
def get_available_models():
    return jsonify(check_available_models())


# Перед app.run()
if __name__ == '__main__':
    # Инициализируем базу данных
    init_db()
    app.run(debug=True)
