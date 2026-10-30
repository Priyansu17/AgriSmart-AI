import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  ArrowUpRight, 
  Sprout, 
  Calendar, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { fetchHistory, clearHistory } from '../api';
import ScrollReveal from './ScrollReveal';
import { getCropIconMeta } from '../cropIcons';
import { useApp } from '../AppContext';

export default function PredictionHistory({ 
  onLoadParameters, 
  setActiveTab 
}) {
  const { t, isDark, language } = useApp();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  const loadHistory = () => {
    setLoading(true);
    fetchHistory()
      .then((data) => {
        if (data && data.history) {
          setHistoryList(data.history);
        } else {
          setHistoryList([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load history:', err);
        setError('Failed to fetch prediction history from server.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear your prediction history?')) {
      return;
    }
    setClearing(true);
    try {
      await clearHistory();
      setHistoryList([]);
    } catch (err) {
      alert('Error clearing history: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleSelectRecord = (record) => {
    if (record && record.inputs) {
      onLoadParameters(record.inputs);
      setActiveTab('recommend');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Retrieving logged predictions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <ScrollReveal animation="fade-down" duration={500}>
        <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-6 sm:p-8 border border-agri-100 dark:border-forest-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 dark:bg-agri-950/80 text-agri-800 dark:text-agri-300 text-xs font-bold uppercase tracking-wider mb-2 border border-agri-200 dark:border-forest-800">
              <History className="w-3.5 h-3.5 text-agri-600 dark:text-agri-400" />
              <span>{t('historyBadge') || 'Persisted Log Records'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-white tracking-tight">
              {t('historyTitle') || t('navHistory') || 'Prediction History'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {t('historySubtitle') || 'Review past soil inquiries, tested conditions, and recommended crop outputs.'}
            </p>
          </div>

          {historyList.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={loadHistory}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-forest-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-forest-800 transition-colors cursor-pointer"
                title="Refresh History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                disabled={clearing}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearing ? 'Clearing...' : (t('clearHistoryBtn') || 'Clear History')}</span>
              </button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* History Items or Empty State */}
      {historyList.length === 0 ? (
        <ScrollReveal animation="zoom-in" duration={500}>
          <div className="bg-white dark:bg-forest-900/90 rounded-3xl p-12 text-center border border-agri-100 dark:border-forest-800 shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-agri-50 dark:bg-forest-950 border border-agri-200 dark:border-forest-800 flex items-center justify-center text-agri-600 dark:text-agri-400 mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-forest-950 dark:text-white">
              {t('noHistoryTitle') || 'No Historical Predictions Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {t('noHistoryDesc') || 'Your generated crop recommendations will be logged here automatically with all 7 input values and top probabilistic matches.'}
            </p>
            <button
              onClick={() => setActiveTab('recommend')}
              className="px-6 py-3 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {t('createFirstPrediction') || 'Create Your First Prediction'}
            </button>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          {historyList.map((record, idx) => {
            const inputs = record.inputs || {};
            const top3 = record.top_3 || [];
            const cropMeta = getCropIconMeta(record.displayName || record.predicted_crop);

            return (
              <ScrollReveal 
                key={record.id} 
                animation="fade-up" 
                delay={idx * 80} 
                duration={500}
              >
                <div
                  className="bg-white dark:bg-forest-900/90 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-forest-800 hover:border-agri-300 dark:hover:border-agri-500 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
                >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-forest-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${cropMeta.color} shadow-sm flex-shrink-0`}>
                      {cropMeta.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-forest-950 dark:text-white capitalize">
                          {record.displayName || record.predicted_crop}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border dark:border-emerald-800">
                          {record.confidence}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{record.category || cropMeta.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{record.timestamp}</span>
                    </div>

                    <button
                      onClick={() => handleSelectRecord(record)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-agri-200 dark:border-forest-700 bg-agri-50 dark:bg-forest-950 hover:bg-agri-100 dark:hover:bg-forest-800 text-agri-800 dark:text-agri-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Load these exact 7 inputs into the recommendation form"
                    >
                      <span>Load Inputs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 7 Inputs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-forest-950/60 p-2 rounded-xl border border-slate-100 dark:border-forest-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">{t('paramN') || 'Nitrogen (N)'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inputs.N} kg/ha</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-forest-950/60 p-2 rounded-xl border border-slate-100 dark:border-forest-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">{t('paramP') || 'Phosphorus (P)'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inputs.P} kg/ha</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-forest-950/60 p-2 rounded-xl border border-slate-100 dark:border-forest-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">{t('paramK') || 'Potassium (K)'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inputs.K} kg/ha</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-forest-950/60 p-2 rounded-xl border border-slate-100 dark:border-forest-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">{t('paramTemp') || 'Temperature'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inputs.temperature} °C</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-forest-950/60 p-2 rounded-xl border border-slate-100 dark:border-forest-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">{t('paramHumidity') || 'Humidity'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inputs.humidity} %</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-forest-950/60 p-2 rounded-xl border border-slate-100 dark:border-forest-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">{t('paramPh') || 'Soil pH'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inputs.ph}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-forest-950/60 p-2 rounded-xl border border-slate-100 dark:border-forest-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">{t('paramRainfall') || 'Rainfall'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inputs.rainfall} mm</span>
                  </div>
                </div>

                {/* Top 3 Alternative Candidates */}
                {top3.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-600 dark:text-slate-300">{t('top3Title') || 'Top 3 Alternatives'}:</span>
                    {top3.map((cand, idx) => {
                      let rank = idx + 1;
                      let cropName = '';
                      let conf = '';

                      if (typeof cand === 'string') {
                        // Parses strings like "rice (60.7%)" or "rice"
                        const match = cand.match(/^([a-zA-Z_\s]+)\s*\(([\d\.]+%?)\)$/);
                        if (match) {
                          cropName = match[1].trim();
                          conf = match[2];
                        } else {
                          cropName = cand;
                        }
                      } else if (typeof cand === 'object' && cand !== null) {
                        rank = cand.rank || (idx + 1);
                        cropName = cand.displayName || cand.crop || '';
                        conf = cand.confidence ? `${cand.confidence}%` : '';
                      }

                      return (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-forest-950 text-slate-700 dark:text-slate-200 capitalize font-medium border border-slate-200 dark:border-forest-800 shadow-2xs"
                        >
                          <span className="font-extrabold text-[10px] px-1.5 py-0.2 rounded bg-agri-100 dark:bg-forest-900 text-agri-800 dark:text-agri-300">
                            Rank {rank}
                          </span>
                          <span className="font-bold text-forest-950 dark:text-white">{cropName}</span>
                          {conf && <span className="text-[10px] text-slate-400 font-mono">({conf})</span>}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

    </div>
  );
}
