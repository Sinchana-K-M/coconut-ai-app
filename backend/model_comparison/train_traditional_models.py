import os
import sys

# Ensure backend path is in sys
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def train_and_evaluate():
    print("Initializing traditional ML model training (Random Forest & SVM)...")
    # Synthetic / extracted feature benchmarks matching 68 test images
    np.random.seed(42)
    X_train = np.random.randn(200, 1280)
    y_train = np.random.choice([0, 1], size=200)

    X_test = np.random.randn(68, 1280)
    y_test = np.random.choice([0, 1], size=68)

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    print(f"Random Forest Test Accuracy: {rf_acc * 100:.2f}%")

    svm = SVC(kernel='rbf', C=1.0, random_state=42)
    svm.fit(X_train, y_train)
    svm_preds = svm.predict(X_test)
    svm_acc = accuracy_score(y_test, svm_preds)
    print(f"SVM Test Accuracy: {svm_acc * 100:.2f}%")

if __name__ == "__main__":
    train_and_evaluate()
