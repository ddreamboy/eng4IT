import os
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
import random
from difflib import SequenceMatcher

# Загрузка необходимых ресурсов NLTK
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

# Убедимся, что 'punkt_tab' тоже загружен
nltk.download('punkt_tab', quiet=True)


class LanguageLearningExercises:
    def __init__(self):
        self.text = ''
        self.sentences = []
        self.words = []
        self.stop_words = set(stopwords.words('english'))
        self.keywords = []

    def load_subtitles(self, directory):
        all_text = ''
        for filename in os.listdir(directory):
            if filename.endswith('.txt'):
                with open(os.path.join(directory, filename), 'r',
                          encoding='utf-8') as file:
                    all_text += file.read() + '\n'

        self.text = all_text
        self.sentences = sent_tokenize(self.text)
        self.words = word_tokenize(self.text.lower())
        self.keywords = [word for word in self.words if word.isalnum() and
                         word not in self.stop_words]

    def create_flashcards(self, num_cards=5):
        flashcards = []
        for _ in range(num_cards):
            word = random.choice(self.keywords)
            context = next((s for s in self.sentences if word in s.lower()),
                           'No context found.')
            flashcards.append({'word': word, 'context': context})
        return flashcards

    def fill_in_the_blanks(self, num_questions=3):
        questions = []
        for _ in range(num_questions):
            sentence = random.choice(self.sentences)
            words = word_tokenize(sentence)
            word_to_remove = random.choice([w for w in words if w.lower() in
                                            self.keywords])
            blank_sentence = sentence.replace(word_to_remove, '___________')
            questions.append({'question': blank_sentence,
                              'answer': word_to_remove})
        return questions

    def multiple_choice(self, num_questions=3):
        questions = []
        for _ in range(num_questions):
            word = random.choice(self.keywords)
            correct_sentence = next((s for s in self.sentences if word in
                                     s.lower()), None)
            if correct_sentence:
                options = [correct_sentence] + random.sample(self.sentences, 3)
                random.shuffle(options)
                questions.append({
                    'word': word,
                    'options': options,
                    'correct_index': options.index(correct_sentence)
                })
        return questions

    def word_order(self, num_questions=3):
        questions = []
        for _ in range(num_questions):
            sentence = random.choice(self.sentences)
            words = word_tokenize(sentence)
            random.shuffle(words)
            questions.append({'shuffled': ' '.join(words),
                              'correct': sentence})
        return questions

    def check_answer(self, user_answer, correct_answer, threshold=0.8):
        similarity = SequenceMatcher(None, user_answer.lower(),
                                     correct_answer.lower()).ratio()
        return similarity >= threshold


# Пример использования
exercises = LanguageLearningExercises()
exercises.load_subtitles('subtitles')

print(f'Загружено {len(exercises.sentences)} предложений и '
      f'{len(exercises.keywords)} ключевых слов.')

# Создание карточек
flashcards = exercises.create_flashcards(num_cards=5)
print('\nFlashcards:')
for card in flashcards:
    print(f'Word: {card["word"]}')
    print(f'Context: {card["context"]}\n')

# Заполнение пропусков
fill_blanks = exercises.fill_in_the_blanks(num_questions=3)
print('Fill in the blanks:')
for question in fill_blanks:
    print(f'Question: {question["question"]}')
    print(f'Answer: {question["answer"]}\n')

# Множественный выбор
multiple_choice = exercises.multiple_choice(num_questions=3)
print('Multiple choice:')
for question in multiple_choice:
    print(f'Word: {question["word"]}')
    for i, option in enumerate(question['options']):
        print(f'{i + 1}. {option}')
    print(f'Correct answer: {question["correct_index"] + 1}\n')

# Порядок слов
word_order = exercises.word_order(num_questions=3)
print('Word order:')
for question in word_order:
    print(f'Shuffled: {question["shuffled"]}')
    print(f'Correct: {question["correct"]}\n')

# Проверка ответа пользователя
user_answer = 'this video will share five tips to organize python code'
correct_answer = ('in this video I will share with you five tips to better '
                  'organize your python code')
is_correct = exercises.check_answer(user_answer, correct_answer)
print(f'User answer is correct: {is_correct}')
