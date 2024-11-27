import React from "react";

const Progress = ({ points }) => {
  return (
    <div className="progress-container">
      <p className="text-xl">Points: {points}</p>
    </div>
  );
};

export default Progress;
