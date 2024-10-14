from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import torch
import random
import json
import sys
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app , resources={r"/chatbot": {"origins": "http://localhost:3000"}})  # Para manejar solicitudes de dominios cruzados

# Cargar los datos y el modelo de PyTorch
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r', encoding='utf-8') as json_data:
    intents = json.load(json_data)

FILE = "data.pth"
data = torch.load(FILE, weights_only=True)


input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

# Cargar el modelo de chatbot
model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

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
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    
    return "Disculpa, no te entiendo..."

# Crear el endpoint de la API
@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    
    # Receive the JSON request and extract inputCode
    data = request.get_json()
    user_message = data.get("inputCode")  # Change this to match the incoming key

    # Check if user_message is None
    if user_message is None:
        return jsonify({"error": "No message provided."}), 400

    # Obtain the chatbot response
    response = get_response(user_message)

    # Return the response in JSON format
    return Response(json.dumps(response, ensure_ascii=False), content_type='application/json; charset=utf-8')
if __name__ == "__main__":
    # Correr la aplicación Flask
    app.run(debug=True)
