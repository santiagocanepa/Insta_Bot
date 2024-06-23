import pandas as pd

# Leer el archivo CSV original
with open('nuevos.csv', 'r') as file:
    data = file.readlines()

# Procesar las líneas del archivo
nombres = []
generos = []

for line in data:
    parts = line.split('\t')  # Asume que los datos están separados por tabulaciones
    if len(parts) >= 2:  # Asegurarse de que haya al menos dos partes
        nombres.append(parts[0].strip())
        generos.append(parts[1].strip())

# Crear un DataFrame con los nombres y géneros
df = pd.DataFrame({'Nombre': nombres, 'Genero': generos})

# Guardar el DataFrame resultante en un nuevo archivo CSV
df.to_csv('nombres_y_generos.csv', index=False)

print("Archivo reformateado guardado como 'nombres_y_generos.csv'")
