# backend/app/scripts/migrate_to_json.py

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from datetime import datetime

from database.db import AssessmentWord, ModelConfig, Scenario
from models.base import Category, Term, UnknownTerm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class DataMigrator:
    def __init__(self, db_path: str, data_dir: str):
        """
        Инициализация мигратора
        :param db_path: путь к файлу БД SQLite
        :param data_dir: директория для JSON файлов
        """
        self.engine = create_engine(f'sqlite:///{db_path}')
        self.Session = sessionmaker(bind=self.engine)
        self.data_dir = data_dir
        self._ensure_directories()

    def _ensure_directories(self):
        """Создание необходимых директорий"""
        directories = ['scenarios', 'terms', 'models', 'categories']
        for dir_name in directories:
            dir_path = os.path.join(self.data_dir, dir_name)
            os.makedirs(dir_path, exist_ok=True)

    def _save_json(self, data: dict, filename: str):
        """Сохранение данных в JSON файл"""
        file_path = os.path.join(self.data_dir, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(
                data,
                f,
                ensure_ascii=False,
                indent=2,
                default=self._datetime_handler,
            )

    def _datetime_handler(self, obj):
        """Обработчик для сериализации datetime"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f'Object of type {type(obj)} is not JSON serializable')

    def migrate_scenarios(self):
        """Миграция сценариев"""
        session = self.Session()
        try:
            scenarios = session.query(Scenario).all()
            scenarios_data = []

            for scenario in scenarios:
                scenario_dict = {
                    'id': scenario.id,
                    'text': scenario.text,
                    'terms': scenario.terms,
                    'created_at': scenario.created_at,
                }
                scenarios_data.append(scenario_dict)

            self._save_json(
                {'scenarios': scenarios_data}, 'scenarios/scenarios.json'
            )
            print(f'Migrated {len(scenarios_data)} scenarios')

        finally:
            session.close()

    def migrate_terms(self):
        """Миграция терминов и категорий"""
        session = self.Session()
        try:
            # Миграция обычных терминов
            terms = session.query(Term).all()
            terms_data = []

            for term in terms:
                term_dict = {
                    'id': term.id,
                    'term': term.term,
                    'translation': term.translation,
                    'category': term.category,
                    'term_metadata': term.term_metadata,
                    'created_at': term.created_at,
                    'updated_at': term.updated_at,
                }
                terms_data.append(term_dict)

            self._save_json({'terms': terms_data}, 'terms/all_terms.json')
            print(f'Migrated {len(terms_data)} terms')

            # Миграция неизвестных терминов
            unknown_terms = session.query(UnknownTerm).all()
            unknown_terms_data = []

            for term in unknown_terms:
                term_dict = {
                    'id': term.id,
                    'term_id': term.term_id,
                    'attempts': term.attempts,
                    'last_attempt': term.last_attempt,
                    'created_at': term.created_at,
                }
                unknown_terms_data.append(term_dict)

            self._save_json(
                {'unknown_terms': unknown_terms_data}, 'terms/unknown_terms.json'
            )
            print(f'Migrated {len(unknown_terms_data)} unknown terms')

            # Миграция категорий
            categories = session.query(Category).all()
            categories_data = {}

            for category in categories:
                categories_data[category.name] = {
                    'id': category.id,
                    'created_at': category.created_at,
                    'subcategories': [
                        {
                            'id': sub.id,
                            'name': sub.name,
                            'created_at': sub.created_at,
                        }
                        for sub in category.subcategories
                    ],
                }

            self._save_json(categories_data, 'categories/categories.json')
            print(f'Migrated {len(categories_data)} categories')

            # Миграция слов для оценки
            assessment_words = session.query(AssessmentWord).all()
            assessment_data = []

            for word in assessment_words:
                word_dict = {
                    'id': word.id,
                    'word': word.word,
                    'category': word.category,
                    'created_at': word.created_at,
                }
                assessment_data.append(word_dict)

            self._save_json(
                {'assessment_words': assessment_data},
                'terms/assessment_words.json',
            )
            print(f'Migrated {len(assessment_data)} assessment words')

        finally:
            session.close()

    def migrate_model_config(self):
        """Миграция настроек моделей"""
        session = self.Session()
        try:
            config = session.query(ModelConfig).first()
            if config:
                config_data = {
                    'current_model': config.current_model,
                    'sub_model': config.sub_model,
                    'gemini_api_key': config.gemini_api_key,
                    'updated_at': config.updated_at,
                }
                self._save_json(
                    {'model_config': config_data}, 'models/config.json'
                )
                print('Migrated model configuration')

        finally:
            session.close()

    def migrate_all(self):
        """Миграция всех данных"""
        print('Starting data migration...')
        self.migrate_scenarios()
        self.migrate_terms()
        self.migrate_model_config()
        print('Data migration completed!')


def main():
    # Пути к файлам
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(current_dir, 'database', 'scenarios.db')
    data_dir = os.path.join(os.path.dirname(current_dir), 'data')

    # Создаем и запускаем мигратор
    migrator = DataMigrator(db_path, data_dir)
    migrator.migrate_all()


if __name__ == '__main__':
    main()
