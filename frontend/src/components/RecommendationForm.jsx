import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Layers, 
  Sliders, 
  Info, 
  Cpu, 
  ArrowRight,
  Ruler,
  Scale
} from 'lucide-react';
import { fetchSampleCrops } from '../api';
import ScrollReveal from './ScrollReveal';
import FarmerCharacter from './FarmerCharacter';
import { useApp } from '../AppContext';
import UnitInfoTooltip from './UnitInfoTooltip';
import UnitsGuideModal from './UnitsGuideModal';
import LiveWeatherAutoFill from './LiveWeatherAutoFill';
import { getLocalizedCropData } from '../cropTranslations';

const DEFAULT_VALUES = {
  N: 90,
  P: 42,
  K: 43,
  temperature: 20.87,
  humidity: 82.0,
  ph: 6.5,
  rainfall: 202.93
};

const FIELD_CONFIGS = [
  {
    id: 'N',
    label: 'Nitrogen (N) • नाइट्रोजन (नत्रजन)',
    category: 'Soil Macronutrient • मुख्य पोषक तत्व',
    unit: 'kg/ha',
    min: 0,
    max: 200,
    step: 1,
    defaultVal: 90,
    tooltip: 'Ratio of Nitrogen (N) content in soil (नाइट्रोजन / नत्रजन). Essential for vegetative leaf development and chlorophyll synthesis.',
    typicalRange: '20 - 140 kg/ha',
    icon: Layers,
    color: 'emerald'
  },
  {
    id: 'P',
    label: 'Phosphorus (P) • फास्फोरस (स्फुर)',
    category: 'Soil Macronutrient • मुख्य पोषक तत्व',
    unit: 'kg/ha',
    min: 0,
    max: 200,
    step: 1,
    defaultVal: 42,
    tooltip: 'Ratio of Phosphorus (P) content in soil (फास्फोरस / स्फुर). Promotes deep root establishment, seed development, and early flowering.',
    typicalRange: '10 - 145 kg/ha',
    icon: Layers,
    color: 'emerald'
  },
  {
    id: 'K',
    label: 'Potassium (K) • पोटाश (पोटाशियम)',
    category: 'Soil Macronutrient • मुख्य पोषक तत्व',
    unit: 'kg/ha',
    min: 0,
    max: 250,
    step: 1,
    defaultVal: 43,
    tooltip: 'Ratio of Potassium (K) content in soil (पोटाश / पोटाशियम). Regulates stomatal water balance, disease resistance, and fruit weight.',
    typicalRange: '15 - 205 kg/ha',
    icon: Layers,
    color: 'emerald'
  },
  {
    id: 'temperature',
    label: 'Temperature • तापमान (°C)',
    category: 'Atmospheric Factor • मौसम कारक',
    unit: '°C',
    min: 0,
    max: 55,
    step: 0.1,
    defaultVal: 20.87,
    tooltip: 'Average ambient temperature in Celsius (औसत तापमान) during prospective vegetative season.',
    typicalRange: '10 - 45 °C',
    icon: Thermometer,
    color: 'amber'
  },
  {
    id: 'humidity',
    label: 'Relative Humidity • आर्द्रता / नमी (%)',
    category: 'Atmospheric Factor • मौसम कारक',
    unit: '%',
    min: 0,
    max: 100,
    step: 0.1,
    defaultVal: 82.0,
    tooltip: 'Average atmospheric relative humidity percentage (हवा में नमी/आर्द्रता). Critical for crop transpiration.',
    typicalRange: '15 - 100 %',
    icon: Droplets,
    color: 'blue'
  },
  {
    id: 'ph',
    label: 'Soil pH • मृदा पीएच (अम्लीयता / क्षारीयता)',
    category: 'Soil Chemistry • मृदा रसायन',
    unit: 'pH',
    min: 3.5,
    max: 10.0,
    step: 0.05,
    defaultVal: 6.5,
    tooltip: 'Soil acidity/alkalinity scale (मृदा का पीएच मान 1-14). Strongly influences micronutrient bioavailability to crop roots.',
    typicalRange: '4.5 - 8.5 pH',
    icon: Sliders,
    color: 'purple'
  },
  {
    id: 'rainfall',
    label: 'Rainfall • वर्षा / बारिश (mm)',
    category: 'Precipitation • वर्षा कारक',
    unit: 'mm',
    min: 0,
    max: 400,
    step: 0.1,
    defaultVal: 202.93,
    tooltip: 'Total expected seasonal precipitation in millimeters (औसत मौसमी वर्षा / बारिश).',
    typicalRange: '30 - 300 mm',
    icon: CloudRain,
    color: 'blue'
  }
];

export default function RecommendationForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isLoading, 
  errorMessage 
}) {
  const { t, isDark, language } = useApp();
  const [samplePresets, setSamplePresets] = useState([]);
  const [selectedPresetName, setSelectedPresetName] = useState('');
  const [errors, setErrors] = useState({});

  const getFieldLabel = (fieldId) => {
    const map = {
      N: 'paramN',
      P: 'paramP',
      K: 'paramK',
      temperature: 'paramTemp',
      humidity: 'paramHumidity',
      ph: 'paramPh',
      rainfall: 'paramRainfall'
    };
    return t(map[fieldId]) || FIELD_CONFIGS.find(f => f.id === fieldId)?.label;
  };
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showUnitsGuide, setShowUnitsGuide] = useState(false);
  const [weatherSyncActive, setWeatherSyncActive] = useState(false);
  const [syncedLocation, setSyncedLocation] = useState('');

  // Handle weather auto-fill from LiveWeatherAutoFill component
  const handleApplyWeather = ({ temperature, humidity, rainfall, locationName }) => {
    setFormData(prev => ({
      ...prev,
      temperature,
      humidity,
      rainfall
    }));

    setWeatherSyncActive(true);
    setSyncedLocation(locationName);

    setErrors(prev => {
      const next = { ...prev };
      delete next.temperature;
      delete next.humidity;
      delete next.rainfall;
      return next;
    });
  };

  // Load sample crops from API
  useEffect(() => {
    let isMounted = true;
    fetchSampleCrops()
      .then((data) => {
        if (isMounted && data && data.samples) {
          setSamplePresets(data.samples);
        }
      })
      .catch((err) => {
        console.warn('Could not load sample crop presets:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // Validate inputs
  const validateField = (id, val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'Value is required';
    const config = FIELD_CONFIGS.find(f => f.id === id);
    if (!config) return '';
    if (num < config.min || num > config.max) {
      return `Must be between ${config.min} and ${config.max}`;
    }
    return '';
  };

  const handleInputChange = (id, rawValue) => {
    const updated = { ...formData, [id]: rawValue };
    setFormData(updated);

    const err = validateField(id, rawValue);
    setErrors(prev => ({ ...prev, [id]: err }));
  };

  const handlePresetSelect = (preset) => {
    if (!preset || !preset.features) return;
    setSelectedPresetName(preset.crop);
    setFormData({
      N: preset.features.N,
      P: preset.features.P,
      K: preset.features.K,
      temperature: preset.features.temperature,
      humidity: preset.features.humidity,
      ph: preset.features.ph,
      rainfall: preset.features.rainfall
    });
    setErrors({});
  };

  const handleReset = () => {
    setFormData(DEFAULT_VALUES);
    setSelectedPresetName('');
    setWeatherSyncActive(false);
    setSyncedLocation('');
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    let hasError = false;
    FIELD_CONFIGS.forEach(f => {
      const err = validateField(f.id, formData[f.id]);
      if (err) {
        newErrors[f.id] = err;
        hasError = true;
      }
    });

    setErrors(newErrors);
    if (!hasError) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Title Card */}
      <ScrollReveal animation="fade-down" duration={500}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-6">
            {/* Row 1: Farmer + Title side by side */}
            <div className="flex flex-row items-start gap-4">
              <div className="flex-shrink-0">
                <FarmerCharacter 
                  character="ramesh"
                  size="sm"
                  message={t('rameshFormGreeting') || "Namaste! Enter your soil test & local climate values for accurate AI crop guidance."}
                  showContinuousWave={true}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-800 dark:text-agri-300 text-xs font-bold uppercase tracking-wider mb-2 border border-agri-200 dark:border-forest-800">
                  <Sparkles className="w-3.5 h-3.5 text-agri-600 dark:text-agri-400" />
                  <span>{t('formBadge') || 'Multi-Factor Agronomic Input'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-white tracking-tight">
                  {t('formTitle') || 'Soil Parameters & Crop Recommendation'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                  {t('formSubtitle') || 'Provide the 7 measured parameters in the exact feature sequence evaluated by the trained neural network model.'}
                </p>
              </div>
            </div>

            {/* Row 2: Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full">
              {samplePresets.length > 0 && (
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={selectedPresetName}
                    onChange={(e) => {
                      const found = samplePresets.find(s => s.crop === e.target.value);
                      if (found) handlePresetSelect(found);
                    }}
                    className="w-full md:w-auto text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-agri-200 dark:border-forest-700 bg-agri-50/70 dark:bg-forest-950 text-forest-950 dark:text-agri-300 hover:bg-agri-100/70 dark:hover:bg-forest-900 focus:outline-none focus:ring-2 focus:ring-agri-500 cursor-pointer transition-colors"
                  >
                    <option value="">{t('fillSamplePrompt') || '⚡ Fill Sample Values...'}</option>
                    {samplePresets.map((crop) => {
                      const localized = getLocalizedCropData(crop.crop, language);
                      return (
                        <option key={crop.crop} value={crop.crop}>
                          {t('samplePrefix') || 'Sample'}: {localized.name || crop.displayName || crop.crop.toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Measurement Units Guide Button */}
              <button
                type="button"
                onClick={() => setShowUnitsGuide(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-agri-200 dark:border-forest-700 bg-agri-50/70 dark:bg-forest-950 text-xs font-bold text-forest-950 dark:text-agri-300 hover:bg-agri-100/70 dark:hover:bg-forest-900 transition-colors cursor-pointer shadow-2xs"
                title="View full unit definitions, benchmarks, and conversion guide"
              >
                <Ruler className="w-3.5 h-3.5 text-agri-600 dark:text-agri-400" />
                <span>{t('unitsGuideBtn') || 'Units Guide'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-forest-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-forest-800 transition-colors cursor-pointer"
                title="Reset all fields to standard baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('clear') || 'Reset'}</span>
              </button>
            </div>
          </div>

          {/* Global Error message if any */}
          {errorMessage && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Prediction Error</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
            
            {/* Macronutrients Group (N, P, K) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest-900 dark:text-emerald-400">
                  {t('macronutrientsGroup') || '1. Soil Macronutrients (NPK)'}
                </h3>
                <span className="text-xs text-slate-400 font-normal">
                  (kg/ha)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FIELD_CONFIGS.slice(0, 3).map((field) => {
                  const Icon = field.icon;
                  const fieldError = errors[field.id];
                  const val = formData[field.id];

                  return (
                    <div 
                      key={field.id}
                      className="p-5 rounded-2xl bg-slate-50/60 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 hover:border-agri-300 dark:hover:border-agri-500 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <label htmlFor={field.id} className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                            {getFieldLabel(field.id)}
                          </label>
                        </div>
                        
                        <div className="relative">
                          <button
                            type="button"
                            onMouseEnter={() => setActiveTooltip(field.id)}
                            onMouseLeave={() => setActiveTooltip(null)}
                            onClick={() => setActiveTooltip(activeTooltip === field.id ? null : field.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          {activeTooltip === field.id && (
                            <div className="absolute right-0 bottom-full mb-2 w-56 p-2.5 rounded-xl bg-forest-950 text-white text-[11px] shadow-xl z-20 leading-relaxed border border-forest-800">
                              {field.tooltip}
                              <div className="mt-1 text-agri-300 font-medium">Typical: {field.typicalRange}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Numeric Input & Unit */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            id={field.id}
                            type="number"
                            step="any"
                            min={field.min}
                            max={field.max}
                            value={val}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-base bg-white dark:bg-forest-950 border text-forest-950 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                              fieldError 
                                ? 'border-red-400 focus:ring-red-300' 
                                : 'border-slate-200 dark:border-forest-700 focus:ring-agri-500/40 focus:border-agri-500'
                            }`}
                          />
                        </div>
                        <UnitInfoTooltip
                          unitKey={field.unit}
                          className="text-xs font-semibold text-slate-500 dark:text-slate-300 bg-white dark:bg-forest-900 px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-forest-800 whitespace-nowrap min-w-[58px] justify-center hover:border-agri-400 dark:hover:border-agri-500 shadow-2xs"
                        >
                          {field.unit}
                        </UnitInfoTooltip>
                      </div>

                      {/* Slider Control */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={val || 0}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full h-1.5 bg-slate-200 dark:bg-forest-800 rounded-lg appearance-none cursor-pointer accent-agri-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                          <span>{field.min}</span>
                          <span>Mid: {Math.round((field.min + field.max) / 2)}</span>
                          <span>{field.max}</span>
                        </div>
                      </div>

                      {fieldError && (
                        <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {fieldError}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Environmental Factors Group */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-forest-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest-900 dark:text-blue-400">
                  {t('environmentalGroup') || '2. Environmental & Climatic Factors'}
                </h3>
                <span className="text-xs text-slate-400 font-normal">
                  Temperature, Humidity, Soil pH, and Precipitation
                </span>
              </div>

              {/* Live Weather & Geo-Location Auto-Fill Component */}
              <LiveWeatherAutoFill 
                onApplyWeather={handleApplyWeather}
                currentValues={{
                  temperature: formData.temperature,
                  humidity: formData.humidity,
                  rainfall: formData.rainfall
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {FIELD_CONFIGS.slice(3).map((field) => {
                  const Icon = field.icon;
                  const fieldError = errors[field.id];
                  const val = formData[field.id];

                  return (
                    <div 
                      key={field.id}
                      className="p-5 rounded-2xl bg-slate-50/60 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 hover:border-agri-300 dark:hover:border-agri-500 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <label htmlFor={field.id} className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                            {getFieldLabel(field.id)}
                          </label>
                          {weatherSyncActive && field.id !== 'ph' && (
                            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-extrabold tracking-tight">
                              ⚡ Live Sync
                            </span>
                          )}
                        </div>
                        
                        <div className="relative">
                          <button
                            type="button"
                            onMouseEnter={() => setActiveTooltip(field.id)}
                            onMouseLeave={() => setActiveTooltip(null)}
                            onClick={() => setActiveTooltip(activeTooltip === field.id ? null : field.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          {activeTooltip === field.id && (
                            <div className="absolute right-0 bottom-full mb-2 w-56 p-2.5 rounded-xl bg-forest-950 text-white text-[11px] shadow-xl z-20 leading-relaxed border border-forest-800">
                              {field.tooltip}
                              <div className="mt-1 text-agri-300 font-medium">Typical: {field.typicalRange}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Numeric Input & Unit */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            id={field.id}
                            type="number"
                            step="any"
                            min={field.min}
                            max={field.max}
                            value={val}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-base bg-white dark:bg-forest-950 border text-forest-950 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                              fieldError 
                                ? 'border-red-400 focus:ring-red-300' 
                                : 'border-slate-200 dark:border-forest-700 focus:ring-blue-500/40 focus:border-blue-500'
                            }`}
                          />
                        </div>
                        <UnitInfoTooltip
                          unitKey={field.unit}
                          className="text-xs font-semibold text-slate-500 dark:text-slate-300 bg-white dark:bg-forest-900 px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-forest-800 whitespace-nowrap min-w-[50px] justify-center hover:border-agri-400 dark:hover:border-agri-500 shadow-2xs"
                        >
                          {field.unit}
                        </UnitInfoTooltip>
                      </div>

                      {/* Slider Control */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={val || 0}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full h-1.5 bg-slate-200 dark:bg-forest-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                          <span>{field.min}</span>
                          <span>{field.max}</span>
                        </div>
                      </div>

                      {fieldError && (
                        <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {fieldError}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Bar & Action Button */}
            <div className="pt-6 border-t border-slate-100 dark:border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>StandardScaler normalization applied automatically before Keras tensor evaluation</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 cursor-pointer ${
                  isLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-agri-600 via-agri-500 to-agri-600 hover:from-agri-500 hover:to-agri-600 shadow-agri-600/30 hover:shadow-agri-600/50 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('calculating') || 'Running Neural Network Model...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{t('predictBtn') || 'Get Crop Recommendation'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </ScrollReveal>

      {/* Full Measurement Units & Conversions Modal Guide */}
      <UnitsGuideModal
        isOpen={showUnitsGuide}
        onClose={() => setShowUnitsGuide(false)}
      />

    </div>
  );
}
