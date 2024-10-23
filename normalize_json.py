import json

# Чтение исходного файла
with open('translated_words.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Сохранение в новый файл с читаемыми символами
with open('translated_words.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print("Файл успешно сохранен как 'translated_words_readable.json'")