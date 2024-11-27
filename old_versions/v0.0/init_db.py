from app.database import engine, Base
from app.models import User

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)
