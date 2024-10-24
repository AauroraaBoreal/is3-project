from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import torch
import random
import json
import sys
import subprocess  # Para ejecutar scripts externos
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app, resources={r"/chatbot": {"origins": "http://localhost:3000"}})  # Para manejar solicitudes de dominios cruzados

# Ejecutar `conversionJSONs.py` antes de cargar los datos
subprocess.run(['python', 'conversionJSONs.py'])  # Ejecuta el script de conversión

# Cargar los datos y el modelo de PyTorch
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Cargar ambos JSONs
with open('intents.json', 'r', encoding='utf-8') as json_data:
    base_intents = json.load(json_data)

with open('dataInfluenza.json', 'r', encoding='utf-8') as json_data:
    influenza_intents = json.load(json_data)

# Combinar intents de ambos JSONs
combined_intents = {
    "intents": base_intents['intents'] + influenza_intents['interaccionesMedicamentos']
}

print("Loaded base intents:", len(base_intents['intents']))  # Depuración
print("Loaded influenza intents:", len(influenza_intents['interaccionesMedicamentos']))  # Depuración
print("Combined intents:", len(combined_intents['intents']))  # Depuración

# Verificar la estructura de intents
print("Sample intent from combined:", combined_intents['intents'][0])  # Depuración

FILE = "data.pth"
data = torch.load(FILE, weights_only=True)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

# Verificar los tags cargados
print("Loaded tags:", tags)  # Depuración

# Cargar el modelo de chatbot
model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

# def get_response(msg):
#     sentence = tokenize(msg)
#     X = bag_of_words(sentence, all_words)
#     X = X.reshape(1, X.shape[0])
#     X = torch.from_numpy(X).to(device)

#     output = model(X)
#     _, predicted = torch.max(output, dim=1)

#     tag = tags[predicted.item()]

#     probs = torch.softmax(output, dim=1)
#     prob = probs[0][predicted.item()]
#     if prob.item() > 0.75:
#         for intent in combined_intents['intents']:
#             if tag == intent["tag"]:
#                 return random.choice(intent['responses'])
    
#     return "Disculpa, no te entiendo..."

def get_response(msg):
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    
    # Agregar impresión de depuración
    print(f"Predicted tag: {tag}, Probability: {prob.item()}")  # Depuración

    if prob.item() > 0.6:  # Reduce el umbral para pruebas
        for intent in combined_intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    
    return "Disculpa, no te entiendo..."


# Crear el endpoint de la API
@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    data = request.get_json()
    user_message = data.get("inputCode")  # Cambia esto si el nombre del campo es diferente

    if user_message is None:
        return jsonify({"error": "No message provided."}), 400

    response = get_response(user_message)

    return Response(json.dumps(response, ensure_ascii=False), content_type='application/json; charset=utf-8')

if __name__ == "__main__":
    app.run(debug=True)
