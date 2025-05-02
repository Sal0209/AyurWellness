import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from imblearn.combine import SMOTETomek
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, precision_score, recall_score, f1_score
import joblib
import matplotlib.pyplot as plt
import seaborn as sns


def load_data():
    url = "https://docs.google.com/spreadsheets/d/1hFfJkcY2Wvh1dgPxE4CiT_BNGLZiyY2ZinanLW5Dy8k/export?gid=1847020359&format=csv"
    df = pd.read_csv(url)
    
    X = df.iloc[:, :-1]  # Features
    y = df.iloc[:, -1]   # Target
    
    print("Data Loaded Successfully")
    print("Class Distribution Before SMOTE:\n", y.value_counts())

    return X, y


def preprocess_data(X, y):
    categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
    encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    X_encoded = encoder.fit_transform(X[categorical_cols])
    X_encoded_df = pd.DataFrame(X_encoded, columns=encoder.get_feature_names_out(categorical_cols))
    X = X.drop(columns=categorical_cols)
    X = pd.concat([X, X_encoded_df], axis=1)

    smote = SMOTETomek(sampling_strategy='not majority', random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X, y)

    print("Class Distribution After SMOTE:\n", y_resampled.value_counts())

    return X_resampled, y_resampled, encoder
    

def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    print(f"Precision: {precision:.2f}")
    print(f"Recall: {recall:.2f}")
    print(f"F1 Score: {f1:.2f}")
    
    print("Classification Report:\n", classification_report(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=np.unique(y), yticklabels=np.unique(y))
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.show()
    
    joblib.dump(model, 'prakriti_model_random_forest.pkl')
    
    return model


def save_encoder(encoder):
    joblib.dump(encoder, 'prakriti_encoder.pkl')


def load_model():
    return joblib.load('prakriti_model_random_forest.pkl')


def load_encoder():
    return joblib.load('prakriti_encoder.pkl')


def predict_prakriti(user_inputs):
    model = load_model()
    encoder = load_encoder()

    X_input = pd.DataFrame([user_inputs])
    categorical_cols = encoder.feature_names_in_.tolist()
    
    missing_cols = set(categorical_cols) - set(X_input.columns)
    if missing_cols:
        for col in missing_cols:
            X_input[col] = 0

    X_encoded = encoder.transform(X_input[categorical_cols]).toarray()
    X_encoded_df = pd.DataFrame(X_encoded, columns=encoder.get_feature_names_out())
    X_input = X_input.drop(columns=categorical_cols)
    X_input = pd.concat([X_input, X_encoded_df], axis=1)

    prediction = model.predict(X_input)
    return prediction[0]


if __name__ == "__main__":
    X, y = load_data()
    X_processed, y_processed, encoder = preprocess_data(X, y)
    model_rf = train_model(X_processed, y_processed)
    save_encoder(encoder)
    print("Model training completed and saved.")
