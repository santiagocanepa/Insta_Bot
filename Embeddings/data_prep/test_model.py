import numpy as np
import joblib
from sklearn.metrics import accuracy_score

# Cargar el modelo entrenado
clf_cargado = joblib.load('modelo_clasificacion_optimizados.pkl')

# Cargar los conjuntos de prueba
X_test = np.load('X_test.npy')
y_test = np.load('y_test.npy')

# Predecir en el conjunto de prueba
y_pred = clf_cargado.predict(X_test)

# Evaluar la precisión del modelo
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2f}")