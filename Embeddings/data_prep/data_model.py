import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import ast

# Convertir la columna de embeddings de string a lista
df['embedding'] = df['embedding'].apply(ast.literal_eval)

# Separar características y etiquetas
X = np.array(df['embedding'].tolist())
y = df['Human']

# Dividir los datos en conjunto de entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Guardar los conjuntos de entrenamiento y prueba
np.save('/kaggle/working/X_train.npy', X_train)
np.save('/kaggle/working/X_test.npy', X_test)
np.save('/kaggle/working/y_train.npy', y_train)
np.save('/kaggle/working/y_test.npy', y_test)
