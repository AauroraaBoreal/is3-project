import easyocr # Reconocimiento optico de caracteres
import re
import json # Manejar archivos y datos en formato JSON
from datetime import datetime

def procesar_imagen_a_texto_easyocr(ruta_imagen):
    """
    Función para extraer texto de una imagen usando EasyOCR.
    """
    reader = easyocr.Reader(['es'])
    resultado = reader.readtext(ruta_imagen, detail=0)
    texto_extraido = " ".join(resultado)
    return texto_extraido

def cargar_medicamentos_json(ruta_json):
    """
    Carga un archivo JSON con información de medicamentos.
    """
    with open(ruta_json, 'r', encoding='utf-8') as f:
        return json.load(f)

def extraer_informacion_receta(texto, medicamentos_json):
    """
    Extrae información relevante (fecha, condición, edad, sexo y medicamentos) de un texto usando expresiones regulares.
    """
    texto_limpio = re.sub(r'[^a-zA-Z0-9áéíóúüÁÉÍÓÚÜ\s.,;:á]', '', texto)
    # Limpia el texto eliminando caracteres no deseados como simbolos extraños.
    
    # Variables inicializadas con valores predeterminados.
    fecha = "No identificado"  # Valor predeterminado para la fecha.
    condicion = "No identificado"  # Valor predeterminado para la condicion medica.
    edad = "No identificado"  # Valor predeterminado para la edad.
    sexo = "No identificado"  # Valor predeterminado para el sexo.
    medicamentos_extraidos = []  # Lista vacia para almacenar medicamentos encontrados.


    try:
        fecha_match = re.search(r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})', texto_limpio)
        if fecha_match:
            fecha = fecha_match.group(0) # Extrae la coincidencia encontrada.
            # Convierte la fecha a un objeto de tipo 'date'.
            fecha = datetime.strptime(fecha, "%d/%m/%Y").date() if '/' in fecha else datetime.strptime(fecha, "%d-%m-%Y").date()

        # Busca una condicion medica, por ejemplo, "condicion: diabetes".
        condicion_match = re.search(r'condición\s*[:\-]?\s*(\w+)', texto_limpio, re.IGNORECASE)
        if condicion_match:
            condicion = condicion_match.group(1)

        # Busca la edad en el texto, por ejemplo, "edad: 30".
        edad_match = re.search(r'edad\s*[:\-]?\s*(\d+)', texto_limpio, re.IGNORECASE)
        if edad_match:
            edad = edad_match.group(1)  # Extrae el # encontrado.

        # Busca el sexo en el texto, por ejemplo, "sexo: masculino".
        sexo_match = re.search(r'sexo\s*[:\-]?\s*(masculino|femenino)', texto_limpio, re.IGNORECASE)
        if sexo_match:
            sexo = sexo_match.group(1)  # Extrae el valor (masculino o femenino).


        # Divide el texto limpio en lineas usando puntos y punto y coma como separadores.
        posibles_lineas = re.split(r'[.;]', texto_limpio)
        for linea in posibles_lineas:
            # Busca un patron de medicamentos en las líneas, por ejemplo, "Paracetamol Tomar".
            patron_medicamento = r"([A-Za-z]+)\s+(Tomar|Indicado para)"
            resultado = re.search(patron_medicamento, linea)
            if resultado:
                medicamento = resultado.group(1)  # Extrae el nombre del medicamento.
                # Verifica si el medicamento está en el archivo JSON de medicamentos.
                if medicamento.lower() in [med['nombre'].lower() for med in medicamentos_json["medicamentos"]]:
                    # Si el medicamento es valido, lo añade a la lista con una dosis generica.
                    medicamentos_extraidos.append({"medicamento": medicamento, "dosis": "Detalles no disponibles"})

    except Exception as e:
        print("Error en la extracción de información:", e)  # Muestra un mensaje si ocurre un error.

    # Retorna los datos 
    return fecha, condicion, edad, sexo, medicamentos_extraidos