import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, Sparkles, Scale, ArrowRight, X } from 'lucide-react';
import { UNIT_DEFINITIONS } from '../unitDefinitions';

export default function UnitInfoTooltip({ unitKey, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const popoverRef = useRef(null);

  // Normalize key
  let normalizedKey = unitKey;
  if (unitKey === 'pH' || unitKey === 'pH scale' || unitKey === 'scale') normalizedKey = 'pH scale';
  if (unitKey === 'qtl' || unitKey === 'qtls') normalizedKey = 'qtls';
  if (unitKey === 'acre' || unitKey === 'acres' || unitKey === 'Acres') normalizedKey = 'Acres';

  const unitData = UNIT_DEFINITIONS[normalizedKey];

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Close on outside click for mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  if (!unitData) {
    return <span className={className}>{children}</span>;
  }

  return (
    <div 
      ref={popoverRef}
      className="relative inline-flex items-center group cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Target Badge with subtle dashed underline / hover cue */}
      <span 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1 transition-all ${className}`}
        title="Hover or click for unit measurement formula & conversions"
      >
        <span>{children || unitData.short}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-agri-400 group-hover:scale-125 transition-transform" />
      </span>

      {/* Floating Glass Tooltip Popover */}
      {isOpen && (
        <div 
          className="absolute bottom-full right-0 mb-2.5 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-white/95 dark:bg-forest-950/95 backdrop-blur-xl border border-agri-200 dark:border-forest-700 shadow-2xl shadow-forest-950/20 text-slate-800 dark:text-slate-100 space-y-2.5 text-xs animate-in zoom-in-95 duration-150 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-forest-800 pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-agri-600 dark:text-agri-400 block font-mono">
                {unitData.category}
              </span>
              <h5 className="font-extrabold text-sm text-forest-950 dark:text-white mt-0.5">
                {unitData.name}
              </h5>
              <p className="text-[11px] font-semibold text-agri-700 dark:text-agri-300">
                {unitData.nameHi}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 sm:hidden"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Conversion Formula Box */}
          <div className="p-2.5 rounded-xl bg-agri-50/80 dark:bg-forest-900/80 border border-agri-200/80 dark:border-forest-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-agri-800 dark:text-agri-300 uppercase tracking-wide">
              <Scale className="w-3 h-3 text-agri-600 dark:text-agri-400" />
              <span>Conversion Formula • रूपांतरण सूत्र:</span>
            </div>
            <div className="font-mono text-[11px] font-bold text-forest-950 dark:text-white">
              {unitData.formula}
            </div>
            {unitData.conversionTip && (
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                {unitData.conversionTip}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {unitData.description}
          </p>

          {/* Agronomic significance / tip */}
          {unitData.agronomicTip && (
            <div className="flex items-start gap-1.5 text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-forest-900/50 p-2 rounded-lg border border-emerald-200/60 dark:border-forest-800">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{unitData.agronomicTip}</span>
            </div>
          )}

          {/* Bottom Arrow Pointer */}
          <div className="absolute top-full right-6 -mt-1.5 border-4 border-transparent border-t-white dark:border-t-forest-950 pointer-events-none" />
        </div>
      )}
    </div>
  );
}
