import Head from "next/head";
import { useState, useEffect } from "react";
import Flashcard from "../components/Flashcard";
import TranslationOptions from "../components/TranslationOptions";
import Progress from "../components/Progress";

export default function Home() {
  const [englishWord, setEnglishWord] = useState("");
  const [translations, setTranslations] = useState([]);
  const [points, setPoints] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    fetchRandomWord();
  }, []);

  const fetchRandomWord = async () => {
    try {
      const response = await fetch("http://localhost:8000/random-word");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setEnglishWord(data.english_word);
      setTranslations(data.translations || []); // Убедимся, что translations всегда массив
      setFlipped(false); // Сбросить состояние переворота при загрузке нового слова
    } catch (error) {
      console.error("Failed to fetch random word:", error);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleSelect = (selectedTranslation) => {
    if (selectedTranslation === translations[0]) {
      setPoints(points + 1);
    } else {
      setPoints(points - 1);
    }
    fetchRandomWord();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-200">
      <Head>
        <title>EduTrack</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-gray-800">EduTrack</h1>

        <Progress points={points} />

        <Flashcard englishWord={englishWord} onFlip={handleFlip} />

        {flipped && (
          <TranslationOptions
            translations={translations}
            onSelect={handleSelect}
          />
        )}
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className="h-4 ml-2" />
        </a>
      </footer>
    </div>
  );
}
