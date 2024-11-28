// frontend/src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import WordAssessment from "./components/WordAssessment";
import LearningInterface from "./components/LearningInterface";
import ChatExercise from "./components/ChatExercise";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assessment" element={<WordAssessment />} />
        <Route path="/learning" element={<LearningInterface />} />
        <Route path="/chat-exercise" element={<ChatExercise />} />
      </Routes>
    </Router>
  );
};

export default App;
