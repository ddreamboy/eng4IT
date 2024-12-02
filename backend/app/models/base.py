# backend/app/models/base.py
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,  # Добавьте этот импорт
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref

Base = declarative_base()


class TimestampMixin:
    """Миксин для добавления полей времени создания и обновления"""

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(
        DateTime, default=datetime.now, onupdate=datetime.now
    )


class Term(Base, TimestampMixin):
    __tablename__ = 'terms'

    id = Column(Integer, primary_key=True)
    term = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)
    translation = Column(String)
    description = Column(String)
    examples = Column(JSON)
    related_terms = Column(JSON)
    term_metadata = Column(JSON)
    is_favorite = Column(Boolean, default=False)  # Убедитесь, что это поле определено только один раз
    pronunciation_url = Column(String)
    study_progress = Column(Integer, default=0)
    last_reviewed = Column(DateTime)
    review_count = Column(Integer, default=0)

class StudySession(Base, TimestampMixin):
    __tablename__ = 'study_sessions'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    success_rate = Column(Integer)  # 0-100%
    time_spent = Column(Integer)    # в секундах
    session_type = Column(String)   # тип упражнения
    session_metadata = Column(JSON)  # дополнительные данные

    # Связи
    term = relationship('Term', backref='study_sessions')

    # Вычисляемые поля
    @property
    def is_successful(self):
        return self.success_rate >= 80

    @property
    def difficulty_level(self):
        if self.success_rate >= 80:
            return 'easy'
        elif self.success_rate >= 50:
            return 'medium'
        return 'hard'


class KnownTerm(Base, TimestampMixin):
    """Модель для известных терминов"""

    __tablename__ = 'known_terms'

    id = Column(Integer, primary_key=True)
    term_id = Column(Integer, ForeignKey('terms.id'))
    learned_at = Column(DateTime, default=datetime.now)
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
    """Расширенная модель категорий"""
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey('categories.id'))
    level = Column(Integer, default=0)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    category_metadata = Column(JSON)

    # Отношения для древовидной структуры
    children = relationship("Category",
        backref=backref('parent', remote_side=[id]),
        cascade="all, delete-orphan")

    # Добавляем связь с подкатегориями
    subcategories = relationship("Subcategory", back_populates="category")

class Subcategory(Base):
    __tablename__ = 'subcategories'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    created_at = Column(DateTime, default=datetime.now)
    category = relationship('Category', back_populates='subcategories')
