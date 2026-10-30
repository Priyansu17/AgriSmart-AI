import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import RecommendationForm from './components/RecommendationForm';
import PredictionResult from './components/PredictionResult';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PredictionHistory from './components/PredictionHistory';
import AboutProject from './components/AboutProject';
import Footer from './components/Footer';
import AgriChatbot from './components/AgriChatbot';
import { predictCrop, fetchHealth } from './api';
import { ArrowUp } from 'lucide-react';
import { useApp } from './AppContext';

const DEFAULT_FORM = {
  N: 90,
  P: 42,
  K: 43,
  temperature: 20.87,
  humidity: 82.0,
  ph: 6.5,
  rainfall: 202.93
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ connected: false, metadata: null });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Clean scroll listener for top progress bar & back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      if (totalScroll > 0) {
        const currentProgress = (currentScrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      setShowBackToTop(currentScrollY > 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  // Initial backend health check
  useEffect(() => {
    let isMounted = true;
    const checkBackend = () => {
      fetchHealth()
        .then((data) => {
          if (isMounted) {
            setBackendStatus({ connected: true, metadata: data });
          }
        })
        .catch(() => {
          if (isMounted) {
            setBackendStatus({ connected: false, metadata: null });
          }
        });
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle prediction submission
  const handlePredict = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await predictCrop(formData);
      setPredictionResult(data);
      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Prediction request failed:', err);
      setErrorMessage(err.message || 'Failed to generate recommendation. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sample selection from hero or overview
  const handleSelectSample = (sample) => {
    setFormData({
      N: sample.N,
      P: sample.P,
      K: sample.K,
      temperature: sample.temp,
      humidity: sample.hum,
      ph: sample.ph,
      rainfall: sample.rain
    });
    setPredictionResult(null);
    setActiveTab('recommend');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load previous history inputs into form
  const handleLoadParameters = (inputs) => {
    setFormData({
      N: inputs.N,
      P: inputs.P,
      K: inputs.K,
      temperature: inputs.temperature,
      humidity: inputs.humidity,
      ph: inputs.ph,
      rainfall: inputs.rainfall
    });
    setPredictionResult(null);
    setActiveTab('recommend');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Try again / Reset
  const handleTryAgain = () => {
    setPredictionResult(null);
    setFormData(DEFAULT_FORM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modify current inputs without resetting
  const handleModifyInputs = () => {
    setPredictionResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F6] dark:bg-[#07120B] text-slate-800 dark:text-slate-100 font-sans selection:bg-agri-500 selection:text-white relative transition-colors duration-200">
      
      {/* Scroll Progress Bar at very top */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-agri-400 via-emerald-500 to-agri-600 z-50 transition-all duration-150 ease-out shadow-sm"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Top Sticky Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        backendStatus={backendStatus} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {activeTab === 'overview' && (
          <Overview 
            setActiveTab={setActiveTab} 
            onSelectSample={handleSelectSample} 
          />
        )}

        {activeTab === 'recommend' && (
          predictionResult ? (
            <PredictionResult 
              result={predictionResult}
              onTryAgain={handleTryAgain}
              onModifyInputs={handleModifyInputs}
              setActiveTab={setActiveTab}
            />
          ) : (
            <RecommendationForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handlePredict}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          )
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'history' && (
          <PredictionHistory 
            onLoadParameters={handleLoadParameters}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'about' && (
          <AboutProject 
            setActiveTab={setActiveTab} 
          />
        )}

      </main>

      {/* Floating Back to Top Button — Translucent Glassy Effect, Stacked above Chatbot */}
      <button
        onClick={handleScrollToTop}
        aria-label="Scroll to top"
        title="Back to Top"
        className={`fixed bottom-24 right-6 z-30 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-forest-900/80 hover:bg-white/90 dark:hover:bg-forest-800 text-forest-950 dark:text-white shadow-xl shadow-forest-950/10 border border-white/80 dark:border-forest-700/80 backdrop-blur-xl transition-all duration-300 transform-gpu cursor-pointer group ring-1 ring-slate-900/10 dark:ring-white/10 ${
          showBackToTop 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto hover:-translate-y-1 hover:shadow-2xl hover:border-agri-400/60' 
            : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
        }`}
      >
        <div className="w-5 h-5 rounded-lg bg-agri-600/10 dark:bg-agri-500/20 flex items-center justify-center text-agri-700 dark:text-agri-400 group-hover:bg-agri-600 group-hover:text-white transition-colors duration-200">
          <ArrowUp className="w-3 h-3 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
        </div>
        <span className="text-[11px] font-bold tracking-tight text-forest-950 dark:text-slate-200">Top</span>
      </button>

      {/* Floating AI Farm Assistant Chatbot Bubble */}
      <AgriChatbot 
        setActiveTab={setActiveTab}
        setFormData={setFormData}
        onSelectSample={handleSelectSample}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}
