import requests
import json

HOST_IP = '192.168.31.39'  # IP-адрес хост-компьютера
PORT = 5000  # Порт Flask-сервера

url = f'http://{HOST_IP}:{PORT}/generate'

headers = {
    'Content-Type': 'application/json'
}

data = {
    'model': 'llama2',
    'prompt': 'Привет, как дела?'
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        result = response.json()
        print('Ответ от Ollama:')
        print(result['response'])
    else:
        print(f'Ошибка: {response.status_code}')
        print(response.text)

except requests.exceptions.RequestException as e:
    print(f'Ошибка при подключении: {e}')
