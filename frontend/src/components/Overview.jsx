import React from 'react';
import { 
  Sprout, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Droplets, 
  Sun, 
  Beaker, 
  Compass, 
  BarChart2, 
  CheckCircle2, 
  Layers, 
  Cpu,
  ArrowUpRight
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import AnimatedCounter from './AnimatedCounter';
import FarmerCharacter from './FarmerCharacter';
import { useApp } from '../AppContext';
import { getLocalizedCropData } from '../cropTranslations';

export default function Overview({ setActiveTab, onSelectSample }) {
  const { t, isDark, language } = useApp();

  const steps = [
    {
      step: '01',
      title: t('step1Title') || 'Enter Conditions',
      desc: t('step1Desc') || 'Input 7 essential parameters: soil macronutrients (Nitrogen, Phosphorus, Potassium - NPK) and environmental factors (temperature, humidity, soil pH, and rainfall).',
      icon: Beaker,
      accent: 'from-blue-500/10 to-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    },
    {
      step: '02',
      title: t('step2Title') || 'AI Neural Analysis',
      desc: t('step2Desc') || 'Inputs are scaled via standard preprocessing (StandardScaler) and processed through the trained deep neural network to compute class probabilities across 22 crops.',
      icon: Cpu,
      accent: 'from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-400'
    },
    {
      step: '03',
      title: t('step3Title') || 'Crop Recommendation',
      desc: t('step3Desc') || 'Receive the top primary crop recommendation with calibrated confidence %, ranked top-3 alternatives, economic viability profit estimates, and video guides.',
      icon: Sprout,
      accent: 'from-emerald-500/10 to-green-500/10 text-agri-700 dark:text-agri-400'
    }
  ];

  const features = [
    {
      title: t('feat1Title') || 'Deep Neural Network Precision',
      desc: t('feat1Desc') || 'Powered by a multi-layer Keras neural network trained on thousands of agricultural soil & climate field observations with 97.5% validated test accuracy.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    {
      title: t('feat2Title') || 'Complete Soil Nutrient Analysis',
      desc: t('feat2Desc') || 'Evaluates Nitrogen, Phosphorus, and Potassium ratios to balance crop nutrient extraction with natural soil fertility preservation.',
      icon: Activity,
      color: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    {
      title: t('feat3Title') || 'Micro-Climate Optimization',
      desc: t('feat3Desc') || 'Factors in seasonal temperature variations, relative atmospheric humidity, rainfall levels, and soil pH for optimal vegetative cycles.',
      icon: Sun,
      color: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    {
      title: t('feat4Title') || 'Ranked Probabilistic Predictions',
      desc: t('feat4Desc') || 'Delivers full probability rankings for top-3 viable crop choices, giving farmers and agronomists risk mitigation alternatives.',
      icon: BarChart2,
      color: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    }
  ];

  const quickSamples = [
    { key: 'rice', fallbackName: 'Rice', tag: 'Monsoon Heavy', N: 90, P: 42, K: 43, temp: 20.87, hum: 82, ph: 6.5, rain: 202.9 },
    { key: 'chickpea', fallbackName: 'Chickpea', tag: 'Arid Legume', N: 40, P: 55, K: 80, temp: 18.5, hum: 16.5, ph: 7.3, rain: 75.0 },
    { key: 'coffee', fallbackName: 'Coffee', tag: 'Hill Plantation', N: 100, P: 25, K: 30, temp: 24.5, hum: 60.0, ph: 6.8, rain: 160.0 },
    { key: 'watermelon', fallbackName: 'Watermelon', tag: 'Summer Cash Crop', N: 100, P: 18, K: 50, temp: 26.0, hum: 85.0, ph: 6.5, rain: 50.0 }
  ];

  return (
    <div className="space-y-24">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-agri-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-forest-800">
        
        {/* Dynamic floating background orbs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-agri-500/20 blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none animate-float-reverse" />
        <div className="absolute top-1/2 left-10 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none animate-pulse-glow" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal animation="fade-down" duration={500}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-agri-500/20 border border-agri-400/30 text-agri-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-agri-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{t('overviewHeroBadge') || 'Next-Gen Agricultural AI Engine'}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={150} duration={600}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
                {t('overviewHeroTitle') || 'Intelligent Crop Selection Powered by Neural Learning'}
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={250} duration={600}>
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
                {t('overviewHeroSubtitle') || 'AgriSmart AI optimizes yield potential by running soil macronutrient profiles and local meteorological telemetry through our TensorFlow/Keras neural network architecture.'}
              </p>
            </ScrollReveal>

            {/* Metrics Chips */}
            <ScrollReveal animation="fade-up" delay={350} duration={600}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('modelAccuracy') || 'Model Accuracy'}</span>
                    <span className="text-lg font-black text-white">
                      <AnimatedCounter target={97.5} decimals={1} suffix="%" />
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('targetCrops') || 'Target Crops'}</span>
                    <span className="text-lg font-black text-white">{t('classesCount') || '22 Certified Crops'}</span>
                  </div>
                </div>

                <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t('multilingual') || 'Multilingual'}</span>
                    <span className="text-lg font-black text-emerald-400">{t('langCount') || '8 Indian Languages'}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal animation="fade-up" delay={450} duration={600}>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('recommend')}
                  className="px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-agri-500 to-emerald-500 text-white shadow-lg shadow-agri-600/30 hover:shadow-agri-600/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <span>{t('startFreePrediction') || t('getRecommendation') || 'Launch Recommendation Engine'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('about')}
                  className="px-6 py-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {t('navAbout') || 'Inspect ML Architecture'}
                </button>
              </div>
            </ScrollReveal>

          </div>

          {/* Right Card with Live Interactive Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <ScrollReveal animation="zoom-in" delay={200} duration={700}>
              <FarmerCharacter 
                character="priya"
                size="sm"
                message={t('priyaGreeting') || "Hello! I'm Dr. Priya. Our neural net checks all 7 soil & climate parameters in real time!"}
                showContinuousWave={true}
              />
            </ScrollReveal>

            <ScrollReveal animation="zoom-in" delay={300} duration={700} className="w-full">
              <div className="rounded-2xl bg-forest-900/85 border border-forest-700/80 p-6 backdrop-blur-xl shadow-2xl space-y-5 hover:border-agri-500/50 transition-colors">
                
                <div className="flex items-center justify-between border-b border-forest-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-agri-300">Live AI Inference Engine</span>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-forest-950 px-2.5 py-1 rounded-md border border-forest-800 font-mono">
                    Dense Neural Net
                  </span>
                </div>

                {/* Sample Quick Selector */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-300">
                    {t('trySampleTitle') || 'Try a preloaded agricultural profile:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickSamples.map((sample) => {
                      const localized = getLocalizedCropData(sample.key, language);
                      return (
                        <button
                          key={sample.key}
                          onClick={() => onSelectSample({ ...sample, name: localized.name })}
                          className="text-left p-3 rounded-xl bg-forest-950/70 hover:bg-agri-900/60 border border-forest-800 hover:border-agri-500/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white group-hover:text-agri-300 transition-colors">
                              {localized.name}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-agri-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                          </div>
                          <p className="text-[11px] text-agri-400 mt-0.5">{localized.category}</p>
                          <p className="text-[10px] text-slate-400">{sample.tag}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Chips */}
                <div className="pt-2 border-t border-forest-800/80">
                  <p className="text-[11px] text-slate-400 mb-2">{t('inputVectorDesc') || 'Input vector evaluated in real time (7 Features):'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['N', 'P', 'K', 'Temperature', 'Humidity', 'Soil pH', 'Rainfall'].map((item) => (
                      <span 
                        key={item} 
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-forest-800/60 text-slate-300 border border-forest-700/60 hover:border-agri-400 hover:text-white transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-agri-950/60 rounded-xl p-3 border border-agri-900 flex items-center justify-between text-xs">
                  <span className="text-slate-300">{t('confidenceCalibration') || 'Confidence Calibration'}</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t('softmaxNormalized') || 'Softmax Normalized'}
                  </span>
                </div>

              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 3-Step Process Section with Scroll Stagger */}
      <section className="space-y-12">
        <ScrollReveal animation="fade-up" duration={600}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-800 dark:text-agri-300 text-xs font-bold uppercase tracking-wider border border-agri-200 dark:border-forest-800">
              <span>{t('workflowTitle') || 'Workflow Overview'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-white tracking-tight">
              {t('workflowSubtitle') || 'How AgriSmart AI Recommends Crops'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t('workflowDesc') || 'Our streamlined three-stage process transforms raw laboratory and weather station inputs into actionable planting decisions.'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <ScrollReveal 
                key={st.step} 
                animation="fade-up" 
                delay={idx * 160} 
                duration={600}
              >
                <div 
                  className="relative h-full rounded-2xl bg-white dark:bg-forest-900/90 p-7 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-xl hover:border-agri-300 dark:hover:border-agri-500 hover:-translate-y-1.5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-200 dark:text-slate-700 group-hover:text-agri-400 transition-colors">
                      {st.step}
                    </span>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${st.accent} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-forest-950 dark:text-white mb-2 group-hover:text-agri-700 dark:group-hover:text-agri-400 transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid with Scroll Stagger */}
      <section className="space-y-12">
        <ScrollReveal animation="fade-up" duration={600}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-800 dark:text-agri-300 text-xs font-bold uppercase tracking-wider border border-agri-200 dark:border-forest-800">
              <span>{t('featuresTitle') || 'Key Capabilities'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-white tracking-tight">
              {t('featuresHeading') || 'Precision Agricultural Intelligence'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t('featuresDesc') || 'Engineered with modern machine learning techniques to help agriculturalists make informed, data-driven planting choices.'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal 
                key={idx} 
                animation="fade-up" 
                delay={idx * 120} 
                duration={550}
              >
                <div 
                  className="h-full bg-white dark:bg-forest-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-forest-800 shadow-sm hover:border-agri-400 dark:hover:border-agri-500 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 space-y-3 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.color} transform group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-forest-950 dark:text-white group-hover:text-agri-700 dark:group-hover:text-agri-400 transition-colors">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Banner CTA with Scroll Reveal */}
      <ScrollReveal animation="zoom-in" duration={650}>
        <section className="rounded-3xl bg-gradient-to-r from-agri-700 via-agri-600 to-forest-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('readyToTest') || 'Ready to test soil & weather conditions?'}
            </h3>
            <p className="text-agri-100 text-sm sm:text-base max-w-xl">
              {t('readyToTestDesc') || 'Input custom agricultural parameters or load real test cases to view real-time neural network predictions.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('recommend')}
            className="relative z-10 px-7 py-3.5 rounded-xl font-bold text-sm bg-white text-forest-950 hover:bg-agri-50 shadow-md hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer hover:shadow-xl"
          >
            {t('getRecommendation') || 'Open Recommendation Tool'}
          </button>
        </section>
      </ScrollReveal>

    </div>
  );
}
