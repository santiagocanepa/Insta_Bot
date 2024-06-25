import numpy as np
import joblib
import optuna
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import xgboost as xgb
from optuna.integration import XGBoostPruningCallback

X_train = np.load('/kaggle/working/X_train.npy')
y_train = np.load('/kaggle/working/y_train.npy')

def objective(trial):
    param = {
        'tree_method': 'hist',
        'device': 'cuda',
        'lambda': trial.suggest_loguniform('lambda', 1e-3, 10.0),
        'alpha': trial.suggest_loguniform('alpha', 1e-3, 10.0),
        'colsample_bytree': trial.suggest_categorical('colsample_bytree', [0.7, 0.8, 0.9, 1.0]),
        'subsample': trial.suggest_categorical('subsample', [0.7, 0.8, 0.9, 1.0]),
        'learning_rate': trial.suggest_categorical('learning_rate', [0.01, 0.05, 0.1, 0.2]),
        'n_estimators': trial.suggest_int('n_estimators', 80, 300),
        'max_depth': trial.suggest_int('max_depth', 3, 6),
        'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
    }
    
    model = xgb.XGBClassifier(**param)
    
    model.fit(X_train, y_train, eval_set=[(X_train, y_train)], verbose=False, 
              eval_metric='logloss', callbacks=[XGBoostPruningCallback(trial, "validation_0-logloss")])
    
    preds = model.predict(X_train)
    accuracy = accuracy_score(y_train, preds)
    
    return accuracy

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)

print('Mejores parámetros encontrados: ', study.best_params)

best_clf = xgb.XGBClassifier(**study.best_params)
best_clf.fit(X_train, y_train)

joblib.dump(best_clf, '/kaggle/working/modelHumanPredict.pkl')