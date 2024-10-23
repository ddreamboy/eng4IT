import requests
import json


class OllamaClient:
    def __init__(self, host='192.168.31.39', port=5000):
        self.base_url = f'http://{host}:{port}'
        self.headers = {'Content-Type': 'application/json'}

    def generate(self, prompt, model='llama3.2'):
        url = f'{self.base_url}/generate'
        data = {
            'model': model,
            'prompt': prompt,
            'top_p': 0.9,
            'temperature': 0.1,
        }

        try:
            response = requests.post(url, headers=self.headers, data=json.dumps(data))
            response.raise_for_status()  # Вызовет исключение для неудачных статус-кодов
            return response.json()['response']
        except requests.exceptions.RequestException as e:
            print(f'Ошибка при подключении: {e}')
            return None


# Пример использования
if __name__ == '__main__':
    client = OllamaClient()
    response = client.generate('Hello', model="llama3.2")
    if response:
        print('Ответ от Ollama:')
        print(response)
