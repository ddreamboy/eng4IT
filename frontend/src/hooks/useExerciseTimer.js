// src/hooks/useExerciseTimer.js
import { useState, useEffect } from "react";

export const useExerciseTimer = () => {
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    return () => {
      setEndTime(Date.now());
    };
  }, []);

  const getTimeSpent = () => {
    const end = endTime || Date.now();
    return Math.floor((end - startTime) / 1000);
  };

  return getTimeSpent;
};
