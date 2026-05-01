"""
Script untuk training model ML prediksi prioritas tiket.
Optimasi untuk dataset kecil.
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

print("=" * 60)
print("🎓 TRAINING MACHINE LEARNING MODEL")
print("=" * 60)

# ──────────────────────────────────────────
# 1. LOAD DATASET
# ──────────────────────────────────────────
print("\n📂 Loading dataset...")

df = pd.read_csv('dataset.csv')

print(f"   Total data: {len(df)} tiket")
print(f"   Kolom: {list(df.columns)}")
print(f"\n   Distribusi prioritas:")
for priority in ['urgent', 'normal', 'low']:
    count = len(df[df['priority'] == priority])
    print(f"   - {priority}: {count} tiket")

# ──────────────────────────────────────────
# 2. PERSIAPKAN DATA
# ──────────────────────────────────────────
print("\n🔧 Memproses data...")

# Gabung title dan description
df['text'] = df['title'] + ' ' + df['description']

X = df['text'].values
y = df['priority'].values

print(f"   Total data: {len(X)}")

# ──────────────────────────────────────────
# 3. BUAT PIPELINE ML (optimasi untuk data kecil)
# ──────────────────────────────────────────
print("\n🏗️  Membuat model ML...")

# Pipeline dengan parameter untuk data kecil
model = Pipeline([
    ('tfidf', TfidfVectorizer(
        ngram_range=(1, 2),      # Unigram + bigram
        max_features=500,         # Fitur lebih sedikit
        min_df=1,                 # Minimal muncul 1x
        max_df=0.9,              # Abaikan kata terlalu umum
        sublinear_tf=True        # Scaling logaritmik
    )),
    ('classifier', MultinomialNB(
        alpha=0.1,               # Smoothing lebih kecil
        fit_prior=True           # Gunakan prior probability
    ))
])

# ──────────────────────────────────────────
# 4. CROSS VALIDATION (evaluasi lebih akurat)
# ──────────────────────────────────────────
print("\n🚀 Training & evaluasi dengan Cross Validation...")

# 5-fold cross validation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')

print(f"   Cross-validation scores: {cv_scores}")
print(f"   Rata-rata akurasi: {cv_scores.mean():.2%} (+/- {cv_scores.std():.2%})")

# ──────────────────────────────────────────
# 5. TRAINING FINAL MODEL (dengan semua data)
# ──────────────────────────────────────────
print("\n🔧 Training final model dengan semua data...")
model.fit(X, y)
print("   ✅ Training selesai!")

# ──────────────────────────────────────────
# 6. TEST PREDIKSI MANUAL
# ──────────────────────────────────────────
print("\n🧪 Test prediksi:")

test_cases = [
    ("Server mati total", "Semua server tidak bisa diakses user", "urgent"),
    ("Tidak bisa login", "Username password benar tapi gagal login", "normal"),
    ("Minta mouse baru", "Mouse lama sudah rusak perlu ganti", "low"),
    ("Aplikasi error terus", "Setiap buka aplikasi langsung crash", "normal"),
    ("Jaringan lemot", "Internet sangat lambat dari pagi", "normal"),
    ("Database hilang", "Semua data hilang setelah restart", "urgent"),
    ("Request training", "Minta jadwal training untuk tim", "low"),
]

correct = 0
for title, desc, expected in test_cases:
    text = f"{title} {desc}"
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    confidence = max(probabilities)
    
    status = "✅" if prediction == expected else "❌"
    if prediction == expected:
        correct += 1
    
    print(f"\n   {status} Title: {title}")
    print(f"      Expected: {expected} | Predicted: {prediction}")
    print(f"      Confidence: {confidence:.1%}")

print(f"\n   Accuracy: {correct}/{len(test_cases)} = {correct/len(test_cases):.1%}")

# ──────────────────────────────────────────
# 7. SIMPAN MODEL
# ──────────────────────────────────────────
print("\n💾 Menyimpan model...")
model_filename = 'ticket_priority_model.joblib'
joblib.dump(model, model_filename)
print(f"   ✅ Model disimpan ke: {model_filename}")

size_kb = os.path.getsize(model_filename) / 1024
print(f"   Ukuran file: {size_kb:.1f} KB")

print("\n" + "=" * 60)
print("✅ TRAINING SELESAI! Model siap digunakan.")
print(f"   Akurasi Cross-Validation: {cv_scores.mean():.2%}")
print("=" * 60)