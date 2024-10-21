import spacy
import re
from deep_translator import GoogleTranslator
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from transformers import AutoTokenizer, AutoModelForTokenClassification
from transformers import pipeline

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

class TextPreprocessor:
    def __init__(self, max_length=1000000):
        self.nlp = spacy.load("en_core_web_sm")
        self.nlp.max_length = max_length
        self.translator = GoogleTranslator(source='auto', target='ru')
        self.stop_words = set(stopwords.words('english'))

        # Загрузка модели и токенизатора для определения границ предложений
        self.tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
        self.model = AutoModelForTokenClassification.from_pretrained("bert-base-uncased")
        self.nlp_pipeline = pipeline("ner", model=self.model, tokenizer=self.tokenizer)

    def preprocess(self, text):
        # Удаление лишних пробелов и переносов строк
        text = re.sub(r'\s+', ' ', text).strip()

        # Разделение на предложения с использованием модели
        sentences = self.split_into_sentences(text)

        # Обработка каждого предложения
        processed_sentences = []
        for sentence in sentences:
            # Капитализация первой буквы предложения
            sentence = sentence.capitalize()
            # Добавление точки в конец предложения, если её нет
            if not sentence.endswith(('.', '!', '?')):
                sentence += '.'
            processed_sentences.append(sentence)

        return " ".join(processed_sentences)

    def split_into_sentences(self, text):
        # Используем модель для определения границ предложений
        results = self.nlp_pipeline(text)

        sentences = []
        current_sentence = ""
        for result in results:
            if result['entity'] == 'LABEL_1':  # LABEL_1 обычно обозначает конец предложения
                current_sentence += result['word']
                sentences.append(current_sentence.strip())
                current_sentence = ""
            else:
                current_sentence += result['word'] + " "

        # Добавляем последнее предложение, если оно есть
        if current_sentence:
            sentences.append(current_sentence.strip())

        return sentences

    def translate_to_russian(self, text):
        return self.translator.translate(text)

    def get_keywords(self, text):
        doc = self.nlp(text.lower())
        words = [token.lemma_ for token in doc if token.is_alpha and not token.is_stop]
        word_freq = Counter(words)

        # Выбираем слова, которые встречаются чаще среднего
        avg_freq = sum(word_freq.values()) / len(word_freq)
        keywords = [word for word, freq in word_freq.items() if freq > avg_freq]

        return keywords

    def get_sentences(self, text):
        return self.split_into_sentences(text)

    def get_paragraphs(self, text):
        # Разделение на параграфы по пустым строкам или длинным паузам
        paragraphs = re.split(r'\n\s*\n', text)
        return [para.strip() for para in paragraphs if para.strip()]

    def get_professional_terms(self, text):
        doc = self.nlp(text)
        professional_terms = []
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PRODUCT', 'GPE', 'EVENT', 'LAW', 'WORK_OF_ART']:
                professional_terms.append(ent.text)
        return list(set(professional_terms))

    def remove_stopwords(self, text):
        words = word_tokenize(text)
        return ' '.join([word for word in words if word.lower() not in self.stop_words])

    def lemmatize(self, text):
        doc = self.nlp(text)
        return ' '.join([token.lemma_ for token in doc])

    def get_named_entities(self, text):
        doc = self.nlp(text)
        return [(ent.text, ent.label_) for ent in doc.ents]

    def get_noun_phrases(self, text):
        doc = self.nlp(text)
        return [chunk.text for chunk in doc.noun_chunks]

    def get_verb_phrases(self, text):
        doc = self.nlp(text)
        return [token.text for token in doc if token.pos_ == "VERB"]

if __name__ == "__main__":
    # Пример использования
    preprocessor = TextPreprocessor()

    sample_text = """
    let's now start this lesson by defining
    what data visualization is
    data visualization is the technique to
    present the data in a pictorial or
    graphical format
    it enables stakeholders and decision
    makers to analyze data visually
    """

    processed_text = preprocessor.preprocess(sample_text)
    print("Processed text:")
    print(processed_text)

    sentences = preprocessor.get_sentences(processed_text)
    print("\nSentences:")
    for sentence in sentences:
        print(sentence)

    keywords = preprocessor.get_keywords(processed_text)
    print("\nKeywords:")
    print(keywords)

    professional_terms = preprocessor.get_professional_terms(processed_text)
    print("\nProfessional terms:")
    print(professional_terms)
