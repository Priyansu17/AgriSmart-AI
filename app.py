"""
AgriSmart AI - Intelligent Crop Recommendation System
Flask Backend API connected to the trained Keras Neural Network.
"""

import os
import json
from datetime import datetime
import numpy as np
import pandas as pd
import time
from collections import deque
import requests
import joblib
import tensorflow as tf
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

def load_env_file():
    """Reads key-value pairs from .env in BASE_DIR into os.environ if present."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and not os.environ.get(k):
                            os.environ[k] = v
        except Exception:
            pass

load_env_file()

app = Flask(__name__)
# Enable CORS for development frontend origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'crop_recommendation_model.keras')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
LABEL_ENCODER_PATH = os.path.join(BASE_DIR, 'models', 'label_encoder.pkl')
DATASET_PATH = os.path.join(BASE_DIR, 'data', 'dataset', 'Crop_recommendation.csv')
METRICS_PATH = os.path.join(BASE_DIR, 'results', 'model_metrics.txt')
HISTORY_PATH = os.path.join(BASE_DIR, 'results', 'prediction_history.json')

# Expected feature order
FEATURE_ORDER = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

# Reference bounds for validation
BOUNDS = {
    'N': {'min': 0, 'max': 300, 'unit': 'kg/ha', 'name': 'Nitrogen'},
    'P': {'min': 0, 'max': 300, 'unit': 'kg/ha', 'name': 'Phosphorus'},
    'K': {'min': 0, 'max': 350, 'unit': 'kg/ha', 'name': 'Potassium'},
    'temperature': {'min': -10.0, 'max': 60.0, 'unit': 'Â°C', 'name': 'Temperature'},
    'humidity': {'min': 0.0, 'max': 100.0, 'unit': '%', 'name': 'Relative Humidity'},
    'ph': {'min': 1.0, 'max': 14.0, 'unit': 'pH scale (1-14)', 'name': 'Soil pH'},
    'rainfall': {'min': 0.0, 'max': 1000.0, 'unit': 'mm', 'name': 'Rainfall'}
}

# Crop Knowledge Base
CROP_KNOWLEDGE = {
    "rice": {
        "displayName": "Rice (Oryza sativa)",
        "category": "Cereal Grain / Staple",
        "season": "Kharif (Monsoon / Summer)",
        "harvestTime": "110 - 150 days",
        "soilType": "Clayey, clay loam, heavy alluvium with high water retention",
        "waterNeed": "Heavy (150 - 300 mm monthly rainfall or standing water)",
        "climate": "Warm, sunny, and highly humid tropical/subtropical climate",
        "description": "A primary dietary staple worldwide that thrives under flooded or moist conditions with substantial heat and humidity.",
        "farmerTips": "Ensure 3-5 cm standing water during the tillering and panicle initiation stages. Apply balanced nitrogen split across vegetative phases.",
        "npkProfile": "High Nitrogen demand, moderate Phosphorus and Potassium."
    },
    "maize": {
        "displayName": "Maize / Corn (Zea mays)",
        "category": "Cereal Grain / Fodder",
        "season": "Kharif / Spring / Rabi",
        "harvestTime": "90 - 120 days",
        "soilType": "Well-drained deep loamy and silt loam soils rich in organic matter",
        "waterNeed": "Moderate (60 - 100 mm monthly)",
        "climate": "Warm weather with bright sunny days; highly sensitive to frost",
        "description": "Known as the 'Queen of Cereals', maize possesses exceptional yield potential and serves as food, animal fodder, and industrial feed.",
        "farmerTips": "Extremely susceptible to waterlogging. Build raised beds or proper drainage furrows to protect the root zone.",
        "npkProfile": "Heavy feeder; demands ample Nitrogen and Potassium."
    },
    "chickpea": {
        "displayName": "Chickpea / Bengal Gram (Cicer arietinum)",
        "category": "Pulse / Legume",
        "season": "Rabi (Winter season)",
        "harvestTime": "95 - 120 days",
        "soilType": "Well-aerated sandy loam to clay loam, free from salinity",
        "waterNeed": "Low to moderate (60 - 90 mm); highly drought tolerant",
        "climate": "Cool, dry weather during growth; warm, sunny weather at maturity",
        "description": "A nutrient-rich legume that naturally fixes atmospheric nitrogen, restoring soil fertility while producing protein-packed pulses.",
        "farmerTips": "Avoid excessive irrigation at the flowering stage as it induces vegetative growth at the expense of pod formation.",
        "npkProfile": "Low Nitrogen requirement (fixes atmospheric N), responds well to Phosphorus and Potassium."
    },
    "kidneybeans": {
        "displayName": "Kidney Beans / Rajma (Phaseolus vulgaris)",
        "category": "Pulse / Legume",
        "season": "Spring (plains) / Kharif (hills)",
        "harvestTime": "90 - 130 days",
        "soilType": "Deep, fertile loam rich in organic matter, pH 5.5-6.5",
        "waterNeed": "Moderate (100 - 150 mm)",
        "climate": "Mild tropical to temperate climate; intolerant of extreme heat or frost",
        "description": "Popular, protein-dense legume prized in regional cuisines, requiring fertile, slightly acidic soils and consistent moisture.",
        "farmerTips": "Unlike many pulses, kidney beans possess limited nitrogen-fixing symbiosis; apply supplemental basal nitrogen.",
        "npkProfile": "Moderate to high Nitrogen, moderate Phosphorus, and balanced Potassium."
    },
    "pigeonpeas": {
        "displayName": "Pigeon Pea / Arhar / Tur (Cajanus cajan)",
        "category": "Pulse / Legume",
        "season": "Kharif (June - July planting)",
        "harvestTime": "150 - 240 days",
        "soilType": "Deep, well-drained loamy to black cotton soils",
        "waterNeed": "Moderate (90 - 200 mm); deep taproot provides drought hardiness",
        "climate": "Tropical and subtropical regions with adequate warmth",
        "description": "Major pulse crop in dryland farming systems, providing food, firewood, and exceptional soil enrichment.",
        "farmerTips": "Intercropping with sorghum, maize, or pearl millet maximizes spatial land utilization and economic resilience.",
        "npkProfile": "Low Nitrogen demand; benefits significantly from starter Phosphorus."
    },
    "mothbeans": {
        "displayName": "Moth Bean (Vigna aconitifolia)",
        "category": "Pulse / Legume",
        "season": "Kharif (Monsoon)",
        "harvestTime": "75 - 90 days",
        "soilType": "Sandy to light sandy loam soils, adaptable to poor soils",
        "waterNeed": "Low (30 - 70 mm); exceptional drought and heat tolerance",
        "climate": "Hot, arid and semi-arid desert borderlands",
        "description": "One of the most drought-hardy legumes known, flourishing in sandy soils with minimal rainfall where other crops fail.",
        "farmerTips": "Excellent cover crop that prevents topsoil erosion during fierce desert windstorms.",
        "npkProfile": "Minimal fertilizer inputs required; thrives on residual soil nutrients."
    },
    "mungbean": {
        "displayName": "Mung Bean / Green Gram (Vigna radiata)",
        "category": "Pulse / Legume",
        "season": "Kharif / Summer (Zaid)",
        "harvestTime": "60 - 75 days",
        "soilType": "Well-drained loamy to sandy loam soils",
        "waterNeed": "Low to moderate (40 - 65 mm)",
        "climate": "Warm and humid tropical climate (25Â°C - 35Â°C)",
        "description": "Short-duration, easily digestible pulse that fits effortlessly between major cropping windows in crop rotations.",
        "farmerTips": "Harvest promptly when 80% of pods turn dark brown/black to avoid field pod shattering.",
        "npkProfile": "Low Nitrogen requirement; responds readily to bio-fertilizer Rhizobium seed inoculation."
    },
    "blackgram": {
        "displayName": "Black Gram / Urad (Vigna mungo)",
        "category": "Pulse / Legume",
        "season": "Kharif / Summer",
        "harvestTime": "70 - 90 days",
        "soilType": "Heavy black cotton soils and loam soils with good moisture retention",
        "waterNeed": "Moderate (60 - 80 mm)",
        "climate": "Hot, humid tropical climate with moderate seasonal showers",
        "description": "Nutritious pulse containing high phosphoric acid, essential for diverse culinary preparations and soil nitrogen enrichment.",
        "farmerTips": "Provide one light protective irrigation during the pod-filling phase to maximize seed grain weight.",
        "npkProfile": "Moderate Phosphorus demand for root nodulation; low synthetic Nitrogen."
    },
    "lentil": {
        "displayName": "Lentil / Masoor (Lens culinaris)",
        "category": "Pulse / Legume",
        "season": "Rabi (Winter)",
        "harvestTime": "110 - 130 days",
        "soilType": "Alluvial, light loamy to clay loam soils",
        "waterNeed": "Low to moderate (35 - 55 mm); moderate drought resistance",
        "climate": "Cold winter climate during vegetative growth; dry warm weather at harvest",
        "description": "Ancient, high-protein pulse crop cultivated worldwide for its culinary versatility and low water consumption.",
        "farmerTips": "Thrives on residual moisture after rice harvesting. Keep fields free from broadleaf weeds in early stages.",
        "npkProfile": "Responds well to Phosphorus (P2O5) application at planting time."
    },
    "pomegranate": {
        "displayName": "Pomegranate (Punica granatum)",
        "category": "Horticultural / Fruit",
        "season": "Perennial (Main harvest: Aug - Dec)",
        "harvestTime": "Bearing starts in 2-3 years, fruit matures 5-6 months after bloom",
        "soilType": "Deep, well-drained loamy soil to light alluvial soil",
        "waterNeed": "Moderate (100 - 120 mm); drought tolerant once established",
        "climate": "Semi-arid climate with hot, dry summers and cool winters",
        "description": "Highly remunerative commercial fruit tree renowned for its jewel-like, antioxidant-rich arils and long shelf life.",
        "farmerTips": "Regulate bahar treatment (flowering induction) by withholding water 4-6 weeks prior to target flowering.",
        "npkProfile": "Balanced NPK demand with high Potassium requirement for fruit size and skin color."
    },
    "banana": {
        "displayName": "Banana (Musa acuminata)",
        "category": "Horticultural / Fruit Plantation",
        "season": "Year-round planting in tropical zones",
        "harvestTime": "11 - 14 months",
        "soilType": "Deep, rich, fertile alluvial and volcanic loam with high humus content",
        "waterNeed": "High (90 - 130 mm monthly, regular irrigation essential)",
        "climate": "Warm, humid tropical lowlands with minimal temperature fluctuations",
        "description": "Fast-growing giant herbaceous perennial and the world's most consumed fruit crop, demanding heavy nutrient feeding.",
        "farmerTips": "Provide sturdy bamboo or rope prop support to bearing pseudostems to prevent lodging from heavy bunch weight.",
        "npkProfile": "Extremely high Potassium and Nitrogen consumer; regular fertigation yields optimal bunches."
    },
    "mango": {
        "displayName": "Mango (Mangifera indica)",
        "category": "Horticultural / Tree Fruit",
        "season": "Perennial (Fruit harvest: April - July)",
        "harvestTime": "Bearing from year 4-5 onwards",
        "soilType": "Deep alluvial, red loamy, or well-drained fertile loam (pH 5.5 - 7.5)",
        "waterNeed": "Moderate (80 - 110 mm); drought resistant once deep roots establish",
        "climate": "Warm tropical/subtropical climate with rain-free dry period during bloom",
        "description": "The universally acclaimed 'King of Fruits', cherished for exquisite flavor, rich aroma, and high commercial value.",
        "farmerTips": "Withhold irrigation 2-3 months before flowering to promote floral bud differentiation over vegetative flushes.",
        "npkProfile": "Moderate Nitrogen in youth; elevated Potassium and Micronutrients (Zinc, Boron) during fruit set."
    },
    "grapes": {
        "displayName": "Grapes (Vitis vinifera)",
        "category": "Viticulture / Commercial Fruit",
        "season": "Perennial (Harvest: Feb - April in tropics)",
        "harvestTime": "Pruning-dependent cycle (120 - 140 days post-pruning)",
        "soilType": "Well-drained sandy loam, gravelly, or red sandy loam soils",
        "waterNeed": "Moderate (65 - 80 mm); requires precise drip irrigation management",
        "climate": "Warm, dry sunny summers and mild winters; humid weather promotes downy mildew",
        "description": "High-value berry vine cultivated on trellis or bower systems for fresh table fruit, raisin production, and wine making.",
        "farmerTips": "Adopt systematic foundation and forward pruning schedules. Avoid rain/excess moisture during ripening to prevent berry cracking.",
        "npkProfile": "High Potassium consumer; moderate Nitrogen and Phosphorus."
    },
    "watermelon": {
        "displayName": "Watermelon (Citrullus lanatus)",
        "category": "Cucurbit / Summer Fruit",
        "season": "Zaid / Summer (Feb - March planting)",
        "harvestTime": "80 - 100 days",
        "soilType": "Warm, sandy loam, sandy riverbed alluvium with high aeration",
        "waterNeed": "Moderate (40 - 60 mm); needs steady moisture until fruit ripening",
        "climate": "Hot, dry sunny climate (24Â°C - 35Â°C) with long daylight hours",
        "description": "Refreshing summer fruit with high lycopene and water content, ideally suited for sandy soil beds and river basins.",
        "farmerTips": "Reduce irrigation significantly 10-14 days before harvest to concentrate natural sugars (Brix content).",
        "npkProfile": "Requires high Potassium for sweet, crisp flesh and firm rind development."
    },
    "muskmelon": {
        "displayName": "Muskmelon / Cantaloupe (Cucumis melo)",
        "category": "Cucurbit / Summer Fruit",
        "season": "Summer (January - March)",
        "harvestTime": "75 - 90 days",
        "soilType": "Sandy to light sandy loam, well-drained, fertile soil",
        "waterNeed": "Low to moderate (20 - 35 mm)",
        "climate": "High temperatures and dry atmosphere during fruit ripening",
        "description": "Fragrant sweet melon demanding sunny, dry ripening weather to attain superior aromatic flavor and high sugar levels.",
        "farmerTips": "Avoid overhead watering; furrow or drip irrigation prevents fruit rot and foliar fungal blights.",
        "npkProfile": "Moderate Nitrogen; high Potassium ensures desirable netting and sweetness."
    },
    "apple": {
        "displayName": "Apple (Malus domestica)",
        "category": "Temperate Fruit Tree",
        "season": "Perennial (Harvest: July - October)",
        "harvestTime": "3-5 years to first crop; 130-150 days from petal fall",
        "soilType": "Deep, well-drained loamy soil rich in organic matter (pH 5.5 - 6.5)",
        "waterNeed": "Moderate (100 - 125 mm annual rainfall / regular mountain showers)",
        "climate": "Temperate hill climate with 800 - 1200 winter chilling hours below 7Â°C",
        "description": "Premier temperate commercial tree fruit requiring cool elevations, well-aerated hillside terrain, and chilling hours.",
        "farmerTips": "Plant appropriate pollinizer tree varieties (such as Crabapple or Golden Delicious) at a 1:4 ratio for successful fruit set.",
        "npkProfile": "Balanced NPK regimen with periodic Calcium foliar sprays to prevent bitter pit disorder."
    },
    "orange": {
        "displayName": "Orange / Mandarin (Citrus sinensis / reticulata)",
        "category": "Citrus Fruit",
        "season": "Perennial (Harvest: November - March)",
        "harvestTime": "Bearing begins in 3-4 years; 7-9 months from flowering",
        "soilType": "Deep, well-aerated light loam or sandy loam with no hardpan",
        "waterNeed": "Moderate (100 - 120 mm); sensitive to water stress during fruit set",
        "climate": "Subtropical to tropical climate with moderate winter drop",
        "description": "Evergreen citrus tree bearing fragrant white flowers and succulent, vitamin C-packed golden-orange fruits.",
        "farmerTips": "Ensure soils are free from high salinity or alkaline sodium levels; prevent phytophthora root rot via good drainage.",
        "npkProfile": "Regular supply of Nitrogen, Potassium, and micronutrients (Zinc, Iron, Manganese)."
    },
    "papaya": {
        "displayName": "Papaya (Carica papaya)",
        "category": "Tropical Fruit Herb",
        "season": "Spring / Monsoon planting",
        "harvestTime": "9 - 11 months from transplanting",
        "soilType": "Rich, well-drained sandy loam or alluvial soil (extremely sensitive to stagnant water)",
        "waterNeed": "Moderate to high (140 - 220 mm)",
        "climate": "Warm, humid tropical climate (22Â°C - 35Â°C); killed by freezing frost",
        "description": "Fast-growing, highly remunerative herbaceous plant producing luscious, enzyme-rich (papain) fruits within a year.",
        "farmerTips": "Water stagnation for even 24-48 hours causes collar rot and fatal plant death. Plant on raised mounds.",
        "npkProfile": "Heavy feeder; requires monthly small doses of balanced NPK."
    },
    "coconut": {
        "displayName": "Coconut Palm (Cocos nucifera)",
        "category": "Plantation / Oil Palm",
        "season": "Year-round planting in coastal humid tropics",
        "harvestTime": "Bearing starts in 5-6 years, yields bunches every 30-45 days",
        "soilType": "Coastal sand, alluvial, red sandy loam, or laterite with good water table",
        "waterNeed": "Moderate to high (130 - 230 mm monthly or constant underground water)",
        "climate": "Equatorial warm humid climate with strong ocean breezes and abundant sunlight",
        "description": "The revered 'Tree of Life' (Kalpavriksha) supplying tender water, edible copra, coconut oil, coir fiber, and building thatch.",
        "farmerTips": "Apply common salt (NaCl) in addition to Potassium chloride in inland non-coastal locations to promote vigorous frond growth.",
        "npkProfile": "Exceptionally high Chlorine and Potassium demand; moderate Nitrogen."
    },
    "cotton": {
        "displayName": "Cotton (Gossypium hirsutum)",
        "category": "Commercial Fiber Crop",
        "season": "Kharif (April - May planting)",
        "harvestTime": "150 - 180 days",
        "soilType": "Deep black cotton soils (regur) with high water retention capacity",
        "waterNeed": "Moderate (60 - 90 mm); requires dry, warm weather during boll bursting",
        "climate": "Warm tropical/subtropical climate with 180-200 frost-free days and bright sunshine",
        "description": "The 'White Gold' of commercial agriculture, providing the fundamental natural raw material for the worldwide textile industry.",
        "farmerTips": "Avoid excessive irrigation or nitrogen during late maturity to prevent excessive vegetative leaf growth and boll dropping.",
        "npkProfile": "Balanced NPK; adequate Phosphorus promotes early maturity and deep rooting."
    },
    "jute": {
        "displayName": "Jute (Corchorus olitorius / capsularis)",
        "category": "Commercial Bast Fiber",
        "season": "Pre-Kharif (March - May)",
        "harvestTime": "110 - 130 days",
        "soilType": "Fertile new alluvial silt loam, deltaic soil",
        "waterNeed": "High (150 - 200 mm); thrives in humid river delta regions",
        "climate": "Hot and humid tropical climate with frequent monsoon showers (70% - 90% humidity)",
        "description": "The premier 'Golden Fiber' plant, producing durable, 100% biodegradable, eco-friendly bast fibers used for sacking, twine, and hessian.",
        "farmerTips": "Harvest at the early small-pod stage to achieve optimal balance between high fiber strength and fine silky texture.",
        "npkProfile": "High Nitrogen demand for vegetative stem elongation; moderate Potassium and Phosphorus."
    },
    "coffee": {
        "displayName": "Coffee (Coffea arabica / canephora)",
        "category": "Plantation / Beverage Crop",
        "season": "Perennial (Harvest: November - February)",
        "harvestTime": "3-4 years to first harvest; 8-9 months from blossom to ripe cherry",
        "soilType": "Deep, porous, virgin forest loam rich in humus and organic litter (pH 6.0 - 6.8)",
        "waterNeed": "High (130 - 180 mm annual distribution with a dry blossom shower period)",
        "climate": "Mild, humid tropical hill climate (15Â°C - 28Â°C) grown under a two-tier shade canopy",
        "description": "World's most cherished aromatic plantation beverage crop, thriving under cool, filtered shade on tropical highland slopes.",
        "farmerTips": "Provide uniform shade trees (such as Silver Oak and Albizia) to buffer leaf scorching and temperature swings.",
        "npkProfile": "High Potassium for bean filling and density; moderate split Nitrogen applications."
    }
}

# Load artifacts into memory
try:
    print(f"Loading scaler from {SCALER_PATH}...")
    scaler = joblib.load(SCALER_PATH)
    print("Scaler loaded successfully.")
except Exception as e:
    print(f"Error loading scaler: {e}")
    scaler = None

try:
    print(f"Loading label encoder from {LABEL_ENCODER_PATH}...")
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    classes_list = list(label_encoder.classes_)
    print(f"Label encoder loaded. Number of classes: {len(classes_list)}")
except Exception as e:
    print(f"Error loading label encoder: {e}")
    label_encoder = None
    classes_list = []

try:
    print(f"Loading Keras model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Keras model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Pre-calculate dataset summary and crop averages
dataset_stats = {}
crop_averages = []
sample_crops_list = []

try:
    if os.path.exists(DATASET_PATH):
        df_data = pd.read_csv(DATASET_PATH)
        total_samples = len(df_data)
        
        # Overall numerical stats
        desc = df_data.describe().to_dict()
        stats_clean = {}
        for col in FEATURE_ORDER:
            if col in desc:
                stats_clean[col] = {
                    'mean': round(float(desc[col]['mean']), 2),
                    'std': round(float(desc[col]['std']), 2),
                    'min': round(float(desc[col]['min']), 2),
                    '25%': round(float(desc[col]['25%']), 2),
                    '50%': round(float(desc[col]['50%']), 2),
                    '75%': round(float(desc[col]['75%']), 2),
                    'max': round(float(desc[col]['max']), 2)
                }

        # Crop-wise mean requirements
        grouped = df_data.groupby('label')[FEATURE_ORDER].mean().round(2)
        for crop_name, row in grouped.iterrows():
            crop_averages.append({
                'crop': crop_name,
                'N': float(row['N']),
                'P': float(row['P']),
                'K': float(row['K']),
                'temperature': float(row['temperature']),
                'humidity': float(row['humidity']),
                'ph': float(row['ph']),
                'rainfall': float(row['rainfall'])
            })

        # Class distribution
        class_counts = df_data['label'].value_counts().to_dict()

        dataset_stats = {
            'total_samples': total_samples,
            'features_count': len(FEATURE_ORDER),
            'classes_count': len(class_counts),
            'total_classes': len(class_counts),
            'feature_stats': stats_clean,
            'class_distribution': class_counts,
            'class_counts': class_counts,
            'crop_averages': crop_averages
        }

        # Pre-select realistic sample crop profiles for quick-fill in the UI
        sample_crops_names = ['rice', 'maize', 'chickpea', 'coffee', 'cotton', 'apple', 'watermelon', 'banana', 'jute']
        for sc in sample_crops_names:
            sc_rows = df_data[df_data['label'] == sc]
            if len(sc_rows) > 0:
                sample_row = sc_rows.iloc[0]
                sample_crops_list.append({
                    'crop': sc,
                    'displayName': sc.capitalize(),
                    'N': round(float(sample_row['N']), 1),
                    'P': round(float(sample_row['P']), 1),
                    'K': round(float(sample_row['K']), 1),
                    'temperature': round(float(sample_row['temperature']), 1),
                    'humidity': round(float(sample_row['humidity']), 1),
                    'ph': round(float(sample_row['ph']), 1),
                    'rainfall': round(float(sample_row['rainfall']), 1)
                })

except Exception as e:
    print(f"Warning: Could not process dataset file: {e}")

# Parse test metrics from model_metrics.txt
model_metrics = {
    'test_loss': 0.0563,
    'test_accuracy': 97.5,
    'accuracy_decimal': 0.9750,
    'macro_f1': 0.97,
    'weighted_f1': 0.97
}

try:
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if 'Test Loss:' in line:
                    model_metrics['test_loss'] = float(line.split(':')[1].strip())
                elif 'Test Accuracy:' in line:
                    raw_acc = line.split(':')[1].strip().replace('%', '')
                    acc_val = float(raw_acc)
                    if acc_val <= 1.0:
                        model_metrics['test_accuracy'] = round(acc_val * 100, 2)
                        model_metrics['accuracy_decimal'] = acc_val
                    else:
                        model_metrics['test_accuracy'] = round(acc_val, 2)
                        model_metrics['accuracy_decimal'] = round(acc_val / 100, 4)
except Exception as e:
    print(f"Warning: Could not read metrics file: {e}")

# Environment flag: True if running on Render cloud, False on localhost/Cloudflare
IS_RENDER = os.environ.get('RENDER') == 'true' or bool(os.environ.get('RENDER_SERVICE_ID'))

# Pre-load neural network weights for Render cloud optimization (instant <1ms inference)
NUMPY_WEIGHTS = None
WEIGHTS_FILE = os.path.join(BASE_DIR, 'models', 'model_weights.npz')
if os.path.exists(WEIGHTS_FILE):
    try:
        _w_data = np.load(WEIGHTS_FILE)
        NUMPY_WEIGHTS = [_w_data[k] for k in _w_data.files]
        print(f"NumPy inference weights loaded for cloud inference ({len(NUMPY_WEIGHTS)} arrays).")
    except Exception as _e:
        print(f"Notice: NumPy weights could not be loaded: {_e}")

def run_prediction_inference(x_scaled):
    """
    Conditional inference engine:
    - If running on Render: Uses ultra-lightweight NumPy forward pass from identical weights.
      Eliminates TensorFlow thread-locking, C++ overhead, and 30-60s freezing on Render's 0.1 CPU tier.
    - If running on Localhost or Cloudflare tunnel: Uses original TensorFlow model.predict directly
      without any changes.
    """
    global NUMPY_WEIGHTS
    if IS_RENDER:
        if NUMPY_WEIGHTS is None and model is not None:
            try:
                NUMPY_WEIGHTS = model.get_weights()
            except Exception:
                pass
        if NUMPY_WEIGHTS and len(NUMPY_WEIGHTS) == 8:
            W1, b1, W2, b2, W3, b3, W4, b4 = NUMPY_WEIGHTS
            z1 = np.maximum(0, x_scaled @ W1 + b1)
            z2 = np.maximum(0, z1 @ W2 + b2)
            z3 = np.maximum(0, z2 @ W3 + b3)
            z4 = z3 @ W4 + b4
            e = np.exp(z4 - np.max(z4, axis=-1, keepdims=True))
            return e / np.sum(e, axis=-1, keepdims=True)

    # Standard Localhost / Cloudflare tunnel execution via TensorFlow model.predict
    return model.predict(x_scaled, verbose=0)



def load_history():
    """Loads prediction history from JSON storage file."""
    if os.path.exists(HISTORY_PATH):
        try:
            with open(HISTORY_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_history(history_list):
    """Saves prediction history list to JSON file."""
    try:
        os.makedirs(os.path.dirname(HISTORY_PATH), exist_ok=True)
        with open(HISTORY_PATH, 'w', encoding='utf-8') as f:
            json.dump(history_list[:50], f, indent=2)  # Keep last 50
    except Exception as e:
        print(f"Error saving history: {e}")


def evaluate_parameter_status(val, col):
    """Returns a visual status badge for an input parameter."""
    if col not in dataset_stats.get('feature_stats', {}):
        return 'Normal'
    stats = dataset_stats['feature_stats'][col]
    mean = stats['mean']
    std = stats['std']
    if val < mean - std:
        return 'Below Average'
    elif val > mean + std:
        return 'Above Average'
    return 'Optimal Range'


# ==========================================================
# API ROUTES
# ==========================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint providing model and API readiness status."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'label_encoder_loaded': label_encoder is not None,
        'total_classes': len(classes_list),
        'accuracy_percent': model_metrics['test_accuracy'],
        'test_loss': model_metrics['test_loss'],
        'architecture': 'Neural Network (Keras Sequential)',
        'supported_crops': classes_list
    }), 200


@app.route('/api/predict', methods=['POST'])
@app.route('/predict', methods=['POST'])
def predict_crop():
    """
    Main prediction endpoint.
    Accepts JSON with N, P, K, temperature, humidity, ph, rainfall.
    Runs standardized values through loaded Keras model.
    Returns predicted crop, real confidence, and top-3 ranked recommendations.
    """
    if model is None or scaler is None or label_encoder is None:
        return jsonify({
            'error': 'Model or preprocessing pipeline is not initialized on the server.'
        }), 503

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            'error': 'Invalid request payload. Please send a valid JSON object with the 7 required agricultural features.'
        }), 400

    # 1. Validation: check for missing fields
    missing_fields = []
    for field in FEATURE_ORDER:
        if field not in data or data[field] is None:
            missing_fields.append(field)

    if missing_fields:
        return jsonify({
            'error': f"Missing required parameters: {', '.join(missing_fields)}.",
            'required_fields': FEATURE_ORDER
        }), 422

    # 2. Validation: convert to numeric and check boundaries
    features_numeric = []
    input_summary = []

    for field in FEATURE_ORDER:
        val_raw = data[field]
        try:
            val = float(val_raw)
        except (ValueError, TypeError):
            return jsonify({
                'error': f"Parameter '{field}' must be a valid number. Received: {val_raw}."
            }), 422

        bound = BOUNDS[field]
        if val < bound['min'] or val > bound['max']:
            return jsonify({
                'error': f"Value for '{bound['name']}' ({val} {bound['unit']}) is outside the acceptable realistic agronomic range of {bound['min']} to {bound['max']} {bound['unit']}."
            }), 422

        features_numeric.append(val)
        input_summary.append({
            'key': field,
            'name': bound['name'],
            'value': round(val, 2),
            'unit': bound['unit'],
            'status': evaluate_parameter_status(val, field)
        })

    try:
        # 3. Exact order: N, P, K, temperature, humidity, ph, rainfall
        df_input = pd.DataFrame([features_numeric], columns=FEATURE_ORDER)

        # 4. Apply existing trained scaler
        input_scaled = scaler.transform(df_input)

        # 5. Run inference on loaded Keras model
        probabilities = run_prediction_inference(input_scaled)[0]

        # 6. Rank all predictions
        sorted_indices = np.argsort(probabilities)[::-1]
        top_index = int(sorted_indices[0])
        predicted_crop = str(classes_list[top_index])
        top_confidence = round(float(probabilities[top_index]) * 100, 2)

        # Build top 3 recommendations
        top_3 = []
        for rank, idx in enumerate(sorted_indices[:3], start=1):
            crop_name = str(classes_list[idx])
            conf = round(float(probabilities[idx]) * 100, 2)
            top_3.append({
                'rank': rank,
                'crop': crop_name,
                'confidence': conf,
                'category': CROP_KNOWLEDGE.get(crop_name, {}).get('category', 'Crop'),
                'displayName': CROP_KNOWLEDGE.get(crop_name, {}).get('displayName', crop_name.capitalize())
            })

        # Full probability distribution for charts
        all_probs = []
        for idx in sorted_indices:
            crop_name = str(classes_list[idx])
            all_probs.append({
                'crop': crop_name,
                'displayName': crop_name.capitalize(),
                'confidence': round(float(probabilities[idx]) * 100, 3)
            })

        # Crop knowledge details
        crop_details = CROP_KNOWLEDGE.get(predicted_crop, {
            'displayName': predicted_crop.capitalize(),
            'category': 'Crop',
            'season': 'Standard growing season',
            'harvestTime': 'Varies by cultivar',
            'soilType': 'Loamy, well-drained soil',
            'waterNeed': 'Moderate',
            'climate': 'Temperate / Tropical',
            'description': f'Suitable for cultivation under the submitted agricultural and climate conditions.',
            'farmerTips': 'Follow recommended local agricultural extension guidelines for optimal seeding and fertilization.',
            'npkProfile': 'Balanced nutrient requirements.'
        })

        prediction_result = {
            'predicted_crop': predicted_crop,
            'confidence': top_confidence,
            'top_3': top_3,
            'all_probabilities': all_probs,
            'input_summary': input_summary,
            'crop_info': crop_details,
            'disclaimer': 'Model predictions reflect statistical class probabilities based on empirical machine learning data and should be verified alongside on-ground soil lab tests and local extension officer advice.',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        # Save to history file
        history = load_history()
        history_item = {
            'id': int(datetime.now().timestamp() * 1000),
            'timestamp': prediction_result['timestamp'],
            'predicted_crop': predicted_crop,
            'confidence': top_confidence,
            'top_3': [
                {'rank': t['rank'], 'crop': t['crop'], 'confidence': t['confidence']}
                for t in top_3
            ],
            'inputs': {field: round(features_numeric[i], 1) for i, field in enumerate(FEATURE_ORDER)}
        }
        history.insert(0, history_item)
        save_history(history)

        return jsonify(prediction_result), 200

    except Exception as e:
        return jsonify({
            'error': f'Prediction execution failed: {str(e)}'
        }), 500


@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Returns dataset distributions, feature statistics, and model benchmarks."""
    return jsonify({
        'dataset': dataset_stats,
        'dataset_summary': dataset_stats,
        'metrics': model_metrics,
        'model_metrics': model_metrics,
        'classes': classes_list,
        'crop_averages': crop_averages,
        'feature_order': FEATURE_ORDER
    }), 200


@app.route('/api/sample-crops', methods=['GET'])
def get_sample_crops():
    """Returns preset soil & weather profiles for quick-fill testing in the UI."""
    return jsonify({
        'samples': sample_crops_list
    }), 200


@app.route('/api/history', methods=['GET'])
def get_history():
    """Returns recent prediction history."""
    history = load_history()
    return jsonify({'history': history}), 200


@app.route('/api/history', methods=['DELETE'])
def clear_history():
    """Clears prediction history."""
    save_history([])
    return jsonify({'message': 'Prediction history cleared successfully.'}), 200


def extract_parameters_from_text(text):
    """Attempts to extract the 7 agricultural parameters from a natural language string."""
    import re
    params = {}
    
    n_match = re.search(r'\b(?:N|nitrogen|à¤¨à¤¤à¥à¤°à¤œà¤¨|à¤¨à¤¾à¤‡à¤Ÿà¥à¤°à¥‹à¤œà¤¨)\s*[:=]?\s*(\d+(?:\.\d+)?)', text, re.I)
    p_match = re.search(r'\b(?:P|phosphorus|à¤«à¤¾à¤¸à¥à¤«à¥‹à¤°à¤¸)\s*[:=]?\s*(\d+(?:\.\d+)?)', text, re.I)
    k_match = re.search(r'\b(?:K|potassium|potash|à¤ªà¥‹à¤Ÿà¤¾à¤¶)\s*[:=]?\s*(\d+(?:\.\d+)?)', text, re.I)
    temp_match = re.search(r'\b(?:temp(?:erature)?|à¤¤à¤¾à¤ªà¤®à¤¾à¤¨)\s*[:=]?\s*(\d+(?:\.\d+)?)', text, re.I)
    hum_match = re.search(r'\b(?:hum(?:idity)?|à¤†à¤°à¥à¤¦à¥à¤°à¤¤à¤¾|à¤¨à¤®à¥€)\s*[:=]?\s*(\d+(?:\.\d+)?)', text, re.I)
    ph_match = re.search(r'\b(?:ph|à¤ªà¥€à¤à¤š)\s*[:=]?\s*(\d+(?:\.\d+)?)', text, re.I)
    rain_match = re.search(r'\b(?:rain(?:fall)?|à¤µà¤°à¥à¤·à¤¾|à¤¬à¤¾à¤°à¤¿à¤¶)\s*[:=]?\s*(\d+(?:\.\d+)?)', text, re.I)

    if n_match: params['N'] = float(n_match.group(1))
    if p_match: params['P'] = float(p_match.group(1))
    if k_match: params['K'] = float(k_match.group(1))
    if temp_match: params['temperature'] = float(temp_match.group(1))
    if hum_match: params['humidity'] = float(hum_match.group(1))
    if ph_match: params['ph'] = float(ph_match.group(1))
    if rain_match: params['rainfall'] = float(rain_match.group(1))

    return params


class GeminiQuotaGuard:
    """
    Guarantees the Gemini API free quota is NEVER exhausted.
    - Limits to 8 requests per minute (sliding window)
    - Limits to 500 requests per calendar day (well below 1,500 daily free limit)
    - In-memory response cache for repeat queries (0 API calls, 0 token waste)
    - Seamless silent fallback to local agronomy engine on limit, 429, or timeout
    """
    def __init__(self, max_rpm=8, max_rpd=500):
        self.max_rpm = max_rpm
        self.max_rpd = max_rpd
        self.minute_window = deque()
        self.daily_count = 0
        self.last_day = time.strftime('%Y-%m-%d')
        self.cache = {}
        self.max_cache_size = 250

    def is_allowed(self):
        now = time.time()
        today = time.strftime('%Y-%m-%d')
        if today != self.last_day:
            self.daily_count = 0
            self.last_day = today

        if self.daily_count >= self.max_rpd:
            return False, "Daily safety quota reached"

        while self.minute_window and now - self.minute_window[0] > 60:
            self.minute_window.popleft()

        if len(self.minute_window) >= self.max_rpm:
            return False, "Minute rate throttle"

        return True, "OK"

    def record_call(self):
        self.daily_count += 1
        self.minute_window.append(time.time())

    def get_cached(self, query):
        clean_q = query.strip().lower()
        return self.cache.get(clean_q)

    def set_cached(self, query, response_dict):
        clean_q = query.strip().lower()
        if len(self.cache) >= self.max_cache_size:
            try:
                first_key = next(iter(self.cache))
                del self.cache[first_key]
            except Exception:
                pass
        self.cache[clean_q] = response_dict

quota_guard = GeminiQuotaGuard(max_rpm=8, max_rpd=500)


def call_gemini_llm(user_msg, language='en', history=None, custom_api_key=None):
    """
    Calls Google Gemini Flash API with strict quota and rate-limit guard.
    Dynamically loads API key from .env if available, with robust multi-model fallback.
    """
    api_key = custom_api_key or os.environ.get('GEMINI_API_KEY')
    if not api_key:
        env_file = os.path.join(BASE_DIR, '.env')
        if os.path.exists(env_file):
            try:
                with open(env_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.strip().startswith('GEMINI_API_KEY='):
                            api_key = line.strip().split('=', 1)[1].strip()
                            if api_key:
                                os.environ['GEMINI_API_KEY'] = api_key
                            break
            except Exception as e:
                print("Error reading .env:", e)

    if not api_key or len(api_key.strip()) < 10:
        return None

    # Check cache first (0 tokens, 0ms latency)
    cached = quota_guard.get_cached(user_msg)
    if cached:
        return cached

    # Check sliding window rate limit & daily budget
    allowed, reason = quota_guard.is_allowed()
    if not allowed:
        print(f"[GeminiQuotaGuard] Safeguard active ({reason}). Falling back to local engine.")
        return None

    contents = []
    if history and isinstance(history, list):
        for h in history[-4:]:
            role = 'model' if h.get('sender') == 'bot' else 'user'
            text = (h.get('text') or '').strip()
            if text:
                contents.append({'role': role, 'parts': [{'text': text[:250]}]})

    contents.append({'role': 'user', 'parts': [{'text': user_msg}]})

    system_instruction = (
        "You are AgriBot, the warm, knowledgeable, and conversational AI Farm Specialist for AgriSmart AI.\n"
        "You help farmers, students, and agronomists across India with soil testing, crop recommendations, fertilizer calculations, and pest control.\n"
        "GUIDELINES:\n"
        "1. Speak naturally and warmly in the user's language (Hindi, Hinglish, or English). Never sound stiff, robotic, or like an official bulletin.\n"
        "2. If greeted (e.g. 'Salamwalekum', 'Namaste', 'Hello', 'Sat Sri Akal'), reply warmly and respectfully in the appropriate cultural greeting (e.g. 'Walekum Assalam kisan bhai!').\n"
        "3. Keep responses conversational and concise (2 to 3 short paragraphs maximum). Avoid overwhelming walls of text.\n"
        "4. Supported 22 crops in AgriSmart AI: Rice, Maize, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee.\n"
        "5. For fertilizers, specify practical commercial formulations: Urea (46% N), DAP (18-46-0), and MOP (60% K2O) with stage-wise application.\n"
        "6. For pests, recommend safe Integrated Pest Management (IPM), neem oil, and standard remedies.\n"
        "7. Always end with a helpful, friendly follow-up question."
    )

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
            "topP": 0.95
        }
    }

    candidate_models = [
        'gemini-3-flash-preview',
        'gemini-3.5-flash',
        'gemini-3.1-pro-preview',
        'gemini-flash-latest'
    ]

    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key.strip()}"
        try:
            resp = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=15)
            if resp.status_code == 200:
                quota_guard.record_call()
                res_data = resp.json()
                candidates = res_data.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    bot_text = "\n".join([p.get('text', '').strip() for p in parts if p.get('text')]).strip()
                    finish_reason = candidates[0].get('finishReason', 'STOP')
                    
                    if bot_text:
                        actions = []
                        combined_lower = (user_msg + " " + bot_text).lower()
                        for crop in ['rice', 'cotton', 'maize', 'chickpea', 'coffee', 'banana', 'grapes', 'watermelon', 'wheat']:
                            if crop in combined_lower:
                                actions.append({
                                    'type': 'load_crop_sample',
                                    'label': f"ðŸŒ¾ Fill {crop.capitalize()} Sample",
                                    'crop': crop
                                })
                                break

                        if any(w in combined_lower for w in ['weather', 'mausam', 'barish', 'rainfall', 'temperature']):
                            actions.append({'type': 'trigger_weather_detect', 'label': 'ðŸ“ Detect Local Weather', 'payload': True})

                        result = {
                            'text': bot_text,
                            'tags': ['Gemini 3.5 Flash', f"Quota: {quota_guard.daily_count}/{quota_guard.max_rpd}"],
                            'actions': actions
                        }
                        if finish_reason != 'MAX_TOKENS' and len(bot_text) > 30:
                            quota_guard.set_cached(user_msg, result)
                        return result
            elif resp.status_code == 429:
                print(f"[Gemini API - {model_name}] 429 Rate Limited. Trying next candidate model...")
                continue
            else:
                print(f"[Gemini API - {model_name}] Error {resp.status_code}: {resp.text[:120]}")
                continue
        except Exception as e:
            print(f"[Gemini API - {model_name}] Request exception: {e}. Trying next candidate...")
            continue

    print("[Gemini API] All online candidate models failed or timed out. Falling back to local engine.")
    return None


@app.route('/api/gemini/status', methods=['GET', 'POST'])
def gemini_status():
    """Returns Gemini configuration status, quota guard stats, and allows setting the key."""
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        new_key = (data.get('api_key') or '').strip()
        if new_key:
            os.environ['GEMINI_API_KEY'] = new_key
            # Save to .env
            env_path = os.path.join(BASE_DIR, '.env')
            try:
                with open(env_path, 'w', encoding='utf-8') as f:
                    f.write(f"# AgriSmart AI Environment Configuration\nGEMINI_API_KEY={new_key}\n")
            except Exception as e:
                print("Could not persist to .env:", e)

            return jsonify({
                'success': True,
                'message': 'Gemini API Key configured and active with Quota Guard!',
                'configured': True
            }), 200

    has_key = bool(os.environ.get('GEMINI_API_KEY') and len(os.environ['GEMINI_API_KEY'].strip()) > 10)
    return jsonify({
        'configured': has_key,
        'daily_used': quota_guard.daily_count,
        'daily_cap': quota_guard.max_rpd,
        'rpm_limit': quota_guard.max_rpm,
        'cached_queries': len(quota_guard.cache)
    }), 200


@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """
    Intelligent Agricultural Chatbot & Voice Assistant Endpoint.
    Connects with the trained Keras model, 22 crop agronomic encyclopedia,
    pest & disease diagnostics, fertilizer dosing calculations, and app actions.
    """
    data = request.get_json(silent=True) or {}
    user_msg = (data.get('message') or '').strip()
    language = data.get('language', 'en')

    if not user_msg:
        return jsonify({
            'text': "Namaste! I'm AgriBot ðŸŒ¾. How can I assist your farm today?",
            'tags': ['AgriBot'],
            'actions': []
        }), 200

    query = user_msg.lower()

    # 1. Check for Soil Parameters in message -> Run in-chat AI inference!
    extracted_params = extract_parameters_from_text(user_msg)
    if len(extracted_params) >= 4 and model is not None and scaler is not None:
        # Fill defaults for any missing features
        eval_features = {
            'N': extracted_params.get('N', 90.0),
            'P': extracted_params.get('P', 42.0),
            'K': extracted_params.get('K', 43.0),
            'temperature': extracted_params.get('temperature', 25.0),
            'humidity': extracted_params.get('humidity', 75.0),
            'ph': extracted_params.get('ph', 6.5),
            'rainfall': extracted_params.get('rainfall', 100.0)
        }
        
        try:
            input_vector = [eval_features[f] for f in FEATURE_ORDER]
            features_scaled = scaler.transform([input_vector])
            probabilities = run_prediction_inference(features_scaled)[0]
            top_idx = int(np.argmax(probabilities))
            predicted_crop = label_encoder.inverse_transform([top_idx])[0]
            conf = round(float(probabilities[top_idx]) * 100, 2)
            
            top_3_indices = np.argsort(probabilities)[::-1][:3]
            top_3 = [
                f"{label_encoder.inverse_transform([idx])[0].capitalize()} ({round(float(probabilities[idx]) * 100, 1)}%)"
                for idx in top_3_indices
            ]
            crop_meta = CROP_KNOWLEDGE.get(predicted_crop, {})

            reply = (
                f"ðŸŽ¯ **Instant AI Prediction from your Soil Parameters:**\n\n"
                f"â€¢ **Recommended Primary Crop:** **{crop_meta.get('displayName', predicted_crop.capitalize())}**\n"
                f"â€¢ **Statistical Model Confidence:** **{conf}%**\n"
                f"â€¢ **Top 3 Candidate Crops:** {', '.join(top_3)}\n"
                f"â€¢ **Key Agronomic Profile:** {crop_meta.get('description', '')}\n"
                f"â€¢ **Harvest Duration:** {crop_meta.get('harvestTime', 'N/A')} | **Water Requirement:** {crop_meta.get('waterNeed', 'N/A')}\n\n"
                f"ðŸ’¡ *Would you like to load these parameters into the main form and run a full economic breakdown?*"
            )
            return jsonify({
                'text': reply,
                'tags': ['Live Prediction', predicted_crop.capitalize(), f"{conf}% Match"],
                'actions': [
                    {
                        'type': 'load_parameters',
                        'label': f"ðŸŒ¾ Fill Form with these {len(extracted_params)} Values",
                        'payload': eval_features
                    },
                    {
                        'type': 'navigate_tab',
                        'label': 'ðŸ“Š View Crop Economics',
                        'payload': 'analytics'
                    }
                ]
            }), 200
        except Exception as e:
            pass

    # 2. Try Google Gemini Flash Lite LLM with QuotaGuard protection
    gemini_key = data.get('gemini_api_key') or request.headers.get('X-Gemini-Key')
    gemini_result = call_gemini_llm(user_msg, language=language, history=data.get('history'), custom_api_key=gemini_key)
    if gemini_result:
        return jsonify(gemini_result), 200

    # 3. Local Agronomic Engine (Zero quota cost, offline fallback)
    # 3a. Pest & Disease Diagnostics
    pest_disease_keywords = [
        'pest', 'disease', 'insect', 'fungus', 'bollworm', 'blast', 'rust', 'armyworm', 
        'aphid', 'whitefly', 'blight', 'termite', 'wilt', 'mildew', 'à¤•à¥€à¤¡à¤¼à¤¾', 'à¤°à¥‹à¤—', 'à¤¸à¥à¤‚à¤¡à¥€', 'à¤¦à¥€à¤®à¤•', 'à¤«à¤«à¥‚à¤‚à¤¦', 'à¤¬à¥à¤²à¤¾à¤¸à¥à¤Ÿ'
    ]
    if any(k in query for k in pest_disease_keywords):
        if 'cotton' in query or 'bollworm' in query or 'à¤•à¤ªà¤¾à¤¸' in query:
            return jsonify({
                'text': (
                    "ðŸ› **Cotton Pest Diagnostic: Pink Bollworm (à¤—à¥à¤²à¤¾à¤¬à¥€ à¤¸à¥à¤‚à¤¡à¥€)**\n\n"
                    "â€¢ **Symptoms:** Rosetted flowers, small exit holes on developing bolls, stained lint, premature boll dropping.\n"
                    "â€¢ **Chemical Control:** Spray **Emamectin Benzoate 5% SG** @ 0.5 g/L or **Chlorantraniliprole 18.5% SC** @ 0.3 ml/L.\n"
                    "â€¢ **Organic / Biological Control:** Install **Pheromone Traps** (5-8 traps/acre) with Gossyplure lures. Spray **Neem Oil 1500 ppm** @ 3 ml/L during squaring stage.\n"
                    "â€¢ **Preventive Measure:** Avoid cultivating ratoon cotton; destroy crop residues after final picking."
                ),
                'tags': ['Pest Control', 'Cotton', 'Pink Bollworm'],
                'actions': [{'type': 'load_crop_sample', 'label': 'ðŸŒ¾ View Cotton Profile', 'crop': 'cotton'}]
            }), 200

        if 'rice' in query or 'blast' in query or 'à¤§à¤¾à¤¨' in query or 'à¤¬à¥à¤²à¤¾à¤¸à¥à¤Ÿ' in query:
            return jsonify({
                'text': (
                    "ðŸ„ **Rice Disease Diagnostic: Blast Disease (à¤§à¤¾à¤¨ à¤•à¤¾ à¤¬à¥à¤²à¤¾à¤¸à¥à¤Ÿ / à¤à¥à¤²à¤¸à¤¾)**\n\n"
                    "â€¢ **Symptoms:** Spindle-shaped lesions with grey centers and brownish-red margins on leaves and neck rot at panicle emergence.\n"
                    "â€¢ **Chemical Remedy:** Spray **Tricyclazole 75% WP** @ 0.6 g/L or **Isoprothiolane 40% EC** @ 1.5 ml/L.\n"
                    "â€¢ **Organic Measure:** Spray **Pseudomonas fluorescens** @ 5 g/L or fermented buttermilk spray (à¤–à¤Ÿà¥à¤Ÿà¥€ à¤›à¤¾à¤›).\n"
                    "â€¢ **Agronomic Advice:** Avoid excessive basal nitrogen dosing in humid weather as excess vegetative nitrogen accelerates blast spore germination."
                ),
                'tags': ['Rice Blast', 'Fungicide', 'Crop Health'],
                'actions': [{'type': 'load_crop_sample', 'label': 'ðŸŒ¾ View Rice Profile', 'crop': 'rice'}]
            }), 200

        if 'rust' in query or 'wheat' in query or 'à¤—à¥‡à¤¹à¥‚à¤‚' in query or 'à¤°à¤¤à¥à¤†' in query:
            return jsonify({
                'text': (
                    "ðŸŒ¾ **Wheat Disease Diagnostic: Yellow / Stripe Rust (à¤ªà¥€à¤²à¤¾ à¤°à¤¤à¥à¤†)**\n\n"
                    "â€¢ **Symptoms:** Yellow pustules arranged in linear stripes along the leaf blades, yellow powdery dust on fingers when touched.\n"
                    "â€¢ **Chemical Remedy:** Immediate foliar spray of **Propiconazole 25% EC (Tilt)** @ 1.0 ml/L or **Tebuconazole 25.9% EC** @ 1.2 ml/L.\n"
                    "â€¢ **Preventive Action:** Grow rust-resistant varieties (HD-2967, PBW-550, DBW-187). Inspect northern border rows weekly during cold foggy January days."
                ),
                'tags': ['Wheat Rust', 'Fungal Control', 'Rabi Crop'],
                'actions': [{'type': 'load_crop_sample', 'label': 'ðŸŒ¾ View Wheat Profile', 'crop': 'wheat'}]
            }), 200

        if 'maize' in query or 'armyworm' in query or 'à¤®à¤•à¥à¤•à¤¾' in query:
            return jsonify({
                'text': (
                    "ðŸŒ½ **Maize Pest Diagnostic: Fall Armyworm (Spodoptera frugiperda)**\n\n"
                    "â€¢ **Symptoms:** Pinholes and large ragged feeding holes in whorl leaves with abundant sawdust-like frass.\n"
                    "â€¢ **Chemical Control:** Spray **Chlorantraniliprole 18.5% SC** @ 0.4 ml/L or **Spinetoram 11.7% SC** @ 0.5 ml/L directed into the central whorl.\n"
                    "â€¢ **Biological Control:** Apply **Beauveria bassiana** or **Metarhizium anisopliae** @ 5 g/L; release Trichogramma egg parasitoids.\n"
                    "â€¢ **Whorl Sand Technique:** Apply dry sand or ash mixed with 10% lime inside the whorl to mechanically suffocate early larvae."
                ),
                'tags': ['Fall Armyworm', 'Maize Pest', 'IPM'],
                'actions': [{'type': 'load_crop_sample', 'label': 'ðŸŒ½ View Maize Profile', 'crop': 'maize'}]
            }), 200

        return jsonify({
            'text': (
                "ðŸ›¡ï¸ **Integrated Pest & Disease Management Advisory (IPM):**\n\n"
                "â€¢ **Sap-Sucking Pests (Aphids, Jassids, Whiteflies):** Spray **Neem Oil 10,000 ppm** @ 2 ml/L or **Imidacloprid 17.8% SL** @ 0.5 ml/L. Install yellow sticky traps (15/acre).\n"
                "â€¢ **Fungal Wilts & Root Rots:** Soil drenching with **Trichoderma viride** @ 5 kg mixed in 500 kg FYM/compost per acre during field preparation.\n"
                "â€¢ **Termites & Soil Grubs:** Soil application of **Chlorpyrifos 20% EC** @ 1.5 L/acre with irrigation water or Chlorantraniliprole granules.\n"
                "â€¢ **Caterpillars & Borers:** Install pheromone traps and spray Bacillus thuringiensis (Bt) @ 2 g/L.\n\n"
                "ðŸ’¡ *Tell me your specific crop name (e.g., Rice, Cotton, Maize, Wheat) for targeted diagnosis!*"
            ),
            'tags': ['IPM Advisory', 'Pest Control', 'Bio-Pesticides'],
            'actions': []
        }), 200

    # 3. Fertilizer Calculation (Urea, DAP, MOP)
    fertilizer_keywords = ['fertilizer', 'urea', 'dap', 'mop', 'à¤–à¤¾à¤¦', 'à¤¯à¥‚à¤°à¤¿à¤¯à¤¾', 'à¤¡à¥€à¤à¤ªà¥€', 'à¤ªà¥‹à¤Ÿà¤¾à¤¶', 'dose', 'à¤¬à¤¸à¥à¤¤à¤¾']
    if any(k in query for k in fertilizer_keywords):
        return jsonify({
            'text': (
                "ðŸ§ª **Commercial Fertilizer Bag Calculation Guide (à¤‰à¤°à¥à¤µà¤°à¤• à¤à¤µà¤‚ à¤–à¤¾à¤¦ à¤—à¤£à¤¨à¤¾):**\n\n"
                "Farmers buy commercial fertilizer bags containing standardized active ingredients:\n"
                "â€¢ **Urea (46% N):** Contains 23 kg pure Nitrogen per 50 kg bag. **Formula:** `Required N (kg) Ã· 23 = Bags of Urea`.\n"
                "â€¢ **DAP (18% N, 46% Pâ‚‚Oâ‚…):** Contains 23 kg Phosphorus + 9 kg Nitrogen per 50 kg bag. **Formula:** `Required P (kg) Ã· 23 = Bags of DAP`.\n"
                "â€¢ **MOP (60% Kâ‚‚O):** Contains 30 kg pure Potassium per 50 kg bag. **Formula:** `Required K (kg) Ã· 30 = Bags of MOP`.\n\n"
                "ðŸ“… **Stage-Wise Application Timeline:**\n"
                "1. **Basal Dose (à¤¬à¥à¤µà¤¾à¤ˆ à¤•à¥‡ à¤¸à¤®à¤¯):** 100% of DAP, 100% of MOP, and 1/3rd of Urea.\n"
                "2. **First Top Dressing (à¤•à¤²à¥à¤²à¥‡ à¤«à¥‚à¤Ÿà¤¤à¥‡ à¤¸à¤®à¤¯ / 25-30 days):** 1/3rd of Urea.\n"
                "3. **Second Top Dressing (à¤«à¥‚à¤² / à¤¬à¤¾à¤²à¥€ à¤¬à¤¨à¤¤à¥‡ à¤¸à¤®à¤¯ / 50-60 days):** Final 1/3rd of Urea."
            ),
            'tags': ['Fertilizer Bags', 'Urea & DAP', 'NPK Dosing'],
            'actions': [
                {'type': 'navigate_tab', 'label': 'ðŸ“ Open Units Guide', 'payload': 'recommend'},
                {'type': 'navigate_tab', 'label': 'ðŸ“Š Check Analytics', 'payload': 'analytics'}
            ]
        }), 200

    # 4. Soil Type Recommendations (Black, Alluvial, Red, Sandy, Laterite)
    soil_keywords = ['soil', 'black soil', 'alluvial', 'red soil', 'sandy', 'clay', 'laterite', 'à¤•à¤¾à¤²à¥€ à¤®à¤¿à¤Ÿà¥à¤Ÿà¥€', 'à¤œà¤²à¥‹à¤¢à¤¼', 'à¤²à¤¾à¤² à¤®à¤¿à¤Ÿà¥à¤Ÿà¥€', 'à¤¬à¤²à¥à¤ˆ']
    if any(k in query for k in soil_keywords):
        if 'black' in query or 'à¤•à¤¾à¤²à¥€' in query:
            return jsonify({
                'text': (
                    "ðŸŒ± **Best Crops for Black Soils / Regur (à¤•à¤¾à¤²à¥€ à¤®à¤¿à¤Ÿà¥à¤Ÿà¥€ à¤•à¥€ à¤«à¤¸à¤²à¥‡à¤‚):**\n\n"
                    "â€¢ **Characteristics:** High montmorillonite clay content, excellent moisture retention, deep fertility, self-ploughing cracks in summer.\n"
                    "â€¢ **Top Cash Crops:** **Cotton (à¤•à¤ªà¤¾à¤¸)**, **Soybean (à¤¸à¥‹à¤¯à¤¾à¤¬à¥€à¤¨)**, **Chickpea (à¤šà¤¨à¤¾)**, **Sorghum (à¤œà¥à¤µà¤¾à¤°)**, **Sugarcane (à¤—à¤¨à¥à¤¨à¤¾)**.\n"
                    "â€¢ **Horticulture:** Pomegranate (à¤…à¤¨à¤¾à¤°), Grapes (à¤…à¤‚à¤—à¥‚à¤°), and Mosambi (à¤®à¥Œà¤¸à¤®à¥€).\n"
                    "â€¢ **Management Tip:** Black soils have poor internal drainage. Implement Broad Bed Furrow (BBF) or ridge-and-furrow planting to prevent waterlogging during heavy monsoon rains."
                ),
                'tags': ['Black Soil', 'Cotton', 'Regur'],
                'actions': [
                    {'type': 'load_crop_sample', 'label': 'ðŸŒ¾ Test Cotton Values', 'crop': 'cotton'},
                    {'type': 'load_crop_sample', 'label': 'ðŸŒ¾ Test Chickpea Values', 'crop': 'chickpea'}
                ]
            }), 200

        if 'alluvial' in query or 'à¤œà¤²à¥‹à¤¢à¤¼' in query or 'ganga' in query:
            return jsonify({
                'text': (
                    "ðŸŒ¾ **Best Crops for Alluvial Soils (à¤œà¤²à¥‹à¤¢à¤¼ à¤®à¤¿à¤Ÿà¥à¤Ÿà¥€):**\n\n"
                    "â€¢ **Characteristics:** Highly fertile river deposition soil (Indo-Gangetic plains), balanced loam texture, high nutrient permeability.\n"
                    "â€¢ **Top Crops:** **Rice (à¤§à¤¾à¤¨)**, **Wheat (à¤—à¥‡à¤¹à¥‚à¤‚)**, **Sugarcane (à¤—à¤¨à¥à¤¨à¤¾)**, **Maize (à¤®à¤•à¥à¤•à¤¾)**, **Mustard (à¤¸à¤°à¤¸à¥‹à¤‚)**, **Jute (à¤œà¥‚à¤Ÿ)**.\n"
                    "â€¢ **Nutrient Status:** Rich in Potassium and organic silt; generally deficient in Nitrogen and Zinc.\n"
                    "â€¢ **Management:** Highly responsive to intensive crop rotation (e.g. Rice-Wheat-Moong) and drip or canal irrigation."
                ),
                'tags': ['Alluvial Soil', 'Rice & Wheat', 'Indo-Gangetic'],
                'actions': [
                    {'type': 'load_crop_sample', 'label': 'ðŸŒ¾ Test Rice Values', 'crop': 'rice'},
                    {'type': 'load_crop_sample', 'label': 'ðŸŒ¾ Test Maize Values', 'crop': 'maize'}
                ]
            }), 200

        if 'red' in query or 'à¤²à¤¾à¤²' in query:
            return jsonify({
                'text': (
                    "ðŸ‚ **Best Crops for Red & Laterite Soils (à¤²à¤¾à¤² à¤à¤µà¤‚ à¤²à¥ˆà¤Ÿà¥‡à¤°à¤¾à¤‡à¤Ÿ à¤®à¤¿à¤Ÿà¥à¤Ÿà¥€):**\n\n"
                    "â€¢ **Characteristics:** Iron oxide enrichment gives red coloration. Highly porous, low organic carbon, slightly acidic (pH 5.0 - 6.5).\n"
                    "â€¢ **Top Crops:** **Groundnut (à¤®à¥‚à¤‚à¤—à¤«à¤²à¥€)**, **Pigeonpea / Tur (à¤…à¤°à¤¹à¤°)**, **Ragi / Finger Millet (à¤°à¤¾à¤—à¥€)**, **Coffee (à¤•à¥‰à¤«à¤¼à¥€)**, **Coconut (à¤¨à¤¾à¤°à¤¿à¤¯à¤²)**.\n"
                    "â€¢ **Management Tip:** Apply Agricultural Lime (à¤šà¥‚à¤¨à¤¾) @ 250 kg/acre every 3 years to correct acidity, and incorporate Farmyard Manure (FYM) to improve water retention."
                ),
                'tags': ['Red Soil', 'Millets', 'Pulses'],
                'actions': [{'type': 'load_crop_sample', 'label': 'â˜• Test Coffee Values', 'crop': 'coffee'}]
            }), 200

    # 5. State / Regional Agricultural Recommendations
    state_map = {
        'punjab': ('Punjab (à¤ªà¤‚à¤œà¤¾à¤¬)', 'Basmati Rice, Wheat, Cotton, Sugarcane, Maize', 'Alluvial / Indo-Gangetic Loam', 'rice'),
        'haryana': ('Haryana (à¤¹à¤°à¤¿à¤¯à¤¾à¤£à¤¾)', 'Basmati Paddy, Wheat, Mustard, Cotton, Pearl Millet', 'Alluvial / Sandy Loam', 'rice'),
        'maharashtra': ('Maharashtra (à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°)', 'Cotton, Soybean, Sugarcane, Grapes, Pomegranate, Onion', 'Deep Black / Regur Soil', 'cotton'),
        'uttar pradesh': ('Uttar Pradesh (à¤‰à¤¤à¥à¤¤à¤° à¤ªà¥à¤°à¤¦à¥‡à¤¶)', 'Sugarcane, Wheat, Rice, Mustard, Potato, Pulses', 'Fertile Gangetic Alluvial', 'rice'),
        'up': ('Uttar Pradesh (à¤‰à¤¤à¥à¤¤à¤° à¤ªà¥à¤°à¤¦à¥‡à¤¶)', 'Sugarcane, Wheat, Rice, Mustard, Potato, Pulses', 'Fertile Gangetic Alluvial', 'rice'),
        'madhya pradesh': ('Madhya Pradesh (à¤®à¤§à¥à¤¯ à¤ªà¥à¤°à¤¦à¥‡à¤¶)', 'Soybean, Sharbati Wheat, Chickpea (à¤šà¤¨à¤¾), Lentil, Garlic', 'Malwa Deep Black Soil', 'chickpea'),
        'mp': ('Madhya Pradesh (à¤®à¤§à¥à¤¯ à¤ªà¥à¤°à¤¦à¥‡à¤¶)', 'Soybean, Sharbati Wheat, Chickpea (à¤šà¤¨à¤¾), Lentil, Garlic', 'Malwa Deep Black Soil', 'chickpea'),
        'gujarat': ('Gujarat (à¤—à¥à¤œà¤°à¤¾à¤¤)', 'Bt Cotton, Groundnut, Castor, Cumin (à¤œà¥€à¤°à¤¾), Sesame, Mango', 'Black Cotton & Coastal Alluvial', 'cotton'),
        'rajasthan': ('Rajasthan (à¤°à¤¾à¤œà¤¸à¥à¤¥à¤¾à¤¨)', 'Mustard, Pearl Millet (à¤¬à¤¾à¤œà¤°à¤¾), Mothbeans, Cluster Bean (à¤—à¥à¤µà¤¾à¤°)', 'Sandy Arid Loam', 'mothbeans'),
        'karnataka': ('Karnataka (à¤•à¤°à¥à¤¨à¤¾à¤Ÿà¤•)', 'Maize, Ragi, Coffee, Sugarcane, Arecanut, Cotton', 'Red Loam & Laterite', 'coffee'),
        'bengal': ('West Bengal (à¤ªà¤¶à¥à¤šà¤¿à¤® à¤¬à¤‚à¤—à¤¾à¤²)', 'Aman & Boro Rice, Jute, Potato, Mustard, Vegetables', 'Deltaic Silt Alluvial', 'jute'),
        'bihar': ('Bihar (à¤¬à¤¿à¤¹à¤¾à¤°)', 'Maize, Rice, Wheat, Litchi, Pulses, Makhana', 'Middle Gangetic Alluvial', 'maize'),
        'tamil nadu': ('Tamil Nadu (à¤¤à¤®à¤¿à¤²à¤¨à¤¾à¤¡à¥)', 'Kuruvai Paddy, Banana, Coconut, Cotton, Millets', 'Red Loam & Black Soil', 'banana'),
        'kerala': ('Kerala (à¤•à¥‡à¤°à¤²)', 'Coconut, Rubber, Coffee, Black Pepper, Banana, Spices', 'Highland Laterite & Coastal Alluvial', 'coconut')
    }
    for state_key, (state_name, crop_list, soil_info, default_crop) in state_map.items():
        if state_key in query:
            return jsonify({
                'text': (
                    f"ðŸ“ **Agro-Climatic Recommendation for {state_name}:**\n\n"
                    f"â€¢ **Major Recommended Crops:** **{crop_list}**\n"
                    f"â€¢ **Primary Soil Profile:** {soil_info}\n"
                    f"â€¢ **Cropping Pattern:** Intensive 2-season (Kharif + Rabi) with summer Zaid vegetables.\n"
                    f"â€¢ **Advice:** Check our **Live Weather & Geo-Location Auto-Fill** to fetch live temperature and precipitation for your specific district!"
                ),
                'tags': [state_name, 'Regional Guide', 'Agro-Climate'],
                'actions': [
                    {'type': 'load_crop_sample', 'label': f"ðŸŒ¾ Test {default_crop.capitalize()} Values", 'crop': default_crop},
                    {'type': 'trigger_weather_detect', 'label': 'ðŸ“ Detect Live Weather', 'payload': True}
                ]
            }), 200

    # 6. Specific Crop Inquiries (Matches all 22 crops in CROP_KNOWLEDGE)
    for crop_key, crop_meta in CROP_KNOWLEDGE.items():
        if crop_key in query:
            return jsonify({
                'text': (
                    f"ðŸŒ¾ **Agronomic Profile for {crop_meta.get('displayName', crop_key.capitalize())}:**\n\n"
                    f"â€¢ **Category & Sowing Season:** {crop_meta.get('category', 'Crop')} | **Season:** {crop_meta.get('season', 'Kharif/Rabi')}\n"
                    f"â€¢ **Harvest Duration:** {crop_meta.get('harvestTime', '90-120 days')}\n"
                    f"â€¢ **Ideal Soil:** {crop_meta.get('soilType', 'Well drained loam')}\n"
                    f"â€¢ **Water & Rain Needs:** {crop_meta.get('waterNeed', 'Moderate')}\n"
                    f"â€¢ **Climate & Temp:** {crop_meta.get('climate', 'Warm sunny weather')}\n"
                    f"â€¢ **NPK Demand:** {crop_meta.get('npkProfile', 'Balanced NPK')}\n"
                    f"â€¢ **Farmer Success Tip:** {crop_meta.get('farmerTips', '')}"
                ),
                'tags': [crop_key.capitalize(), crop_meta.get('season', 'Season'), 'Agronomic Profile'],
                'actions': [
                    {'type': 'load_crop_sample', 'label': f"ðŸŒ¾ Fill Form with {crop_key.capitalize()} Values", 'crop': crop_key},
                    {'type': 'navigate_tab', 'label': 'ðŸ’° View Economic Studio', 'payload': 'analytics'}
                ]
            }), 200

    # 7. Organic Farming & Jeevamrut
    organic_keywords = ['organic', 'jeevamrut', 'natural', 'à¤œà¥ˆà¤µà¤¿à¤•', 'à¤œà¥€à¤µà¤¾à¤®à¥ƒà¤¤', 'à¤•à¥‡à¤‚à¤šà¥à¤†', 'à¤ªà¤‚à¤šà¤—à¤µà¥à¤¯', 'à¤—à¥‹à¤¬à¤°']
    if any(k in query for k in organic_keywords):
        return jsonify({
            'text': (
                "ðŸŒ¿ **Natural & Organic Farming Guide (à¤ªà¥à¤°à¤¾à¤•à¥ƒà¤¤à¤¿à¤• à¤à¤µà¤‚ à¤œà¥ˆà¤µà¤¿à¤• à¤–à¥‡à¤¤à¥€):**\n\n"
                "â€¢ **Jeevamrut Recipe (200 Liters for 1 Acre):**\n"
                "  1. 10 kg fresh indigenous cow dung (à¤¦à¥‡à¤¶à¥€ à¤—à¤¾à¤¯ à¤•à¤¾ à¤—à¥‹à¤¬à¤°)\n"
                "  2. 10 liters cow urine (à¤—à¥‹à¤®à¥‚à¤¤à¥à¤°)\n"
                "  3. 2 kg jaggery (à¤—à¥à¤¡à¤¼) & 2 kg pulse flour (à¤¬à¥‡à¤¸à¤¨)\n"
                "  4. Handful of virgin soil from under a banyan/neem tree.\n"
                "  5. Mix in 200 L water, ferment in shade for 48 hours stirring clockwise twice daily. Apply via flood or drip irrigation.\n"
                "â€¢ **Beejamrut (à¤¬à¥€à¤œà¤¾à¤®à¥ƒà¤¤):** Natural seed treatment using cow urine, lime, and cow dung to prevent seed-borne fungal infections.\n"
                "â€¢ **Green Manuring:** Sow **Dhaincha (Sesbania)** or **Sunn hemp** and incorporate into the soil with a rotavator at 45 days before paddy transplanting. Adds 25-35 kg natural Nitrogen per acre!"
            ),
            'tags': ['Organic Farming', 'Jeevamrut', 'Natural Agriculture'],
            'actions': [{'type': 'navigate_tab', 'label': 'ðŸ§ª Explore Soil Health', 'payload': 'recommend'}]
        }), 200

    # 8a. Kaise ho / Well-being / How are you
    wellbeing_triggers = ['kaise ho', 'kaise hain', 'kya haal', 'kya haal chal', 'how are you', 'sab theek', 'kemon acho', 'kasa kay', 'sab kushal', 'haal chaal', 'kaisa chal raha hai', 'how r u']
    if any(k in query for k in wellbeing_triggers):
        return jsonify({
            'text': (
                "**Namaste! Main bilkul badhiya hoon! (à¤®à¥ˆà¤‚ à¤¬à¤¿à¤²à¥à¤•à¥à¤² à¤¬à¤¢à¤¼à¤¿à¤¯à¤¾ à¤¹à¥‚à¤) ðŸŒ¾**\n\n"
                "Aapki kheti, mitti ki jaanch (soil test) aur fasal ki behtareen paidawar ke liye hamesha hazir hoon.\n\n"
                "Aap batayein, aaj aapke khet ya bagiche ke liye main kya sahayata kar sakta hoon?\n"
                "â€¢ Apni mitti ke anusaar sabse sahi fasal janna chahte hain?\n"
                "â€¢ Khad (Urea, DAP, MOP) ki matra ka hisaab nikalna hai?\n"
                "â€¢ Ya kisi fasal ke keede aur bimari ka upchaar janna hai?"
            ),
            'tags': ['AgriBot AI', 'Friendly Chat', 'Kheti Saathi'],
            'actions': [
                {'type': 'load_crop_sample', 'label': 'ðŸŒ¾ Fill Rice Sample', 'crop': 'rice'},
                {'type': 'trigger_weather_detect', 'label': 'ðŸ“ Detect Local Weather', 'payload': True},
                {'type': 'navigate_tab', 'label': 'ðŸŒ¾ Open Recommendation Form', 'payload': 'recommend'}
            ]
        }), 200

    # 8b. Identity / Who are you / Aap kaun ho
    identity_triggers = ['who are you', 'aap kaun ho', 'tum kaun ho', 'naam kya', 'kya naam', 'who created you', 'who made you', 'kiska bot', 'apne bare me', 'who is agribot']
    if any(k in query for k in identity_triggers):
        return jsonify({
            'text': (
                "**Mera naam AgriBot (à¤à¤—à¥à¤°à¥€à¤¬à¥‰à¤Ÿ) hai! ðŸŒ¾**\n\n"
                "Main **AgriSmart AI** ka dedicated AI Kheti Visheshagya (Agricultural Specialist) aur Voice Assistant hoon.\n\n"
                "**Main aapki in kaamo me madad karta hoon:**\n"
                "1. ðŸ§ª **Mitti ki Jaanch:** 7 factors (N, P, K, Taapman, Nami, pH, Barish) ko deep neural network se evaluate karke sabse laabhkari fasal batana.\n"
                "2. ðŸ› **Keede aur Bimari:** Kapas ki gulabi sundi, dhaan ka blast, gehu ka rituwa, makkai ka armyworm ka sahi ilaj batana.\n"
                "3. âš–ï¸ **Khad ki Matra:** Prati acre Urea, DAP, aur Potash ke kutto ki ganna karna.\n"
                "4. ðŸ’° **Munafa:** Fasal ki aamdaani, lagat aur profit margin ka vishleshan karna."
            ),
            'tags': ['AgriBot Identity', 'AI Specialist'],
            'actions': [
                {'type': 'navigate_tab', 'label': 'ðŸŒ¾ Test Crop Form', 'payload': 'recommend'},
                {'type': 'navigate_tab', 'label': 'ðŸ“Š View AI Pipeline', 'payload': 'about'}
            ]
        }), 200

    # 8c. Gratitude & Politeness (Thanks / Dhanyawad / Shukriya)
    gratitude_triggers = ['thanks', 'thank you', 'dhanyawad', 'shukriya', 'bahut accha', 'badhiya', 'bohot shukriya', 'dhanyawaad', 'thank u', 'shukran']
    if any(k in query for k in gratitude_triggers):
        return jsonify({
            'text': (
                "**Aapka bohot bohot swagat hai! (à¤†à¤ªà¤•à¤¾ à¤¬à¤¹à¥à¤¤-à¤¬à¤¹à¥à¤¤ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ!) ðŸŒ¾**\n\n"
                "Kheti, mitti aur fasal se juda koi bhi sawal ho â€” chahe barish ho, khad ho ya beej â€” bina kisi jhijhak ke poochiye.\n\n"
                "Ek khushhal kisan hi desh ki shaan hai! Jai Jawan, Jai Kisan! ðŸšœ"
            ),
            'tags': ['Swagatam', 'Farmer Friendly'],
            'actions': [
                {'type': 'load_crop_sample', 'label': 'ðŸŒ½ Try Maize Sample', 'crop': 'maize'},
                {'type': 'navigate_tab', 'label': 'ðŸ’° Explore Economics', 'payload': 'analytics'}
            ]
        }), 200

    # 8d. Acknowledgement / Ok / Theek hai
    ack_triggers = ['ok', 'theek hai', 'accha', 'achha', 'thik h', 'haa', 'haan', 'yes', 'done', 'cool', 'sahi hai']
    if any(k == query or query.startswith(k + ' ') for k in ack_triggers):
        return jsonify({
            'text': (
                "**Ji bilkul! (à¤œà¥€ à¤¬à¤¿à¤²à¥à¤•à¥à¤²!)** ðŸ‘\n\n"
                "Aage bataiye â€” kya aapko apni mitti ki jaanch (soil test) karni hai, live mausam dekhna hai, ya kisi specific fasal (Dhaan, Kapas, Gehu, Makkai) ki jaankari chahiye?"
            ),
            'tags': ['Ready to Help', 'AgriBot'],
            'actions': [
                {'type': 'trigger_weather_detect', 'label': 'ðŸ“ Check Live Weather', 'payload': True},
                {'type': 'navigate_tab', 'label': 'ðŸŒ¾ Open Recommendation Form', 'payload': 'recommend'}
            ]
        }), 200

    # 8e. Cultural & Regional Greetings (Hello / Namaste / Salam / Sat Sri Akal)
    salam_triggers = ['salam', 'salaam', 'salamwalekum', 'salaamwalekum', 'assalam', 'as-salamu', 'walekum', 'walaikum', 'adab']
    if any(k in query for k in salam_triggers):
        return jsonify({
            'text': (
                "**Walekum Assalam kisan bhai! AgriSmart AI mein aapka dil se swagat hai.** ðŸŒ¾\n\n"
                "Main aapka digital kheti advisor hoon. Aap mujhse bolkar ya likhkar apni kheti ke baare mein kuch bhi pooch sakte hain:\n"
                "â€¢ **Mitti ke anusaar Fasal:** Apne khet ke N, P, K aur mausam ke anukool sabse laabhkari fasal\n"
                "â€¢ **Keeda & Rog Ilaj:** Kapas, dhaan, gehu, dalhan ke keedon aur phafund ka organic aur chemical ilaj\n"
                "â€¢ **Khad Ganana:** Ek acre mein Urea, DAP, aur Potash kitne kette lagenge\n"
                "â€¢ **Mausam Jankari:** Aapke ilaqe ka taapman, nami aur barish ka anumaan\n\n"
                "Bataiye, aaj aapki fasal ya mitti ke liye main kya madad kar sakta hoon?"
            ),
            'tags': ['Walekum Assalam', 'Voice Assistant', 'Kheti Guide'],
            'actions': [
                {'type': 'trigger_weather_detect', 'label': 'ðŸ“ Detect My Live Weather', 'payload': True},
                {'type': 'load_crop_sample', 'label': 'ðŸŒ¾ Fill Rice Sample', 'crop': 'rice'},
                {'type': 'navigate_tab', 'label': 'ðŸŒ¾ Open Recommendation Form', 'payload': 'recommend'}
            ]
        }), 200

    sikh_triggers = ['sat sri akaal', 'sat sri akal', 'sasrikal', 'waheguru']
    if any(k in query for k in sikh_triggers):
        return jsonify({
            'text': (
                "**Sat Sri Akal kisan veere! AgriSmart AI vich tuhada swagat hai.** ðŸŒ¾\n\n"
                "Main tuhada digital kheti advisor haan. Tussi bol ke ya likh ke fasal, khad (Urea, DAP), te bimariyan baare puch sakde ho.\n\n"
                "Dasso, ajj tuhade khet layi ki madad karaan?"
            ),
            'tags': ['Sat Sri Akal', 'Kheti Guide'],
            'actions': [
                {'type': 'trigger_weather_detect', 'label': 'ðŸ“ Check Live Weather', 'payload': True},
                {'type': 'navigate_tab', 'label': 'ðŸŒ¾ Open Recommendation Form', 'payload': 'recommend'}
            ]
        }), 200

    greeting_triggers = ['hello', 'hi', 'namaste', 'hey', 'namaskar', 'pranam', 'ram ram', 'jai shree ram', 'kem cho', 'vanakkam', 'radhe radhe', 'good morning', 'good afternoon', 'good evening', 'à¤¨à¤®à¤¸à¥à¤¤à¥‡', 'à¤ªà¥à¤°à¤£à¤¾à¤®', 'à¤°à¤¾à¤® à¤°à¤¾à¤®']
    if any(k in query for k in greeting_triggers):
        return jsonify({
            'text': (
                "**Namaste! AgriSmart AI mein aapka swagat hai.** ðŸŒ¾\n\n"
                "Main aapka AI agricultural guide hoon. Aap mujhse bolkar (microphone se) ya likhkar kheti ke sawal pooch sakte hain:\n"
                "â€¢ **Fasal Sifarish:** Apne khet ke N, P, K aur mausam ke hisaab se sabse behtar fasal\n"
                "â€¢ **Keeda / Rog Upchaar:** Kisi bhi fasal ke rog ka sahi ilaj aur dawa ki matra\n"
                "â€¢ **Khad Ganana:** Ek acre mein kitne kette Urea ya DAP lagenge\n"
                "â€¢ **Rajya & Mitti:** Aapke kshetra (Maharashtra, Punjab, UP, Gujarat, Rajasthan) ke anukool fasal\n\n"
                "Neeche diye gaye buttons me se chunein ya apna sawal poochiye!"
            ),
            'tags': ['Namaste', 'Voice Assistant', 'Kheti Guide'],
            'actions': [
                {'type': 'trigger_weather_detect', 'label': 'ðŸ“ Detect My Live Weather', 'payload': True},
                {'type': 'load_crop_sample', 'label': 'ðŸŒ¾ Fill Rice Sample', 'crop': 'rice'},
                {'type': 'load_crop_sample', 'label': 'ðŸŒ½ Fill Maize Sample', 'crop': 'maize'},
                {'type': 'navigate_tab', 'label': 'ðŸ“Š View ML Pipeline', 'payload': 'about'}
            ]
        }), 200

    # 9. Natural Friendly Fallback
    return jsonify({
        'text': (
            f"Aapne **'{user_msg}'** ke baare mein poocha hai. ðŸŒ¾\n\n"
            "Kisan bhai/behan, main aapko kheti ke in mukhya vishayon par poori jankari de sakta hoon:\n"
            "â€¢ **Fasal Recommendation:** Apne 7 parameters batayein aur neural network model se sabse sahi fasal jaaniye.\n"
            "â€¢ **Khad & Urvarak (Fertilizers):** Urea, DAP, Potash aur Zinc ki sahi matra prati acre.\n"
            "â€¢ **Keede & Bimari (Pest & Disease):** Dhaan, Kapas, Gehu, Makkai, Dalhan ke rogon ka organic aur chemical ilaj.\n"
            "â€¢ **Live Mausam (Weather):** Apne zile ka taapman, nami aur barish ka anumaan.\n\n"
            "Aap neeche diye gaye quick buttons dabakar shuru kar sakte hain ya microphone se bol sakte hain!"
        ),
        'tags': ['Kheti Sahayata', 'AgriBot Guide'],
        'actions': [
            {'type': 'trigger_weather_detect', 'label': 'ðŸ“ Auto-Detect Local Weather', 'payload': True},
            {'type': 'navigate_tab', 'label': 'ðŸŒ¾ Open Recommendation Form', 'payload': 'recommend'},
            {'type': 'navigate_tab', 'label': 'ðŸ’° Explore Economic Studio', 'payload': 'analytics'}
        ]
    }), 200


# ---------------------------------------------------------------------------
# Production Single-Service Frontend Serving (React / Vite)
# ---------------------------------------------------------------------------
FRONTEND_DIST = os.path.join(BASE_DIR, 'frontend', 'dist')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend_spa(path):
    """
    Serves the pre-compiled React single-page application (SPA).
    Enables single-port unified deployment on Render, Heroku, Docker, etc.
    """
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({
        'status': 'healthy',
        'service': 'AgriSmart AI Unified Service',
        'message': 'API is active. Build frontend via npm run build to enable web UI.'
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n=======================================================")
    print(f" AgriSmart AI Backend Server running on http://0.0.0.0:{port} (LAN accessible)")
    print(f" Loaded Model: {MODEL_PATH}")
    print(f" Classes: {len(classes_list)} crops")
    print(f" Test Accuracy: {model_metrics['test_accuracy']}%")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=False)

