import pandas as pd

def transformar_genero(input_csv, output_csv):
    # Leer el archivo CSV
    df = pd.read_csv('nombres_final_embeddings.csv')
    
    # Verificar que las columnas necesarias existen
    if 'Genero' not in df.columns:
        raise ValueError("La columna 'Genero' no existe en el archivo CSV")

    # Reemplazar valores en la columna "Genero"
    df['Genero'] = df['Genero'].map({'M': 0, 'F': 1})
    
    # Guardar el archivo CSV modificado
    df.to_csv(output_csv, index=False)

# Llamar a la función con los nombres de archivo de entrada y salida
input_csv = 'tu_archivo.csv'
output_csv = 'tu_archivo_modificado.csv'
transformar_genero(input_csv, output_csv)
