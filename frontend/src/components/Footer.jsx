import React from 'react';
import { Sprout, Heart, ShieldCheck, Cpu, Database, GraduationCap } from 'lucide-react';
import AgriSmartLogo from './AgriSmartLogo';
import { useApp } from '../AppContext';

export default function Footer({ setActiveTab }) {
  const { t } = useApp();

  return (
    <footer className="bg-forest-950 text-slate-300 pt-16 pb-12 border-t border-forest-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-900/80">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <AgriSmartLogo size="sm" />
              <span className="font-extrabold text-xl tracking-tight text-white">
                AgriSmart<span className="text-agri-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footerTagline') || 'Intelligent agricultural crop recommendation powered by deep neural networks. Built for academic research and modern agricultural precision.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-agri-400 font-medium">
              <GraduationCap className="w-4 h-4 text-agri-400" />
              <span>{t('universityDemo') || 'University Demonstration Project'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">{t('quickNav') || 'Navigation'}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveTab('overview')} className="text-slate-400 hover:text-agri-300 transition-colors cursor-pointer">
                  {t('navOverview') || 'System Overview'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('recommend')} className="text-slate-400 hover:text-agri-300 transition-colors cursor-pointer">
                  {t('navRecommend') || 'Crop Recommendation'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('analytics')} className="text-slate-400 hover:text-agri-300 transition-colors cursor-pointer">
                  {t('navAnalytics') || 'Dataset & Model Analytics'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('history')} className="text-slate-400 hover:text-agri-300 transition-colors cursor-pointer">
                  {t('navHistory') || 'Prediction History'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="text-slate-400 hover:text-agri-300 transition-colors cursor-pointer">
                  {t('navAbout') || 'Architecture & Workflow'}
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">{t('techSpecs') || 'AI Engine Specs'}</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-agri-400" />
                <span>{t('kerasModel') || 'TensorFlow / Keras Neural Network'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Accuracy: <strong className="text-white">97.5%</strong> (Test Loss: 0.0563)</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-agri-400" />
                <span>{t('benchmarkRecords') || '2,200 Benchmark Field Observations'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-agri-400" />
                <span>{t('certifiedCrops') || '22 Certified Crop Categories'}</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Agronomic Note</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Model outputs represent probabilistic statistical recommendations derived from experimental soil and climate feature distributions. Field implementation should always consider local ground testing, seed availability, and local agricultural advisory.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <p>© {new Date().getFullYear()} AgriSmart AI. Intelligent Crop Recommendation System.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 border border-forest-800 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-agri-400"></span>
              Keras v3 / Scikit-Learn
            </span>
            <span>All 7 Agronomic Parameters Calibrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
