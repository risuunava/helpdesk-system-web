import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib

# Data training (contoh - bisa ditambah dari database)
training_data = [
    # URGENT
    ("server down production critical", "urgent"),
    ("system crash all users affected", "urgent"),
    ("database corruption data loss", "urgent"),
    ("outage company wide emergency", "urgent"),
    ("security breach hacker attack", "urgent"),
    ("server mati total", "urgent"),
    ("sistem down tidak bisa akses", "urgent"),
    ("critical bug production stopped", "urgent"),
    
    # NORMAL
    ("cannot login to email", "normal"),
    ("printer not working", "normal"),
    ("software error when opening", "normal"),
    ("slow internet connection", "normal"),
    ("bug in application", "normal"),
    ("tidak bisa login", "normal"),
    ("Error saat membuka aplikasi", "normal"),
    ("aplikasi crash", "normal"),
    
    # LOW
    ("request new monitor", "low"),
    ("update software", "low"),
    ("need training", "low"),
    ("info about system", "low"),
    ("pertanyaan tentang fitur", "low"),
]

# Split data
X = [item[0] for item in training_data]
y = [item[1] for item in training_data]

# Buat pipeline ML
model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
    ('classifier', MultinomialNB(alpha=0.5))
])

# Training model
model.fit(X, y)

# Simpan model
joblib.dump(model, 'ticket_priority_model.joblib')

# Test
test_cases = [
    "server is not responding",
    "cannot access my account",
    "need new keyboard",
    "urgent server problem",
]

for text in test_cases:
    prediction = model.predict([text])[0]
    proba = model.predict_proba([text])[0]
    print(f"Text: {text}")
    print(f"Priority: {prediction}")
    print(f"Confidence: {max(proba):.2%}")
    print("-" * 40)