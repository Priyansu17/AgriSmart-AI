/**
 * Botanical crop icons, taxonomies, and visual color themes for all 22 dataset crops.
 */
export const CROP_ICONS_METADATA = {
  rice: { emoji: '🌾', label: 'Rice', category: 'Cereal Grain / Staple', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  maize: { emoji: '🌽', label: 'Maize', category: 'Cereal Grain / Coarse', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  chickpea: { emoji: '🧆', label: 'Chickpea', category: 'Legume / Pulse', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  kidneybeans: { emoji: '🫘', label: 'Kidney Beans', category: 'Legume / Pulse', color: 'bg-red-50 text-red-800 border-red-200' },
  pigeonpeas: { emoji: '🥣', label: 'Pigeonpeas', category: 'Legume / Pulse', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  mothbeans: { emoji: '🍲', label: 'Mothbeans', category: 'Legume / Pulse', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  mungbean: { emoji: '🥗', label: 'Mungbean', category: 'Legume / Pulse', color: 'bg-green-50 text-green-800 border-green-200' },
  blackgram: { emoji: '🫘', label: 'Blackgram', category: 'Legume / Pulse', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  lentil: { emoji: '🥘', label: 'Lentil', category: 'Legume / Pulse', color: 'bg-orange-50 text-orange-900 border-orange-200' },
  pomegranate: { emoji: '🍎', label: 'Pomegranate', category: 'Horticulture Fruit', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  banana: { emoji: '🍌', label: 'Banana', category: 'Tropical Fruit', color: 'bg-yellow-50 text-yellow-800 border-yellow-300' },
  mango: { emoji: '🥭', label: 'Mango', category: 'Tropical Fruit', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  grapes: { emoji: '🍇', label: 'Grapes', category: 'Horticulture Fruit', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  watermelon: { emoji: '🍉', label: 'Watermelon', category: 'Cucurbit Fruit', color: 'bg-red-50 text-red-700 border-red-200' },
  muskmelon: { emoji: '🍈', label: 'Muskmelon', category: 'Cucurbit Fruit', color: 'bg-lime-50 text-lime-800 border-lime-200' },
  apple: { emoji: '🍏', label: 'Apple', category: 'Temperate Fruit', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
  orange: { emoji: '🍊', label: 'Orange', category: 'Citrus Fruit', color: 'bg-orange-50 text-orange-700 border-orange-300' },
  papaya: { emoji: '🍈', label: 'Papaya', category: 'Tropical Fruit', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  coconut: { emoji: '🥥', label: 'Coconut', category: 'Plantation Crop', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  cotton: { emoji: '🪴', label: 'Cotton', category: 'Commercial Fiber', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  jute: { emoji: '🌿', label: 'Jute', category: 'Bast Fiber Crop', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  coffee: { emoji: '☕', label: 'Coffee', category: 'Plantation Beverage', color: 'bg-amber-900/10 text-amber-950 border-amber-800/20' }
};

/**
 * Resilient lookup helper that handles scientific names, casing, and spaces.
 * E.g., "Rice (Oryza Sativa)" -> returns rice metadata.
 */
export function getCropIconMeta(cropName) {
  if (!cropName) {
    return {
      emoji: '🌱',
      label: 'Agricultural Crop',
      category: 'Agricultural Crop',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    };
  }

  const raw = String(cropName).trim().toLowerCase();
  const clean = raw.replace(/[^a-z]/g, '');

  // 1. Direct key match
  if (CROP_ICONS_METADATA[clean]) {
    return CROP_ICONS_METADATA[clean];
  }

  // 2. Space-insensitive match for multi-word crops (e.g. "kidney beans" -> "kidneybeans")
  const noSpace = raw.split('(')[0].replace(/[^a-z]/g, '');
  if (CROP_ICONS_METADATA[noSpace]) {
    return CROP_ICONS_METADATA[noSpace];
  }

  // 3. Substring matching
  for (const key of Object.keys(CROP_ICONS_METADATA)) {
    if (clean.includes(key) || key.includes(noSpace) || noSpace.includes(key)) {
      return CROP_ICONS_METADATA[key];
    }
  }

  return {
    emoji: '🌱',
    label: cropName.charAt(0).toUpperCase() + cropName.slice(1),
    category: 'Agricultural Crop',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  };
}
