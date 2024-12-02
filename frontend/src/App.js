// eng4IT/frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import Dashboard from "./components/Dashboard";
import WordAssessment from "./components/WordAssessment";
import LearningInterface from "./components/LearningInterface";
import ChatExercise from "./components/ChatExercise";
import MatchingExercise from "./components/MatchingExercise";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<WordAssessment />} />
          <Route path="/learning" element={<LearningInterface />} />
          <Route path="/chat-exercise" element={<ChatExercise />} />
          <Route path="/matching" element={<MatchingExercise />} />
        </Routes>
        <ThemeToggle />
      </Router>
    </ThemeProvider>
  );
};

export default App;
