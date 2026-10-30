import React from 'react';
import { 
  X, 
  Ruler, 
  Scale, 
  Sparkles, 
  Layers, 
  Thermometer, 
  Droplet, 
  Sliders, 
  CloudRain, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { UNIT_DEFINITIONS } from '../unitDefinitions';
import { useApp } from '../AppContext';

export default function UnitsGuideModal({ isOpen, onClose }) {
  const { isDark, language } = useApp();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-3xl w-full bg-white/95 dark:bg-forest-900/95 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-forest-700 shadow-2xl shadow-forest-950/30 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-forest-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-agri-100 dark:bg-forest-950 border border-agri-200 dark:border-forest-700 flex items-center justify-center text-agri-700 dark:text-agri-400">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-agri-100 dark:bg-forest-950 text-agri-800 dark:text-agri-300 text-[10px] font-bold uppercase tracking-wider mb-1 border dark:border-forest-800">
                <Scale className="w-3 h-3 text-agri-600 dark:text-agri-400" />
                <span>Standard Agronomic Measurement Units</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-forest-950 dark:text-white">
                Measurement Units & Conversions Guide
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-forest-800 hover:bg-slate-200 dark:hover:bg-forest-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Intro Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-agri-50 to-emerald-50 dark:from-forest-950 dark:to-forest-950/60 border border-agri-200/80 dark:border-forest-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-agri-600 dark:text-agri-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>How to read these units: </strong>
            All 7 input variables use standard agricultural testing metrics matching Government Soil Health Cards (मृदा स्वास्थ्य कार्ड) and Indian Meteorological Department (IMD) standards. Use the conversion formulas below if your laboratory test results are in acres or pounds.
          </div>
        </div>

        {/* Units Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(UNIT_DEFINITIONS).map((u) => (
            <div 
              key={u.id}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-forest-950/60 border border-slate-200/80 dark:border-forest-800 space-y-2 hover:border-agri-300 dark:hover:border-forest-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-agri-600 dark:text-agri-400 font-mono">
                  {u.category}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 text-xs font-mono font-bold text-forest-950 dark:text-white">
                  {u.short}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-forest-950 dark:text-white">
                  {u.name}
                </h4>
                <p className="text-xs font-semibold text-agri-700 dark:text-agri-300">
                  {u.nameHi}
                </p>
              </div>

              {/* Formula & Conversion */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 font-mono text-[11px] text-forest-950 dark:text-slate-200">
                <div className="font-bold text-emerald-700 dark:text-emerald-400">{u.formula}</div>
                {u.conversionTip && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                    {u.conversionTip}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {u.description}
              </p>

              {/* Benchmarks if any */}
              {u.benchmarks && u.benchmarks.length > 0 && (
                <div className="pt-1.5 border-t border-slate-200 dark:border-forest-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Soil Card Benchmarks:</span>
                  <div className="space-y-0.5 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                    {u.benchmarks.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{b.param}:</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {b.medium || b.low}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-forest-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Hover over any unit pill on the input form to see live conversion cards.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-forest-950 dark:bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
