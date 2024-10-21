import os
import threading
import json
from text_preprocessor import TextPreprocessor
from exercises import Exercises
from user_progress import UserProgress

class LanguageLearningSystem:
    def __init__(self, num_threads=4, use_threading=True, max_length=1_000_000):
        self.preprocessor = TextPreprocessor(max_length)
        self.exercises = Exercises(self.preprocessor)
        self.user_progress = UserProgress()
        self.text = ""
        self.sentences = []
        self.paragraphs = []
        self.keywords = []
        self.num_threads = num_threads
        self.use_threading = use_threading
        self.lock = threading.Lock()
        self.max_length = max_length
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

        files_to_process = []

        for filename in all_files:
            json_filename = os.path.splitext(filename)[0] + '.json'
            processed_file_path = os.path.join(self.processed_dir, json_filename)
            if not os.path.exists(processed_file_path):
                files_to_process.append(filename)

        if not files_to_process:
            print("Все файлы уже обработаны.")
            return

        total_files = len(files_to_process)
        print(f"Необходимо обработать {total_files} файлов.")

        if self.use_threading and total_files > 10:
            files_per_thread = total_files // self.num_threads
            threads = []
            for i in range(self.num_threads):
                start = i * files_per_thread
                end = start + files_per_thread if i < self.num_threads - 1 else None
                thread_files = files_to_process[start:end]
                thread = threading.Thread(
                    target=self._process_files,
                    args=(directory, thread_files, i)
                )
                threads.append(thread)
                thread.start()

            for thread in threads:
                thread.join()
        else:
            self._process_files(directory, files_to_process, 0)

        print("Обработка файлов завершена.")

    def _process_files(self, directory, files, thread_id):
        total_files = len(files)
        for i, filename in enumerate(files, 1):
            json_filename = os.path.splitext(filename)[0] + '.json'
            processed_file_path = os.path.join(self.processed_dir, json_filename)

            if os.path.exists(processed_file_path):
                print(f"Поток {thread_id}: Файл {filename} уже обработан. Пропускаем.")
                continue

            print(f"Поток {thread_id}: Обработка файла {i}/{total_files}: {filename}")
            file_data = self._process_file(os.path.join(directory, filename))

            # Сохранение результатов после обработки каждого файла
            with self.lock:
                self.save_processed_data(filename, file_data)

    def _process_file(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            file_text = file.read()
            chunks = [file_text[i:i+self.max_length] for i in range(0, len(file_text), self.max_length)]

            processed_text = ""
            sentences = []
            paragraphs = []
            keywords = []
            professional_terms = []

            for chunk in chunks:
                chunk_processed = self.preprocessor.preprocess(chunk)
                processed_text += chunk_processed + "\n"
                sentences.extend(self.preprocessor.get_sentences(chunk_processed))
                paragraphs.extend(self.preprocessor.get_paragraphs(chunk_processed))
                keywords.extend(self.preprocessor.get_keywords(chunk_processed))
                professional_terms.extend(self.preprocessor.get_professional_terms(chunk_processed))

            with self.lock:
                self.text += processed_text
                self.sentences.extend(sentences)
                self.paragraphs.extend(paragraphs)
                self.keywords.extend(keywords)
                self.professional_terms = list(set(professional_terms))

            return {
                'text': processed_text,
                'sentences': sentences,
                'paragraphs': paragraphs,
                'keywords': list(set(keywords)),
                'professional_terms': list(set(professional_terms))
            }

    def save_processed_data(self, original_filename, data):
        base_name = os.path.basename(original_filename)
        json_filename = os.path.splitext(base_name)[0] + '.json'
        file_path = os.path.join(self.processed_dir, json_filename)

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Данные сохранены в {file_path}")

    def load_processed_data(self):
        self.text = ""
        self.sentences = []
        self.paragraphs = []
        self.keywords = []

        if not os.path.exists(self.processed_dir):
            print(f"Директория {self.processed_dir} не найдена. Нужно выполнить обработку субтитров.")
            return False

        processed_files = [f for f in os.listdir(self.processed_dir) if f.endswith('.json')]
        subtitle_files = [f for f in os.listdir('subtitles') if f.endswith('.txt')]

        if len(processed_files) < len(subtitle_files):
            print(f"Обнаружено {len(subtitle_files)} файлов субтитров, но обработано только {len(processed_files)}.")
            return False

        for filename in processed_files:
            file_path = os.path.join(self.processed_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.text += data['text']
            self.sentences.extend(data['sentences'])
            self.paragraphs.extend(data['paragraphs'])
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
            "translation": self.exercises.create_translation_exercise(self.sentences),
            "paragraph_order": self.exercises.create_paragraph_order_exercise(self.paragraphs),
            "flashcards": self.exercises.create_flashcards(self.keywords, self.sentences),
            "fill_blanks": self.exercises.fill_in_the_blanks(self.sentences, self.keywords),
            "multiple_choice": self.exercises.multiple_choice(self.sentences, self.keywords),
            "word_order": self.exercises.word_order(self.sentences)
        }
        return exercises

    def check_answer(self, exercise_type, user_answer, correct_answer):
        print("Проверка ответа...")
        if exercise_type == "translation":
            return self.exercises.check_answer(user_answer, correct_answer, threshold=0.7)
        elif exercise_type in ["fill_blanks", "multiple_choice", "word_order"]:
            return user_answer.lower() == correct_answer.lower()
        elif exercise_type == "paragraph_order":
            return user_answer == correct_answer
        else:
            return False

    def update_user_progress(self, user_id, word, correct):
        self.user_progress.update_word_familiarity(user_id, word, correct)

    def get_word_familiarity(self, user_id, word):
        return self.user_progress.get_word_familiarity(user_id, word)

if __name__ == "__main__":
    system = LanguageLearningSystem(num_threads=16, max_length=900000)

    # Пытаемся загрузить сохраненные данные
    if not system.load_processed_data():
        # Если данные не загружены или обработаны не все файлы, обрабатываем субтитры
        system.load_subtitles('subtitles')
        # После обработки заново загружаем данные
        system.load_processed_data()

    print(f'Загружено {len(system.sentences)} предложений и {len(system.keywords)} ключевых слов.')

    user_id = "test_user"
    exercises = system.generate_exercises(user_id)

    # Пример вывода упражнений
    print("\nПеревод предложений:")
    for ex in exercises["translation"]:
        print(f"English: {ex['english']}")
        print(f"Russian: {ex['russian']}")
        user_answer = input("Ваш перевод: ")
        correct = system.check_answer("translation", user_answer, ex['english'])
        print(f"Правильно: {correct}\n")
        system.update_user_progress(user_id, ex['english'].split()[0], correct)

    print("\nВосстановите порядок абзацев:")
    for i, para in enumerate(exercises["paragraph_order"]["shuffled"], 1):
        print(f"{i}. {para[:100]}...")
    user_answer = input("Введите правильный порядок (например, 2 1 3): ")
    user_order = [int(x) - 1 for x in user_answer.split()]
    correct = system.check_answer(
        "paragraph_order", user_order, list(range(len(exercises["paragraph_order"]["correct_order"])))
    )
    print(f"Правильно: {correct}")

    # Здесь можно добавить интерактивное взаимодействие с другими типами упражнений

    system.user_progress.close()
