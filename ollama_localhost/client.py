import requests
import json

# Адрес компьютера-хоста в локальной сети
HOST_IP = '192.168.31.39'  # Замените на реальный IP-адрес хоста
PORT = 11434  # Стандартный порт Ollama

# URL для API Ollama
url = f'http://{HOST_IP}:{PORT}/api/generate'

# Заголовки запроса
headers = {
    'Content-Type': 'application/json'
}

# Данные запроса
data = {
    'model': 'llama2',  # Название модели
    'prompt': 'Привет, как дела?',  # Ваш запрос
    'stream': False
}

try:
    # Отправка POST-запроса к Ollama
    response = requests.post(url, headers=headers, data=json.dumps(data))

    # Проверка успешности запроса
    if response.status_code == 200:
        # Получение и вывод ответа
        result = response.json()
        print('Ответ от Ollama:')
        print(result['response'])
    else:
        print(f'Ошибка: {response.status_code}')
        print(response.text)

except requests.exceptions.RequestException as e:
    print(f'Ошибка при подключении: {e}')
