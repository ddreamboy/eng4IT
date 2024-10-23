import React from "react";

function AchievementModal({ show, message, onClose }) {
  if (!show) {
    return null;
  }

  return (
    <div className="achievement-modal">
      <div className="achievement-content">
        <h2>Достижение разблокировано!</h2>
        <p>{message}</p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default AchievementModal;
