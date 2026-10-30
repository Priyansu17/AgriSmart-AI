import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudSun, 
  MapPin, 
  Navigation, 
  Search, 
  Droplet, 
  Thermometer, 
  CloudRain, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Wind,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  fetchLiveWeather, 
  searchGeocoding, 
  reverseGeocode, 
  INDIAN_AGRI_HUBS 
} from '../weatherService';
import { useApp } from '../AppContext';

export default function LiveWeatherAutoFill({ 
  onApplyWeather, 
  currentValues = {} 
}) {
  const { t, isDark, language } = useApp();

  const [isOpen, setIsOpen] = useState(true);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [appliedRecently, setAppliedRecently] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [autoApplyOnSelect, setAutoApplyOnSelect] = useState(true);

  const searchDebounceRef = useRef(null);

  // Handle live search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGeocoding(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Load weather for a given lat/lon and location name
  const loadWeatherForCoords = async (lat, lon, locationLabel, fallbackRainfall = 95.0) => {
    setErrorMessage(null);
    setAppliedRecently(false);

    try {
      const data = await fetchLiveWeather(lat, lon, fallbackRainfall);
      setWeatherData(data);
      setSelectedLocationName(locationLabel);

      // If auto-apply is toggled on, immediately transfer to form
      if (autoApplyOnSelect && onApplyWeather) {
        onApplyWeather({
          temperature: data.temperature,
          humidity: data.humidity,
          rainfall: data.rainfall,
          locationName: locationLabel
        });
        setAppliedRecently(true);
      }
    } catch (err) {
      console.warn('Could not load live weather, using fallback:', err);
      // Fallback with regional agro-climatic estimate
      const fallbackData = {
        success: false,
        latitude: lat,
        longitude: lon,
        temperature: 26.5,
        humidity: 65.0,
        rainfall: fallbackRainfall,
        weatherLabel: 'Estimated Agro-Climatic Normal • सामान्य मौसमी अनुमान',
        weatherIcon: '🌤️',
        isDay: true,
        source: 'Regional Climatological Normal'
      };
      setWeatherData(fallbackData);
      setSelectedLocationName(locationLabel);

      if (autoApplyOnSelect && onApplyWeather) {
        onApplyWeather({
          temperature: fallbackData.temperature,
          humidity: fallbackData.humidity,
          rainfall: fallbackData.rainfall,
          locationName: locationLabel
        });
        setAppliedRecently(true);
      }
      setErrorMessage('Direct weather API unreachable. Applied regional agro-climatic estimate.');
    }
  };

  // GPS Auto-detect
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please search your district below.');
      return;
    }

    setIsDetectingGps(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const locName = await reverseGeocode(latitude, longitude);
          await loadWeatherForCoords(latitude, longitude, locName, 98.0);
        } catch (err) {
          await loadWeatherForCoords(latitude, longitude, `GPS: ${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`, 95.0);
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage('GPS permission was not allowed. You can search your district or pick a region below!');
        } else {
          setErrorMessage('Could not retrieve GPS position. Please pick a district below.');
        }
      },
      { timeout: 9000, enableHighAccuracy: false }
    );
  };

  // Quick preset Indian Hub selection
  const handleSelectHub = (hub) => {
    setSearchQuery('');
    setSearchResults([]);
    loadWeatherForCoords(
      hub.lat, 
      hub.lon, 
      `${hub.name} (${hub.state})`, 
      hub.normalRainfall
    );
  };

  // Search dropdown item click
  const handleSelectSearchResult = (item) => {
    const label = `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}, ${item.country}`;
    setSearchQuery('');
    setSearchResults([]);
    loadWeatherForCoords(item.lat, item.lon, label, 90.0);
  };

  // Manual trigger to apply to form
  const handleApplyToForm = () => {
    if (!weatherData || !onApplyWeather) return;

    onApplyWeather({
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      rainfall: weatherData.rainfall,
      locationName: selectedLocationName
    });

    setAppliedRecently(true);
    setTimeout(() => {
      setAppliedRecently(false);
    }, 4000);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/60 dark:from-forest-950/80 dark:via-forest-900/90 dark:to-forest-950/80 rounded-3xl p-6 sm:p-7 border border-emerald-200/80 dark:border-forest-700/80 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
            <CloudSun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-forest-950 dark:text-white">
                {t('weatherTitle') || 'Live Weather & Geo-Location Auto-Fill'}
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Open-Meteo Live API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('weatherSubtitle') || 'Fetch live local temperature, humidity, and rainfall — eliminates manual guessing.'}
            </p>
          </div>
        </div>

        {/* Toggle open/collapse */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-forest-700 bg-white dark:bg-forest-950 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-forest-900 transition-colors cursor-pointer"
        >
          <span>{isOpen ? (t('minimize') || 'Minimize') : (t('expand') || 'Expand Auto-Fill')}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 space-y-5 animate-in fade-in duration-200">
          
          {/* Action Row: GPS Button & Search Field */}
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            
            {/* GPS Detect Button */}
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-75 cursor-pointer flex-shrink-0"
            >
              {isDetectingGps ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('detectingGps') || 'Detecting GPS Location...'}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>{t('autoDetectGps') || '📍 Auto-Detect My Location (GPS)'}</span>
                </>
              )}
            </button>

            {/* City / District Search Input */}
            <div className="relative flex-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder') || '🔍 Or search Indian District or City (e.g. Pune, Ludhiana, Varanasi)...'}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-forest-950 border border-emerald-200/90 dark:border-forest-700 text-xs sm:text-sm text-forest-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-forest-950 rounded-2xl border border-emerald-200 dark:border-forest-700 shadow-2xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-forest-800">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-forest-900 flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-forest-950 dark:text-white">{item.name}</span>
                        {item.admin1 && (
                          <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                            ({item.admin1}, {item.country})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                        {item.lat.toFixed(2)}°N, {item.lon.toFixed(2)}°E
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Quick Agricultural Hub Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {t('farmingHubs') || 'Popular Agricultural Farming Hubs (1-Click Presets):'}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {INDIAN_AGRI_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => handleSelectHub(hub)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    selectedLocationName.includes(hub.name)
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white/80 dark:bg-forest-950 border-emerald-100 dark:border-forest-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-forest-600 hover:bg-emerald-50/50'
                  }`}
                  title={`${hub.majorCrops} • Normal Rain: ${hub.normalRainfall}mm`}
                >
                  <span>{hub.name.split(',')[0]}</span>
                  <span className="text-[9px] opacity-75">({hub.state})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Weather Result Display Panel */}
          {weatherData && (
            <div className="bg-white dark:bg-forest-950 rounded-2xl p-4 sm:p-5 border border-emerald-300/80 dark:border-forest-700 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-forest-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-forest-900 flex items-center justify-center text-xl flex-shrink-0">
                    {weatherData.weatherIcon || '🌤️'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest-950 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedLocationName}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {weatherData.weatherLabel} • {weatherData.source}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoApplyOnSelect}
                      onChange={(e) => setAutoApplyOnSelect(e.target.checked)}
                      className="rounded accent-emerald-600 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{t('autoApplyCheck') || 'Auto-apply on select'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleApplyToForm}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    {appliedRecently ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{t('appliedSuccess') || 'Applied to Form!'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('applyToForm') || 'Apply Values to Form'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3 Atmospheric Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                
                {/* Temperature */}
                <div className="p-3 rounded-xl bg-gradient-to-b from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-forest-950 border border-amber-200/80 dark:border-amber-900/40">
                  <div className="flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>{t('paramTemp') || 'Temperature (°C)'}</span>
                  </div>
                  <div className="text-2xl font-black text-amber-900 dark:text-amber-200">
                    {weatherData.temperature} <span className="text-sm font-bold">°C</span>
                  </div>
                  <p className="text-[10px] text-amber-700/70 dark:text-amber-400/60 mt-0.5">
                    Live 2m Ambient Temp
                  </p>
                </div>

                {/* Humidity */}
                <div className="p-3 rounded-xl bg-gradient-to-b from-blue-50 to-cyan-50/40 dark:from-blue-950/30 dark:to-forest-950 border border-blue-200/80 dark:border-blue-900/40">
                  <div className="flex items-center justify-center gap-1.5 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-1">
                    <Droplet className="w-3.5 h-3.5" />
                    <span>{t('paramHumidity') || 'Relative Humidity (%)'}</span>
                  </div>
                  <div className="text-2xl font-black text-blue-900 dark:text-blue-200">
                    {weatherData.humidity} <span className="text-sm font-bold">%</span>
                  </div>
                  <p className="text-[10px] text-blue-700/70 dark:text-blue-400/60 mt-0.5">
                    Live Atmospheric Relative Humidity
                  </p>
                </div>

                {/* Estimated Vegetative Rainfall */}
                <div className="p-3 rounded-xl bg-gradient-to-b from-teal-50 to-emerald-50/40 dark:from-teal-950/30 dark:to-forest-950 border border-teal-200/80 dark:border-teal-900/40">
                  <div className="flex items-center justify-center gap-1.5 text-teal-700 dark:text-teal-400 text-xs font-semibold mb-1">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>{t('paramRainfall') || 'Rainfall (mm)'}</span>
                  </div>
                  <div className="text-2xl font-black text-teal-900 dark:text-teal-200">
                    {weatherData.rainfall} <span className="text-sm font-bold">mm</span>
                  </div>
                  <p className="text-[10px] text-teal-700/70 dark:text-teal-400/60 mt-0.5">
                    Projected Vegetative Precipitation
                  </p>
                </div>

              </div>

              {/* Status Banner */}
              {appliedRecently && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Successfully applied {weatherData.temperature}°C, {weatherData.humidity}% humidity, and {weatherData.rainfall}mm rainfall to Recommendation Form!
                  </span>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
