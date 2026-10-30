import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Cpu, 
  Workflow, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  RefreshCw, 
  Play, 
  Pause, 
  Info, 
  HelpCircle,
  Database,
  Calculator,
  Compass,
  PieChart,
  BarChart2,
  Sprout
} from 'lucide-react';
import { useApp } from '../AppContext';
import UnitInfoTooltip from './UnitInfoTooltip';

// Dataset baseline feature statistics from fitted StandardScaler
const FEATURE_STATS = {
  N: { label: 'Nitrogen (N) • नाइट्रोजन', unit: 'kg/ha', mean: 50.55, std: 36.91, min: 0, max: 140, default: 90 },
  P: { label: 'Phosphorus (P) • फास्फोरस', unit: 'kg/ha', mean: 53.36, std: 32.99, min: 5, max: 145, default: 42 },
  K: { label: 'Potassium (K) • पोटाश', unit: 'kg/ha', mean: 48.15, std: 50.65, min: 5, max: 205, default: 43 },
  temperature: { label: 'Temperature • तापमान', unit: '°C', mean: 25.62, std: 5.06, min: 8.8, max: 43.7, default: 20.87 },
  humidity: { label: 'Humidity • आर्द्रता/नमी', unit: '%', mean: 71.48, std: 22.26, min: 14.3, max: 99.9, default: 82.0 },
  ph: { label: 'Soil pH • मृदा पीएच', unit: 'scale', mean: 6.47, std: 0.77, min: 3.5, max: 9.9, default: 6.5 },
  rainfall: { label: 'Rainfall • वर्षा/बारिश', unit: 'mm', mean: 103.46, std: 54.96, min: 20.2, max: 298.6, default: 202.9 }
};

const PIPELINE_STAGES = [
  {
    id: 1,
    title: 'Input Vector',
    titleHi: 'कृषि इनपुट वेक्टर',
    tag: 'x ∈ ℝ⁷',
    desc: 'Collects 7 raw field measurements across soil nutrients (N, P, K) and micro-climate conditions.'
  },
  {
    id: 2,
    title: 'StandardScaler',
    titleHi: 'प्रमाणीकरण (Z-Score)',
    tag: 'z = (x - μ) / σ',
    desc: 'Transforms features to zero mean (μ=0) and unit variance (σ=1) to prevent scale domination.'
  },
  {
    id: 3,
    title: 'Neural Network',
    titleHi: 'डीप न्यूरल नेटवर्क',
    tag: 'Dense 128 → 64',
    desc: 'Dense feed-forward layers with ReLU non-linearities and Dropout compute latent agronomic representations.'
  },
  {
    id: 4,
    title: 'Softmax & Decode',
    titleHi: 'सॉफ्टमैक्स एवं डिकोडिंग',
    tag: 'Softmax(22) → Argmax',
    desc: 'Converts raw logits into calibrated probability distributions across 22 crops and decodes class indices.'
  },
  {
    id: 5,
    title: 'Agronomic Advisory',
    titleHi: 'कृषि परामर्श एवं विश्लेषण',
    tag: 'Top-3 + Economics',
    desc: 'Synthesizes recommendations with seasonal timing, water needs, and profit margin analysis.'
  }
];

export default function InteractivePipeline() {
  const { t, isDark, language } = useApp();
  const [activeStage, setActiveStage] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);

  // Stage 2: Scaler simulator states
  const [scalerN, setScalerN] = useState(90);
  const [scalerPh, setScalerPh] = useState(6.5);
  const [scalerRain, setScalerRain] = useState(202.9);

  // Stage 3: Layer inspector state
  const [activeLayer, setActiveLayer] = useState('dense1');

  // Stage 4: Softmax sharpness slider
  const [confidenceSharpness, setConfidenceSharpness] = useState(85);

  // Auto-cycle stages if play mode is toggled
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStage((prev) => (prev % 5) + 1);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Compute live Z-scores
  const zScoreN = ((scalerN - FEATURE_STATS.N.mean) / FEATURE_STATS.N.std).toFixed(2);
  const zScorePh = ((scalerPh - FEATURE_STATS.ph.mean) / FEATURE_STATS.ph.std).toFixed(2);
  const zScoreRain = ((scalerRain - FEATURE_STATS.rainfall.mean) / FEATURE_STATS.rainfall.std).toFixed(2);

  // Simulated top crops for Stage 4 based on sharpness
  const top1Prob = Math.min(96, Math.max(55, Math.round(confidenceSharpness)));
  const remaining = 100 - top1Prob;
  const top2Prob = Math.round(remaining * 0.65);
  const top3Prob = remaining - top2Prob;

  return (
    <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-xl transition-all space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-forest-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-800 dark:text-agri-300 text-xs font-bold uppercase tracking-wider mb-1.5 border border-agri-200 dark:border-agri-800">
            <Workflow className="w-3.5 h-3.5 text-agri-600 dark:text-agri-400" />
            <span>{t('interactivePlayground') || 'Interactive Machine Learning Simulator'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-forest-950 dark:text-white">
            Live AI Pipeline Explorer
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Click any phase to inspect its mathematical transformations, formula calculations, and neural activations.
          </p>
        </div>

        {/* Play / Pause walkthrough toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isPlaying
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse'
                : 'bg-agri-50 dark:bg-forest-950 text-agri-800 dark:text-agri-300 border border-agri-200 dark:border-forest-800 hover:bg-agri-100 dark:hover:bg-forest-800'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Auto-Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto-Tour Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stage Selector Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PIPELINE_STAGES.map((st) => {
          const isActive = activeStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => {
                setActiveStage(st.id);
                setIsPlaying(false);
              }}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-br from-agri-50 to-emerald-50 dark:from-forest-950 dark:to-forest-900 border-agri-500 dark:border-agri-400 ring-2 ring-agri-500/20 shadow-md -translate-y-0.5'
                  : 'bg-slate-50/70 dark:bg-forest-950/40 border-slate-200 dark:border-forest-800/80 hover:border-slate-300 dark:hover:border-forest-700 opacity-80 hover:opacity-100'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-agri-500 to-emerald-400" />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-mono font-bold ${
                  isActive ? 'text-agri-600 dark:text-agri-400' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  Phase 0{st.id}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive 
                    ? 'bg-agri-200/60 dark:bg-agri-900/60 text-forest-950 dark:text-agri-200 font-bold'
                    : 'bg-slate-200/50 dark:bg-forest-900 text-slate-500'
                }`}>
                  {st.tag}
                </span>
              </div>
              <h4 className={`text-xs font-bold leading-tight ${
                isActive ? 'text-forest-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {st.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Interactive Stage Viewport */}
      <div className="rounded-2xl border border-slate-200 dark:border-forest-800 bg-slate-50/50 dark:bg-forest-950/60 p-5 sm:p-7 space-y-6">
        
        {/* STAGE 1: Input Vector */}
        {activeStage === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-agri-600 dark:text-agri-400">Phase 01 • Raw Agricultural Vector</span>
                <h4 className="text-lg font-black text-forest-950 dark:text-white">
                  7 Measured Field Features
                </h4>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-forest-950 text-agri-300 border border-forest-800">
                Shape: Tensor(1, 7)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Before the neural network can reason about crop suitability, 7 agricultural parameters are gathered from digital soil sensors, laboratory soil health cards, and regional meteorological stations.
            </p>

            {/* 7 Feature Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(FEATURE_STATS).map(([key, stat]) => (
                <div 
                  key={key}
                  className="p-3 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 text-center space-y-1 shadow-sm"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                    x[{key}]
                  </span>
                  <div className="text-sm font-black text-forest-950 dark:text-white">
                    {stat.default} <UnitInfoTooltip unitKey={stat.unit} className="text-[10px] font-normal text-slate-400">{stat.unit}</UnitInfoTooltip>
                  </div>
                  <div className="text-[11px] font-semibold text-agri-700 dark:text-agri-400 truncate">
                    {key.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-agri-50 dark:bg-forest-900/60 border border-agri-200 dark:border-forest-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-agri-600 dark:text-agri-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-forest-950 dark:text-white">Agronomic Vector Significance (कृषि महत्व): </span>
                Macronutrients (N, P, K) dictate plant biomass, root anchoring, and drought defense. Atmospheric conditions (temperature, humidity, pH, and precipitation) dictate enzyme activity and stomatal transpiration.
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: Live StandardScaler Simulator */}
        {activeStage === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Phase 02 • Data Preprocessing</span>
                <h4 className="text-lg font-black text-forest-950 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  <span>Live StandardScaler Normalizer: z = (x - μ) / σ</span>
                </h4>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-blue-50 dark:bg-forest-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-forest-800">
                zero-mean (μ=0), unit-variance (σ=1)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Drag the sliders below to see how raw field inputs are converted into standardized Z-scores using the actual mean (μ) and standard deviation (σ) from our 2,200-sample agricultural dataset.
            </p>

            {/* Live Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Nitrogen Slider */}
              <div className="p-4 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t('paramN') || 'Nitrogen (N)'}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {scalerN} <UnitInfoTooltip unitKey="kg/ha">kg/ha</UnitInfoTooltip>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="140"
                  value={scalerN}
                  onChange={(e) => setScalerN(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="text-[11px] font-mono p-2 rounded bg-slate-50 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 text-slate-600 dark:text-slate-400">
                  <div>μ = {FEATURE_STATS.N.mean}, σ = {FEATURE_STATS.N.std}</div>
                  <div className="font-bold text-forest-950 dark:text-white mt-1">
                    z_N = ({scalerN} - 50.55) / 36.91 = <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{zScoreN}σ</span>
                  </div>
                </div>
              </div>

              {/* pH Slider */}
              <div className="p-4 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t('paramPh') || 'Soil pH'}</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{scalerPh}</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={scalerPh}
                  onChange={(e) => setScalerPh(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="text-[11px] font-mono p-2 rounded bg-slate-50 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 text-slate-600 dark:text-slate-400">
                  <div>μ = {FEATURE_STATS.ph.mean}, σ = {FEATURE_STATS.ph.std}</div>
                  <div className="font-bold text-forest-950 dark:text-white mt-1">
                    z_pH = ({scalerPh} - 6.47) / 0.77 = <span className="text-purple-600 dark:text-purple-400 font-extrabold">{zScorePh}σ</span>
                  </div>
                </div>
              </div>

              {/* Rainfall Slider */}
              <div className="p-4 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t('paramRainfall') || 'Rainfall (mm)'}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {scalerRain} <UnitInfoTooltip unitKey="mm">mm</UnitInfoTooltip>
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="300"
                  step="1"
                  value={scalerRain}
                  onChange={(e) => setScalerRain(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="text-[11px] font-mono p-2 rounded bg-slate-50 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 text-slate-600 dark:text-slate-400">
                  <div>μ = {FEATURE_STATS.rainfall.mean}, σ = {FEATURE_STATS.rainfall.std}</div>
                  <div className="font-bold text-forest-950 dark:text-white mt-1">
                    z_Rain = ({scalerRain} - 103.46) / 54.96 = <span className="text-blue-600 dark:text-blue-400 font-extrabold">{zScoreRain}σ</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Why Normalize Callout */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-forest-900/60 border border-blue-200 dark:border-forest-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Why Normalization is Mandatory:</span>
              </div>
              <p className="leading-relaxed">
                Raw precipitation can reach <strong>300 mm</strong>, whereas soil pH operates on a sensitive <strong>3.5 - 9.0</strong> logarithmic scale. Without StandardScaler, neural weights associated with pH would suffer catastrophic gradient vanishing, rendering the model blind to soil acidity!
              </p>
            </div>
          </div>
        )}

        {/* STAGE 3: Neural Net Architecture Inspector */}
        {activeStage === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Phase 03 • Deep Learning Inference</span>
                <h4 className="text-lg font-black text-forest-950 dark:text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-500" />
                  <span>Sequential Neural Network Architecture (Keras DNN)</span>
                </h4>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-50 dark:bg-forest-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-forest-800">
                Total Params: 10,710 Trainable
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Click on each neural layer below to inspect its mathematical dimensions, activation function, parameter counts, and role in agronomic decision-making.
            </p>

            {/* Interactive Layer Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'dense1',
                  name: 'Dense Layer 1',
                  nameHi: 'प्रथम सघन परत (ReLU)',
                  neurons: '128 Neurons',
                  params: '1,024 params (7×128 + 128)',
                  activation: 'ReLU (Rectified Linear Unit)',
                  desc: 'Learns non-linear interactions between soil macronutrients and climate factors.'
                },
                {
                  id: 'dropout',
                  name: 'Dropout (0.20)',
                  nameHi: 'ड्रॉपआउट परत (नियमितीकरण)',
                  neurons: 'Rate = 20%',
                  params: '0 params',
                  activation: 'Stochastic Zeroing',
                  desc: 'Deactivates 20% of random neurons during training to prevent agricultural overfitting.'
                },
                {
                  id: 'dense2',
                  name: 'Dense Layer 2',
                  nameHi: 'द्वितीय सघन परत (ReLU)',
                  neurons: '64 Neurons',
                  params: '8,256 params (128×64 + 64)',
                  activation: 'ReLU (Rectified Linear Unit)',
                  desc: 'Condenses agronomic feature representations into high-level crop suitability clusters.'
                },
                {
                  id: 'output',
                  name: 'Output Layer',
                  nameHi: 'आउटपुट परत (Softmax)',
                  neurons: '22 Neurons',
                  params: '1,430 params (64×22 + 22)',
                  activation: 'Softmax Activation',
                  desc: 'Outputs normalized probability distribution across all 22 target crop categories.'
                }
              ].map((layer) => {
                const isSelected = activeLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-forest-900 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white dark:bg-forest-950 border-slate-200 dark:border-forest-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">
                      {layer.neurons}
                    </div>
                    <div className="text-sm font-bold text-forest-950 dark:text-white mt-0.5">
                      {layer.name}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                      {layer.params}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Layer Detail Box */}
            <div className="p-4 rounded-xl bg-forest-950 text-slate-200 font-mono text-xs border border-forest-800 shadow-inner space-y-2">
              <div className="text-agri-400 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>// Layer Formulation & Activation Function</span>
              </div>
              {activeLayer === 'dense1' && (
                <div>
                  <div className="text-emerald-300 font-semibold">y₁ = ReLU(W₁ · z + b₁)</div>
                  <div className="text-slate-400 text-[11px] mt-1">Input vector z ∈ ℝ⁷ is projected into 128-dimensional hidden space. ReLU introduces non-linear thresholding: max(0, x).</div>
                </div>
              )}
              {activeLayer === 'dropout' && (
                <div>
                  <div className="text-amber-300 font-semibold">r ~ Bernoulli(1 - 0.20), y₂ = (y₁ ⊙ r) / 0.80</div>
                  <div className="text-slate-400 text-[11px] mt-1">Regularization prevents the neural network from memorizing specific field samples, improving generalization on novel farm conditions.</div>
                </div>
              )}
              {activeLayer === 'dense2' && (
                <div>
                  <div className="text-emerald-300 font-semibold">y₃ = ReLU(W₂ · y₂ + b₂)</div>
                  <div className="text-slate-400 text-[11px] mt-1">Compresses 128 latent dimensions into 64 distilled agronomic feature representations.</div>
                </div>
              )}
              {activeLayer === 'output' && (
                <div>
                  <div className="text-purple-300 font-semibold">P(c | x) = exp(z_c) / Σ exp(z_j) for j ∈ [1..22]</div>
                  <div className="text-slate-400 text-[11px] mt-1">Produces a strictly calibrated probability vector summing to 1.0 (100%) across all 22 agricultural crop classes.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 4: Softmax & Decode Simulator */}
        {activeStage === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Phase 04 • Softmax Distribution & LabelEncoder</span>
                <h4 className="text-lg font-black text-forest-950 dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-amber-500" />
                  <span>Probability Calibration & Argmax Decoding</span>
                </h4>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-amber-50 dark:bg-forest-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-forest-800">
                Classes: 22 Targets
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Adjust the confidence sharpness slider to see how Softmax separates the winning crop candidate from secondary alternatives.
            </p>

            {/* Slider */}
            <div className="p-4 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Simulated Inference Confidence (विश्वसनीयता स्तर)</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{confidenceSharpness}%</span>
              </div>
              <input
                type="range"
                min="55"
                max="98"
                value={confidenceSharpness}
                onChange={(e) => setConfidenceSharpness(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Simulated Probability Distribution */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Softmax Calibrated Probabilities:</span>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-forest-950 dark:text-white">Rank 1 • Rice (चावल / धान) [Index 20]</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{top1Prob}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-forest-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full" 
                      style={{ width: `${top1Prob}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Rank 2 • Jute (पटसन / जूट) [Index 8]</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{top2Prob}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-forest-800 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 rounded-full" 
                      style={{ width: `${top2Prob}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Rank 3 • Cotton (कपास / रुई) [Index 3]</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{top3Prob}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-forest-800 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full" 
                      style={{ width: `${top3Prob}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LabelEncoder callout */}
            <div className="p-3.5 rounded-xl bg-forest-950 text-slate-300 font-mono text-xs border border-forest-800 flex items-center justify-between">
              <div>
                <span className="text-agri-400">argmax(P)</span> = Index 20
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-amber-300">label_encoder.inverse_transform([20])</span> = <span className="text-white font-bold">"rice"</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: Agronomic Advisory */}
        {activeStage === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Phase 05 • Agronomic Advisory</span>
                <h4 className="text-lg font-black text-forest-950 dark:text-white flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-purple-500" />
                  <span>Domain Agronomy & Financial Synthesis</span>
                </h4>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-purple-50 dark:bg-forest-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-forest-800">
                Actionable Advisory
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Machine learning class probabilities alone are not enough for a farmer. In this final step, predictions are cross-referenced against agronomic domain knowledge:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 space-y-1.5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">1. Sowing Season</span>
                <h5 className="font-bold text-sm text-forest-950 dark:text-white">Kharif / Rabi / Zaid (ऋतु)</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">Matches vegetative cycle to the monsoon window to optimize natural rainfall harvesting.</p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 space-y-1.5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">2. Irrigation Demand</span>
                <h5 className="font-bold text-sm text-forest-950 dark:text-white">Water Schedule (सिंचाई)</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">Specifies flood, drip, or furrow irrigation needs based on soil transpiration rates.</p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 space-y-1.5 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">3. Economic Studio</span>
                <h5 className="font-bold text-sm text-forest-950 dark:text-white">MSP & Margins (शुद्ध लाभ)</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">Computes acreage yield, mandi rates, and precision farming ROI for financial viability.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-forest-800">
          <button
            onClick={() => {
              setActiveStage((prev) => (prev > 1 ? prev - 1 : 5));
              setIsPlaying(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-forest-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-800 transition-colors cursor-pointer"
          >
            <span>← Previous Phase</span>
          </button>

          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
            Step {activeStage} of 5
          </span>

          <button
            onClick={() => {
              setActiveStage((prev) => (prev < 5 ? prev + 1 : 1));
              setIsPlaying(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-agri-600 hover:bg-agri-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span>Next Phase →</span>
          </button>
        </div>

      </div>

    </div>
  );
}
