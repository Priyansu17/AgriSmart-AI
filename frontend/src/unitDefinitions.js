/**
 * AgriSmart AI - Measurement Units Knowledge Base
 * Detailed descriptions, agricultural significance, and conversion formulas.
 */

export const UNIT_DEFINITIONS = {
  'kg/ha': {
    id: 'kg/ha',
    name: 'Kilograms per Hectare',
    nameHi: 'किलोग्राम प्रति हेक्टेयर',
    short: 'kg/ha',
    category: 'Soil Nutrient Concentration • पोषक तत्व सघनता',
    formula: '1 kg/ha = 0.4047 kg/acre ≈ 0.892 lbs/acre',
    conversionTip: 'To calculate dose for 1 Acre: Multiply kg/ha by 0.405 (e.g. 100 kg/ha = 40.5 kg/acre).',
    description: 'Measures the quantity of plant-available macronutrient (Nitrogen, Phosphorus, or Potassium) per hectare (10,000 m²) of arable topsoil (0-15 cm plow depth).',
    descriptionHi: 'यह खेत की 0-15 सेमी ऊपरी मिट्टी में प्रति हेक्टेयर (10,000 वर्ग मीटर) उपलब्ध पोषक तत्वों (N, P, K) की मात्रा दर्शाता है।',
    benchmarks: [
      { param: 'Nitrogen (N)', low: '< 280 kg/ha (कम)', medium: '280 - 560 kg/ha (मध्यम)', high: '> 560 kg/ha (अधिक)' },
      { param: 'Phosphorus (P)', low: '< 10 kg/ha (कम)', medium: '10 - 25 kg/ha (मध्यम)', high: '> 25 kg/ha (अधिक)' },
      { param: 'Potassium (K)', low: '< 108 kg/ha (कम)', medium: '108 - 280 kg/ha (मध्यम)', high: '> 280 kg/ha (अधिक)' }
    ],
    agronomicTip: 'Matches the exact standard format printed on Government Soil Health Cards (मृदा स्वास्थ्य कार्ड) across India.'
  },

  '°C': {
    id: '°C',
    name: 'Degrees Celsius',
    nameHi: 'डिग्री सेल्सियस (तापमान)',
    short: '°C',
    category: 'Atmospheric Micro-Climate • मौसमी तापमान',
    formula: '°F = (°C × 9/5) + 32  |  °C = (°F - 32) × 5/9',
    conversionTip: '20°C = 68°F (Cool) • 25°C = 77°F (Pleasant) • 32°C = 89.6°F (Warm) • 38°C = 100.4°F (Hot)',
    description: 'Average ambient daytime and nighttime air temperature expected during the prospective crop growth and pollination cycle.',
    descriptionHi: 'फसल की बुवाई से कटाई तक के मौसम का औसत वायुमंडलीय तापमान। यह पौधों में प्रकाश संश्लेषण एवं परागण को नियंत्रित करता है।',
    benchmarks: [
      { param: 'Cool Season (Rabi)', low: '10°C - 18°C', medium: '18°C - 24°C (Ideal for Wheat/Chickpea)', high: '> 28°C (Heat stress)' },
      { param: 'Warm Season (Kharif)', low: '< 20°C (Slow)', medium: '25°C - 33°C (Ideal for Rice/Cotton)', high: '> 40°C (Moisture stress)' }
    ],
    agronomicTip: 'Extreme temperature above 35°C during flowering causes flower drop and sterile pollen in pulses and cereals.'
  },

  '%': {
    id: '%',
    name: 'Relative Humidity',
    nameHi: 'सापेक्ष आर्द्रता / हवा में नमी (%)',
    short: '%',
    category: 'Atmospheric Moisture • वायुमंडलीय नमी',
    formula: 'RH (%) = (Actual Vapor Pressure / Saturation Vapor Pressure) × 100',
    conversionTip: '< 40% = Dry / Arid • 50-70% = Ideal Agronomic Range • > 85% = Very Humid (Fungal Risk)',
    description: 'The amount of water vapor in the atmosphere expressed as a percentage of the maximum amount water air could hold at that temperature.',
    descriptionHi: 'हवा में मौजूद नमी का प्रतिशत। अधिक नमी से फफूंद (Fungus) का खतरा बढ़ता है, जबकि कम नमी से पौधों में पानी की कमी होती है।',
    benchmarks: [
      { param: 'Low Humidity (< 50%)', low: 'Arid climate (Chickpea, Lentil, Mothbeans thrive)', medium: '', high: '' },
      { param: 'High Humidity (> 80%)', low: 'Tropical monsoon crops (Rice, Jute, Banana thrive)', medium: '', high: '' }
    ],
    agronomicTip: 'Relative humidity governs the transpiration rate of crop leaves through stomata and indicates disease risk.'
  },

  'pH scale': {
    id: 'pH scale',
    name: 'Soil pH (Potential of Hydrogen)',
    nameHi: 'मृदा पीएच (अम्लीयता / क्षारीयता पैमाना)',
    short: 'pH (1-14)',
    category: 'Soil Chemical Balance • मिट्टी का रासायनिक संतुलन',
    formula: 'Logarithmic scale: pH = -log₁₀[H⁺]',
    conversionTip: '< 6.0 = Acidic (अम्लीय) • 6.5 - 7.5 = Optimal Neutral (सर्वोत्तम) • > 7.5 = Alkaline / Saline (क्षारीय)',
    description: 'Measures soil acidity or alkalinity. A difference of 1 pH unit represents a 10-fold change in hydrogen ion concentration.',
    descriptionHi: 'मिट्टी की अम्लीयता या क्षारीयता का सूचकांक। 6.5 से 7.5 पीएच अधिकांश फसलों के लिए पोषक तत्व अवशोषण हेतु सर्वोत्तम माना जाता है।',
    benchmarks: [
      { param: 'Acidic (< 6.0)', low: 'Fix: Apply Agricultural Lime (चूना) CaCO₃ to raise pH', medium: '', high: '' },
      { param: 'Optimal (6.5 - 7.5)', low: 'Maximum bioavailability of N, P, K, Calcium and Magnesium', medium: '', high: '' },
      { param: 'Alkaline (> 7.5)', low: 'Fix: Apply Agricultural Gypsum (जिप्सम) CaSO₄·2H₂O to lower alkalinity', medium: '', high: '' }
    ],
    agronomicTip: 'In acidic soils (< 5.5), Phosphorus becomes tightly bound with iron and aluminum and is unavailable to crop roots.'
  },

  'mm': {
    id: 'mm',
    name: 'Millimeters of Precipitation',
    nameHi: 'वर्षा / वर्षण की मात्रा (मिलीमीटर)',
    short: 'mm',
    category: 'Precipitation Depth • कुल मौसमी वर्षा',
    formula: '1 mm rain = 1 Liter water / m² = 10,000 Liters / Hectare ≈ 4,047 Liters / Acre',
    conversionTip: '1 inch = 25.4 mm • 100 mm = 3.94 inches = 404,700 Liters of water per acre!',
    description: 'Cumulative precipitation depth received over the vegetative and maturation cycle of the crop.',
    descriptionHi: 'फसल की पूरी अवधि के दौरान होने वाली कुल बारिश। 1 मिमी वर्षा का अर्थ है प्रति वर्ग मीटर जमीन पर 1 लीटर पानी।',
    benchmarks: [
      { param: 'Low Rainfall (< 60 mm)', low: 'Arid/Drought-tolerant crops (Mothbeans, Chickpea, Watermelon)', medium: '', high: '' },
      { param: 'Moderate (60 - 150 mm)', low: 'Standard rainfed/irrigated crops (Maize, Cotton, Pulses)', medium: '', high: '' },
      { param: 'Heavy Rainfall (> 180 mm)', low: 'Water-intensive crops (Rice/Paddy, Jute, Coconut)', medium: '', high: '' }
    ],
    agronomicTip: 'Helps determine whether seasonal rainfall suffices or whether supplementary drip/flood irrigation is mandatory.'
  },

  'qtls': {
    id: 'qtls',
    name: 'Quintals',
    nameHi: 'क्विंटल (पैदावार माप)',
    short: 'qtls',
    category: 'Agricultural Yield • उपज एवं मंडी माप',
    formula: '1 Quintal = 100 kg = 0.1 Metric Tonne ≈ 2.68 Maunds (मन)',
    conversionTip: '10 Quintals = 1 Metric Tonne (1,000 kg). 1 quintal is standard Mandi trading unit in India.',
    description: 'Standard agricultural commodity weight measurement unit across agricultural markets (APMC Mandis) in India.',
    descriptionHi: 'भारतीय मंडियों और न्यूनतम समर्थन मूल्य (MSP) में फसल की पैदावार और खरीद-बिक्री की मानक इकाई (1 क्विंटल = 100 किग्रा)।',
    benchmarks: [],
    agronomicTip: 'Government MSP (Minimum Support Price) rates are officially declared in Rupees per Quintal (₹/qtl).'
  },

  'Acres': {
    id: 'Acres',
    name: 'Acre',
    nameHi: 'एकड़ (भूमि माप)',
    short: 'Acre',
    category: 'Land Area • खेत का क्षेत्रफल',
    formula: '1 Acre = 4,046.86 m² = 0.4047 Hectare = 43,560 sq ft ≈ 1.6 Bigha (Standard)',
    conversionTip: '1 Hectare = 2.471 Acres. 1 Acre is roughly 208.7 ft × 208.7 ft of arable land.',
    description: 'Standard agricultural land area unit used by farmers across India for crop budget planning, sowing rate, and harvest forecasting.',
    descriptionHi: 'कृषि भूमि मापने की सबसे प्रचलित इकाई। 1 एकड़ में 43,560 वर्ग फीट होते हैं और लगभग 2.47 एकड़ मिलकर 1 हेक्टेयर बनाते हैं।',
    benchmarks: [],
    agronomicTip: 'Used in the Economic Studio to calculate proportional seeds, fertilizers, and irrigation expenditure.'
  }
};
