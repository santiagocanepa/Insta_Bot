import numpy as np
import joblib
from sklearn.metrics import accuracy_score, classification_report

best_clf = joblib.load('/kaggle/working/modelHumanPredict.pkl')

X_test = np.load('/kaggle/working/X_test.npy')
y_test = np.load('/kaggle/working/y_test.npy')

y_pred = best_clf.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2f}")

report = classification_report(y_test, y_pred)
print(report)
