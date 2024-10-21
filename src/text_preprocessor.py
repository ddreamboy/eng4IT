import spacy
from deep_translator import GoogleTranslator
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
import nltk

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

class TextPreprocessor:
    def __init__(self, max_length=1000000):
        self.nlp = spacy.load("en_core_web_sm")
        self.nlp.max_length = max_length
        self.translator = GoogleTranslator(source='auto', target='ru')
        self.stop_words = set(stopwords.words('english'))

    def preprocess(self, text):
        doc = self.nlp(text)
        processed_text = " ".join([sent.text for sent in doc.sents if len(sent.text.split()) > 3])
        return processed_text

    def translate_to_russian(self, text):
       return self.translator.translate(text)

    def get_keywords(self, text):
        words = word_tokenize(text.lower())
        return [word for word in words if word.isalnum() and word not in self.stop_words]

    def get_sentences(self, text):
        return sent_tokenize(text)

    def get_paragraphs(self, text):
        return [para.strip() for para in text.split('\n') if para.strip()]
