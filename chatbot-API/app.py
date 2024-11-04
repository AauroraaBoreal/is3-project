from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import json
import sys
import subprocess  # Para ejecutar scripts externos
# from model import NeuralNet
from nltk_utils import bag_of_words, tokenize
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from keras.models import load_model
import unidecode
import re

sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app, resources={r"/chatbot": {"origins": "http://localhost:3000"}})  # Para manejar solicitudes de dominios cruzados

class MedicamentosChatbot:

    def __init__(self):
        self.intents = json.loads(open('intents_converted.json').read())
        self.medicamentos = json.loads(open('medicamentos.json').read())
        self.words = pickle.load(open('words.pkl', 'rb'))
        self.classes = pickle.load(open('classes.pkl', 'rb'))
        self.model = load_model('chatbot_model.h5')
        self.context = {}
        self.last_medicine = None

    def normalize_text(self, text):
        """Normaliza el texto removiendo acentos y convirtiendo a minúsculas"""
        text = unidecode.unidecode(text.lower())
        text = re.sub(r'[^\w\s]', '', text)
        return text.strip()

    def extract_medicine_name(self, text):
        """Extrae el nombre del medicamento del texto de la pregunta"""
        for med in self.medicamentos['medicamentos']:
            if med['nombre'].lower() in text.lower():
                return med['nombre'].lower()
        return None

    def get_medicine_info(self, medicine_name, info_type):
        """Obtiene información específica de un medicamento"""
        for med in self.medicamentos['medicamentos']:
            if med['nombre'].lower() == medicine_name.lower():
                # Manejar FAQs
                if info_type == 'faq':
                    faqs = med.get('faq', [])
                    if faqs:
                        response = "Preguntas frecuentes sobre " + med['nombre'] + ":\n\n"
                        for faq in faqs:
                            response += f"P: {faq['pregunta']}\nR: {faq['respuesta']}\n\n"
                        return response
                    return None

                # Manejar efectos secundarios
                if info_type == 'efectos':
                    efectos = med.get('efectosSecundarios')
                    if efectos:
                        response = "Efectos secundarios de " + med['nombre'] + ":\n\n"
                        response += "Comunes:\n- " + "\n- ".join(efectos['comunes'])
                        response += "\n\nGraves:\n- " + "\n- ".join(efectos['graves'])
                        return response
                    return None

                # Manejar interacciones
                if info_type == 'interacciones':
                    interacciones = med.get('interacciones')
                    if interacciones:
                        return "Interacciones de " + med['nombre'] + ":\n- " + "\n- ".join(interacciones)
                    return None

                # Manejar otros campos directos
                if info_type in med:
                    if isinstance(med[info_type], list):
                        return "\n- " + "\n- ".join(med[info_type])
                    return med[info_type]

        return None

    def get_general_response(self, response_type):
        """Obtiene una respuesta general del conjunto de respuestas"""
        if response_type in self.medicamentos.get('respuestasGenerales', {}):
            return random.choice(self.medicamentos['respuestasGenerales'][response_type])
        return None

    def get_response(self, message):
            """Procesa el mensaje del usuario y genera una respuesta apropiada"""
            normalized_message = self.normalize_text(message)

            # Manejo de saludos
            if any(saludo in normalized_message for saludo in ['hola', 'buenos dias', 'buenas tardes', 'buenas noches']):
                return self.get_general_response('saludos')

            # Manejo de despedidas
            if any(despedida in normalized_message for despedida in ['adios', 'hasta luego', 'chao', 'bye']):
                return self.get_general_response('despedidas')

            # Extracción del nombre del medicamento
            medicine_name = self.extract_medicine_name(message)
            if medicine_name:
                self.last_medicine = medicine_name
                
                # Identificar el tipo de información solicitada
                if any(word in normalized_message for word in ['efecto', 'efectos', 'secundario', 'secundarios']):
                    response = self.get_medicine_info(medicine_name, 'efectos')
                elif any(word in normalized_message for word in ['uso', 'usar', 'sirve', 'usos']):
                    response = self.get_medicine_info(medicine_name, 'usos')
                elif any(word in normalized_message for word in ['dosis', 'tomar', 'cantidad']):
                    response = self.get_medicine_info(medicine_name, 'dosisComun')
                elif any(word in normalized_message for word in ['que es', 'describir', 'descripcion']):
                    response = self.get_medicine_info(medicine_name, 'descripcion')
                elif any(word in normalized_message for word in ['contraindicacion', 'contraindicaciones']):
                    response = self.get_medicine_info(medicine_name, 'contraindicaciones')
                elif any(word in normalized_message for word in ['recomendacion', 'recomendaciones']):
                    response = self.get_medicine_info(medicine_name, 'recomendaciones')
                elif any(word in normalized_message for word in ['interaccion', 'interacciones']):
                    response = self.get_medicine_info(medicine_name, 'interacciones')
                elif any(word in normalized_message for word in ['pregunta', 'preguntas', 'faq', 'faqs']):
                    response = self.get_medicine_info(medicine_name, 'faq')
                else:
                    # Si no se identifica el tipo de información, dar información general
                    response = self.get_medicine_info(medicine_name, 'descripcion')

                # Agregar advertencia aleatoriamente
                if response and random.random() < 0.3:  # 30% de probabilidad
                    response += "\n\n" + self.get_general_response('advertencias')
                
                return response or self.get_general_response('noEntiendo')

            # Si no se identifica el medicamento
            return self.get_general_response('noEntiendo')


# Crear el endpoint de la API
@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    chatbot = MedicamentosChatbot()
    data = request.get_json()
    user_message = data.get("inputCode")  # Cambia esto si el nombre del campo es diferente

    if user_message is None:
        return jsonify({"error": "No message provided."}), 400

    response = chatbot.get_response(user_message)

    return Response(json.dumps(response, ensure_ascii=False), content_type='application/json; charset=utf-8')

if __name__ == "__main__":
    app.run(debug=True)
