from flask import Flask, request, jsonify
import ollama

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    model = data.get('model', 'llama2')
    prompt = data.get('prompt', '')

    try:
        response = ollama.generate(model=model, prompt=prompt)
        return jsonify({'response': response['response']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
