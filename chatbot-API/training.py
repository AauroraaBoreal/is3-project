import json
import random
import pickle
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import SGD
import nltk
from nltk.stem import SnowballStemmer
import re

# Descargar recursos necesarios de NLTK
nltk.download('punkt')

# Inicializar el stemmer para español
stemmer = SnowballStemmer('spanish')

def cargar_datos():
    with open('medicamentos.json', encoding='utf-8') as file:
        datos = json.load(file)
    return datos

def generar_patrones_y_respuestas(datos):  
    """
    Genera pares de patrones y respuestas basados en la estructura del nuevo JSON
    """
    patrones_respuestas = []
    
    # Procesar medicamentos
    for medicamento in datos['medicamentos']:
        # Información general del medicamento
        patrones_respuestas.extend([
            {
                "tag": f"info_{medicamento['nombre'].lower()}",
                "patterns": [
                    f"qué es {medicamento['nombre']}",
                    f"información sobre {medicamento['nombre']}",
                    f"háblame de {medicamento['nombre']}",
                    f"describe {medicamento['nombre']}"
                ],
                "responses": [medicamento['descripcion']]
            },
            {
                "tag": f"usos_{medicamento['nombre'].lower()}",
                "patterns": [
                    f"para qué sirve {medicamento['nombre']}",
                    f"usos de {medicamento['nombre']}",
                    f"cuándo se usa {medicamento['nombre']}"
                ],
                "responses": [", ".join(medicamento['usos'])]
            },
            {
                "tag": f"dosis_{medicamento['nombre'].lower()}",
                "patterns": [
                    f"dosis de {medicamento['nombre']}",
                    f"cuánto {medicamento['nombre']} debo tomar",
                    f"cómo tomar {medicamento['nombre']}"
                ],
                "responses": [medicamento['dosisComun']]
            }
        ])
        
        # Efectos secundarios
        efectos = (medicamento['efectosSecundarios']['comunes'] + 
                  medicamento['efectosSecundarios']['graves'])
        patrones_respuestas.append({
            "tag": f"efectos_{medicamento['nombre'].lower()}",
            "patterns": [
                f"efectos secundarios de {medicamento['nombre']}",
                f"efectos adversos de {medicamento['nombre']}",
                f"qué efectos tiene {medicamento['nombre']}"
            ],
            "responses": ["Los efectos secundarios pueden incluir: " + 
                         ", ".join(efectos)]
        })

    # Procesar respuestas generales
    for tipo, respuestas in datos['respuestasGenerales'].items():
        patrones = {
            "saludos": ["hola", "buenos días", "buenas tardes", "hey"],
            "despedidas": ["adiós", "chao", "hasta luego", "bye"],
            "noEntiendo": ["no entiendo", "no comprendo", "qué?"],
            "advertencias": ["es seguro?", "puedo confiar?", "es confiable?"]
        }
        
        patrones_respuestas.append({
            "tag": tipo,
            "patterns": patrones.get(tipo, []),
            "responses": respuestas
        })

    return patrones_respuestas

def preprocesar_texto(texto):
    """Preprocesa el texto tokenizándolo y aplicando stemming"""
    tokens = nltk.word_tokenize(texto.lower())
    return [stemmer.stem(palabra) for palabra in tokens]

def crear_datos_entrenamiento(patrones_respuestas):
    palabras = []
    clases = []
    documentos = []
    
    # Procesar todos los patrones
    for item in patrones_respuestas:
        tag = item['tag']
        for patron in item['patterns']:
            tokens = preprocesar_texto(patron)
            palabras.extend(tokens)
            documentos.append((tokens, tag))
            if tag not in clases:
                clases.append(tag)

    # Eliminar duplicados y ordenar
    palabras = sorted(list(set(palabras)))
    clases = sorted(list(set(clases)))

    # Crear datos de entrenamiento
    training = []
    output_empty = [0] * len(clases)

    for doc in documentos:
        bag = []
        patron_palabras = doc[0]
        
        # Crear bag of words
        for palabra in palabras:
            bag.append(1) if palabra in patron_palabras else bag.append(0)

        output_row = list(output_empty)
        output_row[clases.index(doc[1])] = 1
        training.append([bag, output_row])

    random.shuffle(training)
    training = np.array(training, dtype=object)

    train_x = list(training[:, 0])
    train_y = list(training[:, 1])

    return np.array(train_x), np.array(train_y), palabras, clases

def crear_modelo(input_shape, output_shape):
    model = Sequential([
        Dense(128, input_shape=(input_shape,), activation='relu'),
        Dropout(0.5),
        Dense(64, activation='relu'),
        Dropout(0.5),
        Dense(output_shape, activation='softmax')
    ])
    
    sgd = SGD(learning_rate=0.01, momentum=0.9, nesterov=True)
    model.compile(loss='categorical_crossentropy', optimizer=sgd, metrics=['accuracy'])
    
    return model

def main():
    # Cargar y procesar datos
    datos = cargar_datos()
    patrones_respuestas = generar_patrones_y_respuestas(datos)
    
    # Crear datos de entrenamiento
    train_x, train_y, palabras, clases = crear_datos_entrenamiento(patrones_respuestas)
    
    # Crear y entrenar modelo
    model = crear_modelo(len(train_x[0]), len(train_y[0]))
    hist = model.fit(train_x, train_y, epochs=200, batch_size=5, verbose=1)
    
    # Guardar el modelo y los datos necesarios
    model.save('modelo_chatbot.h5')
    
    # Guardar palabras y clases para el procesamiento posterior
    pickle.dump(palabras, open('palabras.pkl', 'wb'))
    pickle.dump(clases, open('clases.pkl', 'wb'))
    
    # Guardar los patrones y respuestas procesados
    pickle.dump(patrones_respuestas, open('patrones_respuestas.pkl', 'wb'))

if __name__ == '__main__':
    main()