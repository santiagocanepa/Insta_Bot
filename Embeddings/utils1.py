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

model_path = './modelo_clasificacion_optimizados.pkl'
clf = joblib.load(model_path)

def create_embeddings_batch(texts):
    cleaned_texts = [text.strip()[:2048] for text in texts if text]
    if not cleaned_texts:
        return []
    response = openai.Embedding.create(
        input=cleaned_texts,
        model="text-embedding-ada-002"
    )
    return [np.array(item['embedding']) for item in response['data']]

def predecir_genero(nombre_usuario):
    embedding = create_embeddings_batch([nombre_usuario])[0]
    prediction = clf.predict([embedding])[0]
    return int(prediction)  # Asegurarse de que el resultado sea un tipo básico
