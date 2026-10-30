/**
 * AgriSmart AI - Crop Economic & Profit Margin Benchmark Data
 * Comprehensive financial projections per acre across all 22 crops.
 * Based on Indian Agricultural Research Institute (IARI) & NABARD farm cost guidelines.
 */

export const CROP_ECONOMICS = {
  rice: {
    name: 'Rice (Paddy)',
    marketPricePerQtl: 2350, // ₹ per quintal (MSP reference)
    avgYieldPerAcreQtl: 24, // quintals per acre
    costPerAcre: 26000, // ₹ total input & labor cost
    costBreakdown: { seeds: 12, fertilizers: 32, irrigation: 20, labor: 36 },
    profitCategory: 'Steady Cash Flow • High MSP Support',
    marginRating: 'Moderate Margin (54%)',
    gestationDays: '120-140 days',
    riskLevel: 'Low (Insured & Guaranteed Procurement)'
  },
  maize: {
    name: 'Maize / Corn',
    marketPricePerQtl: 2225,
    avgYieldPerAcreQtl: 28,
    costPerAcre: 24500,
    costBreakdown: { seeds: 18, fertilizers: 34, irrigation: 16, labor: 32 },
    profitCategory: 'High Industrial & Feed Demand',
    marginRating: 'Strong Return (61%)',
    gestationDays: '90-110 days',
    riskLevel: 'Low-to-Medium'
  },
  chickpea: {
    name: 'Chickpea / Bengal Gram',
    marketPricePerQtl: 5650,
    avgYieldPerAcreQtl: 9.5,
    costPerAcre: 18000,
    costBreakdown: { seeds: 20, fertilizers: 22, irrigation: 14, labor: 44 },
    profitCategory: 'Low Input Pulse • Nitrogen Enriching',
    marginRating: 'High Margin (66%)',
    gestationDays: '95-115 days',
    riskLevel: 'Low (Low Water Requirement)'
  },
  kidneybeans: {
    name: 'Kidney Beans / Rajma',
    marketPricePerQtl: 9200,
    avgYieldPerAcreQtl: 6.5,
    costPerAcre: 21000,
    costBreakdown: { seeds: 26, fertilizers: 24, irrigation: 18, labor: 32 },
    profitCategory: 'Premium Cash Pulse • High Urban Demand',
    marginRating: 'Very High Margin (65%)',
    gestationDays: '100-120 days',
    riskLevel: 'Medium'
  },
  pigeonpeas: {
    name: 'Pigeon Pea / Arhar',
    marketPricePerQtl: 7550,
    avgYieldPerAcreQtl: 8.5,
    costPerAcre: 19500,
    costBreakdown: { seeds: 14, fertilizers: 25, irrigation: 15, labor: 46 },
    profitCategory: 'Essential Protein Pulse • Intercropping Friendly',
    marginRating: 'High Margin (69%)',
    gestationDays: '160-200 days',
    riskLevel: 'Low-to-Medium'
  },
  mothbeans: {
    name: 'Moth Bean',
    marketPricePerQtl: 6800,
    avgYieldPerAcreQtl: 5.5,
    costPerAcre: 12500,
    costBreakdown: { seeds: 16, fertilizers: 18, irrigation: 10, labor: 56 },
    profitCategory: 'Extreme Arid Hardiness • Minimal Irrigation',
    marginRating: 'High Margin (67%)',
    gestationDays: '75-90 days',
    riskLevel: 'Very Low (Thrives in Drought)'
  },
  mungbean: {
    name: 'Mung Bean / Green Gram',
    marketPricePerQtl: 8600,
    avgYieldPerAcreQtl: 6.0,
    costPerAcre: 15500,
    costBreakdown: { seeds: 18, fertilizers: 22, irrigation: 16, labor: 44 },
    profitCategory: 'Quick Turnaround Catch Crop • 60-70 Days',
    marginRating: 'High Margin (70%)',
    gestationDays: '60-75 days',
    riskLevel: 'Low'
  },
  blackgram: {
    name: 'Black Gram / Urad',
    marketPricePerQtl: 7400,
    avgYieldPerAcreQtl: 6.8,
    costPerAcre: 16500,
    costBreakdown: { seeds: 18, fertilizers: 24, irrigation: 16, labor: 42 },
    profitCategory: 'Staple Culinary Legume • Soil Restorer',
    marginRating: 'High Margin (67%)',
    gestationDays: '75-90 days',
    riskLevel: 'Low'
  },
  lentil: {
    name: 'Lentil / Masoor',
    marketPricePerQtl: 6700,
    avgYieldPerAcreQtl: 7.5,
    costPerAcre: 16000,
    costBreakdown: { seeds: 20, fertilizers: 24, irrigation: 14, labor: 42 },
    profitCategory: 'Rabi Residual Moisture Pulse',
    marginRating: 'High Margin (68%)',
    gestationDays: '110-130 days',
    riskLevel: 'Low'
  },
  pomegranate: {
    name: 'Pomegranate',
    marketPricePerQtl: 9500,
    avgYieldPerAcreQtl: 48,
    costPerAcre: 85000,
    costBreakdown: { seeds: 15, fertilizers: 30, irrigation: 25, labor: 30 },
    profitCategory: 'Export Grade Superfood • Multi-Year Bearing',
    marginRating: 'Exceptional (81%)',
    gestationDays: 'Perennial (Year 3+)',
    riskLevel: 'Medium (Bacterial blight management)'
  },
  banana: {
    name: 'Banana (Tissue Culture)',
    marketPricePerQtl: 1850,
    avgYieldPerAcreQtl: 180,
    costPerAcre: 92000,
    costBreakdown: { seeds: 22, fertilizers: 35, irrigation: 23, labor: 20 },
    profitCategory: 'Massive Biomass & High Volume Turnover',
    marginRating: 'High Margin (72%)',
    gestationDays: '11-13 months',
    riskLevel: 'Medium (Wind & Nematode management)'
  },
  mango: {
    name: 'Mango Orchard',
    marketPricePerQtl: 5200,
    avgYieldPerAcreQtl: 38,
    costPerAcre: 48000,
    costBreakdown: { seeds: 10, fertilizers: 32, irrigation: 20, labor: 38 },
    profitCategory: 'King of Fruits • High Domestic & Export Value',
    marginRating: 'Exceptional (76%)',
    gestationDays: 'Perennial Orchard',
    riskLevel: 'Low (Established trees)'
  },
  grapes: {
    name: 'Grapes (Table / Wine)',
    marketPricePerQtl: 6400,
    avgYieldPerAcreQtl: 65,
    costPerAcre: 110000,
    costBreakdown: { seeds: 10, fertilizers: 36, irrigation: 22, labor: 32 },
    profitCategory: 'High Capital Commercial Horticulture',
    marginRating: 'Exceptional (74%)',
    gestationDays: 'Perennial Vineyard',
    riskLevel: 'Medium-High (Precision Trellis & Spraying)'
  },
  watermelon: {
    name: 'Watermelon (Commercial Hybrid)',
    marketPricePerQtl: 1250,
    avgYieldPerAcreQtl: 160,
    costPerAcre: 45000,
    costBreakdown: { seeds: 22, fertilizers: 30, irrigation: 20, labor: 28 },
    profitCategory: 'Rapid Summer Cash Crop • 85-95 Days',
    marginRating: 'Exceptional (77%)',
    gestationDays: '85-95 days',
    riskLevel: 'Medium (Mulching & Fruit fly control)'
  },
  muskmelon: {
    name: 'Muskmelon / Cantaloupe',
    marketPricePerQtl: 1650,
    avgYieldPerAcreQtl: 110,
    costPerAcre: 42000,
    costBreakdown: { seeds: 24, fertilizers: 28, irrigation: 20, labor: 28 },
    profitCategory: 'Sweet Summer Horticultural Delicacy',
    marginRating: 'High Margin (77%)',
    gestationDays: '75-90 days',
    riskLevel: 'Medium'
  },
  apple: {
    name: 'Apple (High Density Orchard)',
    marketPricePerQtl: 8800,
    avgYieldPerAcreQtl: 50,
    costPerAcre: 95000,
    costBreakdown: { seeds: 15, fertilizers: 30, irrigation: 20, labor: 35 },
    profitCategory: 'Temperate High-Value Perennial Asset',
    marginRating: 'Exceptional (78%)',
    gestationDays: 'Perennial Orchard',
    riskLevel: 'Medium (Frost & Hail protection)'
  },
  orange: {
    name: 'Orange / Citrus (Nagpur Mandarin)',
    marketPricePerQtl: 4200,
    avgYieldPerAcreQtl: 55,
    costPerAcre: 55000,
    costBreakdown: { seeds: 10, fertilizers: 35, irrigation: 25, labor: 30 },
    profitCategory: 'Evergreen Citrus • Stable Processing Demand',
    marginRating: 'High Margin (76%)',
    gestationDays: 'Perennial Citrus Grove',
    riskLevel: 'Low-to-Medium'
  },
  papaya: {
    name: 'Papaya (Red Lady 786 Hybrid)',
    marketPricePerQtl: 1900,
    avgYieldPerAcreQtl: 140,
    costPerAcre: 52000,
    costBreakdown: { seeds: 25, fertilizers: 32, irrigation: 20, labor: 23 },
    profitCategory: 'Fast Bearing Fruit Tree • Yields in 8 Months',
    marginRating: 'Exceptional (80%)',
    gestationDays: '8-10 months',
    riskLevel: 'Medium (Virus & Frost sensitive)'
  },
  coconut: {
    name: 'Coconut Plantation',
    marketPricePerQtl: 3800,
    avgYieldPerAcreQtl: 45,
    costPerAcre: 38000,
    costBreakdown: { seeds: 8, fertilizers: 34, irrigation: 24, labor: 34 },
    profitCategory: 'Lifelong Low-Maintenance Perennial Revenue',
    marginRating: 'High Margin (78%)',
    gestationDays: 'Continuous harvest (Year 5+)',
    riskLevel: 'Very Low (Wind hardy once grown)'
  },
  cotton: {
    name: 'Cotton (Bt Hybrid)',
    marketPricePerQtl: 7200,
    avgYieldPerAcreQtl: 11.5,
    costPerAcre: 29000,
    costBreakdown: { seeds: 20, fertilizers: 32, irrigation: 18, labor: 30 },
    profitCategory: 'Major Commercial Industrial Fiber (White Gold)',
    marginRating: 'Strong Return (65%)',
    gestationDays: '150-180 days',
    riskLevel: 'Medium (Bollworm & Whitefly monitoring)'
  },
  jute: {
    name: 'Jute (Golden Fiber)',
    marketPricePerQtl: 5300,
    avgYieldPerAcreQtl: 14.5,
    costPerAcre: 22000,
    costBreakdown: { seeds: 12, fertilizers: 28, irrigation: 18, labor: 42 },
    profitCategory: 'Eco-Friendly Bast Fiber • High Biodegradable Demand',
    marginRating: 'Strong Return (71%)',
    gestationDays: '120-140 days',
    riskLevel: 'Low'
  },
  coffee: {
    name: 'Coffee (Arabica / Robusta)',
    marketPricePerQtl: 28000,
    avgYieldPerAcreQtl: 4.8,
    costPerAcre: 48000,
    costBreakdown: { seeds: 10, fertilizers: 30, irrigation: 20, labor: 40 },
    profitCategory: 'Premium Export Commodity • Agroforestry Blend',
    marginRating: 'Exceptional (64%)',
    gestationDays: 'Perennial Shade Grown',
    riskLevel: 'Medium'
  }
};

/**
 * Resilient lookup helper for crop economics
 */
export function getCropEconomics(cropName) {
  if (!cropName) return CROP_ECONOMICS.rice;

  const raw = String(cropName).trim().toLowerCase();
  const clean = raw.replace(/[^a-z]/g, '');

  if (CROP_ECONOMICS[clean]) return CROP_ECONOMICS[clean];

  const noSpace = raw.split('(')[0].replace(/[^a-z]/g, '');
  if (CROP_ECONOMICS[noSpace]) return CROP_ECONOMICS[noSpace];

  for (const key of Object.keys(CROP_ECONOMICS)) {
    if (clean.includes(key) || key.includes(noSpace) || noSpace.includes(key)) {
      return CROP_ECONOMICS[key];
    }
  }

  return CROP_ECONOMICS.rice;
}

/**
 * Calculate dynamic financials based on acreage
 */
export function calculateCropFinancials(cropName, acres = 1) {
  const eco = getCropEconomics(cropName);
  const totalYieldQtl = Math.round(eco.avgYieldPerAcreQtl * acres * 10) / 10;
  const grossRevenue = Math.round(totalYieldQtl * eco.marketPricePerQtl);
  const totalCost = Math.round(eco.costPerAcre * acres);
  const netProfit = Math.max(0, grossRevenue - totalCost);
  const profitMarginPercent = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
  const roiPercent = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

  return {
    ...eco,
    acres,
    totalYieldQtl,
    grossRevenue,
    totalCost,
    netProfit,
    profitMarginPercent,
    roiPercent,
    costBreakdownAmounts: {
      seeds: Math.round((totalCost * eco.costBreakdown.seeds) / 100),
      fertilizers: Math.round((totalCost * eco.costBreakdown.fertilizers) / 100),
      irrigation: Math.round((totalCost * eco.costBreakdown.irrigation) / 100),
      labor: Math.round((totalCost * eco.costBreakdown.labor) / 100),
    }
  };
}
