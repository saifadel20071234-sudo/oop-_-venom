"""
nlu/classifier.py - Trains the ML Intent/Condition Classifier
Uses TF-IDF feature extraction + Logistic Regression.
Author: Reda El-Qeblawy (Member 3 - ML/NLU Lead)
"""
import sys
from pathlib import Path

PROJECT_PATH = Path(__file__).resolve().parent.parent
if str(PROJECT_PATH) not in sys.path:
    sys.path.insert(0, str(PROJECT_PATH))

import pandas as pd 
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

from nlu.preprocessor_ml import preprocess_text

# Step 1: Define project paths
DATA_CSV = PROJECT_PATH / 'data' / 'training_data.csv'
DATA_XLSX = PROJECT_PATH / 'data' / 'Training_data.xlsx'
if not DATA_XLSX.exists():
    DATA_XLSX = PROJECT_PATH / 'Training_data.xlsx'
MODEL_PATH = PROJECT_PATH / 'nlu' / 'First_aid_model.joblib'

# Step 2: Load The Dataset (CSV preferred, XLSX fallback)
if DATA_CSV.exists():
    df = pd.read_csv(DATA_CSV)
    print(f'Dataset loaded successfully from CSV: {DATA_CSV}')
elif DATA_XLSX.exists():
    df = pd.read_excel(DATA_XLSX)
    print(f'Dataset loaded successfully from Excel: {DATA_XLSX}')
else:
    raise FileNotFoundError("Training dataset not found in data/training_data.csv or Training_data.xlsx")

print('Original dataset shape:', df.shape)

# Step 3: Check required columns
required_columns = {'text', 'condition'}
if not required_columns.issubset(df.columns):
    raise ValueError("The dataset must contain 'text' and 'condition' columns.")

# Step 4: Keep the columns needed for training
df = df[['text', 'condition']].copy()

# Remove rows with missing text or labels
df = df.dropna(subset=['text', 'condition'])

# Convert values to strings and remove surrounding spaces
df['text'] = df['text'].astype(str).str.strip()
df['condition'] = df['condition'].astype(str).str.strip()

# Remove empty text or labels
df = df[(df['text'] != "") & (df['condition'] != "")]

# Remove exact duplicate training examples
df = df.drop_duplicates(subset=['text', 'condition'])
print('Dataset shape after cleaning:', df.shape)
print('Number of conditions:', df['condition'].nunique())

# Step 5: Preprocess the text 
X = df['text'].apply(preprocess_text)
y = df['condition']

# Step 6: Split the dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)
print('\nTraining examples:', len(X_train))
print('Testing examples:', len(X_test))

# Step 7: Convert text into numerical features using TF-IDF
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    sublinear_tf=True
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf  = vectorizer.transform(X_test)
print('\nTF-IDF training matrix:', X_train_tfidf.shape)
print('TF-IDF testing matrix:', X_test_tfidf.shape)

# Step 8: Create and train the classification model
model = LogisticRegression(
    max_iter=2000,
    random_state=42
)
model.fit(X_train_tfidf, y_train)
print('\nModel training completed successfully!')

# Step 9: Evaluate the model on unseen test examples
y_pred = model.predict(X_test_tfidf)
accuracy = accuracy_score(y_test, y_pred)
print('\nAccuracy:', round(accuracy, 4))
print('\nClassification Report:')
print(classification_report(y_test, y_pred, zero_division=0))

# Step 10: Save the trained model and vectorizer
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(
    {
        'model': model,
        'vectorizer': vectorizer
    },
    MODEL_PATH
)

print('\nModel saved successfully!')
print('Saved Location:', MODEL_PATH)
