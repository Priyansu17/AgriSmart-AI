/**
 * AgriSmart AI - Centralized API Service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Sends 7 agricultural parameters to the prediction API
 */
export async function predictCrop(features) {
  const url = `${API_BASE_URL}/api/predict`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(features),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate crop recommendation');
  }
  return data;
}

/**
 * Checks backend health and loads model metadata
 */
export async function fetchHealth() {
  const url = `${API_BASE_URL}/api/health`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Backend service is not responding');
  }
  return await response.json();
}

/**
 * Fetches dataset statistics and model benchmarks
 */
export async function fetchAnalytics() {
  const url = `${API_BASE_URL}/api/analytics`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load analytics data');
  }
  return await response.json();
}

/**
 * Fetches sample crop parameter presets for 1-click testing
 */
export async function fetchSampleCrops() {
  const url = `${API_BASE_URL}/api/sample-crops`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load sample crops');
  }
  return await response.json();
}

/**
 * Fetches recent prediction history
 */
export async function fetchHistory() {
  const url = `${API_BASE_URL}/api/history`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load prediction history');
  }
  return await response.json();
}

/**
 * Clears prediction history
 */
export async function clearHistory() {
  const url = `${API_BASE_URL}/api/history`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to clear history');
  }
  return await response.json();
}

/**
 * Sends a message to the intelligent agricultural backend chatbot
 */
export async function sendChatMessage(message, language = 'en', history = []) {
  const url = `${API_BASE_URL}/api/chat`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ message, language, history }),
  });

  if (!response.ok) {
    throw new Error('Chatbot service is temporarily unavailable');
  }
  return await response.json();
}
