import requests
import pandas as pd
import numpy as np

# Cargar el CSV con los datos de prueba
df_test = pd.read_csv('/home/santiago/Bots/Insta/Insta_Bot/Embeddings/dataprep/X_y_test_with_embeddings.csv')


# Seleccionar 120 datos aleatorios
df_sample = df_test.sample(120, random_state=42)

# Configurar la URL de la API
api_url = 'http://localhost:8081/predict_gender'

# Preparar la lista de nombres (keys)
nombres = df_sample['Key'].tolist()

# Función para enviar los datos a la API
def enviar_a_api(nombres):
    resultados = []
    for nombre in nombres:
        try:
            response = requests.post(api_url, json={'nombre_usuario': nombre})
            if response.status_code == 200:
                resultado = response.json()
                resultados.append((nombre, resultado))
                print(f"Nombre: {nombre}, Resultado: {resultado}")
            else:
                print(f"Error en la API para el nombre {nombre}: {response.status_code}")
        except Exception as e:
            print(f"Error enviando el nombre {nombre} a la API: {e}")
    return resultados

# Enviar los datos a la API
resultados = enviar_a_api(nombres)

# Guardar los resultados en un archivo CSV
df_resultados = pd.DataFrame(resultados, columns=['Nombre', 'Resultado'])
df_resultados.to_csv('resultados_test_embeddings.csv', index=False)

print("Resultados guardados en 'resultados_test_embeddings.csv'")
