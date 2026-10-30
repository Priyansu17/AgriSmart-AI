import React from 'react';
import { 
  Info, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Database, 
  Workflow, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  GitBranch,
  Terminal,
  CheckCircle2,
  Sliders,
  BarChart2
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import AnimatedCounter from './AnimatedCounter';
import FarmerCharacter from './FarmerCharacter';
import InteractivePipeline from './InteractivePipeline';
import { useApp } from '../AppContext';

export default function AboutProject({ setActiveTab }) {
  const { t, isDark, language } = useApp();

  const pipelineSteps = [
    {
      num: '01',
      title: t('step1Name') || '7 Agricultural Inputs',
      desc: t('step1Explain') || 'Raw soil chemistry (Nitrogen, Phosphorus, Potassium) and local micro-climate variables (temperature, relative humidity, soil pH, and rainfall) are collected from sensors and laboratory soil cards.',
      tag: 'Vector: ℝ⁷'
    },
    {
      num: '02',
      title: t('step2Name') || 'StandardScaler Normalization',
      desc: t('step2Explain') || 'Features are standardized to zero mean (μ=0) and unit variance (σ=1) using the fitted StandardScaler artifact to prevent scale-dominated feature bias between high precipitation and pH.',
      tag: 'z = (x - μ) / σ'
    },
    {
      num: '03',
      title: t('step3Name') || 'Keras Neural Inference',
      desc: t('step3Explain') || 'Dense feed-forward layers with ReLU activation and Dropout (0.20) compute latent agronomic logits and propagate signals through 10,710 trained parameters to the final Softmax layer.',
      tag: 'Dense 128 → 64 → Softmax'
    },
    {
      num: '04',
      title: t('step4Name') || 'LabelEncoder Decoding',
      desc: t('step4Explain') || 'The argmax classification index is mapped back to the botanical crop name via the fitted LabelEncoder mapping 22 target categories without heuristic lookup tables.',
      tag: 'Inverse Mapping: {0..21}'
    },
    {
      num: '05',
      title: t('step5Name') || 'Agronomic Intelligence',
      desc: t('step5Explain') || 'Probabilities are ranked to isolate top-3 candidates, matched with irrigation, season, soil recommendations, and market MSP economics delivered to the farmer.',
      tag: 'Top-3 + Farm Advisory'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      
      {/* Header */}
      <ScrollReveal animation="fade-down" duration={500}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <FarmerCharacter 
              character="tara"
              size="sm"
              message={t('taraGreeting') || "Hi! I'm Tara. Check out our 5-step machine learning inference pipeline and interactive simulator below!"}
              showContinuousWave={true}
              className="flex-shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-800 dark:text-agri-300 text-xs font-bold uppercase tracking-wider mb-2 border border-agri-200 dark:border-forest-800">
                <Info className="w-3.5 h-3.5 text-agri-600 dark:text-agri-400" />
                <span>{t('aboutBadge') || 'System Architecture & Methodology'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-white tracking-tight">
                {t('aboutTitle') || 'How AgriSmart AI Works'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {t('aboutSubtitle') || 'AgriSmart AI combines real deep neural network inference with agronomic domain intelligence. Learn how laboratory soil samples and micro-climate metrics flow through our computational pipeline.'}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* SVG Pipeline Architecture Diagram */}
      <ScrollReveal animation="fade-up" delay={100} duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-lg transition-all space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <h3 className="text-lg font-bold text-forest-950 dark:text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-agri-600 dark:text-agri-400 animate-pulse" />
                <span>{t('pipelineFlowTitle') || 'End-to-End Machine Learning Pipeline'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('pipelineFlowSubtitle') || 'Visual dataflow from raw field measurement to classified crop recommendation.'}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-agri-50 dark:bg-forest-950 text-agri-700 dark:text-agri-300 font-semibold border border-agri-200 dark:border-forest-800">
              Pipeline Architecture
            </span>
          </div>

          {/* Responsive Interactive SVG Diagram */}
          <div className="w-full overflow-x-auto py-2">
            <div className="min-w-[720px] p-6 rounded-2xl bg-forest-950 text-white border border-forest-800 shadow-xl">
              <div className="grid grid-cols-5 gap-3 relative items-stretch">
                
                {/* Box 1 */}
                <div className="bg-forest-900/90 border border-forest-700 hover:border-agri-400 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:-translate-y-1 transition-all duration-200 group">
                  <span className="text-[10px] uppercase font-bold text-agri-400">Step 1 • Input</span>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-agri-300 transition-colors">Field Data</h4>
                    <p className="text-[11px] text-slate-300 mt-1">N, P, K, Temp, Humidity, pH, Rainfall</p>
                  </div>
                  <div className="text-[10px] bg-forest-950 px-2 py-1 rounded text-agri-300 font-mono text-center border border-forest-800">
                    Vector (1, 7)
                  </div>
                </div>

                {/* Box 2 */}
                <div className="bg-forest-900/90 border border-forest-700 hover:border-blue-400 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:-translate-y-1 transition-all duration-200 group">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Step 2 • Preprocess</span>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">StandardScaler</h4>
                    <p className="text-[11px] text-slate-300 mt-1">scaler.pkl transforms raw inputs to z-scores</p>
                  </div>
                  <div className="text-[10px] bg-forest-950 px-2 py-1 rounded text-blue-300 font-mono text-center border border-forest-800">
                    Normalized (1, 7)
                  </div>
                </div>

                {/* Box 3 */}
                <div className="bg-forest-900/90 border border-emerald-500/60 hover:border-emerald-400 rounded-xl p-4 flex flex-col justify-between space-y-2 ring-1 ring-emerald-500/50 hover:-translate-y-1 transition-all duration-200 group shadow-lg shadow-emerald-950/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Step 3 • Inference</span>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Neural Net</h4>
                    <p className="text-[11px] text-slate-300 mt-1">Sequential Keras model evaluates logits</p>
                  </div>
                  <div className="text-[10px] bg-forest-950 px-2 py-1 rounded text-emerald-300 font-mono text-center border border-forest-800">
                    Softmax (1, 22)
                  </div>
                </div>

                {/* Box 4 */}
                <div className="bg-forest-900/90 border border-forest-700 hover:border-amber-400 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:-translate-y-1 transition-all duration-200 group">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Step 4 • Decode</span>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">LabelEncoder</h4>
                    <p className="text-[11px] text-slate-300 mt-1">label_encoder.pkl maps index to crop</p>
                  </div>
                  <div className="text-[10px] bg-forest-950 px-2 py-1 rounded text-amber-300 font-mono text-center border border-forest-800">
                    Class String
                  </div>
                </div>

                {/* Box 5 */}
                <div className="bg-forest-900/90 border border-forest-700 hover:border-purple-400 rounded-xl p-4 flex flex-col justify-between space-y-2 hover:-translate-y-1 transition-all duration-200 group">
                  <span className="text-[10px] uppercase font-bold text-purple-400">Step 5 • Output</span>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Agronomic UI</h4>
                    <p className="text-[11px] text-slate-300 mt-1">Confidence %, top-3 ranking & advisory</p>
                  </div>
                  <div className="text-[10px] bg-forest-950 px-2 py-1 rounded text-purple-300 font-mono text-center border border-forest-800">
                    Actionable Guide
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* NEW INTERACTIVE PIPELINE PLAYGROUND & SIMULATOR */}
      <ScrollReveal animation="fade-up" duration={650}>
        <InteractivePipeline />
      </ScrollReveal>

      {/* Step by step details */}
      <div className="space-y-4">
        <ScrollReveal animation="fade-up" duration={500}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-forest-950 dark:text-white">
              {t('detailedPipelineBreakdown') || 'Detailed Pipeline Breakdown'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">5 Modular Stages</span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pipelineSteps.map((step, idx) => (
            <ScrollReveal 
              key={step.num} 
              animation="fade-up" 
              delay={idx * 100} 
              duration={550}
            >
              <div
                className="h-full bg-white dark:bg-forest-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-forest-800 hover:border-agri-400 dark:hover:border-agri-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-700 group-hover:text-agri-400 transition-colors">
                    {step.num}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-forest-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-forest-800">
                    {step.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-forest-950 dark:text-white group-hover:text-agri-600 dark:group-hover:text-agri-400 transition-colors">
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Model Specifications Table with Animated Counters */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-5">
          <div>
            <h3 className="text-lg font-bold text-forest-950 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-agri-600 dark:text-agri-400" />
              <span>{t('modelTechSpecs') || 'Trained Model Technical Specifications'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact hyperparameters, training configuration, and evaluation results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 space-y-1 hover:border-agri-300 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">Model Architecture</span>
              <p className="font-bold text-forest-950 dark:text-white">TensorFlow / Keras Sequential</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 space-y-1 hover:border-agri-300 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">Test Accuracy</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                <AnimatedCounter target={97.5} decimals={2} suffix="% (Validated)" />
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 space-y-1 hover:border-agri-300 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">Test Loss</span>
              <p className="font-bold text-forest-950 dark:text-white text-sm">0.0563 (Sparse Categorical)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 space-y-1 hover:border-agri-300 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">Feature Dimensions</span>
              <p className="font-bold text-forest-950 dark:text-white">7 Inputs → 22 Crop Targets</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-forest-950 text-slate-300 font-mono text-xs space-y-1 overflow-x-auto border border-forest-800 shadow-inner">
            <div className="text-agri-400 font-bold mb-1">// Model Serialization Files (उत्पादित आर्टिफैक्ट्स)</div>
            <div>• Model Weights: models/crop_recommendation_model.keras</div>
            <div>• Feature Scaler: models/scaler.pkl (StandardScaler)</div>
            <div>• Label Mapping: models/label_encoder.pkl (22 classes)</div>
            <div>• Evaluation Report: results/model_metrics.txt</div>
          </div>
        </div>
      </ScrollReveal>

      {/* Academic Integrity Notice */}
      <ScrollReveal animation="zoom-in" duration={600}>
        <div className="bg-emerald-50 dark:bg-forest-900/80 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-forest-800 space-y-3 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
          <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Academic Integrity & Engineering Methodology • वैज्ञानिक प्रामाणिकता</span>
          </h4>
          <p className="text-xs sm:text-sm text-emerald-900 dark:text-slate-300 leading-relaxed">
            This system was engineered to deliver authentic machine learning predictions rather than static lookup tables. The frontend connects asynchronously to the Python Flask backend, invoking the serialized neural network for genuine real-time inference on every user submission.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('recommend')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Launch Recommendation Tool • फसल अनुशंसा आरंभ करें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
