"""
ML Prediction API Service
Menerima request dari Laravel dan mengembalikan prediksi prioritas.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ──────────────────────────────────────────
# LOAD MODEL
# ──────────────────────────────────────────
MODEL_PATH = 'ticket_priority_model.joblib'
model = None

def load_model():
    """Load model ML dari file"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            logger.info(f"Model loaded from {MODEL_PATH}")
            return True
        else:
            logger.warning(f"Model file not found: {MODEL_PATH}")
            logger.warning("   Run: python train_model.py first!")
            return False
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False

# Load model saat startup
load_model()

# ──────────────────────────────────────────
# API ENDPOINTS
# ──────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    """Cek apakah service berjalan"""
    return jsonify({
        'status': 'ok',
        'service': 'ML Priority Prediction',
        'model_loaded': model is not None,
        'model_file': MODEL_PATH
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediksi prioritas tiket.
    
    Input JSON:
    {
        "title": "Server down",
        "description": "Server utama mati"
    }
    
    Output JSON:
    {
        "priority": "urgent",
        "confidence": 0.95,
        "probabilities": {
            "urgent": 0.95,
            "normal": 0.03,
            "low": 0.02
        },
        "sla_hours": 2,
        "method": "machine_learning"
    }
    """
    
    # Cek model loaded
    if model is None:
        return jsonify({
            'error': 'Model not loaded',
            'message': 'Run python train_model.py first'
        }), 503
    
    try:
        # Ambil data dari request
        data = request.json
        title = data.get('title', '')
        description = data.get('description', '')
        
        if not title and not description:
            return jsonify({
                'error': 'Title and description are required'
            }), 400
        
        # Gabung text (seperti training)
        text = f"{title} {description}"
        
        # Prediksi prioritas
        prediction = model.predict([text])[0]
        
        # Probabilitas setiap kelas
        probabilities = model.predict_proba([text])[0]
        classes = model.classes_
        
        # Confidence (probabilitas tertinggi)
        confidence = max(probabilities)
        
        # SLA berdasarkan prioritas
        sla_hours = {
            'urgent': 2,
            'normal': 6,
            'low': 24
        }
        
        # Log prediksi
        logger.info(f"Predict: '{text[:50]}...' → {prediction} ({confidence:.2%})")
        
        # Return hasil
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
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Retrain model dengan data baru.
    Dipanggil Laravel setelah tiket dibuat.
    
    Input JSON:
    {
        "data": [
            {"title": "...", "description": "...", "priority": "urgent"},
            ...
        ]
    }
    """
    try:
        # Import training function
        import subprocess
        import sys
        
        # Jalankan training ulang
        result = subprocess.run(
            [sys.executable, 'train_model.py'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Reload model
            load_model()
            return jsonify({
                'message': 'Model retrained successfully',
                'output': result.stdout[-500:]  # Last 500 chars
            })
        else:
            return jsonify({
                'error': 'Retrain failed',
                'message': result.stderr
            }), 500
            
    except Exception as e:
        logger.error(f"Retrain error: {e}")
        return jsonify({
            'error': 'Retrain failed',
            'message': str(e)
        }), 500

# ──────────────────────────────────────────
# ERROR HANDLERS
# ──────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# ──────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("ML Priority Prediction Service")
    print("=" * 50)
    print(f"Running on: http://localhost:5000")
    print(f"Health check: http://localhost:5000/health")
    print(f"Predict: POST http://localhost:5000/predict")
    print(f"Retrain: POST http://localhost:5000/retrain")
    print(f"Model: {'Loaded' if model else 'Not loaded'}")
    print("=" * 50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)