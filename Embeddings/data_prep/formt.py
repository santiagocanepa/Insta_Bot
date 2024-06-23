import pandas as pd

# Leer el archivo CSV original
with open('nombres_limpios.csv', 'r') as file:
    data = file.read()

# Separar los nombres y crear un DataFrame
nombres = data.split()
df = pd.DataFrame(nombres, columns=['Nombre'])
df['Genero'] = 'M'

# Guardar el nuevo DataFrame en un archivo CSV
df.to_csv('nombres_reformateados.csv', index=False)

print("Archivo reformateado guardado como 'nombres_reformateados.csv'")
