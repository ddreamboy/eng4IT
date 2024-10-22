from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

class TextPreprocessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))

    def get_words(self, text):
        # Приводим текст к нижнему регистру и токенизируем
        words = word_tokenize(text.lower())

        # Удаляем стоп-слова и пунктуацию
        words = [word for word in words if word.isalnum() and word not in self.stop_words]

        return words

    def get_keywords(self, text):
        words = self.get_words(text)
        word_freq = Counter(words)

        # Выбираем слова, которые встречаются чаще среднего
        avg_freq = sum(word_freq.values()) / len(word_freq)
        keywords = [word for word, freq in word_freq.items() if freq > avg_freq]

        return keywords

    def remove_stopwords(self, text):
        words = word_tokenize(text)
        return ' '.join([word for word in words if word.lower() not in self.stop_words])
