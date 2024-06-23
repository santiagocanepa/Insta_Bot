import pandas as pd
import re

# Supongamos que los datos están en un archivo CSV llamado 'nombres.csv'
# Lee el archivo CSV
df = pd.read_csv('nombres.csv', header=None)

# Define una función para eliminar números, guiones y barras de una cadena
def remove_unwanted_characters(text):
    text = re.sub(r'\d+', '', text)  # Elimina los números
    text = re.sub(r'[-/]', '', text)  # Elimina guiones y barras
    return text

# Aplica la función a cada celda del DataFrame
df_cleaned = df.applymap(remove_unwanted_characters)

# Guarda el DataFrame limpio en un nuevo archivo CSV
df_cleaned.to_csv('nombres_limpios.csv', index=False, header=False)

print("Caracteres no deseados eliminados y archivo guardado como 'nombres_limpios.csv'")
