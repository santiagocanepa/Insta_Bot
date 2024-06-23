import pandas as pd

# Leer el archivo CSV reformateado
df = pd.read_csv('nombres_reformateados.csv')

# Reemplazar las letras "M" por "F" en la columna "Genero"
df['Genero'] = df['Genero'].replace('M', 'F')

# Guardar el DataFrame resultante en un nuevo archivo CSV
df.to_csv('nombres_reformateados_actualizado.csv', index=False)

print("Géneros actualizados y archivo guardado como 'nombres_reformateados_actualizado.csv'")
