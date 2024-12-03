// eng4IT/frontend/src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import Dashboard from "./components/Dashboard";
import WordAssessment from "./components/WordAssessment";
import LearningInterface from "./components/LearningInterface";
import ChatExercise from "./components/ChatExercise";
import MatchingExercise from "./components/MatchingExercise";

const App = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

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
