# backend/app/scripts/migrate_to_db.py

import json
import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging

from database.db import AssessmentWord, Base, ModelConfig, Scenario
from models.base import LearningHistory, Term, UnknownTerm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseMigrator:
    def __init__(self, db_path: str, data_dir: str):
        """
        Инициализация мигратора базы данных
        :param db_path: путь к файлу БД SQLite
        :param data_dir: директория с JSON файлами
        """
        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)  # Создаем все таблицы
        self.Session = sessionmaker(bind=self.engine)
        self.data_dir = data_dir

    def _load_json(self, filename: str) -> dict:
        """Загрузка данных из JSON файла"""
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            logger.warning(f'File not found: {file_path}')
            return {}
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _parse_datetime(self, datetime_str: str) -> datetime:
        """Преобразование строки даты/времени в объект datetime"""
        try:
            return datetime.fromisoformat(datetime_str)
        except ValueError:
            return datetime.now()

    def migrate_scenarios(self):
        """Миграция сценариев из JSON в БД"""
        session = self.Session()
        try:
            data = self._load_json('scenarios/scenarios.json')
            scenarios = data.get('scenarios', [])

            for scenario_data in scenarios:
                scenario = Scenario(
                    text=scenario_data['text'],
                    terms=scenario_data['terms'],
                    created_at=self._parse_datetime(scenario_data['created_at']),
                )
                session.add(scenario)

            session.commit()
            logger.info(f'Migrated {len(scenarios)} scenarios to database')
        except Exception as e:
            logger.error(f'Error migrating scenarios: {e}')
            session.rollback()
        finally:
            session.close()

    def migrate_terms(self):
        """Миграция терминов из JSON в БД"""
        session = self.Session()
        try:
            # Миграция всех терминов
            data = self._load_json('terms/all_terms.json')
            terms = data.get('terms', [])

            for term_data in terms:
                assessment_word = AssessmentWord(
                    word=term_data['word'],
                    category=term_data['category'],
                    created_at=self._parse_datetime(term_data.get('created_at')),
                )
                session.add(assessment_word)

            # Миграция неизвестных терминов
            unknown_data = self._load_json('terms/unknown_terms.json')
            unknown_terms = unknown_data.get('unknown_terms', [])

            for unknown_term_data in unknown_terms:
                term = Term(
                    term=unknown_term_data['term'],
                    translation=unknown_term_data['translation'],
                    category=unknown_term_data.get('category', 'Unknown'),
                    term_metadata={
                        'source': 'migration',
                        'added_at': unknown_term_data.get(
                            'added_at', datetime.now().isoformat()
                        ),
                    },
                )
                session.add(term)
                session.flush()  # Получаем ID термина

                unknown_term = UnknownTerm(
                    term_id=term.id,
                    attempts=unknown_term_data.get('attempts', 0),
                    last_attempt=self._parse_datetime(
                        unknown_term_data.get(
                            'last_attempt', datetime.now().isoformat()
                        )
                    ),
                )
                session.add(unknown_term)

                # Добавляем запись в историю изучения
                history = LearningHistory(
                    term_id=term.id,
                    action='migration',
                    history_metadata={
                        'migration_date': datetime.now().isoformat(),
                        'original_added_at': unknown_term_data.get('added_at'),
                    },
                )
                session.add(history)

            session.commit()
            logger.info(
                f'Migrated {len(terms)} assessment words and {len(unknown_terms)} unknown terms to database'
            )
        except Exception as e:
            logger.error(f'Error migrating terms: {e}')
            session.rollback()
        finally:
            session.close()

    def migrate_model_config(self):
        """Миграция конфигурации модели из JSON в БД"""
        session = self.Session()
        try:
            data = self._load_json('models/config.json')
            config_data = data.get('model_config')

            if config_data:
                config = ModelConfig(
                    current_model=config_data['current_model'],
                    sub_model=config_data['sub_model'],
                    gemini_api_key=config_data.get('gemini_api_key'),
                    updated_at=self._parse_datetime(config_data['updated_at']),
                )
                session.add(config)
                session.commit()
                logger.info('Migrated model configuration to database')
        except Exception as e:
            logger.error(f'Error migrating model config: {e}')
            session.rollback()
        finally:
            session.close()

    def migrate_all(self):
        """Миграция всех данных из JSON в БД"""
        logger.info('Starting database migration...')
        self.migrate_scenarios()
        self.migrate_terms()
        self.migrate_model_config()
        logger.info('Database migration completed!')


def main():
    # Пути к файлам
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(current_dir, 'database', 'scenarios.db')
    data_dir = os.path.join(os.path.dirname(current_dir), 'data')

    # Создаем и запускаем мигратор
    migrator = DatabaseMigrator(db_path, data_dir)
    migrator.migrate_all()


if __name__ == '__main__':
    main()
