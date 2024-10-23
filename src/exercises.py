import random
from difflib import SequenceMatcher
from ollama_localhost.client import OllamaClient

class Exercises:
    def __init__(self, preprocessor):
        self.preprocessor = preprocessor
        self.ollama_client = OllamaClient()

    def create_translation_exercise(self, num_questions=3):
        exercises = []
        for _ in range(num_questions):
            word = random.choice(self.preprocessor.keywords)
            translation = self.preprocessor.translations.get(word, "")
            exercises.append({
                "english": word,
                "russian": translation
            })
        return exercises

    def create_flashcards(self, num_cards=5):
        flashcards = []
        for _ in range(num_cards):
            word = random.choice(self.preprocessor.keywords)
            translation = self.preprocessor.translations.get(word, "")
            context = self.generate_context_sentence(word)
            flashcards.append({"word": word, "translation": translation, "context": context})
        return flashcards

    def generate_context_sentence(self, word):
        prompt = f"Generate a short sentence using the word '{word}' in context:"
        response = self.ollama_client.generate(prompt, model="llama3.2")
        return response if response else f"No context generated for '{word}'"

    def fill_in_the_blanks(self, num_questions=3):
        questions = []
        for _ in range(num_questions):
            word = random.choice(self.preprocessor.keywords)
            context = self.generate_context_sentence(word)
            blank_context = context.replace(word, "_____", 1)
            questions.append({"question": blank_context, "answer": word})
        return questions

    def multiple_choice(self, num_questions=3):
        questions = []
        for _ in range(num_questions):
            word = random.choice(self.preprocessor.keywords)
            context = self.generate_context_sentence(word)
            options = [word] + random.sample([w for w in self.preprocessor.keywords if w != word], 3)
            random.shuffle(options)
            questions.append({
                "word": word,
                "context": context,
                "options": options,
                "correct_index": options.index(word)
            })
        return questions

    def word_order(self, num_questions=3):
        questions = []
        for _ in range(num_questions):
            sentence = self.generate_context_sentence(random.choice(self.preprocessor.keywords))
            words = sentence.split()
            shuffled = words.copy()
            random.shuffle(shuffled)
            questions.append({"shuffled": " ".join(shuffled), "correct": sentence})
        return questions

    def check_answer(self, user_answer, correct_answer, threshold=0.8):
        similarity = SequenceMatcher(None, user_answer.lower(), correct_answer.lower()).ratio()
        return similarity >= threshold

    def analyze_collocations(self):
        collocations = []
        for word in self.preprocessor.keywords:
            prompt = f"Suggest common collocations or phrases using the word '{word}':"
            response = self.ollama_client.generate(prompt, model="llama3.2")
            if response:
                collocations.append({"word": word, "collocations": response})
        return collocations
