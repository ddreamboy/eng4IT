# backend/app/database/db.py

import datetime
import os
from contextlib import contextmanager

from models.base import (  # Добавьте импорт моделей
    Base,
    LearningHistory,
    Term,
    UnknownTerm,
)
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import sessionmaker

# Удалите эту строку, так как Base уже импортирован из models.base
# Base = declarative_base()


class Scenario(Base):
    __tablename__ = 'scenarios'

    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    terms = Column(JSON, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class AssessmentWord(Base):
    __tablename__ = 'assessment_words'

    id = Column(Integer, primary_key=True)
    word = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class ModelConfig(Base):
    __tablename__ = 'model_config'

    id = Column(Integer, primary_key=True)
    current_model = Column(String, nullable=False, default='gemini')
    sub_model = Column(String, nullable=False, default='gemini-1.5-flash')
    has_api_key = Column(Boolean, default=False)  # Just track if key exists
    updated_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    def to_dict(self):
        return {
            'current_model': self.current_model,
            'sub_model': self.sub_model,
            'has_api_key': bool(os.getenv('GEMINI_API_KEY')),
        }


@contextmanager
def get_session():
    session = Session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    """Initialize database and create all tables"""
    # Создаем директорию для базы данных, если её нет
    db_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

    db_path = os.path.join(db_dir, 'scenarios.db')

    # Устанавливаем права доступа
    if os.path.exists(db_path):
        os.chmod(db_path, 0o666)

    engine = create_engine(f'sqlite:///{db_path}')

    # Создаем все таблицы
    Base.metadata.create_all(engine)

    # Создаем таблицы для моделей из models.base
    Term.__table__.create(engine, checkfirst=True)
    UnknownTerm.__table__.create(engine, checkfirst=True)
    LearningHistory.__table__.create(engine, checkfirst=True)

    return engine


# Инициализируем базу данных
engine = init_db()
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
