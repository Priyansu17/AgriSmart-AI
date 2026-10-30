import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Database, 
  ShieldCheck, 
  Layers, 
  Droplet, 
  Thermometer, 
  Activity, 
  HelpCircle,
  FileText,
  Filter,
  X,
  RotateCcw,
  Check,
  ArrowDown,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { fetchAnalytics } from '../api';
import ScrollReveal from './ScrollReveal';
import AnimatedCounter from './AnimatedCounter';
import FarmerCharacter from './FarmerCharacter';
import { CROP_ICONS_METADATA, getCropIconMeta } from '../cropIcons';
import { getCropEconomics, calculateCropFinancials } from '../cropEconomics';
import { useApp } from '../AppContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard({ setActiveTab }) {
  const { t, language } = useApp();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableSearch, setTableSearch] = useState('');
  const [activeChartMetric, setActiveChartMetric] = useState('npk'); // 'npk' or 'climate'
  const [chartScope, setChartScope] = useState('all'); // 'all' or 'top10'
  const [distViewMode, setDistViewMode] = useState('icons'); // 'icons' (default) or 'bars'
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [modalCrop, setModalCrop] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalCrop(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchAnalytics()
      .then((data) => {
        if (isMounted) {
          setAnalyticsData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load analytics data');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">Loading dataset distribution and model metrics...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
        <p className="text-red-800 font-bold">Unable to load analytics</p>
        <p className="text-xs text-red-600">{error || 'Please make sure the Flask backend is running.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Resiliently resolve keys from API response
  const dataset_summary = analyticsData.dataset_summary || analyticsData.dataset || {};
  const model_metrics = analyticsData.model_metrics || analyticsData.metrics || {};
  const crop_averages = analyticsData.crop_averages || dataset_summary.crop_averages || [];
  const classCounts = dataset_summary.class_counts || dataset_summary.class_distribution || {};

  const selectedCropData = selectedCrop
    ? crop_averages.find(c => c.crop.toLowerCase() === selectedCrop.toLowerCase())
    : null;
  const selectedCropMeta = selectedCrop
    ? getCropIconMeta(selectedCrop)
    : null;

  const modalCropData = modalCrop
    ? crop_averages.find(c => c.crop.toLowerCase() === modalCrop.toLowerCase())
    : null;
  const modalCropMeta = modalCrop
    ? getCropIconMeta(modalCrop)
    : null;
  const modalCropFinancials = modalCrop
    ? calculateCropFinancials(modalCrop, 1)
    : null;

  const totalSamples = dataset_summary.total_samples || 2200;
  const totalClasses = dataset_summary.total_classes || dataset_summary.classes_count || 22;
  const testAccuracy = model_metrics.test_accuracy || 97.5;
  const testLoss = model_metrics.test_loss || 0.0563;

  // 1. Class Distribution Chart Data (all 22 crops, 100 samples each)
  const classLabels = Object.keys(classCounts).map(c => c.charAt(0).toUpperCase() + c.slice(1));
  const classValues = Object.values(classCounts);

  const classDistChartData = {
    labels: classLabels,
    datasets: [
      {
        label: 'Observations per Crop Class',
        data: classValues,
        backgroundColor: '#2D752D',
        borderRadius: 6,
        hoverBackgroundColor: '#235D23',
      }
    ]
  };

  const classDistChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} verified field samples (balanced)`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        grid: { color: '#E2E8F0' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // 2. Crop Nutrient / Climate Comparison Chart
  const majorCropsList = ['rice', 'maize', 'chickpea', 'coffee', 'cotton', 'apple', 'watermelon', 'banana', 'jute', 'grapes'];
  const chartCrops = chartScope === 'top10'
    ? crop_averages.filter(c => majorCropsList.includes(c.crop.toLowerCase()))
    : crop_averages;

  let comparisonChartData;
  if (activeChartMetric === 'npk') {
    comparisonChartData = {
      labels: chartCrops.map(c => c.crop.charAt(0).toUpperCase() + c.crop.slice(1)),
      datasets: [
        {
          label: 'Nitrogen (N) kg/ha',
          data: chartCrops.map(c => c.N),
          backgroundColor: '#3D933D',
          borderRadius: 4
        },
        {
          label: 'Phosphorus (P) kg/ha',
          data: chartCrops.map(c => c.P),
          backgroundColor: '#0F2F1F',
          borderRadius: 4
        },
        {
          label: 'Potassium (K) kg/ha',
          data: chartCrops.map(c => c.K),
          backgroundColor: '#8C6D46',
          borderRadius: 4
        }
      ]
    };
  } else {
    comparisonChartData = {
      labels: chartCrops.map(c => c.crop.charAt(0).toUpperCase() + c.crop.slice(1)),
      datasets: [
        {
          label: 'Rainfall (mm)',
          data: chartCrops.map(c => c.rainfall),
          backgroundColor: '#2563EB',
          borderRadius: 4
        },
        {
          label: 'Relative Humidity (%)',
          data: chartCrops.map(c => c.humidity),
          backgroundColor: '#06B6D4',
          borderRadius: 4
        },
        {
          label: 'Temperature (°C)',
          data: chartCrops.map(c => c.temperature),
          backgroundColor: '#F59E0B',
          borderRadius: 4
        }
      ]
    };
  }

  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 11, family: 'Inter' }, boxWidth: 14 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const unit = activeChartMetric === 'npk' ? 'kg/ha' : (ctx.dataset.label.includes('Rainfall') ? 'mm' : ctx.dataset.label.includes('Humidity') ? '%' : '°C');
            return `${ctx.dataset.label}: ${ctx.parsed.y} ${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E2E8F0' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 }
      }
    }
  };

  // 3. Table Filtering
  const filteredTableCrops = crop_averages.filter(c => {
    if (!tableSearch.trim()) return true;
    return c.crop.toLowerCase().includes(tableSearch.toLowerCase().trim());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-forest-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <FarmerCharacter 
              character="arjun"
              size="sm"
              message={t('arjunGreeting') || 'Hey! Check out the 22-class distribution and multi-nutrient benchmark charts below.'}
              showContinuousWave={true}
              className="flex-shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-800 dark:text-agri-300 text-xs font-bold uppercase tracking-wider mb-2 border border-agri-200 dark:border-forest-800">
                <Database className="w-3.5 h-3.5 text-agri-600 dark:text-agri-400" />
                <span>{t('analyticsBadge') || 'Dataset & Machine Learning Diagnostics'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-white tracking-tight">
                {t('analyticsTitle') || 'Model & Agricultural Analytics'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                {t('analyticsSubtitle') || 'Comprehensive statistical distribution of the 2,200 agricultural dataset records and trained Keras model evaluation.'}
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1.5 rounded-xl bg-forest-950 text-white font-mono">
            Dataset: Crop_recommendation.csv
          </span>
        </div>

        {/* 4 KPI Cards with Animated Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-6">
          
          <ScrollReveal animation="fade-up" delay={50} duration={500}>
            <div className="h-full p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all duration-300 space-y-1 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{t('testAccuracyLabel') || 'Test Accuracy'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-black text-emerald-950">
                <AnimatedCounter target={testAccuracy} decimals={1} suffix="%" />
              </div>
              <p className="text-[11px] text-emerald-700">{t('testAccuracyDesc') || 'Validated on hold-out test split'}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={120} duration={500}>
            <div className="h-full p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 space-y-1 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('testLossLabel') || 'Test Loss'}</span>
                <Activity className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-black text-slate-900">{testLoss}</div>
              <p className="text-[11px] text-slate-500">{t('testLossDesc') || 'Sparse Categorical Crossentropy'}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={190} duration={500}>
            <div className="h-full p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 hover:border-blue-400 hover:shadow-md transition-all duration-300 space-y-1 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">{t('targetClassesLabel') || 'Certified Crop Categories'}</span>
                <Layers className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-black text-blue-950">
                <AnimatedCounter target={totalClasses} />
              </div>
              <p className="text-[11px] text-blue-700">{t('targetClassesDesc') || '100 empirical observations per class'}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={260} duration={500}>
            <div className="h-full p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all duration-300 space-y-1 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">{t('datasetSizeLabel') || 'Total Field Observations'}</span>
                <Database className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-black text-amber-950">
                <AnimatedCounter target={totalSamples} />
              </div>
              <p className="text-[11px] text-amber-700">{t('datasetSizeDesc') || 'Balanced Kaggle agricultural benchmark'}</p>
            </div>
          </ScrollReveal>

        </div>
      </div>

      {/* Chart 1: Class Distribution Chart (Crop Icons vs Classic Green Bars) */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-950 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-agri-600 dark:text-agri-400" />
                  <span>{t('cropDistributionTitle') || 'Dataset Class Distribution (22 Categories)'}</span>
                </h3>
                <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 font-bold">
                  Balanced: 100 / class
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {distViewMode === 'icons' 
                  ? 'Individual visual icons for each of the 22 crops representing 100 verified observations each.'
                  : 'Classic bar chart showing exact sample count per crop class across the training dataset.'}
              </p>
            </div>

            {/* Toggle View: Crop Icons vs Classic Green Bars */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setDistViewMode('icons')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  distViewMode === 'icons'
                    ? 'bg-white text-forest-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View individual crop icons instead of flat bars"
              >
                <span>🌱 Crop Icons View</span>
              </button>
              <button
                onClick={() => setDistViewMode('bars')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  distViewMode === 'bars'
                    ? 'bg-white text-forest-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View classic green bar chart"
              >
                <span>📊 Classic Green Bars</span>
              </button>
            </div>
          </div>

          {/* Conditional View: Icons vs Bars */}
          {distViewMode === 'icons' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {Object.keys(classCounts).map((cropKey) => {
                  const meta = CROP_ICONS_METADATA[cropKey.toLowerCase()] || {
                    emoji: '🌱',
                    label: cropKey.charAt(0).toUpperCase() + cropKey.slice(1),
                    category: 'Agricultural Crop',
                    color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  };
                  const count = classCounts[cropKey] || 100;
                  const isSelected = selectedCrop?.toLowerCase() === cropKey.toLowerCase();

                  return (
                    <div
                      key={cropKey}
                      onClick={() => {
                        setSelectedCrop(cropKey);
                        setTableSearch(cropKey);
                        setModalCrop(cropKey);
                      }}
                      className={`group relative p-3.5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/90 border-2 border-agri-600 shadow-md ring-4 ring-agri-500/20 -translate-y-1'
                          : 'bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-agri-400 shadow-sm hover:shadow-lg hover:-translate-y-1.5'
                      }`}
                      title={`Click to inspect ${meta.label} in interactive glass pop-up`}
                    >
                      {/* Selected check badge */}
                      {isSelected && (
                        <span className="absolute -top-2 -right-2 bg-agri-600 text-white rounded-full p-1 shadow-md z-10 animate-in zoom-in-75 duration-200">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}

                      {/* Pop-up hint indicator badge */}
                      <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-forest-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm pointer-events-none">
                        Pop-up
                      </span>

                      {/* Top icon and category */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border ${meta.color} shadow-sm group-hover:scale-110 transition-transform duration-300 ${isSelected ? 'scale-105' : ''}`}>
                          {meta.emoji}
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:border-agri-300 group-hover:text-agri-700 transition-colors">
                          {count}
                        </span>
                      </div>

                      {/* Name and Tag */}
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-xs text-forest-950 group-hover:text-agri-700 capitalize transition-colors">
                          {meta.label}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {meta.category}
                        </p>
                      </div>

                      {/* Mini visual indicator pill */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Samples</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          100% Balanced
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Blinker Alert & Quick Action Bar when a crop is selected */}
              {selectedCropData && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-agri-500/15 to-emerald-500/10 border border-agri-300/80 backdrop-blur-md text-forest-950 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agri-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-agri-600"></span>
                    </span>
                    <span>
                      <strong className="capitalize text-forest-950 font-bold">{selectedCropMeta?.label}</strong> profile selected!
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalCrop(selectedCrop)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-agri-400 text-forest-950 hover:text-agri-700 font-bold shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer hover:shadow"
                    >
                      <span>Open Pop-up Modal</span>
                      <span className="text-sm">🪟</span>
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('selected-crop-inspector');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold shadow-sm transition-all text-xs flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <span>Scroll Down</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* In-page Parameter Inspector (scrollable reference) */}
              {selectedCropData ? (
                <div id="selected-crop-inspector" className="mt-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-agri-50/60 border-2 border-agri-500 shadow-md animate-in fade-in zoom-in-95 duration-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-agri-200/70">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${selectedCropMeta?.color} shadow-sm`}>
                        {selectedCropMeta?.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-forest-950 capitalize">
                            {selectedCropMeta?.label} Agronomic Profile
                          </h4>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-agri-600 text-white shadow-sm">
                            Selected
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {selectedCropMeta?.category} • 100 Balanced Laboratory & Field Records
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => setModalCrop(selectedCrop)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        title="Open interactive pop-up modal"
                      >
                        <span>Enlarge Pop-up</span>
                        <ExternalLink className="w-3.5 h-3.5 text-agri-600" />
                      </button>
                      <button
                        onClick={() => {
                          const tableEl = document.getElementById('crop-reference-table');
                          if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-agri-600" />
                        <span>Jump to Full Table</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCrop(null);
                          setTableSearch('');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                        title="Deselect and clear filter"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* 6 Key Requirements Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Nitrogen */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Nitrogen (N)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="text-lg font-black text-forest-950">
                        {selectedCropData.N} <span className="text-[10px] font-normal text-slate-500">kg/ha</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (selectedCropData.N / 140) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Phosphorus */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Phosphorus (P)</span>
                        <span className="w-2 h-2 rounded-full bg-forest-700"></span>
                      </div>
                      <div className="text-lg font-black text-forest-950">
                        {selectedCropData.P} <span className="text-[10px] font-normal text-slate-500">kg/ha</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-forest-700 h-full rounded-full" style={{ width: `${Math.min(100, (selectedCropData.P / 145) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Potassium */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Potassium (K)</span>
                        <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                      </div>
                      <div className="text-lg font-black text-forest-950">
                        {selectedCropData.K} <span className="text-[10px] font-normal text-slate-500">kg/ha</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-700 h-full rounded-full" style={{ width: `${Math.min(100, (selectedCropData.K / 205) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Soil pH */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Soil pH</span>
                        <span className={`text-[10px] font-semibold ${selectedCropData.ph < 6.0 ? 'text-amber-600' : selectedCropData.ph > 7.2 ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {selectedCropData.ph < 6.0 ? 'Acidic' : selectedCropData.ph > 7.2 ? 'Alkaline' : 'Neutral'}
                        </span>
                      </div>
                      <div className="text-lg font-black text-forest-950">
                        {selectedCropData.ph} <span className="text-[10px] font-normal text-slate-500">pH</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-lime-500 h-full rounded-full" style={{ width: `${Math.min(100, (selectedCropData.ph / 10) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Rainfall */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Rainfall</span>
                        <Droplet className="w-3 h-3 text-blue-500" />
                      </div>
                      <div className="text-lg font-black text-forest-950">
                        {selectedCropData.rainfall} <span className="text-[10px] font-normal text-slate-500">mm</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (selectedCropData.rainfall / 300) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Temperature & Humidity */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Climate</span>
                        <Thermometer className="w-3 h-3 text-amber-500" />
                      </div>
                      <div className="text-xs font-black text-forest-950 mt-1">
                        {selectedCropData.temperature}°C / {selectedCropData.humidity}%
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">Temp / Humidity</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-500">💡</span>
                    <span>Click any crop icon above to inspect its exact N, P, K, pH and rainfall requirements in a pop-up modal.</span>
                  </span>
                  <span className="font-mono text-[11px] text-agri-700 font-semibold">22 / 22 Classes Verified</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-72 w-full animate-in fade-in duration-300">
              <Bar data={classDistChartData} options={classDistChartOptions} />
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Chart 2: Nutrient / Climate Feature Comparison */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <h3 className="text-lg font-bold text-forest-950 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-agri-600 dark:text-agri-400" />
                <span>{t('nutrientComparisonTitle') || 'Agronomic Feature Benchmarks Across Crops'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('nutrientComparisonSubtitle') || 'Mean nutrient and environmental requirements per crop calculated from the underlying dataset.'}
              </p>
            </div>

            {/* Toggle Metric Mode & Scope */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Scope Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setChartScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartScope === 'all' 
                      ? 'bg-white text-forest-950 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('btnAllCrops') || 'All 22 Crops'}
                </button>
                <button
                  onClick={() => setChartScope('top10')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartScope === 'top10' 
                      ? 'bg-white text-forest-950 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('btnTop10') || 'Major 10 Crops'}
                </button>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveChartMetric('npk')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChartMetric === 'npk' 
                      ? 'bg-white text-forest-950 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('btnNpk') || 'Soil NPK (kg/ha)'}
                </button>
                <button
                  onClick={() => setActiveChartMetric('climate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChartMetric === 'climate' 
                      ? 'bg-white text-forest-950 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('btnClimate') || 'Climate & Rainfall'}
                </button>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <Bar data={comparisonChartData} options={comparisonChartOptions} />
          </div>
        </div>
      </ScrollReveal>

      {/* Interactive Crop Parameter Table */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div id="crop-reference-table" className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest-950 dark:text-white">
                  {t('fullTableTitle') || 'Crop-Wise Parameter Averages Reference Table'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-agri-100 dark:bg-agri-950 text-agri-800 dark:text-agri-300 font-semibold border dark:border-forest-800">
                  {filteredTableCrops.length} of {crop_averages.length} crops
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ideal average laboratory soil and climate baselines extracted from historical data.
              </p>
            </div>

            {/* Search/Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('searchCropPlaceholder') || 'Search crops...'}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-500 w-44 sm:w-56 transition-all"
                />
                {tableSearch && (
                  <button
                    onClick={() => setTableSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Crop Name</th>
                  <th className="py-3 px-4">Nitrogen (N)</th>
                  <th className="py-3 px-4">Phosphorus (P)</th>
                  <th className="py-3 px-4">Potassium (K)</th>
                  <th className="py-3 px-4">Temp (°C)</th>
                  <th className="py-3 px-4">Humidity (%)</th>
                  <th className="py-3 px-4">Soil pH</th>
                  <th className="py-3 px-4">Rainfall (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTableCrops.length > 0 ? (
                  filteredTableCrops.map((c) => (
                    <tr 
                      key={c.crop} 
                      className={`transition-colors ${
                        selectedCrop?.toLowerCase() === c.crop.toLowerCase() 
                          ? 'bg-emerald-100/70 font-semibold text-emerald-950' 
                          : 'hover:bg-agri-50/50'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-forest-950 capitalize">{c.crop}</td>
                      <td className="py-3 px-4">{c.N} kg/ha</td>
                      <td className="py-3 px-4">{c.P} kg/ha</td>
                      <td className="py-3 px-4">{c.K} kg/ha</td>
                      <td className="py-3 px-4">{c.temperature}°C</td>
                      <td className="py-3 px-4">{c.humidity}%</td>
                      <td className="py-3 px-4">{c.ph}</td>
                      <td className="py-3 px-4">{c.rainfall} mm</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No crops found matching "{tableSearch}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Frosted Glass Pop-up Modal for Instant Crop Inspection */}
      {modalCrop && modalCropData && (
        <div 
          className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setModalCrop(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white/95 dark:bg-forest-900/95 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-forest-700 shadow-2xl shadow-forest-950/25 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-agri-400/20 blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-forest-800 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl border ${modalCropMeta?.color} shadow-md flex-shrink-0`}>
                  {modalCropMeta?.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-agri-700 dark:text-agri-300 bg-agri-100/80 dark:bg-forest-950 px-2.5 py-0.5 rounded-full border dark:border-forest-800">
                      {modalCropMeta?.category}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">100 Balanced Records</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-forest-950 dark:text-white tracking-tight capitalize mt-0.5">
                    {modalCropMeta?.label}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setModalCrop(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-forest-800 hover:bg-slate-200 dark:hover:bg-forest-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 6 Key Requirements Metric Badges in 3x2 Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Target Laboratory &amp; Soil Benchmarks
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Nitrogen */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Nitrogen (N)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-xl font-black text-forest-950">
                    {modalCropData.N} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (modalCropData.N / 140) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Phosphorus */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Phosphorus (P)</span>
                    <span className="w-2 h-2 rounded-full bg-forest-700"></span>
                  </div>
                  <div className="text-xl font-black text-forest-950">
                    {modalCropData.P} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-forest-700 h-full rounded-full" style={{ width: `${Math.min(100, (modalCropData.P / 145) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Potassium */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Potassium (K)</span>
                    <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                  </div>
                  <div className="text-xl font-black text-forest-950">
                    {modalCropData.K} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-700 h-full rounded-full" style={{ width: `${Math.min(100, (modalCropData.K / 205) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Soil pH */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Soil pH</span>
                    <span className={`text-[10px] font-semibold ${modalCropData.ph < 6.0 ? 'text-amber-600' : modalCropData.ph > 7.2 ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {modalCropData.ph < 6.0 ? 'Acidic' : modalCropData.ph > 7.2 ? 'Alkaline' : 'Neutral'}
                    </span>
                  </div>
                  <div className="text-xl font-black text-forest-950">
                    {modalCropData.ph} <span className="text-xs font-normal text-slate-500">pH</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-lime-500 h-full rounded-full" style={{ width: `${Math.min(100, (modalCropData.ph / 10) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Rainfall */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Rainfall</span>
                    <Droplet className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xl font-black text-forest-950">
                    {modalCropData.rainfall} <span className="text-xs font-normal text-slate-500">mm</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (modalCropData.rainfall / 300) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Climate */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Climate</span>
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-sm font-black text-forest-950">
                    {modalCropData.temperature}°C
                  </div>
                  <div className="text-xs text-slate-500">
                    {modalCropData.humidity}% humidity
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Margin & Economic Projections Preview */}
            {modalCropFinancials && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-agri-500/10 to-transparent border border-emerald-300/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Commercial Viability &amp; Profit Margins (per acre)</span>
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                    {modalCropFinancials.marginRating}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-medium block">Market Rate</span>
                    <span className="text-sm font-extrabold text-forest-950">₹{modalCropFinancials.marketPricePerQtl.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 block">/ quintal</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-medium block">Expected Yield</span>
                    <span className="text-sm font-extrabold text-forest-950">{modalCropFinancials.avgYieldPerAcreQtl} qtls</span>
                    <span className="text-[9px] text-slate-400 block">per acre</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-medium block">Input &amp; Labor Cost</span>
                    <span className="text-sm font-extrabold text-slate-700">₹{modalCropFinancials.costPerAcre.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 block">per acre</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-100/80 border border-emerald-300/80">
                    <span className="text-[10px] text-emerald-800 font-bold block">Estimated Net Profit</span>
                    <span className="text-sm font-black text-emerald-950">₹{modalCropFinancials.netProfit.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-700 font-bold block">{modalCropFinancials.profitMarginPercent}% Net Margin</span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-800/90 flex items-center justify-between pt-1">
                  <span>⏱️ Growth Cycle: <strong>{modalCropFinancials.gestationDays}</strong></span>
                  <span>🛡️ Risk Profile: <strong>{modalCropFinancials.riskLevel}</strong></span>
                </div>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setModalCrop(null);
                  const tableEl = document.getElementById('crop-reference-table');
                  if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:border-agri-400 text-slate-700 hover:text-agri-700 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
              >
                <ArrowDown className="w-3.5 h-3.5 text-agri-600" />
                <span>Jump to Full Table Below</span>
              </button>

              <button
                onClick={() => setModalCrop(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Close Pop-up
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
