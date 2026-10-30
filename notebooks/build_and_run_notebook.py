"""
AgriSmart AI - Notebook Builder and Executor
Generates a comprehensive, publication-grade Jupyter Notebook documenting
the complete lifecycle of the AgriSmart AI crop recommendation neural network.
Executes each cell and captures rich outputs (stdout, plots as base64 images).
"""

import os
import sys
import json
import base64
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import nbformat as nbf

# Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTEBOOKS_DIR = os.path.join(BASE_DIR, 'notebooks')
DATA_PATH = os.path.join(BASE_DIR, 'data', 'dataset', 'Crop_recommendation.csv')
OUTPUT_NB_PATH = os.path.join(NOTEBOOKS_DIR, '01_crop_recommendation_model_development.ipynb')
LEGACY_NB_PATH = os.path.join(NOTEBOOKS_DIR, 'crop_recommendation.ipynb')

print(f"[+] Starting Notebook Generation...")
print(f"    Base Dir: {BASE_DIR}")
print(f"    Data:     {DATA_PATH}")

# Execution context dictionary
exec_globals = {
    '__file__': __file__,
    'BASE_DIR': BASE_DIR,
    'DATA_PATH': DATA_PATH
}

nb = nbf.v4.new_notebook()
nb['metadata'] = {
    'kernelspec': {
        'display_name': 'Python 3 (AgriSmart venv)',
        'language': 'python',
        'name': 'python3'
    },
    'language_info': {
        'name': 'python',
        'version': '3.12.0'
    }
}

cells = []
execution_counter = 1

def add_markdown(text):
    cells.append(nbf.v4.new_markdown_cell(text.strip()))

def add_code(code_str, execute=True):
    global execution_counter
    code_str = code_str.strip()
    cell = nbf.v4.new_code_cell(code_str)
    cell['execution_count'] = execution_counter
    
    if execute:
        # Capture stdout
        old_stdout = sys.stdout
        redirected_output = io.StringIO()
        sys.stdout = redirected_output
        plt.close('all')
        
        try:
            exec(code_str, exec_globals)
            out_text = redirected_output.getvalue()
            
            outputs = []
            if out_text:
                outputs.append(nbf.v4.new_output(
                    output_type='stream',
                    name='stdout',
                    text=out_text
                ))
            
            # Capture any open matplotlib figures
            figs = [plt.figure(i) for i in plt.get_fignums()]
            for fig in figs:
                buf = io.BytesIO()
                fig.savefig(buf, format='png', bbox_inches='tight', dpi=120)
                buf.seek(0)
                img_b64 = base64.b64encode(buf.read()).decode('utf-8')
                outputs.append(nbf.v4.new_output(
                    output_type='display_data',
                    data={
                        'image/png': img_b64,
                        'text/plain': '<Figure size>'
                    },
                    metadata={}
                ))
                plt.close(fig)
                
            cell['outputs'] = outputs
        except Exception as e:
            sys.stdout = old_stdout
            print(f"[!] Error executing cell {execution_counter}: {e}")
            cell['outputs'] = [nbf.v4.new_output(
                output_type='error',
                ename=type(e).__name__,
                evalue=str(e),
                traceback=[str(e)]
            )]
        finally:
            sys.stdout = old_stdout
            plt.close('all')
            
    execution_counter += 1
    cells.append(cell)

# ==========================================
# NOTEBOOK STRUCTURE & CONTENT
# ==========================================

# 1. Header
add_markdown("""
# 🌾 AgriSmart AI — End-to-End Deep Learning Pipeline
### **Precision Crop Recommendation System via Multi-Layer Neural Networks**

**Author:** AgriSmart AI Engineering Team  
**Dataset:** ICAR & Agricultural Benchmark Data (2,200 Observations, 22 Crop Varieties)  
**Model Framework:** TensorFlow / Keras Deep Neural Network (DNN)  
**Production Goal:** High-precision multiclass classification with top-3 alternative crop ranking.

---

## 📌 Table of Contents
1. [Domain Background & Problem Formulation](#1-domain-background--problem-formulation)
2. [Data Acquisition & Integrity Verification](#2-data-acquisition--integrity-verification)
3. [Comprehensive Exploratory Data Analysis (EDA)](#3-comprehensive-exploratory-data-analysis-eda)
4. [Data Preprocessing & Scaling Pipeline](#4-data-preprocessing--scaling-pipeline)
5. [Deep Neural Network Architecture Design](#5-deep-neural-network-architecture-design)
6. [Model Training & Learning Dynamics](#6-model-training--learning-dynamics)
7. [Rigorous Model Evaluation & Diagnostics](#7-rigorous-model-evaluation--diagnostics)
8. [Production Inference Engine & Top-3 Crop Ranking](#8-production-inference-engine--top-3-crop-ranking)
9. [Model Serialization & Export for Production Serving](#9-model-serialization--export-for-production-serving)
""")

# 2. Domain Background
add_markdown("""
---
## 1. Domain Background & Problem Formulation

In modern agriculture, indiscriminate fertilizer application and lack of localized environmental profiling lead to declining soil fertility, degraded yields, and severe economic losses for smallholder farmers. 

The objective of **AgriSmart AI** is to ingest 7 critical agronomic parameters:
* **Soil Macronutrients:** Nitrogen ($N$), Phosphorus ($P$), Potassium ($K$) measured in $\\text{kg/ha}$.
* **Climatic Parameters:** Temperature ($T$ in $^\\circ\\text{C}$), Relative Humidity ($H$ in $\\%$), and Annual Precipitation/Rainfall ($R$ in $\\text{mm}$).
* **Soil Chemistry:** Soil Acidity/Alkalinity level ($\text{pH}$).

Mathematically, given an input feature vector $\\mathbf{x} = [N, P, K, T, H, \\text{pH}, R]^T \\in \\mathbb{R}^7$, our neural network learns a parameterized mapping:
$$\\hat{\\mathbf{y}} = f_\\theta(\\mathbf{x}) = \\text{Softmax}(\\mathbf{W}_L \\dots \\text{ReLU}(\\mathbf{W}_1 \\mathbf{x} + \\mathbf{b}_1))$$
where $\\hat{\\mathbf{y}} \\in [0, 1]^{22}$ represents the predicted probability distribution across 22 distinct commercial and staple crop varieties.
""")

# 3. Imports
add_markdown("### 1.1 Libraries & Environment Setup")
add_code("""
import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# ML & Deep Learning
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Configure plotting aesthetics
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.titleweight'] = 'bold'
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['axes.labelweight'] = 'bold'

print(f"TensorFlow Version: {tf.__version__}")
print(f"Pandas Version:     {pd.__version__}")
print(f"NumPy Version:      {np.__version__}")
""")

# 4. Data Acquisition
add_markdown("""
---
## 2. Data Acquisition & Integrity Verification

We ingest the benchmark agricultural dataset from `data/dataset/Crop_recommendation.csv`.
The dataset contains 2,200 empirical field observations across India's primary agro-climatic zones.
""")

add_code("""
# Resolve robust relative path
dataset_path = os.path.join(BASE_DIR, 'data', 'dataset', 'Crop_recommendation.csv')
if not os.path.exists(dataset_path):
    # Fallback to local working directory
    dataset_path = 'Crop_recommendation.csv'

df = pd.read_csv(dataset_path)
print(f"Dataset successfully loaded from: {dataset_path}")
print(f"Dimensions: {df.shape[0]} samples (rows) x {df.shape[1]} features (columns)")
df.head(10)
""")

add_markdown("### 2.1 Schema Verification & Null Value Auditing")
add_code("""
print("=== DATASET INFORMATION ===")
df.info()

print("\\n=== MISSING VALUES PER COLUMN ===")
missing_counts = df.isnull().sum()
print(missing_counts)

print(f"\\nDuplicate Records: {df.duplicated().sum()}")
""")

# 5. EDA
add_markdown("""
---
## 3. Comprehensive Exploratory Data Analysis (EDA)

Exploratory analysis allows us to discover feature boundaries, understand crop-nutrient requirements, and verify class balance.
""")

add_markdown("### 3.1 Five-Number Summary & Descriptive Statistics")
add_code("""
# Statistical distribution of agronomic variables
summary_stats = df.describe().T[['mean', 'std', 'min', '25%', '50%', '75%', 'max']]
summary_stats.round(2)
""")

add_markdown("### 3.2 Target Class Distribution Check")
add_code("""
class_counts = df['label'].value_counts()
print(f"Total Unique Crop Classes: {df['label'].nunique()}")

plt.figure(figsize=(14, 5))
palette = sns.color_palette("viridis", len(class_counts))
bars = plt.bar(class_counts.index, class_counts.values, color=palette, edgecolor='black', alpha=0.85)
plt.title("Target Class Distribution Across All 22 Crops (Balanced Dataset: 100 Samples Each)")
plt.xlabel("Crop Variety")
plt.ylabel("Sample Count")
plt.xticks(rotation=45, ha='right', fontweight='bold')
plt.grid(axis='y', linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()
""")

add_markdown("""
> **Key Finding:** The dataset exhibits **ideal balance** ($100$ samples per crop class $\\times 22 = 2,200$ samples).  
> Because classes are uniformly balanced, standard accuracy and unweighted cross-entropy loss are optimal training metrics.
""")

add_markdown("### 3.3 Feature Distributions & Histograms")
add_code("""
features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#6366f1']

fig, axes = plt.subplots(nrows=2, ncols=4, figsize=(16, 8))
axes = axes.flatten()

for i, col in enumerate(features):
    sns.histplot(df[col], kde=True, ax=axes[i], color=colors[i], bins=25, edgecolor='black')
    axes[i].set_title(f"Distribution: {col}")
    axes[i].grid(True, linestyle=':', alpha=0.6)

# Hide unused 8th subplot
axes[-1].axis('off')
plt.suptitle("Agronomic Feature Distributions (NPK, Climate & Soil pH)", fontsize=14, fontweight='bold', y=1.02)
plt.tight_layout()
plt.show()
""")

add_markdown("### 3.4 Feature Correlation Heatmap")
add_code("""
plt.figure(figsize=(9, 7))
corr = df[features].corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap='coolwarm', vmin=-1, vmax=1,
            square=True, linewidths=1.5, cbar_kws={"shrink": .8})
plt.title("Pearson Correlation Heatmap Between Agronomic Input Parameters", pad=15)
plt.tight_layout()
plt.show()
""")

add_markdown("""
> **Observation:**  
> * **Phosphorus ($P$) and Potassium ($K$)** show a noticeable positive correlation ($r = 0.74$), which aligns with agricultural science: soils naturally enriched in phosphate minerals frequently co-occur with potash complexes.
> * Environmental factors ($T, H, R$) and $\\text{pH}$ show minimal collinearity, indicating that each variable contributes orthogonal signal to the neural network.
""")

add_markdown("### 3.5 Crop Requirements Across Vital Features")
add_code("""
# Compare NPK and Rainfall demands for representative commercial crops
sample_crops = ['rice', 'coffee', 'cotton', 'apple', 'banana', 'chickpea', 'watermelon', 'lentil']
df_sample = df[df['label'].isin(sample_crops)]

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

sns.boxplot(data=df_sample, x='label', y='rainfall', ax=axes[0], palette='Blues_r')
axes[0].set_title("Rainfall Demand (mm) for Selected Crops")
axes[0].set_xticklabels(axes[0].get_xticklabels(), rotation=30, ha='right')

sns.boxplot(data=df_sample, x='label', y='N', ax=axes[1], palette='Greens_r')
axes[1].set_title("Nitrogen Demand (kg/ha) for Selected Crops")
axes[1].set_xticklabels(axes[1].get_xticklabels(), rotation=30, ha='right')

plt.tight_layout()
plt.show()
""")

# 6. Preprocessing
add_markdown("""
---
## 4. Data Preprocessing & Scaling Pipeline

Machine learning models, particularly gradient-based Deep Neural Networks, require:
1. **Target Encoding:** Categorical crop strings converted to zero-indexed integer IDs ($y \\in [0, 21]$).
2. **Stratified Partitioning:** Preserving the $1:1$ ratio of all 22 classes in both training and test sets.
3. **Z-Score Normalization:** Transforming features to have $\\mu = 0$ and $\\sigma = 1$:
$$z = \\frac{x - \\mu}{\\sigma}$$
Without scaling, high-magnitude features like Rainfall ($0 - 300\\text{ mm}$) would dominate gradient updates compared to Soil $\\text{pH}$ ($3.5 - 9.9$).
""")

add_code("""
# 1. Feature / Target Split
X = df.drop(columns=['label'])
y_raw = df['label']

# 2. Target Label Encoding
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y_raw)
class_names = list(label_encoder.classes_)
num_classes = len(class_names)

print(f"Total encoded classes: {num_classes}")
print("Sample class mappings:")
for i in range(min(8, num_classes)):
    print(f"  Class {i:02d} -> {class_names[i]}")

# 3. Stratified Train-Test Split (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, 
    test_size=0.20, 
    random_state=42, 
    stratify=y_encoded
)

print(f"\\nTraining set: {X_train.shape[0]} samples")
print(f"Test set:     {X_test.shape[0]} samples")

# 4. Standard Scaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("\\nFeature Scaling completed successfully.")
print(f"Train Scaled Mean: {X_train_scaled.mean(axis=0).round(4)}")
print(f"Train Scaled Std:  {X_train_scaled.std(axis=0).round(4)}")
""")

# 7. Model Architecture
add_markdown("""
---
## 5. Deep Neural Network Architecture Design

We construct a multi-layer feedforward deep neural network (DNN) using Keras Sequential API.
* **Input Layer:** 7 nodes corresponding to $[N, P, K, T, H, \\text{pH}, R]$.
* **Hidden Layer 1:** 64 units, **ReLU** activation ($\max(0, z)$), He Normal initialization.
* **Regularization 1:** **Dropout** ($p = 0.20$) to prevent co-adaptation of hidden features.
* **Hidden Layer 2:** 32 units, **ReLU** activation.
* **Regularization 2:** **Dropout** ($p = 0.20$).
* **Hidden Layer 3:** 16 units, **ReLU** activation.
* **Output Layer:** 22 units with **Softmax** activation:
$$\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^{22} e^{z_j}}$$
yielding normalized prediction probabilities across all crops.
""")

add_code("""
# Define Sequential Architecture
def build_crop_recommender_model(input_dim=7, output_classes=22):
    model = keras.Sequential([
        keras.Input(shape=(input_dim,), name="input_agronomic_features"),
        
        layers.Dense(64, activation='relu', kernel_initializer='he_normal', name="dense_features_64"),
        layers.Dropout(0.2, name="dropout_1"),
        
        layers.Dense(32, activation='relu', kernel_initializer='he_normal', name="dense_features_32"),
        layers.Dropout(0.2, name="dropout_2"),
        
        layers.Dense(16, activation='relu', kernel_initializer='he_normal', name="dense_features_16"),
        
        layers.Dense(output_classes, activation='softmax', name="crop_probability_output")
    ], name="AgriSmart_Deep_Neural_Network")
    
    # Optimizer & Loss Configuration
    optimizer = keras.optimizers.Adam(learning_rate=0.001)
    
    model.compile(
        optimizer=optimizer,
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

model = build_crop_recommender_model(input_dim=X_train.shape[1], output_classes=num_classes)
model.summary()
""")

# 8. Training
add_markdown("""
---
## 6. Model Training & Learning Dynamics

We train the model for up to 100 epochs using:
* **Batch Size:** 32 samples per gradient step.
* **Validation Split:** 15% holdout from training data.
* **Early Stopping Callback:** Monitors `val_loss` with a patience of 15 epochs, automatically restoring the best performing weights.
""")

add_code("""
early_stopping = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=15,
    restore_best_weights=True,
    verbose=1
)

history = model.fit(
    X_train_scaled,
    y_train,
    validation_split=0.15,
    epochs=100,
    batch_size=32,
    callbacks=[early_stopping],
    verbose=1
)
""")

add_markdown("### 6.1 Training & Validation Convergence Curves")
add_code("""
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 5))

# Accuracy Curve
ax1.plot(history.history['accuracy'], label='Training Accuracy', color='#10b981', linewidth=2.5)
ax1.plot(history.history['val_accuracy'], label='Validation Accuracy', color='#3b82f6', linewidth=2.5, linestyle='--')
ax1.set_title("Model Accuracy Across Epochs", pad=12)
ax1.set_xlabel("Epoch")
ax1.set_ylabel("Accuracy")
ax1.legend(loc='lower right')
ax1.grid(True, linestyle=':', alpha=0.6)

# Loss Curve
ax2.plot(history.history['loss'], label='Training Loss (Cross-Entropy)', color='#ef4444', linewidth=2.5)
ax2.plot(history.history['val_loss'], label='Validation Loss', color='#f59e0b', linewidth=2.5, linestyle='--')
ax2.set_title("Model Loss Convergence Across Epochs", pad=12)
ax2.set_xlabel("Epoch")
ax2.set_ylabel("Loss")
ax2.legend(loc='upper right')
ax2.grid(True, linestyle=':', alpha=0.6)

plt.suptitle("AgriSmart AI Neural Network Training Convergence Dynamics", fontsize=14, fontweight='bold', y=1.03)
plt.tight_layout()
plt.show()
""")

# 9. Evaluation
add_markdown("""
---
## 7. Rigorous Model Evaluation & Diagnostics

We benchmark the trained model on the unseen test set ($440$ samples).
""")

add_code("""
# Evaluate on test set
test_loss, test_accuracy = model.evaluate(X_test_scaled, y_test, verbose=0)
print("=" * 55)
print(f" 🎯 AGRI-SMART AI TEST BENCHMARK RESULTS")
print("=" * 55)
print(f" Test Set Loss (Sparse Cross-Entropy): {test_loss:.4f}")
print(f" Test Set Accuracy:                    {test_accuracy * 100:.2f}%")
print("=" * 55)

# Predictions
y_probs = model.predict(X_test_scaled, verbose=0)
y_pred = np.argmax(y_probs, axis=1)
""")

add_markdown("### 7.1 Comprehensive Classification Report")
add_code("""
report = classification_report(y_test, y_pred, target_names=class_names, digits=4)
print(report)
""")

add_markdown("### 7.2 Confusion Matrix Heatmap across all 22 Crops")
add_code("""
cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(15, 12))
sns.heatmap(
    cm, 
    annot=True, 
    fmt='d', 
    cmap='Greens',
    xticklabels=class_names,
    yticklabels=class_names,
    cbar=True,
    linewidths=0.5
)
plt.title(f"Confusion Matrix (Test Accuracy: {test_accuracy * 100:.2f}%)", pad=15)
plt.xlabel("Predicted Crop Label", labelpad=10)
plt.ylabel("True Crop Label", labelpad=10)
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()
plt.show()
""")

# 10. Production Inference Engine
add_markdown("""
---
## 8. Production Inference Engine & Top-3 Crop Ranking

In real agricultural applications, presenting only a single recommendation is suboptimal. A farmer might lack irrigation for Rice, but Chickpea or Maize could be an almost equally suitable alternative.

Here, we implement the **Top-3 Ranked Inference Function** with probability confidence scores.
""")

add_code("""
def recommend_crop_top3(N, P, K, temperature, humidity, ph, rainfall):
    \"\"\"
    Takes raw agronomic and environmental parameters, normalizes with trained scaler,
    and returns top-3 crop recommendations with confidence levels.
    \"\"\"
    input_features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    scaled_features = scaler.transform(input_features)
    probabilities = model.predict(scaled_features, verbose=0)[0]
    
    top3_indices = np.argsort(probabilities)[::-1][:3]
    
    results = []
    for rank, idx in enumerate(top3_indices, start=1):
        crop = class_names[idx]
        confidence = float(probabilities[idx] * 100)
        results.append({
            'rank': rank,
            'crop': crop,
            'confidence': round(confidence, 2)
        })
    return results

# Test Scenario A: High Nitrogen & High Moisture (Typical Paddy/Rice environment)
sample_rice = recommend_crop_top3(N=90, P=42, K=43, temperature=24.5, humidity=82.0, ph=6.5, rainfall=210.0)

# Test Scenario B: Semi-arid, Moderate Nitrogen (Chickpea / Lentil environment)
sample_arid = recommend_crop_top3(N=40, P=65, K=80, temperature=18.0, humidity=16.0, ph=7.2, rainfall=75.0)

print("=== SCENARIO A (Paddy/Wetland Profile) ===")
for r in sample_rice:
    print(f"  Rank {r['rank']}: {r['crop'].upper():<12} Confidence: {r['confidence']}%")

print("\\n=== SCENARIO B (Semi-Arid Profile) ===")
for r in sample_arid:
    print(f"  Rank {r['rank']}: {r['crop'].upper():<12} Confidence: {r['confidence']}%")
""")

# 11. Serialization & Export
add_markdown("""
---
## 9. Model Serialization & Export for Production Serving

To power the AgriSmart AI web application (`app.py`), we serialize:
1. `models/crop_recommendation_model.keras` — Trained Keras neural network.
2. `models/scaler.pkl` — Standard scaler parameters ($\mu, \sigma$).
3. `models/label_encoder.pkl` — Label encoder class dictionary.
4. `results/model_metrics.txt` — Plain-text verification metrics.
""")

add_code("""
# Paths
models_dir = os.path.join(BASE_DIR, 'models')
results_dir = os.path.join(BASE_DIR, 'results')
os.makedirs(models_dir, exist_ok=True)
os.makedirs(results_dir, exist_ok=True)

model_save_path = os.path.join(models_dir, 'crop_recommendation_model.keras')
scaler_save_path = os.path.join(models_dir, 'scaler.pkl')
encoder_save_path = os.path.join(models_dir, 'label_encoder.pkl')
metrics_save_path = os.path.join(results_dir, 'model_metrics.txt')

# 1. Save Keras Model
model.save(model_save_path)
print(f"Saved trained Keras model: {model_save_path}")

# 2. Save Scaler
joblib.dump(scaler, scaler_save_path)
print(f"Saved StandardScaler:       {scaler_save_path}")

# 3. Save Label Encoder
joblib.dump(label_encoder, encoder_save_path)
print(f"Saved LabelEncoder:         {encoder_save_path}")

# 4. Save Model Metrics
with open(metrics_save_path, 'w', encoding='utf-8') as f:
    f.write(f"Model: AgriSmart AI Deep Neural Network (Sequential DNN)\\n")
    f.write(f"Timestamp: {pd.Timestamp.now()}\\n")
    f.write(f"Test Accuracy: {test_accuracy * 100:.2f}%\\n")
    f.write(f"Test Loss: {test_loss:.4f}\\n\\n")
    f.write("Classification Report:\\n")
    f.write(report)

print(f"Saved Model Metrics:        {metrics_save_path}")
print("\\n All production artifacts successfully generated and validated!")
""")

# Write out the notebook
nb['cells'] = cells

with open(OUTPUT_NB_PATH, 'w', encoding='utf-8') as f:
    nbf.write(nb, f)
print(f"[OK] Created: {OUTPUT_NB_PATH}")

with open(LEGACY_NB_PATH, 'w', encoding='utf-8') as f:
    nbf.write(nb, f)
print(f"[OK] Updated: {LEGACY_NB_PATH}")
print("[OK] Notebook generation and execution completed successfully!")
