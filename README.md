# Проект: eng4IT - Персонализированная платформа изучения английского для ML и IT

## Содержание

1. [Введение](#1-введение)
2. [Обзор методологии](#2-обзор-методологии)
3. [Архитектура проекта](#3-архитектура-проекта)
4. [Жизненный цикл разработки](#4-жизненный-цикл-разработки)
   - [4.1. Разработка спецификаций и документов](#41-разработка-спецификаций-и-документов)
   - [4.2. Планирование спринта](#42-планирование-спринта)
   - [4.3. Начало спринта i](#43-начало-спринта-i)
   - [4.4. Написание тестов](#44-написание-тестов)
   - [4.5. Итеративная реализация кода](#45-итеративная-реализация-кода)
   - [4.6. Написание документации](#46-написание-документации)
   - [4.7. Развертывание и поддержка](#47-развертывание-и-поддержка)
   - [4.8. Переход к спринту i+1](#48-переход-к-спринту-i1)
5. [Лучшие практики](#5-лучшие-практики)
6. [Решение потенциальных проблем](#6-решение-потенциальных-проблем)
7. [Заключение](#7-заключение)
8. [Приложения](#8-приложения)

## 1. Введение

eng4IT - это персонализированная веб-платформа для изучения английского языка, специализирующаяся на терминологии и контексте машинного обучения (ML) и информационных технологий (IT). Проект нацелен на создание эффективного инструмента для повышения уровня профессионального английского языка в технической сфере.

## 2. Обзор методологии

Разработка проекта будет вестись с использованием гибкой методологии, разделенной на 5 недельных спринтов. Основной фокус будет на создании минимально жизнеспособного продукта (MVP) с возможностью дальнейшего расширения функционала.

## 3. Архитектура проекта

- Frontend: React.js с TypeScript
- Backend: Node.js с Express.js, GraphQL
- База данных: PostgreSQL
- ETL процессы: Python (pandas, nltk, дополнительные NLP-инструменты)
- API интеграции: YouTube Data API, Custom Habr API
- Контейнеризация: Docker
- CI/CD: GitHub Actions
- Аналитика: Google Analytics

## 4. Жизненный цикл разработки

### 4.1. Разработка спецификаций и документов

**Цель:** Создать детальные спецификации и документацию для руководства процессом разработки.

**Действия:**
1. Определить видение проекта и цели
2. Создать детальные функциональные и технические спецификации
3. Разработать начальную документацию

### 4.2. Планирование спринта

**Цель:** Организовать разработку в короткие, сфокусированные итерации.

**Действия:**
1. Определить длительность спринта (1 неделя)
2. Идентифицировать цели спринта
3. Приоритизировать задачи из бэклога
4. Распределить ресурсы

### 4.3. Начало спринта i

**Цель:** Подготовиться к разработке в текущем спринте.

**Действия:**
1. Уточнить спецификации для задач спринта
2. Подготовить тестовые сценарии

### 4.4. Написание тестов

**Цель:** Реализовать автоматизированные тесты для валидации корректности кода.

**Действия:**
1. Выбрать фреймворки для тестирования
2. Разработать тестовые скрипты
3. Интегрировать тесты в CI/CD пайплайн

### 4.5. Итеративная реализация кода

**Цель:** Разработать функциональность, соответствующую спецификациям и проходящую все тесты.

**Действия:**
1. Реализовать функциональность согласно спецификациям
2. Провести код-ревью
3. Выполнить рефакторинг при необходимости

### 4.6. Написание документации

**Цель:** Поддерживать актуальную документацию, отражающую текущее состояние проекта.

**Действия:**
1. Обновить пользовательскую документацию
2. Актуализировать техническую документацию

### 4.7. Развертывание и поддержка

**Цель:** Эффективно развернуть приложение и обеспечить его поддержку.

**Действия:**
1. Настроить процесс автоматического развертывания
2. Реализовать мониторинг приложения
3. Обеспечить непрерывную доставку обновлений

### 4.8. Переход к спринту i+1

**Цель:** Подготовиться к следующей итерации, анализируя прогресс и планируя дальнейшие шаги.

**Действия:**
1. Провести ретроспективу спринта
2. Обновить бэклог проекта
3. Начать планирование следующего спринта

## 5. Лучшие практики

1. Фокус на основном функционале: сбор данных, обработка и отображение слов/фраз
2. Упрощение системы упражнений до базового уровня для MVP
3. Использование готовых библиотек и инструментов для ускорения разработки
4. Регулярный пересмотр и корректировка плана при необходимости
5. Обеспечение качества и релевантности собираемых данных для ML и IT
6. Реализация функции экспорта выученных слов и фраз

## 6. Решение потенциальных проблем

1. Ограничение scope проекта для достижения MVP в установленные сроки
2. Использование кэширования для оптимизации производительности
3. Тщательное планирование архитектуры для обеспечения масштабируемости
4. Регулярное тестирование для раннего выявления и исправления ошибок

## 7. Заключение

Проект eng4IT предоставляет уникальную возможность для создания специализированного инструмента изучения английского языка в сфере ML и IT. Следуя данному плану разработки и придерживаясь лучших практик, мы сможем создать эффективное и полезное приложение в рамках установленных временных ограничений.

## 8. Приложения

### 8.1. Детальный план спринтов

#### Спринт 1: Инициализация проекта, настройка инфраструктуры и сбор данных с YouTube
- Создание репозитория на GitHub
    - Настройка ветвления (GitFlow или GitHub Flow)
    - Создание README.md с описанием проекта
    - Настройка .gitignore
- Настройка CI/CD pipeline с GitHub Actions
    - Создание workflow для автоматической сборки и тестирования
    - Настройка линтера (ESLint) и форматтера (Prettier)
- Инициализация React приложения с TypeScript
    - Выбор и настройка state management (Redux или MobX)
    - Настройка роутинга (React Router)
- Начало настройки Docker-контейнеров
    - Создание Dockerfile для фронтенда
- Имплементация YouTube Data API клиента
    - Настройка аутентификации
    - Создание функций для поиска видео и получения субтитров
- Разработка скрипта для извлечения и обработки субтитров
    - Парсинг SubRip (.srt) файлов
    - Базовая фильтрация и очистка текста

#### Спринт 2:  Обработка данных и настройка бэкенда
- Завершение настройки Docker-контейнеров
    - Создание Dockerfile для бэкенда
    - Настройка docker-compose.yml
- Настройка базовой структуры Node.js сервера с GraphQL
    - Установка и настройка Express.js
    - Интеграция Apollo Server
    - Создание базовой GraphQL схемы
- Разработка процесса обработки и нормализации данных
    - Токенизация и лемматизация текста
    - Удаление стоп-слов и пунктуации
- Имплементация базовых NLP функций
    - Извлечение ключевых слов и фраз
    - Определение частотности слов
- Создание схемы базы данных PostgreSQL
    - Проектирование таблиц для хранения слов, фраз, пользовательских данных
    - Настройка миграций с использованием инструмента вроде Knex.js
- Создание процедур для загрузки данных в PostgreSQL
    - Разработка функций для пакетной вставки данных
    - Реализация механизма обновления существующих записей

#### Спринт 3: API дизайн и разработка
- Разработка GraphQL API для доступа к обработанным данным
    - Создание типов и резолверов для слов и фраз
    - Реализация пагинации и фильтрации
- Создание схемы для CRUD операций с пользовательскими словами/фразами
    - Разработка мутаций для добавления, обновления и удаления
    - Реализация механизма проверки дубликатов
- Разработка сервиса для генерации упражнений
    - Создание алгоритма для выбора слов/фраз для упражнений
    - Разработка базовых типов упражнений (множественный выбор, заполнение пропусков)
- Разработка интерфейса для генерации упражнений (в веб-приложении)

#### Спринт 4: Фронтенд разработка - основной функционал
- Создание компонентов для отображения карточек со словами/фразами
    - Разработка компонента карточки с возможностью переворота
    - Реализация механизма прогресса изучения
- Разработка интерфейса для навигации по категориям слов
    - Создание компонента фильтрации и поиска
    - Реализация бесконечной прокрутки или пагинации
- Реализация функционала добавления пользовательских слов
    - Создание формы для добавления новых слов/фраз
    - Реализация валидации ввода
- Интеграция с GraphQL API
    - Настройка Apollo Client
    - Реализация кэширования запросов
- Разработка прототипа интерфейса (например, с помощью Figma)
- Настройка Google Analytics для отслеживания действий пользователей

#### Спринт 5: Тестирование, оптимизация и развертывание
- Завершение функционала добавления пользовательских слов
    - Интеграция с бэкендом для сохранения пользовательских слов
    - Реализация функции редактирования и удаления слов
- Проведение комплексного тестирования
    - Написание и выполнение unit-тестов для критических компонентов
    - Проведение интеграционных тестов
    - Выполнение end-to-end тестирования основных пользовательских сценариев
- Оптимизация производительности фронтенда и бэкенда
    - Профилирование и выявление узких мест
    - Оптимизация рендеринга компонентов (useMemo, useCallback)
    - Профилирование запросов к базе данных
    - Оптимизация GraphQL резолверов
    - Внедрение кэширования для часто запрашиваемых данных
    - Настройка Redis для кэширования
    - Реализация стратегии инвалидации кэша
- Реализация функции экспорта данных (например, в CSV или Anki deck)
- Подготовка пользовательской документации
    - Создание руководства пользователя
    - Написание API документации
- Настройка production-окружения
    - Конфигурация production-сервера
    - Настройка SSL-сертификатов
- Развертывание приложения локально
    - Финальная проверка Docker-контейнеров
    - Тестирование процесса развертывания
- Анализ данных, полученных с помощью Google Analytics, для выявления потребности пользователей.

### 8.2. Полезные инструменты и ресурсы

1. Фронтенд разработка:
   - [Официальная документация React](https://reactjs.org/docs/getting-started.html)
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
   - [Create React App](https://create-react-app.dev/docs/getting-started/)

2. Бэкенд разработка:
   - [Node.js документация](https://nodejs.org/en/docs/)
   - [Express.js руководство](https://expressjs.com/en/guide/routing.html)
   - [GraphQL документация](https://graphql.org/learn/)
   - [Apollo Server](https://www.apollographql.com/docs/apollo-server/)

3. База данных:
   - [PostgreSQL документация](https://www.postgresql.org/docs/)
   - [TypeORM](https://typeorm.io/#/)

4. ETL и обработка данных:
   - [Pandas documentation](https://pandas.pydata.org/docs/)
   - [NLTK documentation](https://www.nltk.org/)
   - [spaCy documentation](https://spacy.io/api/doc)

5. API интеграции:
   - [YouTube Data API документация](https://developers.google.com/youtube/v3)
   - [Web Scraping с Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)

6. Контейнеризация и CI/CD:
   - [Docker документация](https://docs.docker.com/)
   - [GitHub Actions документация](https://docs.github.com/en/actions)

7. Аналитика:
   - [Google Analytics для разработчиков](https://developers.google.com/analytics)

8. Тестирование:
   - [Jest документация](https://jestjs.io/docs/getting-started)
   - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

9. Оптимизация производительности:
   - [React Performance Optimization](https://reactjs.org/docs/optimizing-performance.html)
   - [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)

10. Безопасность:
    - [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
    - [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

11. UI/UX дизайн:
    - [Material-UI](https://material-ui.com/)
    - [Figma](https://www.figma.com/) для прототипирования

12. NLP и машинное обучение:
    - [TensorFlow.js документация](https://www.tensorflow.org/js/guide)
    - [Natural Language Processing with Python](https://www.nltk.org/book/)

13. Управление проектом:
    - [Agile Manifesto](https://agilemanifesto.org/)
    - [Scrum Guide](https://scrumguides.org/scrum-guide.html)
