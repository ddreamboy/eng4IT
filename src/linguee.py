from ollama_localhost.client import OllamaClient


client = OllamaClient()

prompt = """
        Generate a list of 100 English words 
        commonly used in the IT and Machine 
        Learning fields, along with their translations in Russian.
        """

response = client.generate(prompt, model='mistral')

print(response)