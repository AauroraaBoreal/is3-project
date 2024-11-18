import easyocr
import re
import json
from datetime import datetime

def procesar_imagen_a_texto_easyocr(ruta_imagen):
    reader = easyocr.Reader(['es'])
    resultado = reader.readtext(ruta_imagen, detail=0)
    texto_extraido = " ".join(resultado)
    return texto_extraido

def cargar_medicamentos_json(ruta_json):
    with open(ruta_json, 'r', encoding='utf-8') as f:
        return json.load(f)

def extraer_informacion_receta(texto, medicamentos_json):
    texto_limpio = re.sub(r'[^a-zA-Z0-9áéíóúüÁÉÍÓÚÜ\s.,;:á]', '', texto)
    
    fecha = "No identificado"
    condicion = "No identificado"
    edad = "No identificado"
    sexo = "No identificado"
    medicamentos_extraidos = []

    try:
        fecha_match = re.search(r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})', texto_limpio)
        if fecha_match:
            fecha = fecha_match.group(0)
            fecha = datetime.strptime(fecha, "%d/%m/%Y").date() if '/' in fecha else datetime.strptime(fecha, "%d-%m-%Y").date()

        condicion_match = re.search(r'condición\s*[:\-]?\s*(\w+)', texto_limpio, re.IGNORECASE)
        if condicion_match:
            condicion = condicion_match.group(1)

        edad_match = re.search(r'edad\s*[:\-]?\s*(\d+)', texto_limpio, re.IGNORECASE)
        if edad_match:
            edad = edad_match.group(1)

        sexo_match = re.search(r'sexo\s*[:\-]?\s*(masculino|femenino)', texto_limpio, re.IGNORECASE)
        if sexo_match:
            sexo = sexo_match.group(1)

        posibles_lineas = re.split(r'[.;]', texto_limpio)
        for linea in posibles_lineas:
            patron_medicamento = r"([A-Za-z]+)\s+(Tomar|Indicado para)"
            resultado = re.search(patron_medicamento, linea)
            if resultado:
                medicamento = resultado.group(1)
                if medicamento.lower() in [med['nombre'].lower() for med in medicamentos_json["medicamentos"]]:
                    medicamentos_extraidos.append({"medicamento": medicamento, "dosis": "Detalles no disponibles"})

    except Exception as e:
        print("Error en la extracción de información:", e)

    return fecha, condicion, edad, sexo, medicamentos_extraidos