"""
Generates high-resolution academic diagrams and evaluation charts
for AgriSmart AI Project Documentation and Presentation.
"""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'diagrams')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Nature-inspired palette
FOREST_DARK = '#0F2F1F'
FOREST_MID = '#143D28'
AGRI_GREEN = '#2D752D'
AGRI_LIGHT = '#69B069'
EARTH_BROWN = '#8C6D46'
BG_LIGHT = '#F7F9F6'
BORDER_GRAY = '#CBD5E1'
TEXT_DARK = '#0F172A'

def generate_system_architecture():
    fig, ax = plt.subplots(figsize=(12, 7), dpi=300)
    fig.patch.set_facecolor(BG_LIGHT)
    ax.set_facecolor(BG_LIGHT)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Title
    ax.text(6, 6.6, "AgriSmart AI — High-Level System Architecture", 
            ha='center', va='center', fontsize=16, fontweight='bold', color=FOREST_DARK, fontfamily='sans-serif')
    ax.text(6, 6.25, "Modular 4-Tier Web Application & Machine Learning Inference Engine", 
            ha='center', va='center', fontsize=11, color='#475569', fontfamily='sans-serif')

    tiers = [
        {
            "name": "1. Presentation Tier (Client Browser)",
            "sub": "React 19 • Vite • Tailwind CSS • Chart.js",
            "desc": "Responsive UI • 7-Parameter Synchronized Inputs • Live Visualizations • Prediction Result Gauges",
            "y": 4.8, "h": 1.1, "color": "#E6F3E6", "border": AGRI_GREEN
        },
        {
            "name": "2. Application Services Tier (REST API)",
            "sub": "Python 3.12 • Flask Micro-Framework • Flask-CORS",
            "desc": "Endpoints: /api/predict, /api/health, /api/analytics, /api/sample-crops • Input Boundary Validation",
            "y": 3.3, "h": 1.1, "color": "#F1F5F9", "border": "#334155"
        },
        {
            "name": "3. Machine Learning Inference Tier",
            "sub": "TensorFlow 2.21 / Keras • Scikit-Learn 1.9",
            "desc": "StandardScaler (Z-Score Scaling) • 6-Layer Dense Neural Network • Softmax Distribution • LabelEncoder",
            "y": 1.8, "h": 1.1, "color": "#FEF3C7", "border": "#D97706"
        },
        {
            "name": "4. Persistence & Artifacts Tier",
            "sub": "Serialized Artifacts • File-Based Storage",
            "desc": "crop_recommendation_model.keras • scaler.pkl • label_encoder.pkl • Crop_recommendation.csv • prediction_history.json",
            "y": 0.3, "h": 1.1, "color": "#F8FAFC", "border": "#64748B"
        }
    ]

    for t in tiers:
        # Box
        rect = patches.FancyBboxPatch((0.8, t["y"]), 10.4, t["h"],
                                      boxstyle="round,pad=0.1,rounding_size=0.15",
                                      facecolor=t["color"], edgecolor=t["border"], linewidth=2)
        ax.add_patch(rect)

        # Labels
        ax.text(1.2, t["y"] + 0.8, t["name"], fontsize=12, fontweight='bold', color=FOREST_DARK)
        ax.text(1.2, t["y"] + 0.45, t["sub"], fontsize=9.5, fontweight='bold', color=AGRI_GREEN)
        ax.text(1.2, t["y"] + 0.18, t["desc"], fontsize=8.5, color='#334155')

    # Connective arrows
    arrow_props = dict(facecolor=AGRI_GREEN, edgecolor=AGRI_GREEN, width=2, headwidth=7, headlength=6)
    ax.annotate('', xy=(6, 4.45), xytext=(6, 4.75), arrowprops=arrow_props)
    ax.annotate('', xy=(6, 2.95), xytext=(6, 3.25), arrowprops=arrow_props)
    ax.annotate('', xy=(6, 1.45), xytext=(6, 1.75), arrowprops=arrow_props)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, 'system_architecture.png')
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")


def generate_workflow_diagram():
    fig, ax = plt.subplots(figsize=(13, 5), dpi=300)
    fig.patch.set_facecolor(BG_LIGHT)
    ax.set_facecolor(BG_LIGHT)
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 5)
    ax.axis('off')

    # Title
    ax.text(6.5, 4.6, "AgriSmart AI — End-to-End Prediction Workflow", 
            ha='center', va='center', fontsize=15, fontweight='bold', color=FOREST_DARK)

    steps = [
        {"num": "Step 1", "title": "Field Inputs", "sub": "7 Agricultural Features\nN, P, K, Temp,\nHumidity, pH, Rain", "x": 0.5, "w": 2.0, "color": "#DCFCE7", "b": "#16A34A"},
        {"num": "Step 2", "title": "Preprocessing", "sub": "StandardScaler\nZ-score scaling\nz = (x - μ) / σ", "x": 2.9, "w": 2.0, "color": "#DBEAFE", "b": "#2563EB"},
        {"num": "Step 3", "title": "Neural Net", "sub": "Keras Sequential\n6 Layers (Dense+Drop)\nSoftmax Probabilities", "x": 5.3, "w": 2.2, "color": "#FEF3C7", "b": "#D97706"},
        {"num": "Step 4", "title": "Label Decoding", "sub": "LabelEncoder\nArgmax Class Index\n→ Crop Name String", "x": 7.9, "w": 2.0, "color": "#F3E8FF", "b": "#9333EA"},
        {"num": "Step 5", "title": "Recommendation", "sub": "Top-3 Ranked Crops\nConfidence Scores %\nAgronomic Advisory", "x": 10.3, "w": 2.2, "color": "#ECFDF5", "b": "#059669"}
    ]

    for st in steps:
        rect = patches.FancyBboxPatch((st["x"], 1.0), st["w"], 2.8,
                                      boxstyle="round,pad=0.1,rounding_size=0.15",
                                      facecolor=st["color"], edgecolor=st["b"], linewidth=2)
        ax.add_patch(rect)
        ax.text(st["x"] + st["w"]/2, 3.4, st["num"], ha='center', va='center', fontsize=9.5, fontweight='bold', color=st["b"])
        ax.text(st["x"] + st["w"]/2, 3.0, st["title"], ha='center', va='center', fontsize=11, fontweight='bold', color=FOREST_DARK)
        ax.text(st["x"] + st["w"]/2, 2.0, st["sub"], ha='center', va='center', fontsize=8.5, color='#1E293B', linespacing=1.3)

    # Horizontal Arrows
    arrow_props = dict(facecolor=AGRI_GREEN, edgecolor=AGRI_GREEN, width=2, headwidth=6, headlength=6)
    ax.annotate('', xy=(2.85, 2.4), xytext=(2.55, 2.4), arrowprops=arrow_props)
    ax.annotate('', xy=(5.25, 2.4), xytext=(4.95, 2.4), arrowprops=arrow_props)
    ax.annotate('', xy=(7.85, 2.4), xytext=(7.55, 2.4), arrowprops=arrow_props)
    ax.annotate('', xy=(10.25, 2.4), xytext=(9.95, 2.4), arrowprops=arrow_props)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, 'prediction_workflow.png')
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")


def generate_evaluation_chart():
    # Real metrics from model_metrics.txt
    crops = ['apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee', 'cotton',
             'grapes', 'jute', 'kidneybeans', 'lentil', 'maize', 'mango', 'mothbeans',
             'mungbean', 'muskmelon', 'orange', 'papaya', 'pigeonpeas', 'pomegranate',
             'rice', 'watermelon']
    
    precision = [1.00, 1.00, 0.83, 1.00, 1.00, 1.00, 1.00, 1.00, 0.83, 1.00, 1.00, 1.00,
                 1.00, 0.91, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.94, 1.00]
    recall = [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.95, 1.00, 0.75, 1.00,
              1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.95, 1.00, 0.80, 1.00]
    f1 = [1.00, 1.00, 0.91, 1.00, 1.00, 1.00, 1.00, 1.00, 0.88, 1.00, 0.86, 1.00,
          1.00, 0.95, 1.00, 1.00, 1.00, 1.00, 0.97, 1.00, 0.86, 1.00]

    x = np.arange(len(crops))
    width = 0.28

    fig, ax = plt.subplots(figsize=(14, 6), dpi=300)
    fig.patch.set_facecolor(BG_LIGHT)
    ax.set_facecolor('#FFFFFF')

    r1 = ax.bar(x - width, precision, width, label='Precision', color='#2D752D', edgecolor='#133713', linewidth=0.7)
    r2 = ax.bar(x, recall, width, label='Recall', color='#3B82F6', edgecolor='#1D4ED8', linewidth=0.7)
    r3 = ax.bar(x + width, f1, width, label='F1-Score', color='#D97706', edgecolor='#92400E', linewidth=0.7)

    ax.set_ylabel('Score (0.0 to 1.0)', fontsize=11, fontweight='bold', color=FOREST_DARK)
    ax.set_title('AgriSmart AI — Class-Wise Model Evaluation Metrics (440 Test Samples, Overall Accuracy: 97.5%)', 
                 fontsize=13, fontweight='bold', color=FOREST_DARK, pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels([c.capitalize() for c in crops], rotation=45, ha='right', fontsize=9.5, fontweight='bold')
    ax.set_ylim(0.65, 1.05)
    ax.grid(axis='y', linestyle='--', alpha=0.5, color='#CBD5E1')
    ax.legend(loc='lower left', frameon=True, facecolor='#FFFFFF', edgecolor='#CBD5E1', fontsize=10)

    # Add benchmark line at 0.975
    ax.axhline(0.975, color='#DC2626', linestyle=':', linewidth=1.5, label='Test Accuracy (97.5%)')

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, 'model_evaluation_chart.png')
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_path}")

if __name__ == '__main__':
    generate_system_architecture()
    generate_workflow_diagram()
    generate_evaluation_chart()
