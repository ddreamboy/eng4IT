

### Implemented ✅

- **AI-Powered Text Generation**
  - Gemini and Ollama integration for context-rich technical scenarios
  - Smart term selection based on categories
  - Fallback system between models

- **Interactive Learning Interface**
  - Real-time word translation on hover
  - Multi-word selection system
  - Term categorization and tracking
  - Progress monitoring

- **Assessment System**
  - Swipe-based word knowledge assessment
  - Category-based term organization
  - Learning history tracking

- **Translation Services**
  - Multi-provider translation system (Google Cloud, Helsinki-NLP)
  - Fallback mechanisms for reliability
  - Context-aware technical translations

- **Term Management**
  - Comprehensive term database
  - Category-based organization
  - Progress tracking per term

### In Progress 🔨

- Machine learning-based difficulty assessment
- Spaced repetition system
- Personal learning path generation
- Performance analytics dashboard
- Custom practice sets generation

### Planned 📋

- Advanced statistics and analytics
- Team learning features
- Custom vocabulary lists
- Export/import functionality
- Mobile app version
- Browser extension

## Technical Stack

### Frontend
- React
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Backend
- Flask
- SQLAlchemy
- Langchain
- Google Cloud Translation
- Helsinki-NLP

### AI Models
- Google Gemini
- Ollama (Llama)

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/ddreamboy/eng4IT.git
```

2. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Set up environment variables
```bash
cp .env.example .env
# Add your API keys and configuration
```

5. Run the application
```bash
# Backend
cd backend
python -m flask run

# Frontend
cd frontend
npm start
```
