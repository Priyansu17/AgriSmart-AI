import React, { useState } from 'react';
import { 
  Sprout, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Droplet, 
  Thermometer, 
  Layers, 
  Lightbulb, 
  BarChart3, 
  Printer, 
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Compass,
  ExternalLink,
  Play,
  Tv,
  Search,
  TrendingUp,
  DollarSign,
  Sliders,
  ShieldCheck,
  Percent,
  PieChart
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import AnimatedCounter from './AnimatedCounter';
import FarmerCharacter from './FarmerCharacter';
import { getCropIconMeta } from '../cropIcons';
import { getCropVideos } from '../cropVideos';
import { calculateCropFinancials } from '../cropEconomics';
import { useApp } from '../AppContext';
import { getLocalizedCropData, getLocalizedFarmerSpeech } from '../cropTranslations';
import UnitInfoTooltip from './UnitInfoTooltip';

export default function PredictionResult({ 
  result, 
  onTryAgain, 
  onModifyInputs,
  setActiveTab 
}) {
  const { t, isDark, language } = useApp();

  if (!result) return null;

  const {
    predicted_crop,
    confidence,
    top_3 = [],
    crop_info = {},
    input_summary = [],
    timestamp
  } = result;

  const mainCropMeta = getCropIconMeta(crop_info.displayName || predicted_crop);
  const cropVideos = getCropVideos(predicted_crop);

  // Multilingual Dynamic Localization
  const localizedCrop = getLocalizedCropData(predicted_crop, language);
  const cropDisplayName = localizedCrop.name || crop_info.displayName || predicted_crop;
  
  // Parse common crop name and botanical name (if in parentheses)
  const nameParts = (cropDisplayName || '').match(/^([^(]+)(?:\s*\((.*)\))?$/);
  const cropCommonName = nameParts && nameParts[1] ? nameParts[1].trim() : cropDisplayName;
  const cropBotanicalName = nameParts && nameParts[2] ? `(${nameParts[2].trim()})` : '';

  const cropCategory = localizedCrop.category || crop_info.category || mainCropMeta.category || 'Agricultural Crop';
  const cropDescription = localizedCrop.description || crop_info.description || 'This crop shows the highest statistical suitability matching your entered soil nutrients and environmental parameters.';
  const cropSeason = localizedCrop.season || crop_info.season || 'Seasonal Crop';
  const cropSoil = localizedCrop.soil || crop_info.soilType || 'Well-drained arable loam soils.';
  const cropWater = localizedCrop.water || crop_info.waterNeed || 'Moderate irrigation required';
  const cropClimate = localizedCrop.climate || crop_info.climate || 'Subtropical to tropical climate';

  const farmerGreeting = getLocalizedFarmerSpeech(cropDisplayName, language);

  // Financial & Profit Margin Interactive State
  const [farmAcres, setFarmAcres] = useState(2);
  const [farmingMode, setFarmingMode] = useState('precision'); // 'standard' or 'precision'

  const baseFinancials = calculateCropFinancials(predicted_crop, farmAcres);
  const yieldMultiplier = farmingMode === 'precision' ? 1.15 : 1.0;
  const totalYield = Math.round(baseFinancials.totalYieldQtl * yieldMultiplier * 10) / 10;
  const grossRevenue = Math.round(totalYield * baseFinancials.marketPricePerQtl);
  const totalCost = baseFinancials.totalCost;
  const netProfit = Math.max(0, grossRevenue - totalCost);
  const profitMarginPercent = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
  const roiPercent = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

  const handlePrint = () => {
    document.body.setAttribute('data-printing', 'true');
    window.print();
    setTimeout(() => {
      document.body.removeAttribute('data-printing');
    }, 1000);
  };

  // Color determination based on confidence
  const getConfidenceBadge = (conf) => {
    if (conf >= 85) return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800', text: t('highMatch') || 'High Statistical Match' };
    if (conf >= 50) return { bg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800', text: t('moderateMatch') || 'Moderate Match' };
    return { bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800', text: t('multiCropMatch') || 'Multi-Crop Viability' };
  };

  const badgeInfo = getConfidenceBadge(confidence);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300 print:m-0 print:p-0">
      
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={onModifyInputs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-forest-800 bg-white dark:bg-forest-900/90 hover:bg-slate-50 dark:hover:bg-forest-800 text-slate-700 dark:text-slate-200 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('modifyInputs') || 'Modify Inputs'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-forest-800 bg-white dark:bg-forest-900/90 hover:bg-slate-50 dark:hover:bg-forest-800 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('printReport') || 'Print Report'}</span>
          </button>
          <button
            onClick={onTryAgain}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-md shadow-agri-600/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('tryAnother') || 'Try Another Soil Sample'}</span>
          </button>
        </div>
      </div>

      {/* Official Print-Only Report Header */}
      <div className="hidden print:block mb-6 pb-6 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                AgriSmart<span className="text-emerald-700 font-extrabold">AI</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                Official Soil Health Card
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 mt-1">
              {t('printReportTitle') || 'Soil Health & Crop Advisory Report'}
            </h1>
            <p className="text-xs text-slate-600">
              Evaluated with TensorFlow/Keras Neural Network (Test Accuracy: 97.5%)
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-900">Date: {timestamp || new Date().toLocaleString()}</p>
            <p>Evaluation ID: #{Math.abs(((confidence || 95) * 1234) | 0)}</p>
            <p>Land Allocation: {farmAcres} Acres ({farmingMode === 'precision' ? 'Precision Mode' : 'Standard Mode'})</p>
          </div>
        </div>

        {/* Input Parameters Table for Print */}
        {input_summary && input_summary.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              1. Measured Soil & Meteorological Conditions (7 Inputs)
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-slate-900">
                  {input_summary.map((item) => (
                    <th key={item.key} className="p-2 border border-slate-400 text-center font-bold">
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {input_summary.map((item) => (
                    <td key={item.key} className="p-2 border border-slate-400 text-center">
                      <span className="font-bold text-slate-900">{item.value} {item.unit}</span>
                      <div className="text-[10px] text-slate-600 mt-0.5">{item.status}</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Hero Card for Recommended Crop */}
      <ScrollReveal animation="fade-down" duration={600}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-agri-950 text-white p-8 sm:p-10 shadow-2xl border border-forest-800 print:bg-white print:text-slate-900 print:border-slate-300 print:p-5 print:shadow-none">
          
          {/* Ambient background blur */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-agri-500/20 blur-3xl pointer-events-none animate-float-slow print:hidden" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-500/20 border border-agri-400/30 text-agri-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-agri-400 animate-spin print:hidden" style={{ animationDuration: '6s' }} />
                <span>{t('resultBadge') || 'Optimal Neural Recommendation'}</span>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeInfo.bg} print:bg-slate-100 print:text-slate-900 print:border-slate-300`}>
                {badgeInfo.text} ({confidence}%)
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              <div className="lg:col-span-8 min-w-0 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                <div className="flex-shrink-0 print:hidden">
                  <FarmerCharacter 
                    character="ramesh"
                    size="sm"
                    showSpeechBubble={false}
                    showContinuousWave={true}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl sm:text-4xl shadow-lg flex-shrink-0 print:bg-slate-100 print:border-slate-300">
                      {mainCropMeta.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold block print:text-emerald-800">
                        {cropCategory}
                      </span>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight capitalize leading-tight break-normal whitespace-nowrap sm:whitespace-normal print:text-slate-900">
                        {cropCommonName}
                      </h2>
                      {cropBotanicalName && (
                        <span className="text-xs sm:text-sm md:text-base text-emerald-200/90 font-medium italic block tracking-normal mt-0.5 print:text-slate-600">
                          {cropBotanicalName}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal break-words print:text-slate-700">
                    {cropDescription}
                  </p>
                </div>
              </div>

              {/* Confidence Gauge Card */}
              <div className="lg:col-span-4 min-w-0 w-full bg-forest-900/90 border border-forest-700/80 rounded-2xl p-5 text-center space-y-3 backdrop-blur-md hover:border-agri-400/50 transition-colors print:bg-white print:border-slate-300 print:p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                  {t('modelConfidence') || 'Model Confidence'}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight print:text-emerald-700">
                  <AnimatedCounter target={confidence} decimals={1} suffix="%" />
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-forest-950 rounded-full h-3 overflow-hidden p-0.5 border border-forest-800 print:bg-slate-200 print:border-slate-300">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-agri-400 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(confidence, 100)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-tight print:text-slate-600">
                  {t('modelConfidenceDesc') || 'Derived from softmax probability distribution over 22 crop classes.'}
                </p>
              </div>

            </div>

            {/* Model Note */}
            <div className="pt-4 border-t border-forest-800 flex items-center gap-2 text-xs text-slate-400 print:border-slate-200 print:text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 print:text-emerald-700" />
              <span>
                {t('modelNote') || 'Real-time inference generated by trained Keras sequential neural network model (Test Accuracy: 97.5%).'}
              </span>
            </div>

          </div>
        </div>
      </ScrollReveal>

      {/* Top 3 Crop Probabilistic Ranking */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <h3 className="text-lg font-bold text-forest-950 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-agri-600 dark:text-agri-400" />
                <span>{t('top3Title') || 'Top 3 Ranked Alternative Recommendations'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('top3Subtitle') || 'Comparative suitability probabilities calculated across all 22 trained classes.'}
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Softmax Normalization</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {top_3.map((rec) => {
              const isWinner = rec.rank === 1;
              const locRec = getLocalizedCropData(rec.crop, language);
              const recDisplayName = locRec.name || rec.displayName || rec.crop;
              const cropMeta = getCropIconMeta(rec.displayName || rec.crop);
              const recCategory = locRec.category || rec.category || cropMeta.category;

              return (
                <div
                  key={rec.crop}
                  className={`rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 ${
                    isWinner 
                      ? 'bg-agri-50/70 dark:bg-forest-950/80 border-agri-300 dark:border-agri-500 ring-2 ring-agri-400/20 shadow-md' 
                      : 'bg-slate-50/60 dark:bg-forest-950/40 border-slate-200 dark:border-forest-800 hover:border-slate-300 dark:hover:border-forest-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      isWinner 
                        ? 'bg-agri-600 text-white shadow-sm' 
                        : 'bg-slate-200 dark:bg-forest-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      Rank #{rec.rank}
                    </span>
                    <span className="font-extrabold text-base text-forest-950 dark:text-white">
                      {rec.confidence}%
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${cropMeta.color} shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      {cropMeta.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-forest-950 dark:text-white capitalize leading-snug">
                        {recDisplayName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {recCategory}
                      </p>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-slate-200 dark:bg-forest-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isWinner ? 'bg-agri-600' : 'bg-slate-500 dark:bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(rec.confidence, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Interactive Economic Viability & Profit Margin Studio */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-forest-950 dark:text-white flex items-center gap-2">
                  <span>{t('economicStudioTitle') || 'Economic Viability & Profit Margin Studio'}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Financial feasibility model for <strong className="text-forest-950 dark:text-white capitalize">{cropDisplayName}</strong> based on NABARD agronomic cost benchmarks.
              </p>
            </div>

            {/* Farming Mode Switcher (Standard vs Precision) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-forest-950 rounded-2xl self-start lg:self-auto border dark:border-forest-800 print:hidden">
              <button
                onClick={() => setFarmingMode('standard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  farmingMode === 'standard'
                    ? 'bg-white dark:bg-forest-800 text-forest-950 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌾 {t('standardFarming') || 'Standard Farming'}
              </button>
              <button
                onClick={() => setFarmingMode('precision')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  farmingMode === 'precision'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('precisionFarming') || 'Precision Tech (+15% Yield)'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Farm Size Selector & Slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-slate-50 to-agri-50/50 dark:from-forest-950/80 dark:via-forest-950/60 dark:to-forest-950/80 border border-emerald-200/70 dark:border-forest-800 space-y-3 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-agri-700 dark:text-agri-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-forest-900 dark:text-agri-300">
                  {t('farmHolding') || 'Land Holding Size (Acres)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 5, 10, 15].map((val) => (
                  <button
                    key={val}
                    onClick={() => setFarmAcres(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      farmAcres === val
                        ? 'bg-forest-950 dark:bg-agri-600 text-white shadow-sm'
                        : 'bg-white dark:bg-forest-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-forest-800 border border-slate-200/80 dark:border-forest-700'
                    }`}
                  >
                    {val} {val === 1 ? 'Acre' : 'Acres'}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={farmAcres}
                onChange={(e) => setFarmAcres(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-forest-800 rounded-lg appearance-none cursor-pointer accent-agri-600"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>0.5 Acre</span>
                <span className="font-extrabold text-forest-950 dark:text-white text-xs bg-white dark:bg-forest-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-forest-700 shadow-sm">
                  {farmAcres} {farmAcres === 1 ? 'Acre' : 'Acres'}
                </span>
                <span>20 Acres</span>
              </div>
            </div>
          </div>

          {/* 4 Dynamic Financial KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Yield */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-1 hover:border-emerald-300 transition-colors print:bg-white print:border-slate-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                {t('totalYield') || 'Total Harvest Yield'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-forest-950 dark:text-white">
                {totalYield} <UnitInfoTooltip unitKey="qtls" className="text-xs font-bold text-slate-500 dark:text-slate-400">qtls</UnitInfoTooltip>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Avg {baseFinancials.avgYieldPerAcreQtl} qtls/acre {farmingMode === 'precision' && '(+15% Tech)'}
              </p>
            </div>

            {/* Market Benchmark Price */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-1 hover:border-emerald-300 transition-colors print:bg-white print:border-slate-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                {t('marketRate') || 'Market / MSP Rate'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-forest-950 dark:text-white">
                ₹{baseFinancials.marketPricePerQtl.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Per quintal (100 kg)
              </p>
            </div>

            {/* Total Cultivation Cost */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1 hover:border-amber-400 transition-colors print:bg-white print:border-slate-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400 block truncate">
                {t('totalCost') || 'Total Production Cost'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-300">
                ₹{totalCost.toLocaleString()}
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400">
                ₹{baseFinancials.costPerAcre.toLocaleString()}/acre input &amp; labor
              </p>
            </div>

            {/* Projected Net Profit */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100/90 to-green-50 dark:from-forest-950 dark:to-emerald-950/60 border-2 border-emerald-400/80 dark:border-emerald-600 space-y-1 shadow-sm hover:shadow-md transition-all print:bg-white print:border-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 block truncate">
                  {t('netProfit') || 'Projected Net Profit'}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  {profitMarginPercent}% Margin
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-white">
                ₹{netProfit.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                ROI: <strong>+{roiPercent}%</strong> return on investment
              </p>
            </div>
          </div>

          {/* Cost Allocation Breakdown Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-forest-950/60 border border-slate-200/70 dark:border-forest-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest-950 dark:text-white flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-agri-600 dark:text-agri-400" />
                <span>Operational Cost Distribution for {farmAcres} {farmAcres === 1 ? 'Acre' : 'Acres'} (₹{totalCost.toLocaleString()})</span>
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">Hover segments for details</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-forest-800">
              <div 
                className="bg-emerald-600 transition-all duration-500 hover:opacity-85" 
                style={{ width: `${baseFinancials.costBreakdown.seeds}%` }} 
                title={`Seeds & Seedlings: ₹${baseFinancials.costBreakdownAmounts.seeds.toLocaleString()} (${baseFinancials.costBreakdown.seeds}%)`}
              />
              <div 
                className="bg-blue-600 transition-all duration-500 hover:opacity-85" 
                style={{ width: `${baseFinancials.costBreakdown.fertilizers}%` }} 
                title={`Fertilizers & Nutrients: ₹${baseFinancials.costBreakdownAmounts.fertilizers.toLocaleString()} (${baseFinancials.costBreakdown.fertilizers}%)`}
              />
              <div 
                className="bg-cyan-500 transition-all duration-500 hover:opacity-85" 
                style={{ width: `${baseFinancials.costBreakdown.irrigation}%` }} 
                title={`Irrigation & Water: ₹${baseFinancials.costBreakdownAmounts.irrigation.toLocaleString()} (${baseFinancials.costBreakdown.irrigation}%)`}
              />
              <div 
                className="bg-amber-600 transition-all duration-500 hover:opacity-85" 
                style={{ width: `${baseFinancials.costBreakdown.labor}%` }} 
                title={`Field Labor & Harvesting: ₹${baseFinancials.costBreakdownAmounts.labor.toLocaleString()} (${baseFinancials.costBreakdown.labor}%)`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>{t('seedsLabel') || 'Seeds'}: ₹{baseFinancials.costBreakdownAmounts.seeds.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                <span>{t('nutrientsLabel') || 'Fertilizers'}: ₹{baseFinancials.costBreakdownAmounts.fertilizers.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 flex-shrink-0" />
                <span>{t('irrigationLabel') || 'Irrigation'}: ₹{baseFinancials.costBreakdownAmounts.irrigation.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 flex-shrink-0" />
                <span>{t('laborLabel') || 'Labor'}: ₹{baseFinancials.costBreakdownAmounts.labor.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Strategic Agronomic Market Profile */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-forest-950/80 border border-emerald-200/60 dark:border-forest-800 text-xs text-emerald-900 dark:text-emerald-300 print:bg-white print:border-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">🏷️</span>
              <span>
                <strong>{t('marketPositioning') || 'Market Positioning'}:</strong> {baseFinancials.profitCategory}
              </span>
            </div>
            <div className="flex items-center gap-4 text-emerald-800 dark:text-emerald-400">
              <span>⏱️ Gestation: <strong>{baseFinancials.gestationDays}</strong></span>
              <span>🛡️ Risk Profile: <strong>{baseFinancials.riskLevel}</strong></span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* YouTube Video Learning Hub — Curated & Playable Inline */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Play className="w-4 h-4 fill-red-600 dark:fill-red-400" />
                </div>
                <h3 className="text-lg font-bold text-forest-950 dark:text-white">
                  {t('videoHub') || 'Video Learning Hub'} — {crop_info.displayName || predicted_crop}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verified educational masterclasses and IPM tutorials directly playable right inside AgriSmart AI.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-forest-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-forest-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Video Feeds
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            {/* Cultivation Guide — verified working embed */}
            <div className="flex flex-col justify-between rounded-2xl border border-emerald-100 dark:border-forest-800 bg-gradient-to-b from-emerald-50/40 dark:from-forest-950/80 to-white dark:to-forest-950/40 p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-emerald-300 dark:hover:border-forest-700 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    🌱 {t('cultivationGuide') || 'Cultivation Masterclass'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[160px]" title={cropVideos.cultivation.author}>
                    {cropVideos.cultivation.author}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-forest-950 dark:text-white line-clamp-1" title={cropVideos.cultivation.title}>
                  {cropVideos.cultivation.title}
                </h4>
              </div>

              {/* 16:9 Video Frame */}
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-200/90 dark:border-forest-800 shadow-inner bg-black" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${cropVideos.cultivation.id}?rel=0&modestbranding=1&playsinline=1`}
                  title={`${crop_info.displayName || predicted_crop} Cultivation Guide`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  Covers soil preparation, sowing density, irrigation &amp; harvest.
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${cropVideos.cultivation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 whitespace-nowrap group/link"
                >
                  <span>{t('openYoutube') || 'Open in YouTube'}</span>
                  <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Pest & Disease Management — verified working embed */}
            <div className="flex flex-col justify-between rounded-2xl border border-amber-100 dark:border-forest-800 bg-gradient-to-b from-amber-50/40 dark:from-forest-950/80 to-white dark:to-forest-950/40 p-4 sm:p-5 space-y-3.5 shadow-sm hover:border-amber-300 dark:hover:border-forest-700 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    🪲 {t('pestGuide') || 'Pest & Disease IPM'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[160px]" title={cropVideos.pest.author}>
                    {cropVideos.pest.author}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-forest-950 dark:text-white line-clamp-1" title={cropVideos.pest.title}>
                  {cropVideos.pest.title}
                </h4>
              </div>

              {/* 16:9 Video Frame */}
              <div className="relative w-full rounded-xl overflow-hidden border border-slate-200/90 dark:border-forest-800 shadow-inner bg-black" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${cropVideos.pest.id}?rel=0&modestbranding=1&playsinline=1`}
                  title={`${crop_info.displayName || predicted_crop} Pest Management`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  Biological controls, early diagnosis &amp; pesticide safety.
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${cropVideos.pest.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 whitespace-nowrap group/link"
                >
                  <span>{t('openYoutube') || 'Open in YouTube'}</span>
                  <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Deep-Dive Search Suggestions */}
          <div className="pt-4 border-t border-slate-100 dark:border-forest-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 print:hidden">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-agri-600 dark:text-agri-400 flex-shrink-0" />
              <span className="font-semibold text-forest-950 dark:text-white">{t('videoTopics') || 'Recommended Video Topics'}:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent((crop_info.displayName || predicted_crop) + ' high yield variety modern cultivation')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-forest-950 hover:bg-agri-100 dark:hover:bg-forest-800 text-slate-700 dark:text-slate-300 hover:text-agri-800 dark:hover:text-agri-300 transition-colors border border-slate-200/80 dark:border-forest-800"
              >
                🌾 High-Yield Hybrid Varieties →
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent((crop_info.displayName || predicted_crop) + ' drip irrigation water management')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-forest-950 hover:bg-blue-100 dark:hover:bg-forest-800 text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-300 transition-colors border border-slate-200/80 dark:border-forest-800"
              >
                💧 Drip Irrigation Setup →
              </a>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent((crop_info.displayName || predicted_crop) + ' organic pest control neem oil')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-forest-950 hover:bg-emerald-100 dark:hover:bg-forest-800 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors border border-slate-200/80 dark:border-forest-800"
              >
                🧪 Organic Pest Solutions →
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Comprehensive Agronomic Guide Grid (Page 2 in Print) */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-6 print:p-4 print-break-before print:border-slate-300">
          <div>
            <h3 className="text-lg font-bold text-forest-950 dark:text-white flex items-center gap-2">
              <span className="text-xl">{mainCropMeta.emoji}</span>
              <span>{t('agronomicProfile') || 'Agronomic Profile & Cultivation Guide'} ({cropDisplayName})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('agronomicProfileSubtitle') || 'Key cultivation parameters, seasonal windows, and field management recommendations.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Season */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-2 hover:border-agri-300 transition-colors print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2 text-agri-700 dark:text-agri-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('season') || 'Optimal Season'}</span>
              </div>
              <p className="text-sm font-bold text-forest-950 dark:text-white">
                {cropSeason}
              </p>
            </div>

            {/* Harvest Duration */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-2 hover:border-agri-300 transition-colors print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2 text-agri-700 dark:text-agri-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('harvestDuration') || 'Harvest Duration'}</span>
              </div>
              <p className="text-sm font-bold text-forest-950 dark:text-white">
                {crop_info.harvestTime || 'Standard growth cycle'}
              </p>
            </div>

            {/* Water Needs */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-2 hover:border-blue-300 transition-colors print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Droplet className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('waterIrrigation') || 'Water & Irrigation'}</span>
              </div>
              <p className="text-sm font-bold text-forest-950 dark:text-white">
                {cropWater}
              </p>
            </div>

            {/* Soil Type */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-2 sm:col-span-2 hover:border-amber-300 transition-colors print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('idealSoil') || 'Ideal Soil Profile'}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {cropSoil}
              </p>
            </div>

            {/* Climate */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-2 hover:border-amber-300 transition-colors print:bg-white print:border-slate-300">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Thermometer className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('climateConditions') || 'Climate Conditions'}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {cropClimate}
              </p>
            </div>

          </div>

          {/* Farmer Tips Banner */}
          {crop_info.farmerTips && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-forest-950/80 border border-emerald-200/80 dark:border-emerald-800 flex items-start gap-3.5 print:bg-white print:border-slate-300">
              <Lightbulb className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  {t('fieldAdvisory') || 'Agronomic Field Advisory & Best Practice'}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-slate-300 leading-relaxed">
                  {crop_info.farmerTips}
                </p>
              </div>
            </div>
          )}

          {/* NPK Analysis */}
          {crop_info.npkProfile && (
            <div className="p-5 rounded-2xl bg-agri-50/60 dark:bg-forest-950/60 border border-agri-200/80 dark:border-forest-800 flex items-start gap-3.5 print:bg-white print:border-slate-300">
              <Layers className="w-5 h-5 text-agri-700 dark:text-agri-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-white">
                  {t('nutrientDemand') || 'Nutrient Demand Profile (NPK)'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {crop_info.npkProfile}
                </p>
              </div>
            </div>
          )}

        </div>
      </ScrollReveal>

      {/* Submitted Parameters Summary Table (Hidden in print because top official table contains it) */}
      <ScrollReveal animation="fade-up" duration={600}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm hover:shadow-md transition-shadow space-y-5 print:hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-forest-800">
            <div>
              <h3 className="text-lg font-bold text-forest-950 dark:text-white">
                {t('submittedParamsTitle') || 'Submitted Soil & Climate Parameters'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('submittedParamsSubtitle') || 'Exact feature values transformed via StandardScaler and evaluated by the neural network.'}
              </p>
            </div>
            {timestamp && (
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {timestamp}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {input_summary.map((item) => (
              <div 
                key={item.key} 
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-forest-950/60 border border-slate-200 dark:border-forest-800 text-center space-y-1 hover:border-agri-300 transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block truncate">
                  {item.name}
                </span>
                <span className="text-base font-black text-forest-950 dark:text-white block">
                  {item.value} <UnitInfoTooltip unitKey={item.unit} className="text-[10px] font-normal text-slate-500 dark:text-slate-400">{item.unit}</UnitInfoTooltip>
                </span>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  item.status === 'Optimal Range' 
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                    : item.status === 'Above Average'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Disclaimers & Next Actions */}
      <ScrollReveal animation="fade-up" duration={500}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-100/80 dark:bg-forest-950 border border-slate-200 dark:border-forest-800 text-xs text-slate-600 dark:text-slate-400 print:bg-white print:border-slate-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
            <span>
              Predictions are statistical indicators based on laboratory benchmark records. Consult local soil testing agencies and extension offices prior to commercial planting.
            </span>
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className="whitespace-nowrap font-bold text-agri-700 dark:text-agri-400 hover:text-agri-800 dark:hover:text-agri-300 transition-colors cursor-pointer print:hidden"
          >
            Explore Dataset Analytics →
          </button>
        </div>
      </ScrollReveal>

    </div>
  );
}
