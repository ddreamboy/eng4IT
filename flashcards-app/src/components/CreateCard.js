import React, { useState } from "react";
import "../styles/CreateCard.css";

function CreateCard({ userWords, setUserWords }) {
  const [newWord, setNewWord] = useState("");
  const [newTranslations, setNewTranslations] = useState("");

  const addNewWord = () => {
    if (newWord.trim() === "" || newTranslations.trim() === "") {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    const newWordData = {
      english: newWord.trim(),
      russian: newTranslations.split(",").map((t) => t.trim()),
    };
    setUserWords([...userWords, newWordData]);
    setNewWord("");
    setNewTranslations("");
  };

  return (
    <div className="create-card">
      <h2>Создать карточку</h2>
      <div className="form-group">
        <label htmlFor="new-word">Слово:</label>
        <input
          id="new-word"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="new-translations">Переводы (через запятую):</label>
        <textarea
          id="new-translations"
          value={newTranslations}
          onChange={(e) => setNewTranslations(e.target.value)}
        />
      </div>
      <button onClick={addNewWord}>Добавить</button>
    </div>
  );
}

export default CreateCard;
