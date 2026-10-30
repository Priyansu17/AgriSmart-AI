import React, { useState } from 'react';
import { 
  Sprout, 
  BarChart3, 
  History, 
  Info, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Home,
  Sparkles,
  Sun,
  Moon,
  Globe,
  ChevronDown
} from 'lucide-react';
import AgriSmartLogo from './AgriSmartLogo';
import { useApp } from '../AppContext';

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { language, setLanguage, t, supportedLanguages, theme, toggleTheme, isDark } = useApp();

  const navItems = [
    { id: 'overview', label: t('navOverview'), icon: Home },
    { id: 'recommend', label: t('navRecommend'), icon: Sparkles, highlight: true },
    { id: 'analytics', label: t('navAnalytics'), icon: BarChart3 },
    { id: 'history', label: t('navHistory'), icon: History },
    { id: 'about', label: t('navAbout'), icon: Info },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-forest-950/95 backdrop-blur-md border-b border-agri-100 dark:border-forest-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <AgriSmartLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-forest-950 dark:text-white font-sans">
                  AgriSmart<span className="text-agri-500 font-extrabold ml-0.5">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block font-medium">
                {t('brandSubtitle')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links — Formed as in the picture */}
          <nav className="hidden lg:flex items-center gap-2 lg:gap-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm bg-agri-600 hover:bg-agri-700 text-white shadow-md shadow-agri-600/30 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-forest-950 dark:text-white font-bold bg-slate-100 dark:bg-forest-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-forest-950 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-forest-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-agri-600 dark:text-agri-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Language Switcher, Theme Toggle & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multilingual Regional Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-forest-700 bg-white dark:bg-forest-900 hover:bg-slate-50 dark:hover:bg-forest-800 text-xs font-bold text-forest-950 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
                title="Select Language / भाषा चुनें"
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden sm:inline">{currentLangObj.native}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Language Dropdown Menu */}
              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-forest-800 mb-1">
                    Select Language / भाषा
                  </div>
                  {supportedLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-agri-50 dark:bg-forest-800 text-agri-700 dark:text-agri-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-forest-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.native}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-forest-700 bg-white dark:bg-forest-900 hover:bg-slate-50 dark:hover:bg-forest-800 text-slate-700 dark:text-amber-300 shadow-xs transition-all cursor-pointer group"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-forest-900 group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Backend Health Badge */}
            <div 
              title={backendStatus.connected ? "Flask AI API Connected & Ready" : "Connecting to Flask API..."}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                backendStatus.connected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              {backendStatus.connected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('modelActive')}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('modelConnecting')}</span>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-forest-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-forest-800 bg-white/95 dark:bg-forest-950/95 px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-agri-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-forest-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {/* Mobile Language Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-forest-800 flex flex-wrap gap-1.5">
            {supportedLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  language === l.code
                    ? 'bg-agri-600 text-white'
                    : 'bg-slate-100 dark:bg-forest-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {l.flag} {l.native}
              </button>
            ))}
          </div>

          <div className="pt-2 px-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{backendStatus.connected ? 'Trained Keras Model Connected' : 'Checking Backend Server...'}</span>
          </div>
        </div>
      )}
    </header>
  );
}
