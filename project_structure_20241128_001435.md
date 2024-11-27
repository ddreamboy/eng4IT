# Project Structure

**Project Path:** `/home/kadi/PythonProjects/eng4IT`
**Generated at:** 2024-11-28 00:14:35
**Ignored patterns:** .DS_Store, .env, .git, .idea, .pyc, .pytest_cache, .venv, .vscode, __pycache__, build, dist, env, get_structure.py, logs, migrations, node_modules, venv

## Directory Tree
```
├── .ropeproject/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── db.py
│   │   │   └── scenarios.db
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── base.py
│   │   ├── scripts/
│   │   │   ├── migrate_to_db.py
│   │   │   └── migrate_to_json.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── constants.py
│   │   │   ├── data_service.py
│   │   │   ├── exceptions.py
│   │   │   ├── gemini_service.py
│   │   │   ├── ollama_service.py
│   │   │   └── translation_service.py
│   │   └── app.py
│   ├── data/
│   │   ├── models/
│   │   │   └── config.json
│   │   ├── scenarios/
│   │   │   └── scenarios.json
│   │   └── terms/
│   │       ├── all_terms.json
│   │       └── unknown_terms.json
│   ├── templates/
│   │   └── index.html
│   ├── requirements-lite.txt
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── LearningInterface.js
│   │   │   ├── SharedComponents.js
│   │   │   ├── TermModal.js
│   │   │   ├── WordAssessment.js
│   │   │   └── WordList.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── old_versions/
│   └── v0.0/
│       ├── app/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── database.py
│       │   ├── main.py
│       │   ├── models.py
│       │   └── schemas.py
│       ├── frontend/
│       │   ├── frontend/
│       │   │   ├── components/
│       │   │   │   ├── Flashcard.js
│       │   │   │   ├── Progress.js
│       │   │   │   └── TranslationOptions.js
│       │   │   ├── pages/
│       │   │   │   ├── api/
│       │   │   │   │   └── hello.js
│       │   │   │   ├── fonts/
│       │   │   │   │   ├── GeistMonoVF.woff
│       │   │   │   │   └── GeistVF.woff
│       │   │   │   ├── _app.js
│       │   │   │   ├── _document.js
│       │   │   │   └── index.js
│       │   │   ├── public/
│       │   │   │   ├── favicon.ico
│       │   │   │   ├── file.svg
│       │   │   │   ├── globe.svg
│       │   │   │   ├── next.svg
│       │   │   │   ├── vercel.svg
│       │   │   │   └── window.svg
│       │   │   ├── styles/
│       │   │   │   ├── Home.module.css
│       │   │   │   └── globals.css
│       │   │   ├── .eslintrc.json
│       │   │   ├── README.md
│       │   │   ├── jsconfig.json
│       │   │   ├── next.config.mjs
│       │   │   ├── package.json
│       │   │   ├── postcss.config.mjs
│       │   │   └── tailwind.config.js
│       │   ├── package.json
│       │   ├── postcss.config.js
│       │   └── tailwind.config.js
│       ├── add_words.py
│       ├── init_db.py
│       ├── requirements.txt
│       ├── sprints.md
│       └── words.js
└── words/
    ├── categorized_words.md
    ├── en_words.py
    ├── unknown_words.txt
    └── unknown_words_.txt
```