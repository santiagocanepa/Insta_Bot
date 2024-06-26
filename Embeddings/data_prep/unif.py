import pandas as pd

# Cargar los archivos CSV
df1 = pd.read_csv('/home/santiago/Bots/Insta/Insta_Bot/Embeddings/NombresEmbeddingGenerosyHuman.csv')
df2 = pd.read_csv('/home/santiago/Bots/Insta/Insta_Bot/Embeddings/data_prep/.CSV/SustantivosConEmbeddings.csv')

# Unificar los dos DataFrames
df_unificado = pd.concat([df1, df2], ignore_index=True)

# Imprimir las longitudes de los valores de la columna 'embedding'
df_unificado['embedding_length'] = df_unificado['embedding'].apply(len)
print(df_unificado['embedding_length'])

# Mostrar cómo quedaron las columnas
print(df_unificado.columns)

# Guardar el archivo CSV unificado
df_unificado.to_csv('CompletoConEmbedding(Human).csv', index=False)

print("Archivo CSV unificado y guardado exitosamente.")
