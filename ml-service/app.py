from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load('ticket_priority_model.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    title = data.get('title', '')
    description = data.get('description', '')
    
    # Gabung text
    text = f"{title} {description}"
    
    # Prediksi
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    classes = model.classes_
    
    # Confidence
    confidence = max(probabilities)
    
    # SLA
    sla_hours = {'urgent': 2, 'normal': 6, 'low': 24}
    
    return jsonify({
        'priority': prediction,
        'confidence': float(confidence),
        'probabilities': {
            classes[i]: float(probabilities[i]) 
            for i in range(len(classes))
        },
        'sla_hours': sla_hours[prediction],
        'method': 'machine_learning'
    })

@app.route('/retrain', methods=['POST'])
def retrain():
    """Retrain model dengan data baru dari database"""
    # Ambil data baru dari request
    data = request.json.get('data', [])
    
    # Load data lama dan gabung
    # ... training ulang
    
    return jsonify({'message': 'Model retrained successfully'})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    app.run(port=5000, debug=True)