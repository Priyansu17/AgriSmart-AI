"""
Generates the comprehensive Academic Project Synopsis for AgriSmart AI
in DOCX and converts to PDF using Microsoft Word COM automation.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

DOC_DIR = os.path.dirname(os.path.abspath(__file__))
DIAG_DIR = os.path.join(DOC_DIR, 'diagrams')
SHOTS_DIR = os.path.join(DOC_DIR, 'screenshots')

DOCX_PATH = os.path.join(DOC_DIR, 'AgriSmart_AI_Project_Synopsis.docx')
PDF_PATH = os.path.join(DOC_DIR, 'AgriSmart_AI_Project_Synopsis.pdf')

# Palette
COLOR_FOREST_DARK = RGBColor(15, 47, 31)    # #0F2F1F
COLOR_AGRI_GREEN  = RGBColor(45, 117, 45)   # #2D752D
COLOR_EARTH_BROWN = RGBColor(140, 109, 70)  # #8C6D46
COLOR_SLATE_DARK  = RGBColor(30, 41, 59)    # #1E293B
COLOR_MUTED_GRAY  = RGBColor(100, 116, 139) # #64748B

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_callout_box(doc, title, text, fill_hex="F4F9F4", border_hex="2D752D"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, fill_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    # Left border only styling via XML
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>'
        f'<w:top w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    run_title = p.add_run(f"📌 {title}\n")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(10)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_FOREST_DARK

    run_text = p.add_run(text)
    run_text.font.name = 'Arial'
    run_text.font.size = Pt(9.5)
    run_text.font.color.rgb = COLOR_SLATE_DARK
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_synopsis_docx():
    print("Building AgriSmart AI Project Synopsis DOCX...")
    doc = docx.Document()

    # Page setup - Margins 1 inch
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True

        # Header for page 2 onwards
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("AgriSmart AI — Intelligent Crop Recommendation System | Project Synopsis")
        hrun.font.name = 'Arial'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = COLOR_MUTED_GRAY

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Department of Computer Science & Engineering • Academic Project Synopsis")
        frun.font.name = 'Arial'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = COLOR_MUTED_GRAY

    # Helper function for headings
    def add_sec_heading(title, level=1):
        p = doc.add_paragraph()
        p.paragraph_format.keep_with_next = True
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(title)
        run.font.name = 'Arial'
        if level == 1:
            run.font.size = Pt(14)
            run.font.bold = True
            run.font.color.rgb = COLOR_FOREST_DARK
        elif level == 2:
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = COLOR_AGRI_GREEN
        else:
            run.font.size = Pt(10.5)
            run.font.bold = True
            run.font.color.rgb = COLOR_SLATE_DARK
        return p

    def add_p(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Arial'
            run_b.font.size = Pt(10)
            run_b.font.bold = True
            run_b.font.color.rgb = COLOR_SLATE_DARK
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10)
        run.font.color.rgb = COLOR_SLATE_DARK
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Arial'
            run_b.font.size = Pt(10)
            run_b.font.bold = True
            run_b.font.color.rgb = COLOR_SLATE_DARK
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10)
        run.font.color.rgb = COLOR_SLATE_DARK
        return p

    def add_image_box(img_path, caption, width=Inches(6.2)):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(3)
            p_img.paragraph_format.keep_with_next = True
            run = p_img.add_run()
            run.add_picture(img_path, width=width)

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(0)
            p_cap.paragraph_format.space_after = Pt(10)
            r_cap = p_cap.add_run(f"Figure: {caption}")
            r_cap.font.name = 'Arial'
            r_cap.font.size = Pt(8.5)
            r_cap.font.italic = True
            r_cap.font.color.rgb = COLOR_MUTED_GRAY

    # -------------------------------------------------------------
    # 1. COVER PAGE
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(18)
    p_inst.paragraph_format.space_after = Pt(4)
    run_inst = p_inst.add_run("ACADEMIC PROJECT SYNOPSIS\nDEPARTMENT OF COMPUTER SCIENCE & ENGINEERING")
    run_inst.font.name = 'Arial'
    run_inst.font.size = Pt(11)
    run_inst.font.bold = True
    run_inst.font.color.rgb = COLOR_AGRI_GREEN

    # Decorative line
    p_rule = doc.add_paragraph()
    p_rule.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rule.paragraph_format.space_after = Pt(28)
    r_rule = p_rule.add_run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    r_rule.font.name = 'Arial'
    r_rule.font.size = Pt(10)
    r_rule.font.color.rgb = COLOR_EARTH_BROWN

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("AgriSmart AI — Intelligent Crop Recommendation System")
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_FOREST_DARK

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(28)
    r_sub = p_sub.add_run("A Precision Agriculture Web Platform Powered by Deep Neural Networks (Keras) & Micro-Climate Analytics")
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(11.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_SLATE_DARK

    # Badge Callout
    add_callout_box(
        doc,
        "Project Classification & Evaluation Benchmark",
        "Domain: Machine Learning / Deep Learning / Precision Agri-Tech\n"
        "Model Architecture: TensorFlow/Keras 6-Layer Sequential Neural Network\n"
        "Validated Test Accuracy: 97.50% | Test Loss: 0.0563 | Test Set: 440 Benchmark Observations\n"
        "Web Framework: Python Flask REST API & React 19 / Vite / Tailwind CSS Frontend",
        fill_hex="E6F3E6", border_hex="2D752D"
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(30)

    # Submitter Details Table
    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    meta_table.columns[0].width = Inches(2.2)
    meta_table.columns[1].width = Inches(4.3)

    fields = [
        ("Candidate / Student Name:", "[STUDENT NAME]"),
        ("University Roll Number:", "[ROLL NUMBER]"),
        ("Degree & Branch:", "[COURSE AND BRANCH]"),
        ("Institution / University:", "[UNIVERSITY NAME]"),
        ("Academic Session / Year:", "[SESSION]"),
        ("Under the Guidance of:", "[FACULTY NAME] (Project Supervisor)")
    ]

    for idx, (label, val) in enumerate(fields):
        row = meta_table.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        set_cell_margins(c0, top=70, bottom=70, left=80, right=80)
        set_cell_margins(c1, top=70, bottom=70, left=80, right=80)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")

        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(label)
        r0.font.name = 'Arial'
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_FOREST_DARK

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(val)
        r1.font.name = 'Arial'
        r1.font.size = Pt(9.5)
        r1.font.bold = (idx == 0 or idx == 5)
        r1.font.color.rgb = COLOR_SLATE_DARK

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2. ABSTRACT
    # -------------------------------------------------------------
    add_sec_heading("1. Abstract")
    add_p(
        "Agriculture remains the backbone of the global economy, yet traditional crop selection methods "
        "frequently rely on historical intuition, trial-and-error, or regional monoculture conventions. Such approaches "
        "fail to dynamically account for fluctuating soil macronutrient concentrations and localized atmospheric parameters, "
        "leading to diminished crop yields, soil degradation, and severe economic losses for agricultural producers. "
        "This project presents AgriSmart AI, a full-stack precision agriculture decision-support system driven by "
        "a trained deep neural network developed in TensorFlow/Keras."
    )
    add_p(
        "The core model evaluates seven continuous agronomic input variables: soil Nitrogen (N), Phosphorus (P), Potassium (K), "
        "ambient Temperature, Relative Humidity, Soil pH, and Precipitation (Rainfall). Input vectors are standardized via "
        "a pre-fitted StandardScaler and processed through a 6-layer feedforward neural network comprising Dense layers with "
        "Rectified Linear Unit (ReLU) activations, Dropout regularization to mitigate overfitting, and a 22-way Softmax output layer. "
        "Rigorous empirical evaluation over a hold-out test set of 440 samples demonstrates an outstanding classification accuracy "
        "of 97.50% with a test loss of 0.0563. The model is operationalized via a lightweight Python Flask REST API and paired with "
        "a responsive, nature-inspired React 19 single-page application built with Vite and Tailwind CSS. Beyond classification, "
        "AgriSmart AI delivers top-3 probabilistic crop alternatives, nutrient demand assessments, and seasonal cultivation advisories, "
        "providing a mathematically rigorous yet user-accessible tool for modern smart farming."
    )

    # -------------------------------------------------------------
    # 3. INTRODUCTION
    # -------------------------------------------------------------
    add_sec_heading("2. Introduction")
    add_p(
        "With the accelerating impacts of climate change, fluctuating seasonal rainfall, and intensive farming pressures on arable land, "
        "precision agriculture has transitioned from a theoretical concept into an imperative necessity. Soil fertility is fundamentally "
        "governed by the availability of primary macronutrients—Nitrogen, Phosphorus, and Potassium (NPK)—which dictate vegetative vigor, "
        "root architecture, and metabolic resilience. Simultaneously, atmospheric micro-climates (ambient temperature, atmospheric humidity, "
        "and precipitation) and soil chemistry (pH balance) determine whether a specific crop cultivar can complete its physiological growth cycle."
    )
    add_p(
        "While routine soil testing laboratory services are increasingly accessible, farmers frequently lack actionable analytical tools "
        "to translate soil chemistry reports and meteorological data into optimized planting decisions. AgriSmart AI bridges this critical "
        "gap by embedding deep learning intelligence into an intuitive, high-performance web dashboard. By providing real-time crop recommendations, "
        "confidence probability meters, and risk-mitigating alternative choices, the system empowers farmers, agricultural students, "
        "and agronomists to maximize land productivity while safeguarding ecological balance."
    )

    # -------------------------------------------------------------
    # 4. PROBLEM STATEMENT
    # -------------------------------------------------------------
    add_sec_heading("3. Problem Statement")
    add_p("Modern agriculture faces several acute operational dilemmas that directly threaten crop productivity and rural livelihoods:")
    add_bullet("Traditional Heuristics vs. Scientific Optimization: Most smallholder and medium-scale farmers select crops based on ancestral tradition or prevailing market hype, without objective verification against the current biochemical state of their soil.")
    add_bullet("Unbalanced Chemical Fertilization: Inadequate knowledge regarding existing soil NPK ratios causes either over-application of synthetic fertilizers (leading to soil acidification, groundwater contamination, and excessive expense) or under-application (causing stunted growth).")
    add_bullet("Precipitation and Climate Volatility: Erratic monsoon patterns and unpredictable thermal conditions render static crop calendars obsolete. Crops planted under mismatched atmospheric humidity or precipitation thresholds suffer severe yield penalties.")
    add_bullet("Lack of Accessible Decision Support: Existing agro-advisory mechanisms are either paper-based, slow, or restricted to complex statistical software inaccessible to non-technical users.")

    # -------------------------------------------------------------
    # 5. AIM AND OBJECTIVES
    # -------------------------------------------------------------
    add_sec_heading("4. Aim and Objectives")
    add_p(
        "The overarching aim of AgriSmart AI is to develop, validate, and deploy an intelligent, end-to-end crop recommendation platform "
        "that leverages deep neural networks to prescribe optimal crop cultivars based on measurable soil and atmospheric parameters."
    )
    add_p("The specific technical objectives of the project are as follows:")
    add_bullet("To preprocess and standardize agricultural benchmark data spanning 22 distinct crop categories and 2,200 observation records across 7 vital agronomic features.")
    add_bullet("To design, train, and hyperparameter-tune a multi-layer deep neural network (Keras Sequential) capable of multi-class classification with test accuracy exceeding 95%.")
    add_bullet("To serialize the trained neural network, StandardScaler, and LabelEncoder into persistent deployment artifacts for deterministic zero-drift production inference.")
    add_bullet("To construct a high-throughput, secure Python Flask REST API featuring comprehensive input range validation, probabilistic ranking, and historical logging.")
    add_bullet("To engineer a modern, mobile-responsive React single-page frontend featuring dual slider/numeric input controls, interactive Chart.js visualizations, and an agronomic cultivation guide.")
    add_bullet("To provide ranked top-3 probabilistic crop alternatives to support farmer contingency planning rather than presenting rigid binary outcomes.")

    # -------------------------------------------------------------
    # 6. SCOPE OF THE PROJECT
    # -------------------------------------------------------------
    add_sec_heading("5. Scope of the Project")
    add_p(
        "The scope of AgriSmart AI encompasses the entire operational pipeline from raw laboratory/weather data ingestion to actionable field advisory:",
        bold_prefix="Functional Boundaries: "
    )
    add_bullet("Supported Botanical Classes: Recommends 22 major commercial crops including cereals (Rice, Maize), pulses (Chickpea, Kidney Beans, Pigeon Peas, Moth Beans, Mung Bean, Blackgram, Lentil), fruits (Apple, Banana, Mango, Grapes, Watermelon, Muskmelon, Orange, Papaya, Pomegranate), fiber crops (Cotton, Jute), and plantation crops (Coffee, Coconut).")
    add_bullet("Input Feature Domain: Strictly bounded to 7 measurable parameters: N (0-300 kg/ha), P (0-300 kg/ha), K (0-350 kg/ha), Temperature (-10°C to 60°C), Relative Humidity (0-100%), Soil pH (1.0-14.0), and Rainfall (0-1000 mm).")
    add_bullet("Target Audience: University agricultural engineering departments, agronomists, extension officers, progressive farming cooperatives, and educational demonstration.")
    add_bullet("Deployment Profile: Lightweight local or cloud server configuration operating without external paid API dependencies or third-party proprietary services.")

    # -------------------------------------------------------------
    # 7. EXISTING SYSTEM VS PROPOSED SYSTEM
    # -------------------------------------------------------------
    add_sec_heading("6. Existing System and Proposed System")
    add_p("A comparative analysis highlighting the architectural and operational advantages of AgriSmart AI over legacy approaches:")

    comp_table = doc.add_table(rows=6, cols=3)
    comp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    comp_table.autofit = False
    comp_table.columns[0].width = Inches(1.8)
    comp_table.columns[1].width = Inches(2.3)
    comp_table.columns[2].width = Inches(2.4)

    headers = ["Evaluation Metric", "Legacy / Existing Methods", "AgriSmart AI (Proposed System)"]
    for c_idx, h in enumerate(headers):
        cell = comp_table.rows[0].cells[c_idx]
        set_cell_background(cell, "0F2F1F")
        set_cell_margins(cell, top=100, bottom=100, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    comp_data = [
        ("Decision Mechanism", "Rule-based static lookup tables, farmer intuition, or simplistic decision trees.", "Multi-layer deep neural network computing non-linear feature interactions."),
        ("Accuracy & Generalization", "Typically 75% - 85%; prone to high variance and severe underfitting.", "Validated 97.50% test accuracy on unseen data with cross-entropy loss of 0.0563."),
        ("Output Diversity", "Single deterministic crop output without confidence estimation.", "Ranked top-3 crop suggestions with calibrated softmax probability percentages."),
        ("User Experience", "Command-line scripts, static paper charts, or cumbersome desktop software.", "Modern responsive web dashboard (React 19 + Tailwind CSS) with synchronized inputs & charts."),
        ("Agronomic Guidance", "Displays only the crop name without context.", "Comprehensive cultivation guide: harvest days, water need, soil type, and farmer field advisory.")
    ]

    for r_idx, row_vals in enumerate(comp_data, start=1):
        for c_idx, val in enumerate(row_vals):
            cell = comp_table.rows[r_idx].cells[c_idx]
            set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = 'Arial'
            r.font.size = Pt(8.5)
            r.font.bold = (c_idx == 0)
            r.font.color.rgb = COLOR_SLATE_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 8. LITERATURE REVIEW AND RELATED WORK
    # -------------------------------------------------------------
    add_sec_heading("7. Literature Review and Related Work")
    add_p(
        "The integration of machine learning into agricultural decision systems has been widely explored in recent academic literature. "
        "A rigorous review of verified, peer-reviewed foundations reveals the evolution of computational agro-intelligence:"
    )
    add_bullet(
        "Food and Agriculture Organization (FAO) Agro-Ecological Framework: Foundational agricultural literature (FAO, Rome) establishes "
        "that crop vegetative growth is constrained by Liebig's Law of the Minimum—the principle that crop yield is dictated not by total "
        "resource availability, but by the scarcest nutrient or climate factor. This justifies the holistic modeling of N, P, K alongside temperature, humidity, pH, and precipitation."
    )
    add_bullet(
        "Rajak et al. (2017) on Machine Learning in Crop Recommendation: Published in the International Journal of Computer Applications, "
        "the authors explored basic classification algorithms (Support Vector Machines, Naive Bayes, and Random Forests) on Indian soil datasets. "
        "Their work achieved accuracies between 88% and 92%, highlighting the promise of algorithmic recommendations but noting limitations in handling non-linear boundary distributions."
    )
    add_bullet(
        "Kumar et al. (2020) on Soil Nutrient and Climate Prediction: Investigated supervised machine learning techniques for crop recommendation, "
        "demonstrating that combining soil chemistry with meteorological factors significantly outperforms soil-only models. However, their proposed architectures "
        "lacked persistent REST API deployment and intuitive farmer-facing interactive user interfaces."
    )
    add_bullet(
        "Goodfellow, Bengio, and Courville (2016) Deep Learning Principles: Establishes that feedforward neural networks equipped with non-linear activation functions "
        "(such as ReLU) and regularization mechanisms (Dropout) serve as universal function approximators capable of capturing intricate high-dimensional interactions "
        "between environmental covariates without manual feature engineering."
    )

    # -------------------------------------------------------------
    # 9. DATASET DESCRIPTION AND INPUT FEATURES
    # -------------------------------------------------------------
    add_sec_heading("8. Dataset Description and Input Features")
    add_p(
        "The system is trained on an empirical agricultural dataset comprising 2,200 verified observation records. "
        "The dataset features perfect class balance, containing exactly 100 observations for each of the 22 supported crop categories, "
        "preventing model bias toward any single cultivar. The dataset contains zero missing or null values."
    )

    # Table of Features
    feat_table = doc.add_table(rows=8, cols=4)
    feat_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    feat_table.autofit = False
    feat_table.columns[0].width = Inches(1.5)
    feat_table.columns[1].width = Inches(0.9)
    feat_table.columns[2].width = Inches(1.4)
    feat_table.columns[3].width = Inches(2.7)

    f_headers = ["Feature Name", "Unit", "Observed Range", "Agronomic Relevance & Biological Role"]
    for c_idx, h in enumerate(f_headers):
        cell = feat_table.rows[0].cells[c_idx]
        set_cell_background(cell, "0F2F1F")
        set_cell_margins(cell, top=100, bottom=100, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    feat_data = [
        ("Nitrogen (N)", "kg/ha", "0 to 140", "Essential macronutrient for chlorophyll synthesis, foliage vigor, and protein structure."),
        ("Phosphorus (P)", "kg/ha", "5 to 145", "Drives cellular energy transfer (ATP), deep root development, and early blooming."),
        ("Potassium (K)", "kg/ha", "5 to 205", "Regulates stomatal opening, osmotic water potential, disease resistance, and fruit weight."),
        ("Temperature", "°C", "8.8 to 43.7", "Dictates enzyme kinetics, metabolic respiration rates, and vegetative growth velocity."),
        ("Relative Humidity", "%", "14.3 to 99.9", "Governs leaf transpiration rates, moisture retention, and foliar disease vulnerability."),
        ("Soil pH", "scale", "3.50 to 9.94", "Controls chemical bioavailability and microbial solubilization of soil minerals to roots."),
        ("Rainfall", "mm", "20.2 to 298.6", "Supplies seasonal hydration; dictates irrigation requirement and waterlogging thresholds.")
    ]

    for r_idx, row_vals in enumerate(feat_data, start=1):
        for c_idx, val in enumerate(row_vals):
            cell = feat_table.rows[r_idx].cells[c_idx]
            set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = 'Arial'
            r.font.size = Pt(8.5)
            r.font.bold = (c_idx == 0)
            r.font.color.rgb = COLOR_SLATE_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 10. PROPOSED METHODOLOGY
    # -------------------------------------------------------------
    add_sec_heading("9. Proposed Methodology")
    add_p("The development and operationalization of AgriSmart AI followed a rigorous six-phase machine learning engineering methodology:")
    add_bullet("Phase 1 — Data Ingestion and Exploratory Analysis: Examined statistical distributions, correlations, and verified zero class imbalance across the 2,200 observation records.")
    add_bullet("Phase 2 — Feature Scaling & Preprocessing: Applied Scikit-Learn's StandardScaler to fit mean and variance parameters across the 7 numerical features. This normalizes input features according to z = (x - μ) / σ, preventing magnitude bias between high-range features (Rainfall) and low-range features (Soil pH).")
    add_bullet("Phase 3 — Label Encoding: Transformed 22 textual crop names into integer indices (0 to 21) using LabelEncoder, generating a bijective mapping for neural network multi-class target loss computation.")
    add_bullet("Phase 4 — Stratified Dataset Partitioning: Split the 2,200 records into an 80% training set (1,760 samples) and a 20% hold-out test set (440 samples) maintaining exact class proportions (20 test samples per crop).")
    add_bullet("Phase 5 — Neural Network Architecture & Optimization: Configured a sequential architecture in Keras utilizing Dense layers, Dropout regularization, Adam optimizer, and Sparse Categorical Crossentropy loss function.")
    add_bullet("Phase 6 — Artifact Serialization & API Deployment: Saved the trained model (.keras), scaler (.pkl), and label encoder (.pkl) for deployment within a Flask REST service.")

    # -------------------------------------------------------------
    # 11. SYSTEM ARCHITECTURE AND WORKFLOW
    # -------------------------------------------------------------
    add_sec_heading("10. System Architecture and Workflow")
    add_p(
        "AgriSmart AI is organized as a decoupled, multi-tier distributed architecture ensuring modularity, high performance, "
        "and clean separation of concerns between client presentation, API validation, and neural network inference."
    )

    # Insert Architecture Diagram
    arch_img = os.path.join(DIAG_DIR, 'system_architecture.png')
    add_image_box(arch_img, "AgriSmart AI 4-Tier High-Level System Architecture")

    add_p(
        "The end-to-end dataflow pipeline is depicted below, illustrating the sequential transformation of raw agronomic inputs "
        "into standardized tensors, neural logits, class probabilities, and enriched farming advisories:"
    )

    # Insert Workflow Diagram
    wf_img = os.path.join(DIAG_DIR, 'prediction_workflow.png')
    add_image_box(wf_img, "AgriSmart AI 5-Stage Machine Learning Prediction Workflow")

    # -------------------------------------------------------------
    # 12. MODEL DEVELOPMENT AND EVALUATION
    # -------------------------------------------------------------
    add_sec_heading("11. Model Development and Evaluation")
    add_p(
        "The neural network was constructed using TensorFlow 2.21 and Keras Sequential API. The layer configuration and parameter counts "
        "extracted directly from the serialized model artifact (`crop_recommendation_model.keras`) are summarized below:"
    )

    # Model Summary Table
    model_table = doc.add_table(rows=7, cols=4)
    model_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    model_table.autofit = False
    model_table.columns[0].width = Inches(1.8)
    model_table.columns[1].width = Inches(1.4)
    model_table.columns[2].width = Inches(1.5)
    model_table.columns[3].width = Inches(1.8)

    m_headers = ["Layer Name & Type", "Activation / Function", "Output Shape", "Trainable Parameters"]
    for c_idx, h in enumerate(m_headers):
        cell = model_table.rows[0].cells[c_idx]
        set_cell_background(cell, "0F2F1F")
        set_cell_margins(cell, top=100, bottom=100, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    m_data = [
        ("dense (Dense Layer 1)", "ReLU", "(None, 64)", "512 (7 inputs × 64 + 64 bias)"),
        ("dropout (Dropout 1)", "Dropout (rate = 0.2)", "(None, 64)", "0 (Regularization layer)"),
        ("dense_1 (Dense Layer 2)", "ReLU", "(None, 32)", "2,080 (64 × 32 + 32 bias)"),
        ("dropout_1 (Dropout 2)", "Dropout (rate = 0.2)", "(None, 32)", "0 (Regularization layer)"),
        ("dense_2 (Dense Layer 3)", "ReLU", "(None, 16)", "528 (32 × 16 + 16 bias)"),
        ("dense_3 (Dense Output)", "Softmax (22 classes)", "(None, 22)", "374 (16 × 22 + 22 bias)")
    ]

    for r_idx, row_vals in enumerate(m_data, start=1):
        for c_idx, val in enumerate(row_vals):
            cell = model_table.rows[r_idx].cells[c_idx]
            set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = 'Arial'
            r.font.size = Pt(8.5)
            r.font.bold = (c_idx == 0)
            r.font.color.rgb = COLOR_SLATE_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_p(
        "Total Network Parameters: 10,484 (40.96 KB) | Trainable Parameters: 3,494 (13.65 KB) | Non-Trainable Parameters: 0 | Optimizer States: 6,990 (27.31 KB).",
        bold_prefix="Parameter Metrics: "
    )

    # Insert Model Evaluation Chart
    eval_chart = os.path.join(DIAG_DIR, 'model_evaluation_chart.png')
    add_image_box(eval_chart, "Class-Wise Precision, Recall, and F1-Score Across 22 Crop Classes (440 Test Samples)")

    add_p(
        "Quantitative Evaluation Results on 440 Unseen Test Samples (from model_metrics.txt):",
        bold_prefix="Benchmark Metrics: "
    )
    add_bullet("Test Classification Accuracy: 97.50% (429 correct predictions out of 440 test samples)")
    add_bullet("Test Cross-Entropy Loss: 0.0563")
    add_bullet("Macro Average Precision: 0.98 | Macro Average Recall: 0.97 | Macro Average F1-Score: 0.97")
    add_bullet("Weighted Average Precision: 0.98 | Weighted Average Recall: 0.97 | Weighted Average F1-Score: 0.97")
    add_bullet("Perfect Classification (1.00 Precision, Recall, F1): Apple, Banana, Chickpea, Coconut, Coffee, Cotton, Grapes, Kidney Beans, Maize, Mango, Mung Bean, Muskmelon, Orange, Papaya, Pomegranate, Watermelon.")
    add_bullet("Minor Class Overlaps: Minor biochemical overlaps occur between Jute (0.88 F1) and Rice (0.86 F1), and between Blackgram (0.91 F1) and Lentil (0.86 F1) due to closely shared monsoon precipitation and nitrogen utilization ranges.")

    # -------------------------------------------------------------
    # 13. SOFTWARE AND HARDWARE REQUIREMENTS
    # -------------------------------------------------------------
    add_sec_heading("12. Software and Hardware Requirements")
    add_p("The application is optimized for low-latency operation on commodity hardware:")
    add_bullet("Hardware Requirements (Client & Development): Minimum 1.6 GHz dual-core CPU, 4 GB RAM (8 GB recommended), 2 GB free disk space, standard color monitor (1280×720 or higher).")
    add_bullet("Server Operating System: Windows 10/11, Ubuntu 20.04/22.04 LTS, or macOS 12+.")
    add_bullet("Python Environment: Python 3.12 (64-bit), Virtual Environment (venv).")
    add_bullet("Node.js Runtime: Node.js 18.x or 20.x LTS with npm package manager.")
    add_bullet("Client Browsers: Modern evergreen web browsers supporting ES6+ (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).")

    # -------------------------------------------------------------
    # 14. TECHNOLOGY STACK
    # -------------------------------------------------------------
    add_sec_heading("13. Technology Stack")
    add_p("AgriSmart AI leverages modern, industry-standard open-source frameworks:")

    tech_table = doc.add_table(rows=6, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_table.autofit = False
    tech_table.columns[0].width = Inches(1.8)
    tech_table.columns[1].width = Inches(2.2)
    tech_table.columns[2].width = Inches(2.5)

    t_headers = ["Layer / Subsystem", "Technologies & Libraries", "Purpose & Architectural Role"]
    for c_idx, h in enumerate(t_headers):
        cell = tech_table.rows[0].cells[c_idx]
        set_cell_background(cell, "0F2F1F")
        set_cell_margins(cell, top=100, bottom=100, left=80, right=80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    tech_data = [
        ("Frontend Presentation", "React 19, Vite 8, Tailwind CSS v4, Lucide Icons", "Responsive single-page interface, dual-control inputs, interactive tabs, nature aesthetic."),
        ("Data Visualization", "Chart.js 4.5, React-ChartJS-2", "Dynamic rendering of class distribution bars and multi-factor agronomic comparison charts."),
        ("Application Backend", "Python 3.12, Flask 3.1, Flask-CORS", "Lightweight HTTP micro-framework, JSON REST endpoints, CORS handling, boundary validation."),
        ("Machine Learning Engine", "TensorFlow 2.21, Keras 3.15, Scikit-Learn 1.9", "StandardScaler preprocessing, neural tensor computation, softmax probability derivation."),
        ("Persistence & Artifacts", "Joblib 1.6, NumPy 2.5, Pandas 3.0, JSON file-storage", "Serialization of weights, preprocessing pipelines, dataset analytics, and prediction history.")
    ]

    for r_idx, row_vals in enumerate(tech_data, start=1):
        for c_idx, val in enumerate(row_vals):
            cell = tech_table.rows[r_idx].cells[c_idx]
            set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            r.font.name = 'Arial'
            r.font.size = Pt(8.5)
            r.font.bold = (c_idx == 0)
            r.font.color.rgb = COLOR_SLATE_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 15. APPLICATION MODULES AND FEATURES (WITH SCREENSHOTS)
    # -------------------------------------------------------------
    add_sec_heading("14. Application Modules and Implemented Features")
    add_p(
        "The AgriSmart AI web application delivers a seamless, responsive user experience structured around five core operational modules. "
        "The figures below present actual, live screenshots captured directly from the running implementation:"
    )

    # Screenshot 1: Overview
    shot_overview = os.path.join(SHOTS_DIR, '01_overview_landing.png')
    add_image_box(shot_overview, "Live Screen 1: AgriSmart AI Home / Overview Page with Hero, Model KPIs, and Quick Presets")

    add_bullet("Module 1 — Overview & Landing Page: Features an agricultural hero banner, system metrics (97.5% Accuracy, 22 Classes, 7 Features), a three-step workflow overview, and quick 1-click test profiles for instant demonstration.")

    # Screenshot 2: Recommendation Form
    shot_form = os.path.join(SHOTS_DIR, '02_recommendation_form.png')
    add_image_box(shot_form, "Live Screen 2: Interactive 7-Parameter Agricultural Input Form with Synchronized Numeric Sliders")

    add_bullet("Module 2 — Crop Recommendation Dashboard: Implements 7 dedicated input controls featuring synchronized numeric input boxes and smooth sliders. Includes informative agronomic tooltips, strict boundary validation, 1-click sample presets (Rice, Chickpea, Coffee, Watermelon, etc.), and form reset capability.")

    # Screenshot 3: Prediction Result
    shot_result = os.path.join(SHOTS_DIR, '03_prediction_result.png')
    add_image_box(shot_result, "Live Screen 3: Neural Prediction Output Displaying Primary Crop, Confidence Gauge, Top-3 Alternatives, and Agronomic Guide")

    add_bullet("Module 3 — Probabilistic Prediction Results: Highlights recommended crop name and category, confidence score percentage with visual gauge meter, ranked top-3 alternative crops, submitted input evaluation badges (Optimal/Above Average), comprehensive agronomic cultivation guide (season, harvest duration, water need, soil type, climate), and printable summary.")

    # Screenshot 4: Analytics Dashboard
    shot_analytics = os.path.join(SHOTS_DIR, '04_analytics_dashboard.png')
    add_image_box(shot_analytics, "Live Screen 4: Model Analytics Dashboard with 22-Class Distribution and Agronomic Benchmarks")

    add_bullet("Module 4 — Analytics & Dataset Dashboard: Displays 4 KPI cards, full 22-crop dataset distribution chart (balanced 100 samples/class), toggleable nutrient (NPK) vs climate comparison charts, and an interactive reference table of baseline crop averages.")

    # Screenshot 5: Prediction History
    shot_history = os.path.join(SHOTS_DIR, '05_prediction_history.png')
    add_image_box(shot_history, "Live Screen 5: Persisted Prediction History Module with 1-Click Parameter Reloading")

    add_bullet("Module 5 — Prediction History & How It Works: Logs previous inquiries persistently with timestamps, input summaries, and rankings; allows 1-click reloading of historical parameters back into the form for iterative sensitivity analysis.")

    # -------------------------------------------------------------
    # 16. RESULTS AND DISCUSSION
    # -------------------------------------------------------------
    add_sec_heading("15. Results and Discussion")
    add_p(
        "Extensive experimental testing confirms that the trained neural network exhibits remarkable discriminative capacity across 22 crop varieties. "
        "With a verified test accuracy of 97.50% and cross-entropy loss of 0.0563, the model demonstrates high generalization without evidence of overfitting."
    )
    add_p(
        "Discussion of Classification Dynamics & Minor Misclassifications:",
        bold_prefix="Agronomic Interpretation: "
    )
    add_bullet("High-Margin Separation: Crops with distinct agronomic requirements—such as Apple (demanding low temperatures and chilling hours), Coconut (thriving in tropical coastal humidity), and Cotton (requiring high potassium and moderate heat)—achieved 100% precision and recall.")
    add_bullet("Boundary Overlaps in Heavy-Rainfall Cultivars: A minor classification overlap occurs between Rice and Jute. In the dataset, Rice requires high humidity (mean 82.2%) and rainfall (mean 236 mm), while Jute requires similar atmospheric humidity (mean 79.6%) and rainfall (mean 174 mm). Under borderline moisture conditions (e.g., rainfall ~190-205 mm), the model appropriately distributes probability between Rice and Jute, reflecting authentic ecological co-viability.")
    add_bullet("Legume Nitrogen-Fixing Dynamics: Pulses like Chickpea, Lentil, and Blackgram share low nitrogen requirements due to symbiotic Rhizobium nitrogen fixation. The model effectively leverages secondary features (Phosphorus demand and Temperature) to distinguish them, achieving F1-scores between 0.86 and 1.00.")

    # -------------------------------------------------------------
    # 17. LIMITATIONS
    # -------------------------------------------------------------
    add_sec_heading("16. Limitations")
    add_p("To ensure academic honesty and rigorous engineering reporting, the following operational limitations are documented:")
    add_bullet("Statistical Correlation vs. Guaranteed Biological Yield: Model confidence scores indicate statistical proximity to historical training distributions. They do not constitute an infallible guarantee of crop harvest or profit.")
    add_bullet("Unmodeled Agronomic Variables: The current implementation does not evaluate soil micronutrients (Zinc, Boron, Iron, Manganese), soil organic carbon content, electrical conductivity (salinity), or microbiological health.")
    add_bullet("Absence of Dynamic Pest & Disease Modeling: Seasonal pest outbreaks, viral vectors, and fungal pathogens are external biological shocks that fall outside the feature boundary.")
    add_bullet("Market & Economic Volatility: The system focuses strictly on ecological and physiological suitability, without integrating real-time crop market prices, transportation costs, or supply-chain demand.")

    # -------------------------------------------------------------
    # 18. FUTURE ENHANCEMENTS
    # -------------------------------------------------------------
    add_sec_heading("17. Future Enhancements")
    add_p("Future research and engineering iterations will focus on expanding AgriSmart AI into an intelligent farm management suite:")
    add_bullet("IoT Soil Sensor Stream Integration: Interfacing with field-deployed micro-controller nodes (ESP32 / Arduino with NPK optical probes) to automate continuous telemetry ingestion.")
    add_bullet("Satellite Remote Sensing (NDVI / Sentinel-2): Incorporating multi-spectral satellite imagery to monitor vegetative vigor indices and canopy moisture in real time.")
    add_bullet("Precision Fertilizer Dosage Calculator: Developing an automated module that computes specific fertilizer application quantities (e.g., Urea, DAP, MOP in kg/acre) required to bridge soil deficiencies.")
    add_bullet("Multi-Lingual Vernacular Voice Interface: Introducing multi-lingual natural language voice queries (Hindi, Marathi, Punjabi, Telugu, Tamil, Bengali) to ensure usability among non-English-speaking rural farmers.")

    # -------------------------------------------------------------
    # 19. CONCLUSION
    # -------------------------------------------------------------
    add_sec_heading("18. Conclusion")
    add_p(
        "AgriSmart AI successfully demonstrates the practical efficacy of applying deep neural networks to precision agriculture. "
        "By training a regularized multi-layer feedforward architecture on balanced multi-factor agronomic data, the system achieves "
        "an outstanding 97.50% test accuracy across 22 certified crop classes. The integration of this neural engine into a modern "
        "Flask and React web architecture transforms complex mathematical inference into an intuitive, visually engaging, and actionable "
        "decision-support utility. By offering top-3 probabilistic rankings, nutrient demand analysis, and seasonal agronomic advisory, "
        "AgriSmart AI exemplifies the transformative potential of artificial intelligence in advancing sustainable, data-driven agriculture."
    )

    # -------------------------------------------------------------
    # 20. REFERENCES
    # -------------------------------------------------------------
    add_sec_heading("19. References")
    refs = [
        "Food and Agriculture Organization (FAO). (2020). Crop Ecological Requirements and Land Evaluation Guidelines. FAO Land and Water Bulletin, Rome, Italy.",
        "Rajak, R. K., Pawar, F., Pendke, M., Shinde, P., Rathod, S., & Deokate, A. (2017). Crop recommendation system to maximize crop yield using machine learning technique. International Journal of Computer Applications, 161(2), 19-23.",
        "Kumar, R., Singh, M. P., Kumar, P., & Singh, J. P. (2020). Crop Selection and Fertilizer Recommendation using Machine Learning Algorithms. In 2020 International Conference on Computing, Communication, and Intelligent Systems (ICCCIS) (pp. 382-387). IEEE.",
        "Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press, Cambridge, MA. http://www.deeplearningbook.org",
        "Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., ... & Duchesnay, É. (2011). Scikit-learn: Machine learning in Python. Journal of Machine Learning Research, 12(Oct), 2825-2830.",
        "Chollet, F., et al. (2015). Keras: Deep Learning for Humans. GitHub Repository: https://github.com/keras-team/keras",
        "Abadi, M., et al. (2016). TensorFlow: A system for large-scale machine learning. In 12th USENIX Symposium on Operating Systems Design and Implementation (OSDI 16) (pp. 265-283).",
        "Pudumalar, S., Ramanujam, E., Rajashree, R. H., Kavya, C., Kiruthika, T., & Prasanth, J. (2017). Crop recommendation system for precision agriculture. In 2016 Eighth International Conference on Advanced Computing (ICoAC) (pp. 32-36). IEEE."
    ]

    for idx, ref in enumerate(refs, start=1):
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.space_before = Pt(0)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.15
        p_ref.paragraph_format.left_indent = Inches(0.3)
        p_ref.paragraph_format.first_line_indent = Inches(-0.3)
        r_num = p_ref.add_run(f"[{idx}] ")
        r_num.font.name = 'Arial'
        r_num.font.size = Pt(9.5)
        r_num.font.bold = True
        r_num.font.color.rgb = COLOR_AGRI_GREEN

        r_text = p_ref.add_run(ref)
        r_text.font.name = 'Arial'
        r_text.font.size = Pt(9.5)
        r_text.font.color.rgb = COLOR_SLATE_DARK

    doc.save(DOCX_PATH)
    print(f"DOCX created successfully at: {DOCX_PATH}")

def convert_docx_to_pdf():
    print(f"Converting DOCX to PDF using MS Word: {PDF_PATH}...")
    import win32com.client
    import pythoncom
    
    pythoncom.CoInitialize()
    word = None
    try:
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(os.path.abspath(DOCX_PATH))
        # 17 represents wdFormatPDF
        doc.SaveAs(os.path.abspath(PDF_PATH), FileFormat=17)
        doc.Close()
        print("PDF conversion completed successfully!")
    except Exception as e:
        print(f"Error converting via MS Word: {e}")
        raise
    finally:
        if word:
            word.Quit()
        pythoncom.CoUninitialize()

if __name__ == '__main__':
    build_synopsis_docx()
    convert_docx_to_pdf()
