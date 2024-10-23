import React, { useState } from "react";

function WordList({
  words,
  userWords,
  learnedWords,
  repeatWords,
  setLearnedWords,
  currentPage,
  setCurrentPage,
  wordsPerPage,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("alphabet");
  const [showLearned, setShowLearned] = useState(false);

  const allWords = [...words, ...userWords];

  const filteredWords = allWords.filter((word) =>
    word.english.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedWords = filteredWords.sort((a, b) => {
    if (sortMode === "alphabet") {
      return a.english.localeCompare(b.english);
    } else if (sortMode === "difficulty") {
      const aErrors = repeatWords.includes(a.english) ? 1 : 0;
      const bErrors = repeatWords.includes(b.english) ? 1 : 0;
      return bErrors - aErrors;
    }
    return 0;
  });

  const wordsToShow = showLearned
    ? sortedWords.filter((word) => learnedWords.includes(word.english))
    : sortedWords;

  // Пагинация
  const indexOfLastWord = currentPage * wordsPerPage;
  const indexOfFirstWord = indexOfLastWord - wordsPerPage;
  const currentWords = wordsToShow.slice(indexOfFirstWord, indexOfLastWord);

  const totalPages = Math.ceil(wordsToShow.length / wordsPerPage);

  const toggleLearned = (word) => {
    if (learnedWords.includes(word.english)) {
      setLearnedWords(learnedWords.filter((w) => w !== word.english));
    } else {
      setLearnedWords([...learnedWords, word.english]);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={currentPage === i ? "active" : ""}
          >
            {i}
          </button>,
        );
      }
    } else {
      if (currentPage > 1) {
        buttons.push(
          <button key="prev" onClick={() => handlePageChange(currentPage - 1)}>
            Назад
          </button>,
        );
      }

      if (currentPage > 3) {
        buttons.push(
          <button key={1} onClick={() => handlePageChange(1)}>
            1
          </button>,
        );
        if (currentPage > 4) {
          buttons.push(<span key="dots1">...</span>);
        }
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={currentPage === i ? "active" : ""}
          >
            {i}
          </button>,
        );
      }

      if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) {
          buttons.push(<span key="dots2">...</span>);
        }
        buttons.push(
          <button key={totalPages} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </button>,
        );
      }

      if (currentPage < totalPages) {
        buttons.push(
          <button key="next" onClick={() => handlePageChange(currentPage + 1)}>
            Вперед
          </button>,
        );
      }
    }

    return buttons;
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
          <option value="alphabet">Алфавит</option>
          <option value="difficulty">Сложность</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={showLearned}
            onChange={() => setShowLearned(!showLearned)}
          />
          Показать изученные
        </label>
      </div>
      <ul className="word-list">
        {currentWords.map((word, index) => (
          <li key={index}>
            <span>
              {word.english} - {word.russian.join(", ")}
            </span>
            <button
              className={
                learnedWords.includes(word.english)
                  ? "remove-learned"
                  : "add-learned"
              }
              onClick={() => toggleLearned(word)}
            >
              {learnedWords.includes(word.english)
                ? "Удалить из изученных"
                : "Добавить в изученные"}
            </button>
          </li>
        ))}
      </ul>
      <div className="pagination">{renderPaginationButtons()}</div>
    </div>
  );
}

export default WordList;
