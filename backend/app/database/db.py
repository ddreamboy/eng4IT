# backend/app/database/db.py

from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

Base = declarative_base()

class Scenario(Base):
    __tablename__ = 'scenarios'
    
    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    terms = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class AssessmentWord(Base):
    __tablename__ = 'assessment_words'
    
    id = Column(Integer, primary_key=True)
    word = Column(String, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class ModelConfig(Base):
    __tablename__ = 'model_config'
    
    id = Column(Integer, primary_key=True)
    current_model = Column(String, nullable=False, default='ollama')
    sub_model = Column(String, nullable=False, default='llama3.2')  # Добавляем значение по умолчанию
    gemini_api_key = Column(String, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

# Создаем директорию для базы данных, если её нет
db_dir = os.path.dirname(os.path.abspath(__file__))
if not os.path.exists(db_dir):
    os.makedirs(db_dir)

engine = create_engine(f'sqlite:///{os.path.join(db_dir, "scenarios.db")}')
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)