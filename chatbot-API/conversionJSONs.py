import nltk


import requests
from bs4 import BeautifulSoup
import json
import spacy
from collections import defaultdict

# Descargar los recursos necesarios de NLTK 
# nltk.download('punkt') # Para la tokenización
nltk.download('punkt_tab')

# Cargamos el modelo en español de spaCy
nlp = spacy.load("es_core_news_sm")

# Ingresamos la URL 
url = 'https://espanol.cdc.gov/flu/treatment/index.html'

# Hacemos la solicitud GET para obtener el contenido HTML
respuesta = requests.get(url)
contenidoHTML = respuesta.text

# Parseamos el contenido HTML con BeautifulSoup
soup = BeautifulSoup(contenidoHTML, 'html.parser')

# Extraemos el texto relevante (títulos y párrafos)
elementos = soup.find_all(['h1', 'h2', 'h3', 'p'])

# Extrae el texto de cada elemento
texto = [elemento.get_text(strip=True) for elemento in elementos]

# Unir el texto extraído en un solo string
textoCompleto = " ".join(texto)



# Tokenización del texto usando NLTK y spaCy
tokensNltk = nltk.word_tokenize(textoCompleto)
doc_spacy = nlp(textoCompleto)

# Filtrar tokens relevantes (eliminamos palabras cortas)
filtered_tokens = [token for token in tokensNltk if len(token) > 2]

# Crear un diccionario para almacenar patrones y respuestas por categoría
patternsDictados = defaultdict(list)
respuestasDictadas = defaultdict(list)

# Analizar el texto para generar patrones y respuestas
for token in filtered_tokens:
    if token.lower() in ['antiviral', 'medicamento', 'gripe', 'influenza']:
        patternsDictados['medicamento'].append(f"¿Qué es {token}?")
        respuestasDictadas['medicamento'].append(f"{token.capitalize()} es un medicamento utilizado para tratar la influenza.")
        
    if token.lower() in ['síntoma', 'fiebre', 'tos']:
        patternsDictados['síntomas'].append(f"¿Cuáles son los síntomas de {token}?")
        respuestasDictadas['síntomas'].append(f"Los síntomas incluyen fiebre y tos.")

# Crear la estructura JSON deseada con múltiples categorías
datosDictados = {
    "interaccionesMedicamentos": []
}

for category in patternsDictados.keys():
    datosDictados["interaccionesMedicamentos"].append({
        "tag": category,
        "patterns": list(set(patternsDictados[category])),  # Eliminar duplicados
        "responses": list(set(respuestasDictadas[category]))  # Eliminar duplicados
    })

datosDictados["textoCompleto"] = textoCompleto
datosDictados["tokens"] = tokensNltk

# Convertir el diccionario a formato JSON
dataJson = json.dumps(datosDictados, ensure_ascii=False, indent=4)

# Guardar el JSON en un archivo
with open('dataInfluenza.json', 'w', encoding='utf-8') as archivoJson:
    archivoJson.write(dataJson)

print("Datos extraídos y guardados en 'dataInfluenza.json'")

