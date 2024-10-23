import json
import re
import requests
from deep_translator import GoogleTranslator
from ollama_localhost.client import OllamaClient
from tqdm import tqdm
import os
from concurrent.futures import ThreadPoolExecutor, as_completed


def is_valid_word(word):
    return re.match(r'^[a-zA-Z]+$', word)


def get_translation(word):
    if not is_valid_word(word):
        return None

    try:
        translation = GoogleTranslator(source='en', target='ru').translate(word, return_all=True)
    except Exception as e:
        print(f"Error: {e}")
        return None

    return translation


def get_translation_ollama(word):
    if not is_valid_word(word):
        return None

    try:
        ollama = OllamaClient()
        prompt = f'''
                You are the most responsible translator
                in the world from English to Russian.
                Return, if possible, all the
                translation options into Russian
                for this word '{word}' in a strict format.
                For example, for 'equal', the answer should be strictly
                ["равняться", "одинаковый", "приравнивать", ...]
                PLEASE, SEND ONLY ANSWERS IN STRICT FORMAT [str, str, str, ...]
                NO ADDITIONAL TEXT OR SYMBOLS
                '''
        translation = ollama.generate(prompt=prompt, model="mistral")
    except Exception as e:
        print(f"Error: {e}")
        return None

    return translation

with open('keywords.json', encoding='utf-8') as f:
    words = json.load(f)


def process_word(word, existing_translations):
    if word in existing_translations:
        return word, existing_translations[word]

    translation = get_translation(word)
    if translation:
        translation_list = [translation]
        translation_by_llm = get_translation_ollama(word)
        if translation_by_llm:
            translation_list += json.loads(translation_by_llm)
        return word, translation_list
    return word, None


result = {}

# Check if translated_words.json exists and load its content
if os.path.exists('translated_words.json'):
    with open('translated_words.json', encoding='utf-8') as f:
        existing_translations = json.load(f)
else:
    existing_translations = {}

with ThreadPoolExecutor(max_workers=10) as executor:  # Можно настроить количество потоков
    # Создаем список задач
    future_to_word = {executor.submit(process_word, word, existing_translations): word for word in words}

    # Обрабатываем результаты по мере их завершения
    for future in tqdm(as_completed(future_to_word), total=len(words), desc="Translating words"):
        word = future_to_word[future]
        try:
            word, translation = future.result()
            if translation:
                result[word] = translation

                # Merge new translations with existing ones
                existing_translations.update(result)

                with open('translated_words.json', 'w', encoding='utf-8') as f:
                    json.dump(existing_translations, f, ensure_ascii=False, indent=4)
        except Exception as exc:
            print(f'{word} generated an exception: {exc}')
