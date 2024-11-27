import React from "react";

const Flashcard = ({ englishWord, onFlip }) => {
  return (
    <div className="flashcard-container">
      <div className="flashcard" onClick={onFlip}>
        <div className="flashcard-front">
          <p className="text-2xl font-bold">{englishWord}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
