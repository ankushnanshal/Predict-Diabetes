from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import os

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

def train_model():
    csv_path = 'diabetes.csv'
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"'{csv_path}' not found. Please ensure it is in the same directory as app.py.")
    
    df = pd.read_csv(csv_path)
    X = df.drop('Outcome', axis=1)
    y = df['Outcome']
    
    model_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    model_pipeline.fit(X, y)
    return model_pipeline

try:
    model = train_model()
    print("Machine learning model trained and ready.")
except Exception as e:
    print(f"Error training model: {e}")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model is not trained or unavailable.'}), 500
    
    try:
        data = request.get_json()
        
        features = [
            float(data['Pregnancies']),
            float(data['Glucose']),
            float(data['BloodPressure']),
            float(data['SkinThickness']),
            float(data['Insulin']),
            float(data['BMI']),
            float(data['DiabetesPedigreeFunction']),
            float(data['Age'])
        ]
        
        features_array = np.array([features])
        
        prediction = int(model.predict(features_array)[0])
        probability = float(model.predict_proba(features_array)[0][1])
        
        return jsonify({
            'prediction': prediction,
            'probability': round(probability * 100, 2),
            'status': 'success'
        })
        
    except KeyError as e:
        return jsonify({'error': f'Missing input field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)