# Project Structure

**Project Path:** `Q:\PythonProjects\eng4IT`
**Generated at:** 2024-11-27 17:44:25
**Ignored patterns:** .DS_Store, .env, .git, .idea, .pyc, .pytest_cache, .venv, .vscode, __pycache__, build, dist, env, get_structure.py, logs, migrations, node_modules, venv

## Directory Tree
```
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── db.py
│   │   │   └── scenarios.db
│   │   ├── services/
│   │   │   ├── model_cache/
│   │   │   │   ├── .locks/
│   │   │   │   │   └── models--Helsinki-NLP--opus-mt-en-ru/
│   │   │   │   └── models--Helsinki-NLP--opus-mt-en-ru/
│   │   │   │       ├── .no_exist/
│   │   │   │       │   └── bb09c99d180016eac6819df3dae68edb1690fdee/
│   │   │   │       │       ├── added_tokens.json
│   │   │   │       │       ├── model.safetensors
│   │   │   │       │       ├── model.safetensors.index.json
│   │   │   │       │       ├── special_tokens_map.json
│   │   │   │       │       ├── target_vocab.json
│   │   │   │       │       └── tokenizer.json
│   │   │   │       ├── blobs/
│   │   │   │       │   └── eb1bda1bd256f14435a7904373c8bec152fe0e85503bcecf1373b2dd47a9f03f
│   │   │   │       ├── refs/
│   │   │   │       │   ├── refs/
│   │   │   │       │   │   └── pr/
│   │   │   │       │   │       └── 5
│   │   │   │       │   └── main
│   │   │   │       └── snapshots/
│   │   │   │           ├── b3e725abcf85d1b8c6df4218e0c0b68564660bc6/
│   │   │   │           │   └── model.safetensors
│   │   │   │           └── bb09c99d180016eac6819df3dae68edb1690fdee/
│   │   │   │               ├── config.json
│   │   │   │               ├── generation_config.json
│   │   │   │               ├── pytorch_model.bin
│   │   │   │               ├── source.spm
│   │   │   │               ├── target.spm
│   │   │   │               ├── tokenizer_config.json
│   │   │   │               └── vocab.json
│   │   │   ├── __init__.py
│   │   │   ├── constants.py
│   │   │   ├── exceptions.py
│   │   │   ├── gemini_service.py
│   │   │   ├── ollama_service.py
│   │   │   └── translation_service.py
│   │   └── app.py
│   ├── templates/
│   │   └── index.html
│   ├── requirements.txt
│   └── translation.log
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
│   │   │   └── WordAssessment.js
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
├── words/
│   ├── categorized_words.md
│   ├── en_words.py
│   ├── unknown_words.txt
│   └── unknown_words_.txt
└── project_structure_20241120_175114.md
```