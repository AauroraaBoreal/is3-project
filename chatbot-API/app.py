from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import json
import sys
import numpy as np
from tensorflow.keras.models import load_model
import unidecode
import re
import pickle
import nltk
from nltk.stem import SnowballStemmer

sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app, resources={r"/chatbot": {"origins": "http://localhost:3000"}})

class MedicamentosChatbot:
    def __init__(self):
        # Cargar recursos
        self.intents = pickle.load(open('patrones_respuestas.pkl', 'rb'))
        self.medicamentos = json.loads(open('medicamentos.json', encoding='utf-8').read())
        self.words = pickle.load(open('palabras.pkl', 'rb'))
        self.classes = pickle.load(open('clases.pkl', 'rb'))
        self.model = load_model('modelo_chatbot.h5')
        self.stemmer = SnowballStemmer('spanish')
        self.context = {}
        self.last_medicine = None

    def normalize_text(self, text):
        """Normaliza el texto removiendo acentos y convirtiendo a minúsculas"""
        text = unidecode.unidecode(text.lower())
        text = re.sub(r'[^\w\s]', '', text)
        return text.strip()

    def bag_of_words(self, message):
        """Crea un bag of words a partir del mensaje"""
        sentence_words = [self.stemmer.stem(word) for word in nltk.word_tokenize(message)]
        bag = [0] * len(self.words)
        for s in sentence_words:
            for i, w in enumerate(self.words):
                if w == s: 
                    bag[i] = 1
        return np.array(bag)

    def predict_class(self, message):
        """Predice la clase del mensaje usando el modelo neuronal"""
        p = self.bag_of_words(self.normalize_text(message))
        res = self.model.predict(np.array([p]))[0]
        ERROR_THRESHOLD = 0.25
        results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
        results.sort(key=lambda x: x[1], reverse=True)
        return_list = []
        for r in results:
            return_list.append({
                "intent": self.classes[r[0]],
                "probability": str(r[1])
            })
        return return_list

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
                if info_type == 'faq':
                    faqs = med.get('faq', [])
                    if faqs:
                        response = f"Preguntas frecuentes sobre {med['nombre']}:\n\n"
                        for faq in faqs:
                            response += f"P: {faq['pregunta']}\nR: {faq['respuesta']}\n\n"
                        return response
                    return None

                if info_type == 'efectos':
                    efectos = med.get('efectosSecundarios')
                    if efectos:
                        response = f"Efectos secundarios de {med['nombre']}:\n\n"
                        response += "Comunes:\n- " + "\n- ".join(efectos['comunes'])
                        response += "\n\nGraves:\n- " + "\n- ".join(efectos['graves'])
                        return response
                    return None

                if info_type == 'interacciones':
                    interacciones = med.get('interacciones')
                    if interacciones:
                        return f"Interacciones de {med['nombre']}:\n- " + "\n- ".join(interacciones)
                    return None

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
        # Primero intentamos predecir la intención usando el modelo
        intents = self.predict_class(message)
        
        if not intents:
            return self.get_general_response('noEntiendo')

        # Extraer el tag de la intención principal
        intent_tag = intents[0]['intent']

        # Manejar intenciones generales
        if intent_tag in ['saludos', 'despedidas']:
            return self.get_general_response(intent_tag)

        # Extraer información del medicamento y tipo de consulta del tag
        if '_' in intent_tag:
            info_type, medicine = intent_tag.split('_', 1)
            
            # Si encontramos un medicamento específico
            if medicine:
                self.last_medicine = medicine
                
                # Mapear tipos de información
                info_mapping = {
                    'info': 'descripcion',
                    'usos': 'usos',
                    'dosis': 'dosisComun',
                    'efectos': 'efectos'
                }
                
                response = self.get_medicine_info(medicine, info_mapping.get(info_type, 'descripcion'))
                
                # Agregar advertencia aleatoriamente
                if response and random.random() < 0.3:
                    response += "\n\n" + self.get_general_response('advertencias')
                
                return response or self.get_general_response('noEntiendo')

        # Si no se pudo identificar la intención específica
        return self.get_general_response('noEntiendo')

@app.route('/')
def home():
    return "Welcome to the API!"

@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    chatbot = MedicamentosChatbot()
    data = request.get_json()
    print(data)

    user_message = data.get("inputCode")
    if user_message is None:
        return jsonify({"error": "No message provided."}), 400

    response = chatbot.get_response(user_message)
    return Response(json.dumps(response, ensure_ascii=False), content_type='application/json; charset=utf-8')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)