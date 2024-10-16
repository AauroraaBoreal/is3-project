from flask import Flask, request, jsonify, Response, render_template, redirect
from flask_cors import CORS
import torch
import random
import json
import sys
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize
import csv
from datetime import datetime

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
    """if request.method == 'GET':
        return jsonify({"message": "Use POST method to interact with the chatbot."})

    # Log the incoming request
    app.logger.info('Received message: %s', request.data) """

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

# Crear la ruta para el formulario de registro de usuario
@app.route('/')
def registro():
    return render_template('registroUsuarios.html')

"""
# Ruta para procesar el formulario de registro
@app.route('/registrar', methods=['POST'])
def registrar():
    nombre = request.form['name']
    correo = request.form['email']
    contraseña = request.form['password']
    # Aquí puedes agregar lógica para guardar los datos en una base de datos o archivo
    print(f"Usuario registrado: {nombre}, {correo}")
    return redirect('/')

"""

#################################
@app.route('/')
def index():
    return render_template('registroUsuarios.html')  # Renderiza el archivo HTML desde la carpeta templates


def validar_datos(datos):
    errores = []
    if not datos.get('nombres'):
        errores.append("El campo 'nombres' es requerido.")
    if not datos.get('email') or '@' not in datos['email']:
        errores.append("El correo electrónico es inválido.")
    if not datos.get('fechaNacimiento'):
        errores.append("La fecha de nacimiento es requerida.")
    if not datos.get('sexo'):
        errores.append("El campo 'sexo' es requerido.")
    if not datos.get('aceptarTerminos'):
        errores.append("Debe aceptar los términos y condiciones.")
    if not datos.get('tratamientoDatos'):
        errores.append("Debe autorizar el tratamiento de datos personales.")
    
    return errores

def guardar_datos_csv(datos):
    try:
        with open('usuarios_registrados.csv', mode='a', newline='') as archivo_csv:
            campo_nombres = ['nombres', 'email', 'password', 'fechaNacimiento', 'sexo', 
                            'aceptarTerminos', 'tratamientoDatos', 'compartirDatos']
            writer = csv.DictWriter(archivo_csv, fieldnames=campo_nombres)
            
            # Si el archivo está vacío, escribe los encabezados
            if archivo_csv.tell() == 0:
                writer.writeheader()
            
            writer.writerow(datos)
    except Exception as e:
        return f"Error al guardar los datos: {str(e)}"

@app.route('/guardar_datos', methods=['POST'])
def guardar_datos():
    datos = request.form.to_dict()
    errores = validar_datos(datos)

    if errores:
        return jsonify({"errores": errores}), 400

    error_guardado = guardar_datos_csv(datos)
    if error_guardado:
        return jsonify({"error": error_guardado}), 500  # 500 Internal Server Error

    return jsonify({"mensaje": "Registro exitoso."}), 200


if __name__ == "__main__":
    # Correr la aplicación Flask
    app.run(debug=True)
