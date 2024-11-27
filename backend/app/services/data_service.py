import json
import os
from typing import Dict

from models.base import KnownTerm, LearningHistory, Term, UnknownTerm
from sqlalchemy.orm import Session


class DataService:
    """Сервис для работы с данными и синхронизации между БД и JSON"""

    def __init__(self, db_session: Session, data_dir: str):
        self.db = db_session
        self.data_dir = data_dir
        self._ensure_data_dirs()

    def _ensure_data_dirs(self):
        """Создаёт необходимые директории для данных"""
        dirs = ['terms', 'scenarios', 'models']
        for dir_name in dirs:
            dir_path = os.path.join(self.data_dir, dir_name)
            os.makedirs(dir_path, exist_ok=True)

    def _save_to_json(self, data: dict, filename: str):
        """Сохраняет данные в JSON файл"""
        file_path = os.path.join(self.data_dir, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _load_from_json(self, filename: str) -> dict:
        """Загружает данные из JSON файла"""
        file_path = os.path.join(self.data_dir, filename)
        if not os.path.exists(file_path):
            return {}
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def sync_terms(self):
        """Синхронизирует термины между БД и JSON"""
        # Получаем все термины из БД
        all_terms = self.db.query(Term).all()
        known_terms = self.db.query(KnownTerm).all()
        unknown_terms = self.db.query(UnknownTerm).all()

        # Формируем структуры данных для JSON
        terms_data = {
            'all_terms': [self._term_to_dict(term) for term in all_terms],
            'known_terms': [
                self._known_term_to_dict(term) for term in known_terms
            ],
            'unknown_terms': [
                self._unknown_term_to_dict(term) for term in unknown_terms
            ],
        }

        # Сохраняем в JSON
        self._save_to_json(terms_data['all_terms'], 'terms/all_terms.json')
        self._save_to_json(terms_data['known_terms'], 'terms/known_terms.json')
        self._save_to_json(terms_data['unknown_terms'], 'terms/unknown_terms.json')

    def add_term(self, term_data: Dict) -> Term:
        """Добавляет новый термин"""
        term = Term(**term_data)
        self.db.add(term)
        self.db.commit()
        self.sync_terms()
        return term

    def mark_term_as_known(self, term_id: int, confidence_level: int = 1):
        """Отмечает термин как изученный"""
        known_term = KnownTerm(term_id=term_id, confidence_level=confidence_level)
        self.db.add(known_term)

        # Добавляем запись в историю
        history = LearningHistory(
            term_id=term_id,
            action='learn',
            metadata={'confidence_level': confidence_level},
        )
        self.db.add(history)

        self.db.commit()
        self.sync_terms()

    def mark_term_as_unknown(self, term_id: int):
        """Отмечает термин как неизвестный"""
        unknown_term = UnknownTerm(term_id=term_id)
        self.db.add(unknown_term)

        history = LearningHistory(term_id=term_id, action='forget', metadata={})
        self.db.add(history)

        self.db.commit()
        self.sync_terms()

    @staticmethod
    def _term_to_dict(term: Term) -> Dict:
        """Конвертирует Term в словарь"""
        return {
            'id': term.id,
            'term': term.term,
            'category': term.category,
            'translation': term.translation,
            'description': term.description,
            'examples': term.examples,
            'related_terms': term.related_terms,
            'metadata': term.metadata,
            'created_at': term.created_at.isoformat(),
            'updated_at': term.updated_at.isoformat(),
        }

    @staticmethod
    def _known_term_to_dict(known_term: KnownTerm) -> Dict:
        """Конвертирует KnownTerm в словарь"""
        return {
            'id': known_term.id,
            'term_id': known_term.term_id,
            'learned_at': known_term.learned_at.isoformat(),
            'confidence_level': known_term.confidence_level,
            'term_info': DataService._term_to_dict(known_term.term_info),
        }

    @staticmethod
    def _unknown_term_to_dict(unknown_term: UnknownTerm) -> Dict:
        """Конвертирует UnknownTerm в словарь"""
        return {
            'id': unknown_term.id,
            'term_id': unknown_term.term_id,
            'attempts': unknown_term.attempts,
            'last_attempt': unknown_term.last_attempt.isoformat()
            if unknown_term.last_attempt
            else None,
            'term_info': DataService._term_to_dict(unknown_term.term_info),
        }
