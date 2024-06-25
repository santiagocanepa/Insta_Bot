import pandas as pd

# Leer el archivo de texto
with open('sustantivos.txt', 'r') as file:
    palabras = file.read()

# Separar las palabras por comas y convertir a minúsculas
palabras_lista = [palabra.strip().lower() for palabra in palabras.split(',')]

# Eliminar duplicados
palabras_unicas = list(set(palabras_lista))

# Crear el DataFrame
df = pd.DataFrame(palabras_unicas, columns=['Nombre'])
df['Genero'] = 3
df['Human'] = 1

# Guardar el DataFrame en un archivo CSV
df.to_csv('sustantivos.csv', index=False)

