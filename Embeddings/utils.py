import openai
import pandas as pd
import numpy as np
import ast
import os
from dotenv import load_dotenv
import joblib
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Cargar las variables de entorno
load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')
openai.api_key = openai_api_key

# Cargar los modelos entrenados
model_gender_path = './Models/modelGenerosPredict.pkl'
model_words_path = './Models/modelWordsPredict.pkl'
clf_gender = joblib.load(model_gender_path)
clf_words = joblib.load(model_words_path)

# Cargar el label encoder
label_encoder_path = './Models/label_encoderWords.pkl'
label_encoder = joblib.load(label_encoder_path)

# Función para obtener embeddings en lotes
def create_embeddings_batch(texts):
    # Convertir todos los textos a minúsculas
    cleaned_texts = [text.lower().strip()[:2048] for text in texts if len(text) >= 3]
    if not cleaned_texts:
        return []
    response = openai.Embedding.create(
        input=cleaned_texts,
        model="text-embedding-ada-002"
    )
    embeddings = [np.array(item['embedding']) for item in response['data']]
    
    # Verificar que todos los embeddings tienen la longitud correcta
    for text, embedding in zip(cleaned_texts, embeddings):
        if len(embedding) != 1536:
            logger.error(f"Embedding de longitud incorrecta: {len(embedding)} para el texto: {text}")
            raise ValueError(f"Embedding de longitud incorrecta: {len(embedding)}")
    return embeddings

# Función para predecir el tipo de palabra
def predecir_tipo_palabra(palabras):
    embeddings = create_embeddings_batch(palabras)
    if not embeddings or any(len(embedding) != 1536 for embedding in embeddings):
        raise ValueError("Embeddings no válidos recibidos.")
    predicciones = clf_words.predict(embeddings)
    predicciones_labels = label_encoder.inverse_transform(predicciones)
    logger.debug(f"Palabras: {palabras}, Predicciones: {predicciones_labels}")
    return predicciones_labels

# Función para predecir el género basado en nombres
def predecir_genero(nombres):
    embeddings = create_embeddings_batch(nombres)
    if not embeddings or any(len(embedding) != 1536 for embedding in embeddings):
        raise ValueError("Embeddings no válidos recibidos.")
    if len(embeddings) == 1:
        prediction = clf_gender.predict([embeddings[0]])[0]
    else:
        predictions = clf_gender.predict(embeddings)
        confidences = clf_gender.predict_proba(embeddings)
        # En caso de empate, usar la predicción con mayor confianza
        if predictions[0] == predictions[1]:
            prediction = predictions[0]
        else:
            if confidences[0][predictions[0]] >= confidences[1][predictions[1]]:
                prediction = predictions[0]
            else:
                prediction = predictions[1]
    return int(prediction)  # Asegurarse de que el resultado sea un tipo básico

# Función principal para predecir si las palabras son comunes o propias y luego el género si es necesario
def predecir_humano_o_genero(frase):
    # Convertir la frase a minúsculas
    palabras = frase.lower().split()
    predicciones = predecir_tipo_palabra(palabras)

    # Si alguna palabra es 'Comun', retornar '3'
    if 'Comun' in predicciones:
        return '3'

    # Filtrar nombres para el modelo de género
    nombres = [palabra for palabra, tipo in zip(palabras, predicciones) if tipo == 'Nombre']

    # Si no se encontraron nombres etiquetados, usar todas las palabras
    if not nombres:
        nombres = palabras

    logger.debug(f"Nombres para predecir género: {nombres}")

    # Predecir el género basado en los nombres
    return predecir_genero(nombres)

# Ejemplo de uso
nombre_usuario = "Juan Perez"
try:
    resultado = predecir_humano_o_genero(nombre_usuario)
    print(f"Resultado: {resultado}, Tipo: {type(resultado)}")
except ValueError as e:
    logger.error(f"Error processing request: {e}")
