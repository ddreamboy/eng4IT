import random
from difflib import SequenceMatcher

class Exercises:
    def __init__(self, preprocessor):
        self.preprocessor = preprocessor

    def create_translation_exercise(self, sentences, num_questions=3):
        exercises = []
        for _ in range(num_questions):
            sentence = random.choice(sentences)
            russian_translation = self.preprocessor.translate_to_russian(sentence)
            exercises.append({
                "english": sentence,
                "russian": russian_translation
            })
        return exercises

    def create_paragraph_order_exercise(self, paragraphs, num_paragraphs=3):
        selected_paragraphs = random.sample(paragraphs, min(num_paragraphs, len(paragraphs)))
        shuffled_paragraphs = selected_paragraphs.copy()
        random.shuffle(shuffled_paragraphs)
        return {
            "shuffled": shuffled_paragraphs,
            "correct_order": selected_paragraphs
        }

    def create_flashcards(self, keywords, sentences, num_cards=5):
        flashcards = []
        for _ in range(num_cards):
            word = random.choice(keywords)
            context = next((s for s in sentences if word in s.lower()), "No context found.")
            flashcards.append({"word": word, "context": context})
        return flashcards

    def fill_in_the_blanks(self, words, keywords, num_questions=3):
        questions = []
        attempts = 0
        max_attempts = num_questions * 10  # Увеличиваем количество попыток

        while len(questions) < num_questions and attempts < max_attempts:
            word = random.choice(keywords)
            context = self.find_context(word, words, window=5)

            if context:
                blank_context = context.replace(word, "___________", 1)
                questions.append({"question": blank_context, "answer": word})

            attempts += 1

        return questions

    def find_context(self, word, words, window=5):
        try:
            index = words.index(word)
            start = max(0, index - window)
            end = min(len(words), index + window + 1)
            return " ".join(words[start:end])
        except ValueError:
            return None

    def multiple_choice(self, words, keywords, num_questions=3):
        questions = []
        attempts = 0
        max_attempts = num_questions * 10

        while len(questions) < num_questions and attempts < max_attempts:
            word = random.choice(keywords)
            context = self.find_context(word, words)

            if context:
                options = [word] + random.sample([w for w in keywords if w != word], 3)
                random.shuffle(options)
                questions.append({
                    "word": word,
                    "context": context,
                    "options": options,
                    "correct_index": options.index(word)
                })

            attempts += 1

        return questions

    def word_order(self, words, num_questions=3):
        questions = []
        attempts = 0
        max_attempts = num_questions * 10

        while len(questions) < num_questions and attempts < max_attempts:
            start = random.randint(0, len(words) - 6)
            phrase = words[start:start+5]
            shuffled = phrase.copy()
            random.shuffle(shuffled)

            if phrase != shuffled:
                questions.append({"shuffled": " ".join(shuffled), "correct": " ".join(phrase)})

            attempts += 1

        return questions

    def check_answer(self, user_answer, correct_answer, threshold=0.8):
        similarity = SequenceMatcher(None, user_answer.lower(), correct_answer.lower()).ratio()
        return similarity >= threshold
