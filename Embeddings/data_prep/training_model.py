import numpy as np
import joblib
from sklearn.model_selection import GridSearchCV
import xgboost as xgb

# Cargar los conjuntos de entrenamiento desde archivos .npy
X_train = np.load('/kaggle/working/X_train.npy')
y_train = np.load('/kaggle/working/y_train.npy')

# Definir el clasificador XGBoost con soporte para GPU y ajustes para reducir la memoria
clf = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', tree_method='gpu_hist')

# Definir la ponderación de clases inversamente proporcional
weights = len(y_train) / (2 * np.bincount(y_train))

# Asignar los pesos de clase al clasificador
clf.set_params(**{'scale_pos_weight': weights[1]})

# Definir el conjunto de hiperparámetros para probar
param_grid = {
    'n_estimators': [50, 150],  # Reducir el número de árboles
    'max_depth': [3, 5],        # Reducir la profundidad máxima
    'learning_rate': [0.01, 0.1],
    'subsample': [0.7, 0.8],
    'colsample_bytree': [0.7, 0.8]
}

# Configurar Grid Search con un subconjunto de datos para optimización
X_train_sub, _, y_train_sub, _ = train_test_split(X_train, y_train, test_size=0.8, random_state=42)

grid_search = GridSearchCV(estimator=clf, param_grid=param_grid, cv=3, scoring='accuracy', verbose=1, n_jobs=-1)

# Entrenar el modelo utilizando Grid Search
grid_search.fit(X_train_sub, y_train_sub)

# Imprimir los mejores parámetros encontrados
print("Mejores parámetros encontrados:", grid_search.best_params_)

# Entrenar el modelo final con los mejores parámetros en todos los datos de entrenamiento
best_clf = grid_search.best_estimator_
best_clf.fit(X_train, y_train)

# Guardar el modelo entrenado
joblib.dump(best_clf, '/kaggle/working/modelHumanPredict.pkl')
