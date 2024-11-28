# eng4IT

Eng4IT is an innovative application designed to enhance language learning through interactive chat exercises. Modeled after Duolingo, it allows users to engage in dialogues where they must respond by selecting words in the correct order. This project leverages advanced AI models to provide context-rich responses and real-time translations, making language learning both fun and effective.

## Features

### Implemented ✅

- **AI-Powered Text Generation**
  - Integration with Gemini and Ollama for context-rich technical scenarios.
  - Smart term selection based on categories.
  - Fallback system between models to ensure reliability.

- **Interactive Learning Interface**
  - Real-time word translation on hover.
  - Multi-word selection system for accurate responses.
  - Term categorization and tracking.
  - Progress monitoring to track user improvement.

- **Assessment System**
  - Swipe-based word knowledge assessment.
  - Category-based term organization.
  - Learning history tracking to review past progress.

- **Translation Services**
  - Multi-provider translation system (Google Cloud, Helsinki-NLP).
  - Fallback mechanisms for uninterrupted learning.
  - Context-aware technical translations to enhance understanding.

- **Term Management**
  - Comprehensive term database.
  - Category-based organization for efficient learning.
  - Progress tracking per term to monitor individual term mastery.

- **Chat Exercise System**
  - Interactive dialogue-based learning mimicking real conversations.
  - Word ordering exercises similar to Duolingo.
  - Real-time translation and hints to assist learning.
  - Progress tracking per dialogue.
  - Fallback between Gemini and Ollama for dialogue generation.

### In Progress 🔨

- Machine learning-based difficulty assessment.
- Spaced repetition system for optimized learning.
- Personal learning path generation.
- Performance analytics dashboard.
- Custom practice sets generation.

### Planned 📋

- Advanced statistics and analytics.
- Team learning features for collaborative learning.
- Custom vocabulary lists.
- Export/import functionality.
- Mobile app version.
- Browser extension.

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

1. **Clone the repository**
   ```bash
   git clone https://github.com/ddreamboy/eng4IT.git
  ```
Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```
Install frontend dependencies
```bash
cd frontend
npm install
```
Set up environment variables
```bash
cp .env.example .env
# Add your API keys and configuration
```
Run the application

# Backend
```bash
cd backend
python -m flask run
```
# Frontend
```bash
cd frontend
npm start
```
