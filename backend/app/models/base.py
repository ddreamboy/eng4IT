# backend/app/models/base.py
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class TimestampMixin:
    """Миксин для добавления полей времени создания и обновления"""

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Term(Base, TimestampMixin):
    """Базовая модель для терминов"""

    __tablename__ = 'terms'

    id = Column(Integer, primary_key=True)
    term = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)
    translation = Column(String)
    description = Column(String)
    examples = Column(JSON)  # Примеры использования
    related_terms = Column(JSON)  # Связанные термины
    term_metadata = Column(JSON)  # Переименовано с metadata на term_metadata


class KnownTerm(Base, TimestampMixin):
    """Модель для известных терминов"""

    __tablename__ = 'known_terms'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    learned_at = Column(DateTime, default=datetime.utcnow)
    confidence_level = Column(Integer, default=0)  # Уровень уверенности в знании
    term_info = relationship('Term')


class UnknownTerm(Base, TimestampMixin):
    """Модель для неизвестных терминов"""

    __tablename__ = 'unknown_terms'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    attempts = Column(Integer, default=0)  # Количество попыток изучения
    last_attempt = Column(DateTime)
    term_info = relationship('Term')


class LearningHistory(Base, TimestampMixin):
    """История изучения терминов"""

    __tablename__ = 'learning_history'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    action = Column(String)  # 'learn', 'review', 'forget'
    history_metadata = Column(JSON)  # Переименовано с metadata на history_metadata


class Category(Base):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    subcategories = relationship('Subcategory', back_populates='category')


class Subcategory(Base):
    __tablename__ = 'subcategories'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    category = relationship('Category', back_populates='subcategories')
