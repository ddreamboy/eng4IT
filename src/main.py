import sys
import os
import threading
import json
import logging
from text_preprocessor import TextPreprocessor
from exercises import Exercises
from user_progress import UserProgress

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LanguageLearningSystem:
    def __init__(self, num_threads=4, use_threading=True):
        logger.info("Инициализация системы изучения языка")
        self.preprocessor = TextPreprocessor()
        self.exercises = Exercises(self.preprocessor)
        self.user_progress = UserProgress()
        self.text = ""
        self.num_threads = num_threads
        self.use_threading = use_threading
        self.lock = threading.Lock()
        self.processed_dir = 'processed_subtitles'
        os.makedirs(self.processed_dir, exist_ok=True)
        logger.info("Система инициализирована")

    def load_subtitles(self, directory):
        logger.info(f"Загрузка субтитров из директории: {directory}")
        all_files = [f for f in os.listdir(directory) if f.endswith('.txt')]
        processed_files = [f for f in os.listdir(self.processed_dir) if f.endswith('.json')]

        if len(processed_files) < len(all_files):
            logger.info(f"Обнаружено {len(all_files)} файлов субтитров, обработано {len(processed_files)}")
            files_to_process = [f for f in all_files if f.replace('.txt', '.json') not in processed_files]
            logger.info(f"Необходимо обработать {len(files_to_process)} файлов")

            if self.use_threading and len(files_to_process) > 10:
                self._process_files_threaded(directory, files_to_process)
            else:
                self._process_files(directory, files_to_process, 0)
        else:
            logger.info("Все файлы уже обработаны")

        logger.info("Обработка файлов завершена")
        self.preprocessor.translate_keywords()

    def _process_files_threaded(self, directory, files):
        logger.info(f"Запуск многопоточной обработки для {len(files)} файлов")
        files_per_thread = len(files) // self.num_threads
        threads = []
        for i in range(self.num_threads):
            start = i * files_per_thread
            end = start + files_per_thread if i < self.num_threads - 1 else None
            thread_files = files[start:end]
            thread = threading.Thread(
                target=self._process_files,
                args=(directory, thread_files, i)
            )
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()
        logger.info("Многопоточная обработка завершена")

    def _process_files(self, directory, files, thread_id):
        for i, filename in enumerate(files, 1):
            logger.info(f"Поток {thread_id}: Обработка файла {i}/{len(files)}: {filename}")
            file_data = self._process_file(os.path.join(directory, filename))
            with self.lock:
                self.save_processed_data(filename, file_data)

    def _process_file(self, file_path):
        logger.info(f"Обработка файла: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as file:
            file_text = file.read()
            words = self.preprocessor.get_words(file_text)
            keywords = self.preprocessor.get_keywords(file_text)

            with self.lock:
                self.text += file_text + "\n"

            return {
                'text': file_text,
                'words': words,
                'keywords': keywords
            }

    def save_processed_data(self, original_filename, data):
        json_filename = os.path.splitext(original_filename)[0] + '.json'
        file_path = os.path.join(self.processed_dir, json_filename)

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info(f"Данные сохранены в {file_path}")

    def load_processed_data(self):
        logger.info("Загрузка обработанных данных")
        self.text = ""
        all_keywords = set()

        if not os.path.exists(self.processed_dir):
            logger.warning(f"Директория {self.processed_dir} не найдена")
            return False

        processed_files = [f for f in os.listdir(self.processed_dir) if f.endswith('.json')]

        for filename in processed_files:
            file_path = os.path.join(self.processed_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.text += data['text'] + "\n"
            all_keywords.update(data['keywords'])

        if not self.text:
            logger.warning("Обработанные данные не найдены")
            return False

        self.preprocessor.keywords = list(all_keywords)
        self.preprocessor.save_keywords()  # Сохраняем ключевые слова
        logger.info(f"Данные загружены из {self.processed_dir}")
        logger.info(f"Загружено {len(self.preprocessor.keywords)} уникальных ключевых слов")
        return True

    def generate_exercises(self, user_id):
        logger.info(f"Генерация упражнений для пользователя {user_id}")
        exercises = {
            "flashcards": self.exercises.create_flashcards(),
            "fill_blanks": self.exercises.fill_in_the_blanks(),
            "multiple_choice": self.exercises.multiple_choice(),
            "word_order": self.exercises.word_order()
        }

        for exercise_type, exercise_list in exercises.items():
            if not exercise_list:
                logger.warning(f"Не удалось сгенерировать упражнения типа {exercise_type}")

        return exercises

    def check_answer(self, exercise_type, user_answer, correct_answer):
        logger.info(f"Проверка ответа для упражнения типа {exercise_type}")
        if exercise_type in ["fill_blanks", "multiple_choice", "word_order"]:
            return user_answer.lower() == correct_answer.lower()
        else:
            return self.exercises.check_answer(user_answer, correct_answer)

    def update_user_progress(self, user_id, word, correct):
        logger.info(f"Обновление прогресса пользователя {user_id} для слова '{word}' (правильно: {correct})")
        self.user_progress.update_word_familiarity(user_id, word, correct)

    def get_word_familiarity(self, user_id, word):
        familiarity = self.user_progress.get_word_familiarity(user_id, word)
        logger.info(f"Получена знакомость слова '{word}' для пользователя {user_id}: {familiarity}")
        return familiarity

    def analyze_collocations(self):
        logger.info("Анализ словосочетаний")
        return self.exercises.analyze_collocations()

    def translate_keywords(self):
        logger.info("Начало перевода ключевых слов")
        self.preprocessor.translate_keywords()
        logger.info("Перевод ключевых слов завершен")


if __name__ == "__main__":
    logger.info("Запуск основной программы")
    system = LanguageLearningSystem(num_threads=4)

    if not system.load_processed_data():
        logger.error("Не удалось загрузить обработанные данные. Программа завершается.")
        sys.exit(1)

    if not system.preprocessor.keywords:
        logger.error("Список ключевых слов пуст. Невозможно сгенерировать упражнения.")
        sys.exit(1)

    logger.info(f'Загружено {len(system.preprocessor.keywords)} ключевых слов')

    system.translate_keywords()


    user_id = "test_user"
    exercises = system.generate_exercises(user_id)

    logger.info("Начало выполнения упражнений")

    print("\nФлеш-карточки:")
    for card in exercises["flashcards"]:
        print(f"Слово: {card['word']}")
        print(f"Перевод: {card['translation']}")
        print(f"Контекст: {card['context']}")
        user_answer = input("Введите перевод слова: ")
        correct = system.check_answer("flashcards", user_answer, card['translation'])
        print(f"Правильно: {correct}\n")
        system.update_user_progress(user_id, card['word'], correct)

    print("\nЗаполните пропуски:")
    for question in exercises["fill_blanks"]:
        print(f"Предложение: {question['question']}")
        user_answer = input("Введите пропущенное слово: ")
        correct = system.check_answer("fill_blanks", user_answer, question['answer'])
        print(f"Правильно: {correct}\n")
        system.update_user_progress(user_id, question['answer'], correct)

    print("\nАнализ словосочетаний:")
    collocations = system.analyze_collocations()
    for item in collocations:
        print(f"Слово: {item['word']}")
        print(f"Словосочетания: {item['collocations']}\n")

    logger.info("Завершение работы программы")
    system.user_progress.close()
