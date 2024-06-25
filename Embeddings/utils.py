import openai
import pandas as pd
import numpy as np
import ast
import os
from dotenv import load_dotenv
import joblib

# Cargar las variables de entorno
load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')
openai.api_key = openai_api_key

# Cargar los modelos entrenados
model_gender_path = './modelGenderPredict.pkl'
model_human_path = './modelHumanPredict.pkl'
clf_gender = joblib.load(model_gender_path)
clf_human = joblib.load(model_human_path)

# Función para obtener embeddings en lotes
def create_embeddings_batch(texts):
    cleaned_texts = [text.strip()[:2048] for text in texts if text]
    if not cleaned_texts:
        return []
    response = openai.Embedding.create(
        input=cleaned_texts,
        model="text-embedding-ada-002"
    )
    return [np.array(item['embedding']) for item in response['data']]

# Función para predecir si el nombre de usuario pertenece a un humano
def predecir_humano(nombre_usuario):
    embedding = create_embeddings_batch([nombre_usuario])[0]
    prediction = clf_human.predict([embedding])[0]
    return int(prediction)  # Asegurarse de que el resultado sea un tipo básico

# Función para predecir el género de un nombre de usuario
def predecir_genero(nombre_usuario):
    embedding = create_embeddings_batch([nombre_usuario])[0]
    prediction = clf_gender.predict([embedding])[0]
    return int(prediction)  # Asegurarse de que el resultado sea un tipo básico

# Función principal para predecir humano y luego género si es necesario
def predecir_humano_o_genero(nombre_usuario):
    humano_prediction = predecir_humano(nombre_usuario)
    if humano_prediction == 1:
        return 3
    else:
        return predecir_genero(nombre_usuario)

