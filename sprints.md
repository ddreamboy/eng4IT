# EduTrack Project Specification

This document outlines the development of EduTrack, an interactive language-learning app focused on IT and ML terminologies. The specification includes detailed functionality and unique visual design for a seamless, engaging user experience.

## Project Overview

- **Duration per Sprint:** 1 week
- **Feature Format:** Each sprint delivers features formulated as “User can…”
- **Core Focus:** Backend and Frontend development

## Sprint Plan

### Sprint 1: Initial Infrastructure Setup

**Backend:**

- Create GitHub repository with branch structure (main, develop).
- Add .gitignore for Python and Node.js.
- Set up FastAPI and MySQL, initialize project structure, create database connection.
- Configure primary dependencies (Uvicorn, SQLAlchemy).
- Implement basic user authentication (JWT).

**Frontend:**

- Initialize Next.js project.
- Set up and configure Tailwind CSS.
- Create a unique welcome page with illustrations and animations.
- Ensure mobile responsiveness for the design.

**Features:**

- User can view the initial welcome page with animations and unique illustrations.
- User can access a test API that returns a welcome message.

**Design Enhancements:**

- **Animations:** Add animations for welcome text and illustrations.
- **Illustrations:** Use IT and ML-themed illustrations.
- **Interactive Elements:** Include interactive buttons with hover animations.

### Sprint 2: Flashcards and Points System

**Backend:**

- Create database model for vocabulary words (English, Russian translation, progress for each word).
- Develop endpoint for retrieving a random word with 4 translation options.
- Implement logic for awarding/deducting points for correct/incorrect answers.
- Create API for user stats (points, correct/incorrect answers).

**Frontend:**

- Design flashcards with flip animation to reveal translations.
- Implement translation option selection (4 options with one correct answer).
- Display user progress for each word (points).
- Add animations on choosing a translation option.

**Features:**

- User can see flashcards with 4 translation options and flip them for the answer.
- User can gain points for correct answers and lose points for incorrect ones.
- User can view their current stats and points on the main page.

**Design Enhancements:**

- **Flip Animation:** Smooth and realistic flip animation for flashcards.
- **Progress Bar:** Add a progress bar showing remaining flashcards.
- **Answer Animations:** Include animations for correct (green check) and incorrect (red cross) answers.

### Sprint 3: Tracking Learned Words and Progress

**Backend:**

- Set up database table to track user progress on each word (count of successful translations).
- Create endpoint for retrieving a list of learned words and their stats.
- Update word progress statistics after completing each flashcard.

**Frontend:**

- Display list of learned words (e.g., words successfully translated 3 times) with filtering options.
- Add a progress indicator for each word (charts, levels).
- Incorporate unique visual elements such as progress bars and animations.

**Features:**

- User can see their learned words and progress for each word.
- User can filter learned words by various criteria (e.g., date learned, difficulty).

**Design Enhancements:**

- **Real-time Progress:** Visual elements showing real-time user progress.
- **Sorting Options:** Allow sorting of learned words by different criteria.
- **Interactive Charts:** Use animated charts to display progress.

### Sprint 4: Word Search and Filtering

**Backend:**

- Create API for searching words in the database with support for different filters.
- Develop endpoint for filtering words by topic, difficulty level, and other parameters.

**Frontend:**

- Add search functionality for vocabulary words with topic-based filtering (e.g., AI, ML, IT).
- Implement an interface with interactive filters and the ability to save preferences.
- Design a unique search page layout (e.g., using cards to display results).

**Features:**

- User can search and filter words by topic and difficulty level.
- User can save filter preferences for future sessions.

**Design Enhancements:**

- **Result Cards:** Use animated cards to display search results.
- **Interactive Filters:** Make filters interactive with animations.
- **Save Preferences:** Include animations for confirming saved preferences.

### Sprint 5: User Profile and Statistics

**Backend:**

- Create user profile model storing personal data (name, email, theme preferences).
- Implement API for profile retrieval and editing.
- Set up user statistics tracking (accuracy rate, mistakes, study time) with historical data.

**Frontend:**

- Design user profile page with progress information and settings in a unique style.
- Display user statistics with detailed progress (charts, progress tables).
- Enable profile editing (selecting topics for study) with an intuitive UI and animations.

**Features:**

- User can edit their profile, view study statistics, and track progress.
- User can choose topics for study and receive vocabulary recommendations based on stats.

**Design Enhancements:**

- **Avatar:** Allow users to upload avatars with change animations.
- **Statistics:** Use animated charts and graphs for displaying statistics.
- **Settings:** Include animated toggles and sliders for settings.

## Final Sprint Outcomes

- **Sprint 1:** User can see a unique welcome page and access API with custom design.
- **Sprint 2:** User can interact with flashcards, earn/lose points, and view stats.
- **Sprint 3:** User can view their learned words and track progress with unique visuals.
- **Sprint 4:** User can search/filter words by topic, with saved filter preferences.
- **Sprint 5:** User can edit their profile, view study statistics, and select topics.

## Visual Design Recommendations:

- **Color Palette:** Use a vibrant color palette and modern fonts for an attractive interface.
- **Animations:** Implement animations for interactive elements (e.g., on card flips).
- **Illustrations:** Add illustrations to visually represent vocabulary concepts (e.g., related to AI, ML, IT).
- **Navigation Ease:** Emphasize navigation ease and usability with tooltips and visual feedback on actions.
- **Responsive Design:** Ensure all interface elements display well on various devices and screens.
- **Interactive Elements:** Add interactive elements like tooltips and hover animations.
- **Parallax Effects:** Include parallax effects for background and illustrations to create depth and dynamics.
- **Modal Windows:** Use modal windows with smooth animations for additional information or confirmations.
- **Interactive Tutorials:** Add interactive tutorials with animations for new users to help them get started.
