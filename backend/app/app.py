# backend/app/app.py
from sqlalchemy import func, desc
from datetime import datetime, timedelta
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
from models.base import Category, LearningHistory, Subcategory, Term, UnknownTerm, StudySession
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
                        # Проверяем существование термина перед добавлением
                        existing_term = session.query(Term).filter_by(term=word).first()
                        if not existing_term:
                            # Добавляем в AssessmentWord
                            assessment_word = AssessmentWord(
                                word=word,
                                category=f'{current_category} -> {current_subcategory}',
                            )
                            session.add(assessment_word)

                            # Добавляем в Term без перевода
                            term = Term(
                                term=word,
                                translation=word,  # Используем само слово как временный перевод
                                category=f'{current_category} -> {current_subcategory}',
                                term_metadata={
                                    'source': 'initial_load',
                                    'added_at': datetime.now().isoformat(),
                                }
                            )
                            session.add(term)
                            session.flush()

                            words_added += 1

        session.commit()
        logger.info(f'Added {words_added} words to database')

    except Exception as e:
        logger.error(f'Error initializing assessment words: {e}')
        session.rollback()
    finally:
        session.close()

# Инициализация базы данных словами
initialize_assessment_words()

def create_study_session(session, term_id, success_rate, session_type, time_spent=0, metadata=None):
    """Создание записи о сессии изучения"""
    study_session = StudySession(
        term_id=term_id,
        success_rate=success_rate,  # 0-100
        time_spent=time_spent,      # в секундах
        session_type=session_type,  # тип упражнения
        session_metadata=metadata or {}
    )
    session.add(study_session)
    return study_session


def get_current_model():
    session = Session()
    try:
        config = session.query(ModelConfig).first()
        if not config:
            api_key = os.getenv('GEMINI_API_KEY')
            config = ModelConfig(
                current_model='gemini',
                sub_model='gemini-1.5-flash',
                has_api_key=bool(api_key),
            )
            session.add(config)
            session.commit()
        return config.current_model, os.getenv('GEMINI_API_KEY')
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
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
            session.commit()

        api_key = os.getenv('GEMINI_API_KEY')
        return jsonify(
            {
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': bool(api_key),
                'api_key': api_key if api_key else None,
            }
        )
    finally:
        session.close()


@app.route('/api/all-terms', methods=['GET'])
def get_all_terms():
    logger.info('Request received: %s', request.path)
    try:
        session = Session()
        try:
            # Получаем все термины из базы данных
            terms = session.query(Term).all()

            # Формируем словарь с терминами, включая ID
            terms_dict = {
                term.term: {
                    'id': term.id,
                    'category': term.category,
                    'translation': term.translation
                }
                for term in terms
            }

            if not terms_dict:
                logger.warning('No terms found in database')

            return jsonify(terms_dict)
        finally:
            session.close()

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
                    'id': term.id,
                    'original': term.term,
                    'translation': term.translation,
                    'category': term.category,
                    'attempts': unknown.attempts,
                    'is_favorite': term.is_favorite,  # Убедитесь, что это поле передается
                    'last_attempt': unknown.last_attempt.isoformat() if unknown.last_attempt else None,
                    'study_progress': term.study_progress
                }
                for term, unknown in unknown_terms
            ]

            logger.info(f"Returning words with favorites: {[(w['original'], w['is_favorite']) for w in words]}")
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
                has_api_key=bool(os.getenv('GEMINI_API_KEY')),
            )
            session.add(config)
        else:
            config.current_model = model_name
            config.sub_model = sub_model
            config.has_api_key = bool(os.getenv('GEMINI_API_KEY'))

        session.commit()
        return jsonify(
            {
                'status': 'success',
                'model': config.current_model,
                'sub_model': config.sub_model,
                'has_api_key': config.has_api_key,
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

        result = None
        error_message = None

        try:
            if current_model == 'gemini' and api_key:
                logger.info('Using Gemini for generation')
                gemini_service = GeminiService(api_key)
                result = gemini_service.generate_evaluation_text(
                    selected_words, categories
                )
            else:
                logger.info('Using Ollama for generation')
                result = evaluator.generate_evaluation_text(
                    selected_words, categories
                )

            if not result or not result.get('text'):
                error_message = 'Empty result from generation service'

        except Exception as e:
            error_message = f'Generation error: {str(e)}'
            logger.error(error_message)

        if error_message:
            # Возвращаем информативное сообщение об ошибке
            return jsonify(
                {
                    'text': f'Service temporarily unavailable. {error_message}',
                    'categories': categories,
                    'error': error_message,
                }
            ), 503  # Service Unavailable

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
                            'added_at': datetime.now().isoformat(),
                        },
                    )
                    session.add(term)
                    session.flush()

                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now(),
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
        logger.info(f"Processing unknown words: {unknown_words}")

        words_added = 0

        for word in unknown_words:
            try:
                # Получаем перевод
                translation = translator.translate(word['term'], 'en', 'ru')
                logger.info(f"Got translation for {word['term']}: {translation}")
            except Exception as e:
                logger.error(f"Translation failed for {word['term']}: {e}")
                translation = word['term']

            try:
                # Проверяем существование термина
                existing_term = session.query(Term).filter_by(term=word['term']).first()

                if existing_term:
                    logger.info(f"Term already exists: {word['term']}")
                    # Проверяем, есть ли уже запись в UnknownTerm
                    unknown_exists = session.query(UnknownTerm).filter_by(term_id=existing_term.id).first()

                    if not unknown_exists:
                        # Если термин есть, но его нет в unknown_terms - добавляем
                        existing_term.translation = translation
                        unknown_term = UnknownTerm(
                            term_id=existing_term.id,
                            attempts=0,
                            last_attempt=datetime.now()
                        )
                        session.add(unknown_term)
                        words_added += 1
                else:
                    logger.info(f"Adding new term: {word['term']}")

                    # Создаем новый термин
                    term = Term(
                        term=word['term'],
                        translation=translation,  # Временно используем оригинал как перевод
                        category=word['category'],
                        term_metadata={
                            'source': 'assessment',
                            'added_at': datetime.now().isoformat(),
                        }
                    )
                    session.add(term)
                    session.flush()

                    # Создаем запись неизвестного термина
                    unknown_term = UnknownTerm(
                        term_id=term.id,
                        attempts=0,
                        last_attempt=datetime.now()
                    )
                    session.add(unknown_term)
                    words_added += 1

            except Exception as e:
                logger.error(f"Error processing word {word['term']}: {e}")
                continue

        session.commit()
        logger.info(f"Successfully added {words_added} words to unknown terms")
        return jsonify({
            'status': 'success',
            'words_added': words_added
        })

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


@app.route('/api/categorize-words', methods=['POST'])
def categorize_words():
    data = request.json
    words = data.get('words', [])

    if not words:
        return jsonify({'error': 'No words provided'}), 400

    try:
        session = Session()
        # Получаем все категории и подкатегории из БД
        categories = session.query(Category).all()
        categories_dict = {}

        for category in categories:
            subcategories = [sub.name for sub in category.subcategories]
            categories_dict[category.name] = subcategories

        # Формируем текст с категориями для промпта
        categories_text = '\n'.join(
            [
                f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                for cat, subs in categories_dict.items()
            ]
        )

        # Если категорий нет, создаем базовые
        if not categories_dict:
            default_categories = [
                ('Programming', ['General', 'Algorithms', 'Data Structures']),
                ('Web Development', ['Frontend', 'Backend', 'APIs']),
                ('Databases', ['SQL', 'NoSQL', 'Design']),
            ]

            for cat_name, subcats in default_categories:
                category = Category(name=cat_name)
                session.add(category)
                session.flush()

                for subcat_name in subcats:
                    subcategory = Subcategory(
                        name=subcat_name, category_id=category.id
                    )
                    session.add(subcategory)

            session.commit()

            # Обновляем текст категорий
            categories_text = '\n'.join(
                [
                    f"Category: {cat}\nSubcategories: {', '.join(subs)}"
                    for cat, subs in default_categories
                ]
            )

        prompt = f"""Given these existing categories and their subcategories:
        {categories_text}

        Please categorize the following words by assigning them to either existing or new categories.
        Words to categorize: {', '.join([w['original'] for w in words])}

        Return the results in the format:
        word1: Category -> Subcategory
        word2: Category -> Subcategory
        ...

        Important:
        - Use existing categories when possible
        - Create new categories only if really necessary
        - Always use the format "Category -> Subcategory"
        """

        # Получаем текущую модель и ключ API
        current_model, api_key = get_current_model()

        try:
            if current_model == 'gemini' and api_key:
                categorization = gemini_service.categorize_words(prompt)
            else:
                service = KnowledgeEvaluator(
                    os.path.join(WORDS_DIR, 'categorized_words.md')
                )
                categorization = service.categorize_words(prompt)

            # Парсим результат и добавляем новые категории если нужно
            categorized_words = []
            for word in words:
                word_category = None

                # Ищем категоризацию для текущего слова
                for line in categorization.strip().split('\n'):
                    if ':' in line and '->' in line:
                        cat_word, category = line.split(':', 1)
                        if cat_word.strip().lower() == word['original'].lower():
                            word_category = category.strip()
                            break

                if word_category and '->' in word_category:
                    cat_name, subcat_name = [
                        x.strip() for x in word_category.split('->')
                    ]

                    # Проверяем существование категории
                    category = (
                        session.query(Category).filter_by(name=cat_name).first()
                    )
                    if not category:
                        category = Category(name=cat_name)
                        session.add(category)
                        session.flush()

                    # Проверяем существование подкатегории
                    subcategory = (
                        session.query(Subcategory)
                        .filter_by(category_id=category.id, name=subcat_name)
                        .first()
                    )
                    if not subcategory:
                        subcategory = Subcategory(
                            name=subcat_name, category_id=category.id
                        )
                        session.add(subcategory)

                    word['category'] = f'{cat_name} -> {subcat_name}'
                else:
                    word['category'] = 'Programming -> General'

                categorized_words.append(word)

            session.commit()
            return jsonify({'words': categorized_words})

        except Exception as e:
            logger.error(f'Error during categorization: {e}')
            session.rollback()
            # В случае ошибки используем базовую категорию
            return jsonify(
                {
                    'words': [
                        {**w, 'category': 'Programming -> General'} for w in words
                    ]
                }
            )

    except Exception as e:
        logger.error(f'Error in categorize_words: {e}')
        if 'session' in locals():
            session.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        if 'session' in locals():
            session.close()


@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        session = Session()
        categories = session.query(Category).all()

        result = {}
        for category in categories:
            result[category.name] = [sub.name for sub in category.subcategories]

        return jsonify(result)

    except Exception as e:
        logger.error(f'Error getting categories: {e}')
        return jsonify({'error': str(e)}), 500

    finally:
        session.close()


@app.route('/api/chat-exercise', methods=['GET'])
def get_chat_exercise():
    try:
        session = Session()
        current_model, api_key = get_current_model()

        # Получаем неизвестные слова
        unknown_terms = session.query(Term).join(UnknownTerm).all()

        if current_model == 'gemini' and api_key:
            service = GeminiService(api_key)
        else:
            service = KnowledgeEvaluator(
                os.path.join(WORDS_DIR, 'categorized_words.md')
            )

        # Генерируем диалог
        terms_for_dialogue = random.sample(
            unknown_terms, min(10, len(unknown_terms))
        )
        dialogue = service.generate_dialogue(terms_for_dialogue)

        return jsonify(dialogue)

    except Exception as e:
        logger.error(f'Error generating chat exercise: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/matching-pairs', methods=['GET'])
def get_matching_pairs():
    use_ai = request.args.get('useAI') == 'true'
    pairs_count = 15
    session = Session()
    try:
        # Получаем все термины
        terms = session.query(Term).all()

        # Если терминов мало, добавляем базовые
        if len(terms) < pairs_count:
            basic_terms = [
                {"term": "database", "translation": "база данных"},
                {"term": "algorithm", "translation": "алгоритм"},
                {"term": "framework", "translation": "фреймворк"},
                {"term": "interface", "translation": "интерфейс"},
                {"term": "variable", "translation": "переменная"},
                {"term": "function", "translation": "функция"},
                {"term": "array", "translation": "массив"},
                {"term": "string", "translation": "строка"},
                {"term": "object", "translation": "объект"},
                {"term": "class", "translation": "класс"},
                {"term": "method", "translation": "метод"},
                {"term": "property", "translation": "свойство"},
                {"term": "inheritance", "translation": "наследование"},
                {"term": "polymorphism", "translation": "полиморфизм"},
                {"term": "encapsulation", "translation": "инкапсуляция"},
                {"term": "abstraction", "translation": "абстракция"},
                {"term": "debugging", "translation": "отладка"},
                {"term": "compiler", "translation": "компилятор"},
                {"term": "runtime", "translation": "время выполнения"},
                {"term": "memory", "translation": "память"}
            ]
            for term_data in basic_terms:
                term = Term(
                    term=term_data["term"],
                    translation=term_data["translation"],
                    category="Programming -> General"
                )
                session.add(term)
            session.commit()
            terms = session.query(Term).all()

        # Выбираем 20 случайных терминов
        selected_terms = random.sample(terms, min(pairs_count, len(terms)))  # Убедитесь, что здесь 20

        # Формируем пары БЕЗ перемешивания
        pairs = [
            {
                'english': term.term,
                'russian': term.translation
            }
            for term in selected_terms
        ]

        if use_ai:
            try:
                current_model, api_key = get_current_model()
                if current_model == 'gemini' and api_key:
                    service = GeminiService(api_key)
                    result = service.improve_translations({'pairs': pairs}, pairs_count=pairs_count)
                    if result and 'english' in result and 'russian' in result:
                        return jsonify({
                            'english': result['english'],
                            'russian': result['russian']
                        })
            except Exception as e:
                logger.error(f'Error improving translations: {e}')

        return jsonify({
            'english': [p['english'] for p in pairs],
            'russian': [p['russian'] for p in pairs]
        })

    except Exception as e:
        logger.error(f'Error getting matching pairs: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/progress', methods=['POST'])
def update_progress():
    """Update study progress for a term"""
    data = request.json
    term_id = data.get('term_id')
    progress = data.get('progress')

    session = Session()
    try:
        term = session.query(Term).get(term_id)
        if not term:
            return jsonify({'error': 'Term not found'}), 404

        term.study_progress = progress
        term.last_reviewed = datetime.utcnow()
        term.review_count += 1

        # Add study session
        study_session = StudySession(
            term_id=term_id,
            success_rate=progress,
            time_spent=data.get('time_spent', 0),
            session_type=data.get('session_type', 'review'),
            session_metadata=data.get('metadata', {})
        )
        session.add(study_session)
        session.commit()

        return jsonify({'status': 'success', 'progress': progress})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/statistics', methods=['GET'])
def get_statistics():
    """Get learning statistics"""
    session = Session()
    try:
        # Основная статистика
        total_unknown = session.query(UnknownTerm).count()
        total_terms = session.query(Term).count()
        learning_progress = (total_terms - total_unknown) / total_terms * 100 if total_terms > 0 else 0

        # Статистика по типам упражнений
        exercise_stats = session.query(
            StudySession.session_type,
            func.count().label('total_count'),
            func.avg(StudySession.success_rate).label('avg_success')
        ).group_by(StudySession.session_type).all()

        exercise_data = [{
            'type': session_type,
            'count': total_count,
            'success_rate': float(avg_success or 0)
        } for session_type, total_count, avg_success in exercise_stats]

        # Статистика успешности
        success_stats = {
            'high_success': session.query(StudySession).filter(StudySession.success_rate >= 80).count(),
            'medium_success': session.query(StudySession).filter(StudySession.success_rate.between(50, 79)).count(),
            'low_success': session.query(StudySession).filter(StudySession.success_rate < 50).count()
        }

        # Активность за последние 30 дней
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_activity = session.query(StudySession)\
            .filter(StudySession.created_at > thirty_days_ago)\
            .order_by(StudySession.created_at.desc())\
            .all()

        activity_data = [{
            'date': session.created_at.isoformat(),
            'type': session.session_type,
            'success_rate': session.success_rate,
            'description': f"Изучено {session.time_spent//60} минут, успешность {session.success_rate}%"
        } for session in recent_activity]

        # Статистика по дням недели
        weekly_activity = []
        days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        for day_idx, day_name in enumerate(days):
            count = session.query(StudySession)\
                .filter(func.extract('dow', StudySession.created_at) == day_idx)\
                .count()
            weekly_activity.append({
                'day': day_name,
                'words_count': count
            })

        # Кривая обучения
        learning_curve = []
        current_date = thirty_days_ago
        while current_date <= datetime.now():
            day_success = session.query(func.avg(StudySession.success_rate))\
                .filter(
                    StudySession.created_at >= current_date,
                    StudySession.created_at < current_date + timedelta(days=1)
                ).scalar() or 0

            learning_curve.append({
                'date': current_date.isoformat(),
                'success_rate': float(day_success)
            })
            current_date += timedelta(days=1)

        return jsonify({
            'overview': {
                'unknown_words': total_unknown,
                'total_terms': total_terms,
                'learning_progress': learning_progress,
                'favorites': session.query(Term).filter(Term.is_favorite == True).count()
            },
            'exercise_stats': exercise_data,
            'success_stats': success_stats,
            'recent_activity': activity_data,
            'weekly_activity': weekly_activity,
            'learning_curve': learning_curve
        })

    except Exception as e:
        logger.error(f'Error getting statistics: {e}')
        return jsonify({
            'overview': {
                'unknown_words': 0,
                'total_terms': 0,
                'learning_progress': 0,
                'favorites': 0
            },
            'exercise_stats': [],
            'success_stats': {
                'high_success': 0,
                'medium_success': 0,
                'low_success': 0
            },
            'recent_activity': [],
            'weekly_activity': [],
            'learning_curve': []
        })
    finally:
        session.close()

@app.route('/api/categories/tree', methods=['GET'])
def get_category_tree():
    """Get category tree structure"""
    session = Session()
    try:
        def build_tree(parent_id=None):
            categories = session.query(Category)\
                .filter(Category.parent_id == parent_id)\
                .order_by(Category.order)\
                .all()

            return [
                {
                    'id': cat.id,
                    'name': cat.name,
                    'level': cat.level,
                    'metadata': cat.category_metadata,  # Обновлено здесь
                    'children': build_tree(cat.id)
                }
                for cat in categories
            ]

        tree = build_tree()
        return jsonify({'categories': tree})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/terms/favorite', methods=['POST'])
def toggle_favorite():
    data = request.json
    term_id = data.get('term_id')

    logger.info(f"Received toggle favorite request for term_id: {term_id}")

    if not term_id:
        return jsonify({'error': 'Term ID is required'}), 400

    session = Session()
    try:
        term = session.query(Term).filter(Term.id == term_id).first()
        if not term:
            return jsonify({'error': 'Term not found'}), 404

        # Инвертируем значение
        term.is_favorite = not term.is_favorite
        session.commit()

        logger.info(f"Updated term {term_id} is_favorite to: {term.is_favorite}")

        # Возвращаем обновленное значение
        return jsonify({
            'status': 'success',
            'is_favorite': term.is_favorite,
            'term_id': term.id
        })

    except Exception as e:
        session.rollback()
        logger.error(f'Error toggling favorite: {e}')
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/exercises/matching/complete', methods=['POST'])
def complete_matching():
    """Сохранение результатов упражнения на сопоставление"""
    data = request.json
    session = Session()
    try:
        for result in data['results']:
            create_study_session(
                session=session,
                term_id=result['term_id'],
                success_rate=result['success_rate'],
                session_type='matching',
                time_spent=data.get('time_spent', 0),
                metadata={
                    'attempts': result.get('attempts', 0),
                    'correct_matches': result.get('correct_matches', 0),
                    'total_matches': result.get('total_matches', 0)
                }
            )
        session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/exercises/chat/complete', methods=['POST'])
def complete_chat():
    """Сохранение результатов чат-упражнения"""
    data = request.json
    session = Session()
    try:
        for result in data['results']:
            create_study_session(
                session=session,
                term_id=result['term_id'],
                success_rate=result['success_rate'],
                session_type='chat',
                time_spent=data.get('time_spent', 0),
                metadata={
                    'correct_responses': result.get('correct_responses', 0),
                    'total_responses': result.get('total_responses', 0),
                    'hints_used': result.get('hints_used', 0)
                }
            )
        session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/exercises/reading/complete', methods=['POST'])
def complete_reading():
    """Сохранение результатов упражнения на чтение"""
    data = request.json
    session = Session()
    try:
        for term in data['terms']:
            create_study_session(
                session=session,
                term_id=term['term_id'],
                success_rate=100,  # В чтении нет явного показателя успеха
                session_type='reading',
                time_spent=data.get('time_spent', 0),
                metadata={
                    'context': data.get('context', ''),
                    'translations_viewed': term.get('translations_viewed', 0)
                }
            )
        session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/api/terms/add', methods=['POST'])
def add_term():
    data = request.json
    logger.info(f"Received data for new term: {data}")  # Добавляем логирование

    term = data.get('term')
    category = data.get('category')
    subcategory = data.get('subcategory')

    # Валидация входных данных
    if not all([term, category, subcategory]):
        logger.warning(f"Missing required fields: term={term}, category={category}, subcategory={subcategory}")
        return jsonify({
            'status': 'error',
            'error': 'Все поля обязательны',
            'received_data': {
                'term': term,
                'category': category,
                'subcategory': subcategory
            }
        }), 400

    session = Session()
    try:
        # Проверяем существование термина
        existing_term = session.query(Term).filter_by(term=term).first()
        if existing_term:
            logger.warning(f"Term already exists: {term}")
            return jsonify({
                'status': 'error',
                'error': 'Термин уже существует'
            }), 400

        # Проверяем/создаем категорию
        category_obj = session.query(Category).filter_by(name=category).first()
        if not category_obj:
            logger.info(f"Creating new category: {category}")
            category_obj = Category(name=category)
            session.add(category_obj)
            session.flush()

        # Проверяем/создаем подкатегорию
        subcategory_obj = (
            session.query(Subcategory)
            .filter_by(name=subcategory, category_id=category_obj.id)
            .first()
        )
        if not subcategory_obj:
            logger.info(f"Creating new subcategory: {subcategory} for category {category}")
            subcategory_obj = Subcategory(
                name=subcategory,
                category_id=category_obj.id
            )
            session.add(subcategory_obj)
            session.flush()

        # Формируем строку категории
        category_str = f"{category} -> {subcategory}"

        # Создаем новый термин
        new_term = Term(
            term=term,
            translation="",  # Пустой перевод по умолчанию
            category=category_str,
            term_metadata={
                'source': 'manual_add',
                'added_at': datetime.now().isoformat(),
            }
        )
        session.add(new_term)
        session.flush()

        # Добавляем в UnknownTerm
        new_unknown = UnknownTerm(
            term_id=new_term.id,
            attempts=0,
            last_attempt=datetime.now()
        )
        session.add(new_unknown)

        session.commit()
        logger.info(f"Successfully added new term: {term}")
        return jsonify({
            'status': 'success',
            'term_id': new_term.id
        }), 201

    except Exception as e:
        session.rollback()
        logger.error(f"Error adding term: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': f'Ошибка сервера: {str(e)}'
        }), 500
    finally:
        session.close()

@app.route('/api/unknown-words/<int:id>', methods=['DELETE'])
def delete_unknown_word(id):
    session = Session()
    try:
        # Ищем запись в UnknownTerm по term_id, а не по id
        unknown_term = session.query(UnknownTerm).filter_by(term_id=id).first()
        if not unknown_term:
            return jsonify({"status": "error", "message": "Unknown word not found"}), 404

        session.delete(unknown_term)
        session.commit()
        return jsonify({"status": "success", "message": "Unknown word deleted"}), 200
    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting unknown word: {e}")
        return jsonify({"status": "error", "message": "Failed to delete unknown word"}), 500
    finally:
        session.close()

@app.route('/api/terms/<int:id>', methods=['DELETE'])
def delete_term(id):
    session = Session()
    try:
        # Находим термин только по ID
        term = session.query(Term).filter_by(id=id).first()
        if not term:
            return jsonify({"status": "error", "message": "Term not found"}), 404

        logger.info(f"Deleting term: {term.term} (ID: {term.id})")

        try:
            # Удаляем связанные записи из UnknownTerm
            unknown_terms = session.query(UnknownTerm).filter_by(term_id=term.id).all()
            for ut in unknown_terms:
                session.delete(ut)
                logger.info(f"Deleted unknown term record for term_id: {term.id}")

            # Удаляем связанные записи из StudySession
            study_sessions = session.query(StudySession).filter_by(term_id=term.id).all()
            for ss in study_sessions:
                session.delete(ss)
                logger.info(f"Deleted study session record for term_id: {term.id}")

            # Удаляем связанные записи из LearningHistory
            learning_history = session.query(LearningHistory).filter_by(term_id=term.id).all()
            for lh in learning_history:
                session.delete(lh)
                logger.info(f"Deleted learning history record for term_id: {term.id}")

            # Удаляем сам термин
            session.delete(term)
            session.commit()
            logger.info(f"Successfully deleted term and all related records")

            return jsonify({
                "status": "success",
                "message": "Term and all related records deleted successfully"
            }), 200

        except Exception as e:
            logger.error(f"Error while deleting term and related records: {e}")
            session.rollback()
            return jsonify({
                "status": "error",
                "message": f"Failed to delete term: {str(e)}"
            }), 500

    except Exception as e:
        logger.error(f"Error in delete_term: {e}")
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500
    finally:
        session.close()



# Перед app.run()
if __name__ == '__main__':
    # Инициализируем базу данных
    init_db()
    app.run(debug=True)
