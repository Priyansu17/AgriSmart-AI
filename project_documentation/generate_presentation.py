"""
Generates the Academic PowerPoint Presentation (PPTX) for AgriSmart AI
using python-pptx with widescreen 16:9 layout, nature aesthetic,
embedded diagrams, live screenshots, and detailed speaker notes.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

DOC_DIR = os.path.dirname(os.path.abspath(__file__))
DIAG_DIR = os.path.join(DOC_DIR, 'diagrams')
SHOTS_DIR = os.path.join(DOC_DIR, 'screenshots')
PPTX_PATH = os.path.join(DOC_DIR, 'AgriSmart_AI_Project_Presentation.pptx')

# Color Palette
C_FOREST_DARK = RGBColor(15, 47, 31)     # #0F2F1F (Deep Forest Green)
C_FOREST_MID  = RGBColor(20, 61, 40)     # #143D28
C_AGRI_GREEN  = RGBColor(45, 117, 45)    # #2D752D (Fresh Green)
C_AGRI_LIGHT  = RGBColor(230, 243, 230)  # #E6F3E6 (Light Mint)
C_EARTH_BROWN = RGBColor(140, 109, 70)   # #8C6D46
C_BG_LIGHT    = RGBColor(247, 249, 246)  # #F7F9F6 (Off-white)
C_WHITE       = RGBColor(255, 255, 255)
C_SLATE_DARK  = RGBColor(30, 41, 59)     # #1E293B
C_MUTED_GRAY  = RGBColor(100, 116, 139)  # #64748B
C_CARD_BG     = RGBColor(255, 255, 255)
C_CARD_BORDER = RGBColor(203, 213, 225)  # #CBD5E1

TOTAL_SLIDES = 16

def add_header_and_footer(slide, title_text, category_badge, slide_num):
    # Top Header Background Bar
    header_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.1))
    header_box.fill.solid()
    header_box.fill.fore_color.rgb = C_FOREST_DARK
    header_box.line.color.rgb = C_FOREST_DARK

    # Subtle bottom accent stripe on header
    stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.08), Inches(13.333), Inches(0.04))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = C_AGRI_GREEN
    stripe.line.color.rgb = C_AGRI_GREEN

    # Category Badge
    badge_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.18), Inches(2.6), Inches(0.28))
    badge_box.fill.solid()
    badge_box.fill.fore_color.rgb = C_FOREST_MID
    badge_box.line.color.rgb = C_AGRI_GREEN
    bp = badge_box.text_frame.paragraphs[0]
    bp.alignment = PP_ALIGN.CENTER
    brun = bp.add_run()
    brun.text = category_badge.upper()
    brun.font.name = 'Arial'
    brun.font.size = Pt(8.5)
    brun.font.bold = True
    brun.font.color.rgb = C_AGRI_LIGHT

    # Title Text
    tp = slide.shapes.add_textbox(Inches(0.75), Inches(0.44), Inches(11.5), Inches(0.6)).text_frame.paragraphs[0]
    trun = tp.add_run()
    trun.text = title_text
    trun.font.name = 'Arial'
    trun.font.size = Pt(19)
    trun.font.bold = True
    trun.font.color.rgb = C_WHITE

    # Bottom Footer Bar
    footer_stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.05), Inches(13.333), Inches(0.45))
    footer_stripe.fill.solid()
    footer_stripe.fill.fore_color.rgb = C_WHITE
    footer_stripe.line.color.rgb = C_CARD_BORDER

    # Footer Left
    fl = slide.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(8.0), Inches(0.35)).text_frame.paragraphs[0]
    frun1 = fl.add_run()
    frun1.text = "AgriSmart AI — Intelligent Crop Recommendation System  |  University Project Demonstration"
    frun1.font.name = 'Arial'
    frun1.font.size = Pt(8.5)
    frun1.font.color.rgb = C_MUTED_GRAY

    # Footer Right (Slide Number)
    fr = slide.shapes.add_textbox(Inches(10.5), Inches(7.08), Inches(2.0), Inches(0.35)).text_frame.paragraphs[0]
    fr.alignment = PP_ALIGN.RIGHT
    frun2 = fr.add_run()
    frun2.text = f"Slide {slide_num} of {TOTAL_SLIDES}"
    frun2.font.name = 'Arial'
    frun2.font.size = Pt(8.5)
    frun2.font.bold = True
    frun2.font.color.rgb = C_AGRI_GREEN

def add_card(slide, left, top, width, height, title, body_bullets, bg_rgb=C_CARD_BG, border_rgb=C_CARD_BORDER):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_rgb
    card.line.color.rgb = border_rgb
    card.line.width = Pt(1.5)

    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.2)
    tf.margin_bottom = Inches(0.2)

    # Title
    p0 = tf.paragraphs[0]
    p0.alignment = PP_ALIGN.LEFT
    r0 = p0.add_run()
    r0.text = title
    r0.font.name = 'Arial'
    r0.font.size = Pt(13)
    r0.font.bold = True
    r0.font.color.rgb = C_FOREST_DARK
    p0.space_after = Pt(8)

    # Bullets
    for b in body_bullets:
        p = tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(5)
        p.level = 0
        
        # Check for bold prefix (before ':')
        if ":" in b:
            prefix, rest = b.split(":", 1)
            rb = p.add_run()
            rb.text = f"• {prefix}:"
            rb.font.name = 'Arial'
            rb.font.size = Pt(9.5)
            rb.font.bold = True
            rb.font.color.rgb = C_SLATE_DARK

            rt = p.add_run()
            rt.text = rest
            rt.font.name = 'Arial'
            rt.font.size = Pt(9.5)
            rt.font.color.rgb = C_SLATE_DARK
        else:
            rt = p.add_run()
            rt.text = f"• {b}"
            rt.font.name = 'Arial'
            rt.font.size = Pt(9.5)
            rt.font.color.rgb = C_SLATE_DARK

    return card

def set_speaker_notes(slide, notes_text):
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = notes_text

def build_presentation():
    print("Initializing AgriSmart AI Presentation Generator (python-pptx)...")
    prs = Presentation()
    # 16:9 Widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    # Background full
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_FOREST_DARK
    bg1.line.color.rgb = C_FOREST_DARK

    # Ambient Accent Card
    card_glow = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9))
    card_glow.fill.solid()
    card_glow.fill.fore_color.rgb = C_FOREST_MID
    card_glow.line.color.rgb = C_AGRI_GREEN
    card_glow.line.width = Pt(2)

    # Category Pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(1.2), Inches(4.5), Inches(0.35))
    pill.fill.solid()
    pill.fill.fore_color.rgb = C_AGRI_GREEN
    pill.line.color.rgb = C_AGRI_LIGHT
    p_pill = pill.text_frame.paragraphs[0]
    p_pill.alignment = PP_ALIGN.CENTER
    r_pill = p_pill.add_run()
    r_pill.text = "ACADEMIC FINAL YEAR PROJECT DEMONSTRATION"
    r_pill.font.name = 'Arial'
    r_pill.font.size = Pt(9)
    r_pill.font.bold = True
    r_pill.font.color.rgb = C_WHITE

    # Title
    t_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.8), Inches(1.8))
    tf1 = t_box.text_frame
    tf1.word_wrap = True
    p_t = tf1.paragraphs[0]
    r_t = p_t.add_run()
    r_t.text = "AgriSmart AI — Intelligent Crop Recommendation System"
    r_t.font.name = 'Arial'
    r_t.font.size = Pt(28)
    r_t.font.bold = True
    r_t.font.color.rgb = C_WHITE

    p_sub = tf1.add_paragraph()
    p_sub.space_before = Pt(8)
    r_sub = p_sub.add_run()
    r_sub.text = "Deep Neural Network-Driven Precision Agriculture Platform Powered by TensorFlow/Keras, Flask & React"
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = C_AGRI_LIGHT

    # 4 Quick Metric Badges
    badges = [
        ("97.5% Accuracy", "Hold-Out Test Set (440 samples)"),
        ("0.0563 Loss", "Cross-Entropy Optimization"),
        ("22 Crop Classes", "Balanced Multi-Class Target"),
        ("7 Agronomic Features", "Soil NPK + Climate Dynamics")
    ]
    for idx, (b_title, b_desc) in enumerate(badges):
        bx = Inches(1.3 + idx * 2.7)
        by = Inches(3.8)
        b_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, by, Inches(2.5), Inches(0.95))
        b_box.fill.solid()
        b_box.fill.fore_color.rgb = C_FOREST_DARK
        b_box.line.color.rgb = C_AGRI_GREEN
        btf = b_box.text_frame
        btf.margin_top = Inches(0.12)
        bp1 = btf.paragraphs[0]
        bp1.alignment = PP_ALIGN.CENTER
        br1 = bp1.add_run()
        br1.text = b_title
        br1.font.name = 'Arial'
        br1.font.size = Pt(12)
        br1.font.bold = True
        br1.font.color.rgb = C_WHITE

        bp2 = btf.add_paragraph()
        bp2.alignment = PP_ALIGN.CENTER
        bp2.space_before = Pt(2)
        br2 = bp2.add_run()
        br2.text = b_desc
        br2.font.name = 'Arial'
        br2.font.size = Pt(7.5)
        br2.font.color.rgb = C_AGRI_LIGHT

    # Student metadata table at bottom of slide 1
    m_box = s1.shapes.add_textbox(Inches(1.3), Inches(5.0), Inches(10.8), Inches(1.4))
    mtf = m_box.text_frame
    mp = mtf.paragraphs[0]
    mrun = mp.add_run()
    mrun.text = (
        "Candidate Name: [STUDENT NAME]   |   Roll Number: [ROLL NUMBER]   |   Branch: [COURSE AND BRANCH]\n"
        "Institution: [UNIVERSITY NAME]   |   Session: [SESSION]   |   Supervisor: [FACULTY NAME]"
    )
    mrun.font.name = 'Arial'
    mrun.font.size = Pt(10)
    mrun.font.bold = True
    mrun.font.color.rgb = C_WHITE

    set_speaker_notes(
        s1,
        "Good morning respected evaluators, committee members, and faculty guide. "
        "Today, I present AgriSmart AI — an intelligent, full-stack crop recommendation system "
        "driven by a trained deep neural network in TensorFlow/Keras. This project addresses the core challenge "
        "of precision agriculture: empowering agriculturalists to make scientifically grounded planting choices "
        "based on verified soil chemistry and micro-climate parameters. Our trained neural network achieves a 97.5% "
        "validated accuracy across 22 crop classes, deployed via a high-performance Flask API and an interactive React web dashboard."
    )

    # =========================================================================
    # SLIDE 2: INTRODUCTION & BACKGROUND
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s2, "Introduction & Agricultural Significance", "Project Background", 2)

    add_card(
        s2, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.3),
        "The Paradigm Shift to Precision Agriculture",
        [
            "Economic Cornerstone: Agriculture employs over 40% of the developing world's workforce and remains vital to global food security.",
            "Soil Chemistry Complexity: Soil fertility is fundamentally dictated by the availability of primary macronutrients (Nitrogen, Phosphorus, Potassium), which govern leaf chlorophyll, root architecture, and cell osmotic resilience.",
            "Climatic Interdependence: Soil nutrients cannot act in isolation; local atmospheric temperatures, humidity levels, and seasonal rainfall strictly dictate vegetative cycle completion.",
            "Decision Gap: While laboratory soil tests are increasingly affordable, farmers lack instant computational tools to interpret laboratory metrics into optimal planting decisions."
        ]
    )

    add_card(
        s2, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.3),
        "The Role of Deep Learning in Agri-Tech",
        [
            "High-Dimensional Non-Linearity: The biological relationship between 7 environmental factors and crop yield is highly non-linear, making static threshold heuristics inadequate.",
            "Deep Neural Networks (DNN): Multi-layer perceptrons equipped with ReLU activations and Dropout regularization serve as universal function approximators for multi-class agro-prediction.",
            "Risk Mitigation via Probabilities: Rather than generating rigid binary outcomes, probabilistic outputs enable farmers to evaluate contingency crops and diversify risk.",
            "End-to-End Operationalization: AgriSmart AI transitions machine learning from offline academic research scripts into a production-grade, interactive web decision system."
        ]
    )

    set_speaker_notes(
        s2,
        "In this slide, we establish why precision agriculture is vital. Traditional farming practices often rely on "
        "generational intuition or regional monoculture trends. However, crop yield is tightly bounded by Liebig's Law of the Minimum—meaning "
        "if even one soil nutrient or environmental factor is inadequate, crop yield plummets. Deep learning excels here because it discovers "
        "complex, non-linear feature interactions between soil NPK chemistry and atmospheric temperature, humidity, and rainfall."
    )

    # =========================================================================
    # SLIDE 3: PROBLEM STATEMENT & MOTIVATION
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s3, "Problem Statement & Project Motivation", "Operational Dilemma", 3)

    add_card(
        s3, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.3),
        "1. Intuition-Based Farming",
        [
            "Reliance on Tradition: Cultivation decisions based on customary habits rather than empirical soil health.",
            "Monoculture Risks: Over-reliance on single crops exacerbates localized soil depletion and pest vulnerability.",
            "Catastrophic Crop Failure: Planting crops unsuited to underlying soil chemistry results in severe economic devastation for farmers."
        ],
        border_rgb=RGBColor(239, 68, 68)
    )

    add_card(
        s3, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.3),
        "2. Soil & Climate Volatility",
        [
            "Fertilizer Mismanagement: Excessive synthetic fertilization causes soil acidification and groundwater contamination.",
            "Monsoon Unpredictability: Changing rainfall patterns render static seasonal crop calendars obsolete.",
            "Microclimate Variations: Temperature and humidity fluctuations drastically alter transpiration and vegetative growth."
        ],
        border_rgb=RGBColor(245, 158, 11)
    )

    add_card(
        s3, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.3),
        "3. Advisory Deficiencies",
        [
            "Delayed Laboratory Reports: Physical soil testing results take weeks to reach rural agriculturalists.",
            "Lack of Actionable Advice: Laboratory sheets state NPK numbers without clear guidance on what crop to plant.",
            "Inflexible Recommendations: Legacy systems output single crops without probabilistic alternatives for risk mitigation."
        ],
        border_rgb=RGBColor(59, 130, 246)
    )

    set_speaker_notes(
        s3,
        "Here we articulate the core problems farmers face. First, intuition-based farming leads to planting crops unsuited "
        "to the soil chemistry. Second, chemical fertilizer mismanagement causes soil depletion and economic waste. Third, agricultural "
        "extension services are slow and often deliver technical numbers without practical crop guidance. AgriSmart AI solves all three "
        "by delivering instant, data-driven, probabilistic crop advice directly in the farmer's browser."
    )

    # =========================================================================
    # SLIDE 4: PROJECT OBJECTIVES
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s4, "Project Aim & Specific Technical Objectives", "System Goals", 4)

    add_card(
        s4, Inches(0.8), Inches(1.4), Inches(11.733), Inches(5.3),
        "Key Deliverables & Research Milestones",
        [
            "Standardized Preprocessing Pipeline: Ingest and normalize 2,200 observation records across 7 agricultural features using StandardScaler to ensure zero feature scale bias.",
            "Robust Neural Network Architecture: Construct and train a 6-layer Keras Sequential neural network incorporating Dense layers, ReLU activations, and Dropout regularization for multi-class classification.",
            "High Classification Accuracy (>95%): Achieve empirical classification performance exceeding 95% on hold-out test data (model achieved 97.50% test accuracy with 0.0563 test loss).",
            "Deterministic Production Serialization: Serialize trained weights (.keras), scaler (.pkl), and label encoder (.pkl) for deployment without training-serving skew.",
            "Production Flask REST API: Implement RESTful endpoints (/api/predict, /api/health, /api/analytics, /api/history) with strict input validation across acceptable agronomic ranges.",
            "Responsive Modern Web Interface: Deliver a responsive single-page web dashboard using React 19, Vite, and Tailwind CSS featuring dual-control input sliders and real-time Chart.js visual analytics.",
            "Ranked Top-3 Recommendations: Deliver primary crop suggestions paired with top-3 alternative choices and comprehensive agronomic profiles (season, water, soil, farmer tips)."
        ]
    )

    set_speaker_notes(
        s4,
        "Our project objectives are explicit and measurable. We set out to preprocess 2,200 records, train a deep neural "
        "network that exceeds 95% accuracy, serialize all artifacts without drift, build a production Flask API with validation, "
        "and provide an intuitive React 19 frontend with ranked top-3 recommendations. As we will demonstrate, every objective was "
        "successfully accomplished."
    )

    # =========================================================================
    # SLIDE 5: EXISTING SYSTEM VS PROPOSED SYSTEM
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s5, "Comparative Analysis: Existing vs. Proposed System", "Architectural Shift", 5)

    # Create comparison table
    rows, cols = 6, 3
    t_shape = s5.shapes.add_table(rows, cols, Inches(0.8), Inches(1.5), Inches(11.733), Inches(5.0))
    table = t_shape.table
    table.columns[0].width = Inches(2.5)
    table.columns[1].width = Inches(4.5)
    table.columns[2].width = Inches(4.733)

    c_headers = ["Parameter / Metric", "Conventional / Existing Approach", "AgriSmart AI (Proposed Platform)"]
    for i, h in enumerate(c_headers):
        cell = table.cell(0, i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_FOREST_DARK
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = h
        r.font.name = 'Arial'
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = C_WHITE

    c_rows = [
        ("Prediction Model", "Basic Decision Trees, Naive Bayes, or manual lookup charts.", "6-Layer Deep Neural Network (Keras) with ReLU and Dropout."),
        ("Accuracy & Generalization", "Typically 75% - 85%; prone to underfitting on edge conditions.", "97.50% Test Accuracy | 0.0563 Test Loss on 440 unseen test cases."),
        ("Recommendation Output", "Single deterministic output with no indication of certainty.", "Ranked Top-3 Probabilistic Recommendations with Softmax confidence %."),
        ("User Experience", "Command-line scripts, manual worksheets, or outdated web forms.", "React 19 + Tailwind CSS dashboard with dual synchronized sliders & numbers."),
        ("Agronomic Context", "Displays only the crop name without guidance.", "Detailed agronomic advisory: season, harvest days, soil needs, and farmer tips.")
    ]

    for r_idx, (col0, col1, col2) in enumerate(c_rows, start=1):
        for c_idx, text_val in enumerate([col0, col1, col2]):
            cell = table.cell(r_idx, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_CARD_BG if r_idx % 2 == 1 else C_BG_LIGHT
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT
            r = p.add_run()
            r.text = text_val
            r.font.name = 'Arial'
            r.font.size = Pt(9.5)
            r.font.bold = (c_idx == 0)
            r.font.color.rgb = C_SLATE_DARK

    set_speaker_notes(
        s5,
        "Slide 5 provides a clear comparison matrix between conventional crop advisory tools and AgriSmart AI. "
        "Traditional tools use rigid decision trees or heuristic lookup tables that fail on non-linear data. "
        "AgriSmart AI introduces a 6-layer neural network with 97.5% test accuracy, provides top-3 ranked alternatives, "
        "and embeds complete cultivation advisories to assist the farmer in real-world planning."
    )

    # =========================================================================
    # SLIDE 6: DATASET & 7 INPUT PARAMETERS
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s6, "Dataset Architecture & Seven Input Parameters", "Data Engineering", 6)

    add_card(
        s6, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.3),
        "Dataset Structure & Properties",
        [
            "Total Observations: 2,200 verified agricultural field records.",
            "Class Distribution: Perfectly balanced across 22 crop categories (100 observations per class).",
            "Zero Missing Values: Complete data integrity with zero null, NaN, or corrupted values.",
            "Partitioning: 80% Training Set (1,760 samples) and 20% Stratified Hold-Out Test Set (440 samples).",
            "Supported Crops (22): Apple, Banana, Blackgram, Chickpea, Coconut, Coffee, Cotton, Grapes, Jute, Kidney Beans, Lentil, Maize, Mango, Moth Beans, Mung Bean, Muskmelon, Orange, Papaya, Pigeon Peas, Pomegranate, Rice, Watermelon."
        ]
    )

    add_card(
        s6, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.3),
        "The Seven Continuous Input Parameters",
        [
            "Nitrogen (N) [0 - 140 kg/ha]: Primary driver of leaf growth and chlorophyll synthesis.",
            "Phosphorus (P) [5 - 145 kg/ha]: Essential for root establishment and energy transfer (ATP).",
            "Potassium (K) [5 - 205 kg/ha]: Regulates stomatal water balance, disease resistance, and fruit weight.",
            "Temperature [8.8 - 43.7 °C]: Dictates enzyme kinetics and physiological growth velocity.",
            "Relative Humidity [14.3 - 99.9 %]: Governs transpiration rates and moisture preservation.",
            "Soil pH [3.5 - 9.9]: Controls chemical bioavailability of essential soil micronutrients.",
            "Rainfall [20.2 - 298.6 mm]: Natural water volume; establishes irrigation requirements."
        ]
    )

    set_speaker_notes(
        s6,
        "Here we examine the dataset. We trained on 2,200 verified observation records. Crucially, the dataset is "
        "perfectly balanced—100 observations per class across all 22 crop classes, preventing classification bias. "
        "The model evaluates exactly 7 continuous agronomic features in strict sequence: Nitrogen, Phosphorus, Potassium, "
        "Temperature, Relative Humidity, Soil pH, and Rainfall. These represent the definitive determinants of crop suitability."
    )

    # =========================================================================
    # SLIDE 7: TECHNOLOGY STACK
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s7, "Comprehensive Technology Stack", "System Implementation", 7)

    tech_cards = [
        ("Machine Learning & Preprocessing", Inches(0.8), Inches(1.4), [
            "TensorFlow 2.21: Deep learning tensor execution engine.",
            "Keras 3.15: High-level sequential neural architecture API.",
            "Scikit-Learn 1.9: StandardScaler and LabelEncoder preprocessing.",
            "Joblib 1.6: High-performance artifact serialization."
        ]),
        ("Application Backend Server", Inches(6.8), Inches(1.4), [
            "Python 3.12: Modern, high-performance runtime environment.",
            "Flask 3.1: Lightweight micro-framework for RESTful endpoints.",
            "Flask-CORS: Cross-Origin Resource Sharing handling.",
            "NumPy 2.5 & Pandas 3.0: Array manipulation and statistical analytics."
        ]),
        ("Client Frontend UI", Inches(0.8), Inches(4.2), [
            "React 19: Component-driven reactive single-page architecture.",
            "Vite 8: Ultra-fast module bundler with Hot Module Replacement.",
            "Tailwind CSS v4: Utility-first responsive design system.",
            "Lucide React: Crisp vector iconography and agricultural glyphs."
        ]),
        ("Data Visualization & Analytics", Inches(6.8), Inches(4.2), [
            "Chart.js 4.5: Canvas-based responsive charting library.",
            "React-ChartJS-2: Declarative React chart wrappers.",
            "JSON History Store: Persistent local logging of predictions.",
            "Playwright: End-to-end automated UI capture and validation."
        ])
    ]

    for title, x, y, bullets in tech_cards:
        add_card(s7, x, y, Inches(5.7), Inches(2.6), title, bullets)

    set_speaker_notes(
        s7,
        "Slide 7 outlines our technology stack. We chose a decoupled architecture. On the machine learning side, we use "
        "TensorFlow 2.21, Keras, and Scikit-Learn. The backend is built with Python 3.12 and Flask, providing low-latency REST endpoints. "
        "The frontend is built with React 19, Vite, and Tailwind CSS, featuring Chart.js for interactive analytics. "
        "Everything runs locally without proprietary paid APIs."
    )

    # =========================================================================
    # SLIDE 8: 4-TIER SYSTEM ARCHITECTURE
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s8, "Four-Tier System Architecture", "System Design", 8)

    arch_img_path = os.path.join(DIAG_DIR, 'system_architecture.png')
    if os.path.exists(arch_img_path):
        s8.shapes.add_picture(arch_img_path, Inches(0.8), Inches(1.4), Inches(11.733), Inches(5.3))

    set_speaker_notes(
        s8,
        "This slide presents the high-level 4-tier system architecture diagram. At Tier 1 is the Client Presentation Tier—React 19 "
        "running in the user's browser. Tier 2 is the Application Services Tier running on Flask, which enforces boundary validation. "
        "Tier 3 is the Machine Learning Inference Tier, where the StandardScaler normalizes inputs into z-scores and the Keras neural "
        "network evaluates class probabilities. Finally, Tier 4 represents the persistent artifact storage where model weights and history reside."
    )

    # =========================================================================
    # SLIDE 9: MACHINE LEARNING WORKFLOW PIPELINE
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s9, "End-to-End Prediction Workflow Pipeline", "Dataflow & Inference", 9)

    wf_img_path = os.path.join(DIAG_DIR, 'prediction_workflow.png')
    if os.path.exists(wf_img_path):
        s9.shapes.add_picture(wf_img_path, Inches(0.8), Inches(1.4), Inches(11.733), Inches(3.2))

    add_card(
        s9, Inches(0.8), Inches(4.8), Inches(11.733), Inches(2.0),
        "Pipeline Execution Mechanics",
        [
            "Step 1 (Ingestion): User submits 7 continuous values (N, P, K, Temp, Humidity, pH, Rainfall) via the web form.",
            "Step 2 (StandardScaler Preprocessing): Inputs are transformed into standard normal variates using z = (x - μ) / σ based on fitted training distribution parameters.",
            "Step 3 (Neural Inference): The 6-layer Keras Sequential model executes feedforward tensor multiplication across 10,484 parameters, generating unnormalized logits.",
            "Step 4 (Softmax & LabelEncoder): Softmax normalizes logits into a 22-class probability simplex. LabelEncoder maps the argmax index to the certified crop name.",
            "Step 5 (Advisory Delivery): The top-3 candidate crops are ranked by descending probability and displayed with complete cultivation advisories."
        ]
    )

    set_speaker_notes(
        s9,
        "Slide 9 illustrates the 5-stage inference workflow. When a user submits data, it is validated, scaled into z-scores "
        "via the pre-fitted StandardScaler, propagated through the 6-layer neural network, decoded from integer indices to crop names "
        "via LabelEncoder, and presented to the farmer as a ranked top-3 recommendation with actionable advisory."
    )

    # =========================================================================
    # SLIDE 10: NEURAL NETWORK ARCHITECTURE & SPECIFICATIONS
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s10, "Neural Network Architecture & Layer Topology", "Deep Learning Model", 10)

    # Table of Keras layers
    t10_shape = s10.shapes.add_table(7, 4, Inches(0.8), Inches(1.4), Inches(7.5), Inches(5.3))
    t10 = t10_shape.table
    t10.columns[0].width = Inches(2.0)
    t10.columns[1].width = Inches(1.5)
    t10.columns[2].width = Inches(1.5)
    t10.columns[3].width = Inches(2.5)

    headers10 = ["Layer Name", "Activation", "Output Shape", "Param Calculation"]
    for i, h in enumerate(headers10):
        cell = t10.cell(0, i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_FOREST_DARK
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = h
        r.font.name = 'Arial'
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.color.rgb = C_WHITE

    layers_data = [
        ("dense (Input/Dense)", "ReLU", "(None, 64)", "512  [(7 inputs + 1) × 64]"),
        ("dropout (Dropout)", "Rate = 0.2", "(None, 64)", "0  [Regularization]"),
        ("dense_1 (Hidden 1)", "ReLU", "(None, 32)", "2,080  [(64 + 1) × 32]"),
        ("dropout_1 (Dropout)", "Rate = 0.2", "(None, 32)", "0  [Regularization]"),
        ("dense_2 (Hidden 2)", "ReLU", "(None, 16)", "528  [(32 + 1) × 16]"),
        ("dense_3 (Output)", "Softmax", "(None, 22)", "374  [(16 + 1) × 22]")
    ]

    for r_idx, row in enumerate(layers_data, start=1):
        for c_idx, val in enumerate(row):
            cell = t10.cell(r_idx, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_CARD_BG if r_idx % 2 == 1 else C_BG_LIGHT
            p = cell.text_frame.paragraphs[0]
            r = p.add_run()
            r.text = val
            r.font.name = 'Arial'
            r.font.size = Pt(9)
            r.font.bold = (c_idx == 0)
            r.font.color.rgb = C_SLATE_DARK

    add_card(
        s10, Inches(8.6), Inches(1.4), Inches(3.9), Inches(5.3),
        "Training & Hyperparameters",
        [
            "Total Parameters: 10,484 (40.96 KB total memory footprint).",
            "Trainable Weights: 3,494 parameters (13.65 KB).",
            "Optimizer: Adam (Adaptive Moment Estimation) with initial learning rate = 0.001.",
            "Loss Function: Sparse Categorical Crossentropy for multi-class optimization.",
            "Dropout Regularization: 20% dropout rate on layers 1 and 2 to eliminate co-adaptation.",
            "Overfitting Prevention: Dropout ensures robust generalization across unseen soil variants."
        ]
    )

    set_speaker_notes(
        s10,
        "Slide 10 details our deep neural network topology directly from the trained Keras model artifact. "
        "The model is a sequential feedforward network with 6 layers: Dense 64 with ReLU, Dropout 0.2, Dense 32 with ReLU, "
        "Dropout 0.2, Dense 16 with ReLU, and a 22-unit Softmax output layer. In total, the model has 3,494 trainable weights "
        "and 10,484 total parameters, making it extremely lightweight and capable of sub-10 millisecond inference."
    )

    # =========================================================================
    # SLIDE 11: MODEL EVALUATION & EXPERIMENTAL RESULTS
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s11, "Model Evaluation & Quantitative Experimental Results", "Evaluation & Metrics", 11)

    eval_chart_path = os.path.join(DIAG_DIR, 'model_evaluation_chart.png')
    if os.path.exists(eval_chart_path):
        s11.shapes.add_picture(eval_chart_path, Inches(0.8), Inches(1.4), Inches(7.5), Inches(5.3))

    add_card(
        s11, Inches(8.6), Inches(1.4), Inches(3.9), Inches(5.3),
        "Key Evaluation Metrics",
        [
            "Hold-Out Test Set: 440 samples (20 per class, 20% split).",
            "Test Accuracy: 97.50% (429 of 440 predictions exact).",
            "Test Cross-Entropy Loss: 0.0563.",
            "Macro Precision: 0.98 | Macro Recall: 0.97 | Macro F1: 0.97.",
            "Weighted Precision: 0.98 | Weighted Recall: 0.97 | Weighted F1: 0.97.",
            "16 Crops with 100% F1: Apple, Banana, Chickpea, Coconut, Coffee, Cotton, Grapes, Kidney Beans, Maize, Mango, Mung Bean, Muskmelon, Orange, Papaya, Pomegranate, Watermelon.",
            "Minor Biochemical Overlap: Jute (0.88 F1) vs Rice (0.86 F1) due to closely shared monsoon precipitation patterns."
        ]
    )

    set_speaker_notes(
        s11,
        "Slide 11 reports our verified evaluation benchmarks from model_metrics.txt. On the hold-out test set of 440 samples, "
        "our model achieved 97.50% test accuracy and a test loss of 0.0563. Sixteen out of 22 crops achieved perfect 1.00 precision "
        "and recall. Minor overlaps occurred only between Rice and Jute, which share identical heavy monsoon rainfall ranges."
    )

    # =========================================================================
    # SLIDE 12: APPLICATION MODULES OVERVIEW
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s12, "AgriSmart AI Web Application Modules", "Software Engineering", 12)

    modules_data = [
        ("1. Overview & Landing", Inches(0.8), Inches(1.4), [
            "Hero banner with agricultural mission.",
            "Real-time model KPI badges (97.5% Acc).",
            "Three-step visual workflow explanation.",
            "Quick 1-click sample profile selectors."
        ]),
        ("2. Recommendation Dashboard", Inches(6.8), Inches(1.4), [
            "7 dedicated agronomic input controls.",
            "Synchronized numeric input and range sliders.",
            "Informative agronomic tooltips with typical bounds.",
            "Preset loader (Rice, Maize, Coffee, Chickpea)."
        ]),
        ("3. Prediction Result Engine", Inches(0.8), Inches(4.2), [
            "Primary crop banner and botanical name.",
            "Softmax confidence percentage progress gauge.",
            "Ranked top-3 alternative crop suggestions.",
            "Agronomic guide: season, harvest, soil, water."
        ]),
        ("4. Analytics & History Store", Inches(6.8), Inches(4.2), [
            "Full 22-class distribution chart (balanced).",
            "NPK vs Climate interactive comparison charts.",
            "Crop-wise parameter reference benchmark table.",
            "Persisted history log with 1-click parameter reload."
        ])
    ]

    for title, x, y, bullets in modules_data:
        add_card(s12, x, y, Inches(5.7), Inches(2.6), title, bullets)

    set_speaker_notes(
        s12,
        "In Slide 12, we present the functional architecture of the web application. It is divided into four cohesive modules: "
        "the Overview landing page, the 7-input Recommendation Dashboard, the Prediction Result Engine, and the Analytics & History Store. "
        "Every component is reactive, mobile-responsive, and styled with our cohesive nature-inspired palette."
    )

    # =========================================================================
    # SLIDE 13: LIVE APPLICATION SCREENSHOTS
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s13, "Live Application Screenshots: Interface in Action", "User Interface", 13)

    shot2_path = os.path.join(SHOTS_DIR, '02_recommendation_form.png')
    shot3_path = os.path.join(SHOTS_DIR, '03_prediction_result.png')

    if os.path.exists(shot2_path):
        s13.shapes.add_picture(shot2_path, Inches(0.8), Inches(1.4), Inches(5.7), Inches(3.6))
        # Label under image 1
        lbl1 = s13.shapes.add_textbox(Inches(0.8), Inches(5.05), Inches(5.7), Inches(0.4)).text_frame.paragraphs[0]
        lbl1.alignment = PP_ALIGN.CENTER
        r1 = lbl1.add_run()
        r1.text = "Screen A: Recommendation Form with 7 Synchronized Numeric Sliders"
        r1.font.name = 'Arial'
        r1.font.size = Pt(8.5)
        r1.font.bold = True
        r1.font.color.rgb = C_AGRI_GREEN

    if os.path.exists(shot3_path):
        s13.shapes.add_picture(shot3_path, Inches(6.8), Inches(1.4), Inches(5.7), Inches(3.6))
        # Label under image 2
        lbl2 = s13.shapes.add_textbox(Inches(6.8), Inches(5.05), Inches(5.7), Inches(0.4)).text_frame.paragraphs[0]
        lbl2.alignment = PP_ALIGN.CENTER
        r2 = lbl2.add_run()
        r2.text = "Screen B: Real-Time Prediction Output, Top-3 Ranking & Agronomic Advisory"
        r2.font.name = 'Arial'
        r2.font.size = Pt(8.5)
        r2.font.bold = True
        r2.font.color.rgb = C_AGRI_GREEN

    add_card(
        s13, Inches(0.8), Inches(5.5), Inches(11.733), Inches(1.3),
        "Demonstrated Features in Live Screens",
        [
            "Dual-Control Input Synchronization: Users can drag sliders for rapid tactile exploration or type exact laboratory numbers.",
            "Instant Neural Inference: Predicts recommended crop in under 15ms; returns confidence gauge, top-3 ranked alternatives, and comprehensive agronomic guide."
        ]
    )

    set_speaker_notes(
        s13,
        "Slide 13 displays authentic screenshots captured from our running application. On the left is the recommendation form "
        "featuring dual slider and numeric controls. On the right is the actual prediction result screen, displaying the recommended crop "
        "(Rice at 61.2% confidence), ranked alternatives (Jute at 38.8%), and a complete cultivation advisory."
    )

    # =========================================================================
    # SLIDE 14: LIMITATIONS & FUTURE SCOPE
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s14, "System Limitations & Future Enhancements", "Critical Analysis", 14)

    add_card(
        s14, Inches(0.8), Inches(1.4), Inches(5.6), Inches(5.3),
        "Acknowledged System Limitations",
        [
            "Probabilistic Estimation: Model confidence reflects statistical correlation with historical training distributions, not a biological guarantee of harvest yield.",
            "Unmodeled Soil Factors: Current inputs exclude secondary micronutrients (Zinc, Iron, Boron, Copper), electrical conductivity (salinity), and organic matter.",
            "Dynamic Biological Pressures: External biological shocks such as pest infestations, viral blights, and weed competition fall outside the feature scope.",
            "Economic Invariance: The system evaluates agronomic suitability regardless of fluctuating market prices, cold storage access, or local transportation logistics."
        ],
        border_rgb=RGBColor(245, 158, 11)
    )

    add_card(
        s14, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.3),
        "Future Research & Engineering Scope",
        [
            "IoT Sensor Telemetry: Direct hardware interfacing with field microcontroller probes (ESP32 / LoRaWAN) for automated soil NPK telemetry.",
            "Satellite Remote Sensing: Integration of Sentinel-2 multi-spectral imagery to compute Normalized Difference Vegetation Index (NDVI).",
            "Precision Fertilizer Dosage: Automated calculation of exact fertilizer requirements (Urea, DAP, MOP in kg/acre) to correct soil deficiencies.",
            "Vernacular Multi-Lingual Voice: Adding voice-based natural language interaction in regional Indian languages (Hindi, Marathi, Telugu, Tamil, Bengali)."
        ],
        border_rgb=RGBColor(45, 117, 45)
    )

    set_speaker_notes(
        s14,
        "Academic honesty requires candidly addressing system limitations. Model confidence reflects statistical proximity "
        "to training data, not a harvest guarantee. In the future, we plan to interface with IoT field sensors for real-time telemetry, "
        "incorporate satellite NDVI imagery, calculate exact fertilizer dosages, and support regional voice queries for rural farmers."
    )

    # =========================================================================
    # SLIDE 15: CONCLUSION
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s15, "Project Conclusion & Academic Summary", "Conclusion", 15)

    add_card(
        s15, Inches(0.8), Inches(1.4), Inches(11.733), Inches(5.3),
        "Summary of Project Achievements",
        [
            "High Model Efficacy: Designed, trained, and verified a 6-layer Keras Sequential neural network achieving 97.50% test accuracy and 0.0563 test loss across 22 crop classes.",
            "Zero Feature Bias: Applied StandardScaler normalization to 7 essential agronomic variables, eliminating scale bias across distinct measurement units (kg/ha, °C, %, mm).",
            "Seamless Micro-Service Integration: Developed a production Python Flask REST API featuring strict boundary validation, error handling, and persistent prediction history logging.",
            "High-Performance Web Dashboard: Engineered an interactive single-page application in React 19, Vite, and Tailwind CSS with real-time Chart.js visual analytics.",
            "Empowering Agricultural Decision-Making: Bridged the gap between laboratory soil chemistry and field planting decisions through ranked top-3 probabilistic recommendations and comprehensive crop advisories."
        ]
    )

    set_speaker_notes(
        s15,
        "To conclude, AgriSmart AI successfully demonstrates that deep neural networks can deliver high-accuracy, "
        "real-time decision support for precision agriculture. Achieving 97.5% test accuracy across 22 crops, the system transforms "
        "complex mathematical inference into an intuitive web tool that helps farmers reduce fertilizer waste, adapt to climate variations, "
        "and maximize sustainable crop yields."
    )

    # =========================================================================
    # SLIDE 16: THANK YOU & Q&A
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    bg16 = s16.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg16.fill.solid()
    bg16.fill.fore_color.rgb = C_FOREST_DARK
    bg16.line.color.rgb = C_FOREST_DARK

    # Glow Card
    glow16 = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1))
    glow16.fill.solid()
    glow16.fill.fore_color.rgb = C_FOREST_MID
    glow16.line.color.rgb = C_AGRI_GREEN
    glow16.line.width = Pt(2)

    # Text Box
    t16 = s16.shapes.add_textbox(Inches(2.0), Inches(1.8), Inches(9.333), Inches(3.8))
    tf16 = t16.text_frame
    tf16.word_wrap = True

    p_ty = tf16.paragraphs[0]
    p_ty.alignment = PP_ALIGN.CENTER
    r_ty = p_ty.add_run()
    r_ty.text = "Thank You!"
    r_ty.font.name = 'Arial'
    r_ty.font.size = Pt(36)
    r_ty.font.bold = True
    r_ty.font.color.rgb = C_WHITE

    p_qa = tf16.add_paragraph()
    p_qa.alignment = PP_ALIGN.CENTER
    p_qa.space_before = Pt(12)
    r_qa = p_qa.add_run()
    r_qa.text = "Questions & Answers (Q&A)"
    r_qa.font.name = 'Arial'
    r_qa.font.size = Pt(18)
    r_qa.font.bold = True
    r_qa.font.color.rgb = C_AGRI_LIGHT

    p_sub16 = tf16.add_paragraph()
    p_sub16.alignment = PP_ALIGN.CENTER
    p_sub16.space_before = Pt(18)
    r_sub16 = p_sub16.add_run()
    r_sub16.text = (
        "AgriSmart AI — Intelligent Crop Recommendation System\n"
        "Presented by: [STUDENT NAME] (Roll No: [ROLL NUMBER])\n"
        "Under the Guidance of: [FACULTY NAME]\n"
        "Department of Computer Science & Engineering • [UNIVERSITY NAME]"
    )
    r_sub16.font.name = 'Arial'
    r_sub16.font.size = Pt(11)
    r_sub16.font.color.rgb = C_WHITE

    set_speaker_notes(
        s16,
        "Thank you respected committee members for your time and attention. "
        "I am now open to any questions regarding the deep neural network architecture, data preprocessing pipeline, "
        "API integration, or practical agricultural deployment."
    )

    prs.save(PPTX_PATH)
    print(f"Presentation saved successfully at: {PPTX_PATH}")

if __name__ == '__main__':
    build_presentation()
