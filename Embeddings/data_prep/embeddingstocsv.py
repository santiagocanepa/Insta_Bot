import openai
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv
from tqdm import tqdm

# Cargar las variables de entorno
load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')

# Configura tu clave de API de OpenAI
openai.api_key = openai_api_key

# Función para obtener embeddings en lotes
def create_embeddings_batch(texts):
    cleaned_texts = [text.strip()[:2048] for text in texts if text]
    if not cleaned_texts:
        return []
    response = openai.Embedding.create(
        input=cleaned_texts,
        model="text-embedding-ada-002"
    )
    return [item['embedding'] for item in response['data']]

# Leer el archivo CSV final
df_final = pd.read_csv('nombres_final.csv')

# Dividir el DataFrame en lotes para procesar en partes
batch_size = 100  # Ajusta el tamaño del lote según sea necesario
num_batches = len(df_final) // batch_size + 1

embeddings = []
for i in tqdm(range(num_batches), desc="Procesando lotes"):
    batch_texts = df_final['Nombre'][i * batch_size:(i + 1) * batch_size].tolist()
    batch_embeddings = create_embeddings_batch(batch_texts)
    embeddings.extend(batch_embeddings)

# Convertir embeddings a listas de texto para guardar en CSV
embeddings_text = [str(embed) for embed in embeddings]

# Añadir los embeddings al DataFrame
df_final['embedding'] = embeddings_text

# Guardar los embeddings en un archivo CSV
df_final.to_csv('nombres_final_embeddings.csv', index=False)

print("Embeddings generados y guardados en 'nombres_final_embeddings.csv'")
           