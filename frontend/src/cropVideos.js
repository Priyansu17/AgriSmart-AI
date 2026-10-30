import cropVideosData from './cropVideos.json';

/**
 * Returns verified cultivation and pest management video metadata for any crop name.
 */
export function getCropVideos(cropName) {
  if (!cropName) {
    return cropVideosData.rice;
  }

  const raw = String(cropName).trim().toLowerCase();
  const clean = raw.replace(/[^a-z]/g, '');

  // 1. Direct key match
  if (cropVideosData[clean]) {
    return cropVideosData[clean];
  }

  // 2. Space/punctuation stripped match (e.g., "kidney beans" -> "kidneybeans")
  const noSpace = raw.split('(')[0].replace(/[^a-z]/g, '');
  if (cropVideosData[noSpace]) {
    return cropVideosData[noSpace];
  }

  // 3. Substring match
  for (const key of Object.keys(cropVideosData)) {
    if (clean.includes(key) || key.includes(noSpace) || noSpace.includes(key)) {
      return cropVideosData[key];
    }
  }

  // Fallback to rice if unknown
  return cropVideosData.rice;
}
