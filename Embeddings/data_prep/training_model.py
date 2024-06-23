import numpy as np
import joblib
from sklearn.model_selection import GridSearchCV
import xgboost as xgb

# Cargar los conjuntos de entrenamiento
X_train = np.load('/kaggle/working/X_train.npy')
y_train = np.load('/kaggle/working/y_train.npy')

# Definir el clasificador con soporte para GPU
clf = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', tree_method='hist', device='cuda')

# Definir el conjunto de hiperparámetros para probar
param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [3, 4, 5, 6],
    'learning_rate': [0.01, 0.1, 0.2],
    'subsample': [0.7, 0.8, 0.9, 1.0],
    'colsample_bytree': [0.7, 0.8, 0.9, 1.0]
}

# Configurar Grid Search
grid_search = GridSearchCV(estimator=clf, param_grid=param_grid, cv=5, scoring='accuracy', verbose=1, n_jobs=-1)

# Entrenar el modelo utilizando Grid Search
grid_search.fit(X_train, y_train)

# Imprimir los mejores parámetros
print("Mejores parámetros encontrados:", grid_search.best_params_)

# Entrenar el modelo final con los mejores parámetros
best_clf = grid_search.best_estimator_
best_clf.set_params(device='cuda')
best_clf.fit(X_train, y_train)

# Guardar el modelo entrenado
joblib.dump(best_clf, '/kaggle/working/modelo_clasificacion_optimizados.pkl')
