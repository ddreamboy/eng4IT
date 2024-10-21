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

    def fill_in_the_blanks(self, sentences, keywords, num_questions=3):
        questions = []
        for _ in range(num_questions):
            sentence = random.choice(sentences)
            words = self.preprocessor.get_keywords(sentence)
            word_to_remove = random.choice([w for w in words if w in keywords])
            blank_sentence = sentence.replace(word_to_remove, "___________")
            questions.append({"question": blank_sentence, "answer": word_to_remove})
        return questions

    def multiple_choice(self, sentences, keywords, num_questions=3):
        questions = []
        for _ in range(num_questions):
            word = random.choice(keywords)
            correct_sentence = next((s for s in sentences if word in s.lower()), None)
            if correct_sentence:
                options = [correct_sentence] + random.sample(sentences, 3)
                random.shuffle(options)
                questions.append({
                    "word": word,
                    "options": options,
                    "correct_index": options.index(correct_sentence)
                })
        return questions

    def word_order(self, sentences, num_questions=3):
        questions = []
        for _ in range(num_questions):
            sentence = random.choice(sentences)
            words = self.preprocessor.get_keywords(sentence)
            random.shuffle(words)
            questions.append({"shuffled": " ".join(words), "correct": sentence})
        return questions

    def check_answer(self, user_answer, correct_answer, threshold=0.8):
        similarity = SequenceMatcher(None, user_answer.lower(), correct_answer.lower()).ratio()
        return similarity >= threshold
