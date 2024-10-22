import os
import threading
import json
from text_preprocessor import TextPreprocessor
from exercises import Exercises
from user_progress import UserProgress

class LanguageLearningSystem:
    def __init__(self, num_threads=4, use_threading=True):
        self.preprocessor = TextPreprocessor()
        self.exercises = Exercises(self.preprocessor)
        self.user_progress = UserProgress()
        self.text = ""
        self.words = []
        self.keywords = []
        self.num_threads = num_threads
        self.use_threading = use_threading
        self.lock = threading.Lock()
        self.processed_dir = 'processed_subtitles'
        os.makedirs(self.processed_dir, exist_ok=True)

    def load_subtitles(self, directory):
        all_files = [f for f in os.listdir(directory) if f.endswith('.txt')]
        processed_files = [f for f in os.listdir(self.processed_dir) if f.endswith('.json')]

        if len(processed_files) < len(all_files):
            print(f"Обнаружено {len(all_files)} файлов субтитров, но обработано только {len(processed_files)}.")
            print("Начинаем обработку недостающих файлов.")
        else:
            print("Все файлы уже обработаны.")
            return

        files_to_process = [f for f in all_files if f.replace('.txt', '.json') not in processed_files]

        total_files = len(files_to_process)
        print(f"Необходимо обработать {total_files} файлов.")

        if self.use_threading and total_files > 10:
            self._process_files_threaded(directory, files_to_process)
        else:
            self._process_files(directory, files_to_process, 0)

        print("Обработка файлов завершена.")

    def _process_files_threaded(self, directory, files):
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

    def _process_files(self, directory, files, thread_id):
        for i, filename in enumerate(files, 1):
            print(f"Поток {thread_id}: Обработка файла {i}/{len(files)}: {filename}")
            file_data = self._process_file(os.path.join(directory, filename))
            with self.lock:
                self.save_processed_data(filename, file_data)

    def _process_file(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            file_text = file.read()
            words = self.preprocessor.get_words(file_text)
            keywords = self.preprocessor.get_keywords(file_text)

            with self.lock:
                self.text += file_text + "\n"
                self.words.extend(words)
                self.keywords.extend(keywords)

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

        print(f"Данные сохранены в {file_path}")

    def load_processed_data(self):
        self.text = ""
        self.words = []
        self.keywords = []

        if not os.path.exists(self.processed_dir):
            print(f"Директория {self.processed_dir} не найдена. Нужно выполнить обработку субтитров.")
            return False

        processed_files = [f for f in os.listdir(self.processed_dir) if f.endswith('.json')]

        for filename in processed_files:
            file_path = os.path.join(self.processed_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.text += data['text'] + "\n"
            self.words.extend(data['words'])
            self.keywords.extend(data['keywords'])

        if not self.text:
            print("Обработанные данные не найдены. Нужно выполнить обработку субтитров.")
            return False

        self.keywords = list(set(self.keywords))  # Удаление дубликатов
        print(f"Данные загружены из {self.processed_dir}")
        return True

    def generate_exercises(self, user_id):
        print("Генерация упражнений...")
        exercises = {
            "flashcards": self.exercises.create_flashcards(self.keywords, self.words),
            "fill_blanks": self.exercises.fill_in_the_blanks(self.words, self.keywords),
            "multiple_choice": self.exercises.multiple_choice(self.words, self.keywords),
            "word_order": self.exercises.word_order(self.words)
        }

        # Проверяем, что все типы упражнений сгенерированы успешно
        for exercise_type, exercise_list in exercises.items():
            if not exercise_list:
                print(f"Предупреждение: Не удалось сгенерировать упражнения типа {exercise_type}")

        return exercises

    def check_answer(self, exercise_type, user_answer, correct_answer):
        print("Проверка ответа...")
        if exercise_type in ["fill_blanks", "multiple_choice", "word_order"]:
            return user_answer.lower() == correct_answer.lower()
        else:
            return self.exercises.check_answer(user_answer, correct_answer)

    def update_user_progress(self, user_id, word, correct):
        self.user_progress.update_word_familiarity(user_id, word, correct)

    def get_word_familiarity(self, user_id, word):
        return self.user_progress.get_word_familiarity(user_id, word)

if __name__ == "__main__":
    system = LanguageLearningSystem(num_threads=4)

    # Пытаемся загрузить сохраненные данные
    if not system.load_processed_data():
        # Если данные не загружены или обработаны не все файлы, обрабатываем субтитры
        system.load_subtitles('subtitles')
        # После обработки заново загружаем данные
        system.load_processed_data()

    print(f'Загружено {len(system.words)} слов и {len(system.keywords)} ключевых слов.')

    user_id = "test_user"
    exercises = system.generate_exercises(user_id)

    # Пример вывода упражнений
    print("\nФлеш-карточки:")
    for card in exercises["flashcards"]:
        print(f"Слово: {card['word']}")
        print(f"Контекст: {card['context']}")
        user_answer = input("Введите перевод слова: ")
        correct = system.check_answer("flashcards", user_answer, card['word'])
        print(f"Правильно: {correct}\n")
        system.update_user_progress(user_id, card['word'], correct)

    print("\nЗаполните пропуски:")
    for question in exercises["fill_blanks"]:
        print(f"Предложение: {question['question']}")
        user_answer = input("Введите пропущенное слово: ")
        correct = system.check_answer("fill_blanks", user_answer, question['answer'])
        print(f"Правильно: {correct}\n")
        system.update_user_progress(user_id, question['answer'], correct)

    # Здесь можно добавить интерактивное взаимодействие с другими типами упражнений

    system.user_progress.close()
