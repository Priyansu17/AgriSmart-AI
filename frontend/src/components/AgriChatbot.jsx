import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RotateCcw, 
  ChevronDown,
  ChevronUp,
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Radio, 
  Scale, 
  Droplet, 
  Layers, 
  Sprout, 
  CheckCircle2, 
  Headphones,
  Copy,
  Check,
  ArrowUpRight,
  ShieldAlert,
  Bug,
  Compass,
  MapPin,
  TrendingUp,
  Sliders,
  DollarSign,
  Info,
  Key,
  ShieldCheck,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../AppContext';
import { sendChatMessage } from '../api';

// Curated crop parameter presets for instant 1-click loading from chat
const SAMPLE_CROP_VALUES = {
  rice: { N: 90, P: 42, K: 43, temperature: 20.87, humidity: 82.0, ph: 6.5, rainfall: 202.93 },
  maize: { N: 71, P: 54, K: 20, temperature: 22.38, humidity: 65.0, ph: 6.9, rainfall: 84.76 },
  chickpea: { N: 40, P: 67, K: 79, temperature: 18.87, humidity: 16.81, ph: 7.33, rainfall: 80.05 },
  kidneybeans: { N: 20, P: 67, K: 20, temperature: 20.11, humidity: 21.6, ph: 5.74, rainfall: 105.93 },
  pigeonpeas: { N: 20, P: 67, K: 20, temperature: 27.74, humidity: 48.49, ph: 5.73, rainfall: 149.46 },
  mothbeans: { N: 21, P: 48, K: 20, temperature: 28.19, humidity: 53.15, ph: 6.83, rainfall: 51.19 },
  mungbean: { N: 20, P: 47, K: 20, temperature: 28.52, humidity: 85.88, ph: 6.77, rainfall: 48.40 },
  blackgram: { N: 40, P: 67, K: 19, temperature: 29.94, humidity: 65.27, ph: 7.18, rainfall: 67.88 },
  lentil: { N: 18, P: 68, K: 19, temperature: 24.50, humidity: 64.80, ph: 6.92, rainfall: 45.68 },
  pomegranate: { N: 18, P: 18, K: 40, temperature: 21.82, humidity: 90.0, ph: 6.64, rainfall: 107.55 },
  banana: { N: 100, P: 75, K: 50, temperature: 27.37, humidity: 80.35, ph: 5.96, rainfall: 104.62 },
  mango: { N: 20, P: 27, K: 30, temperature: 31.20, humidity: 50.15, ph: 5.76, rainfall: 94.60 },
  grapes: { N: 23, P: 132, K: 200, temperature: 23.84, humidity: 81.87, ph: 6.02, rainfall: 69.61 },
  watermelon: { N: 99, P: 17, K: 50, temperature: 25.59, humidity: 85.0, ph: 6.49, rainfall: 50.78 },
  muskmelon: { N: 100, P: 17, K: 50, temperature: 28.61, humidity: 92.32, ph: 6.35, rainfall: 24.68 },
  apple: { N: 20, P: 134, K: 199, temperature: 22.63, humidity: 92.33, ph: 5.92, rainfall: 112.65 },
  orange: { N: 19, P: 16, K: 10, temperature: 33.76, humidity: 92.12, ph: 7.00, rainfall: 110.47 },
  papaya: { N: 50, P: 59, K: 50, temperature: 33.72, humidity: 92.21, ph: 6.74, rainfall: 142.62 },
  coconut: { N: 21, P: 15, K: 30, temperature: 27.40, humidity: 94.84, ph: 6.22, rainfall: 175.68 },
  cotton: { N: 120, P: 46, K: 20, temperature: 23.98, humidity: 79.82, ph: 6.91, rainfall: 80.39 },
  jute: { N: 78, P: 46, K: 40, temperature: 24.97, humidity: 79.63, ph: 6.73, rainfall: 174.77 },
  coffee: { N: 101, P: 28, K: 30, temperature: 25.54, humidity: 58.86, ph: 6.79, rainfall: 158.06 }
};

// Categorized question chips
const CHIP_CATEGORIES = [
  { id: 'top', label: '⭐ Top Questions' },
  { id: 'crops', label: '🌾 Crops & Seasons' },
  { id: 'pests', label: '🐛 Pest & Disease' },
  { id: 'fertilizer', label: '🧪 Fertilizers & Dosing' },
  { id: 'states', label: '📍 States & Soils' }
];

const CATEGORIZED_QUESTIONS = {
  top: [
    { label: '🌾 Best crop for my soil?', query: 'How does AgriSmart recommend the best crop for my soil?' },
    { label: '🧪 Calculate Urea & DAP bags', query: 'How do I calculate commercial bags of Urea and DAP per acre from soil test?' },
    { label: '📏 Convert kg/ha to acre', query: 'What does kg/ha mean and how do I convert it to kg per acre?' },
    { label: '🐛 Pink Bollworm in Cotton', query: 'How to control pink bollworm in cotton?' }
  ],
  crops: [
    { label: '🌾 Compare Rice vs Maize', query: 'Compare rice and maize cultivation duration, water, and economics' },
    { label: '🌧️ Low rainfall crops', query: 'Which crops grow well in low rainfall and arid conditions?' },
    { label: '🍇 High-profit fruit crops', query: 'What are the most profitable fruit crops like Grapes, Banana, and Papaya?' },
    { label: '🌱 Kharif vs Rabi season', query: 'What is the difference between Kharif, Rabi, and Zaid seasons?' }
  ],
  pests: [
    { label: '🍄 Rice Blast disease remedy', query: 'Rice blast symptoms and chemical remedy' },
    { label: '🌽 Fall Armyworm in Maize', query: 'How to control fall armyworm in maize?' },
    { label: '🌾 Yellow Rust in Wheat', query: 'Yellow rust in wheat symptoms and fungicide control' },
    { label: '🌿 Natural Jeevamrut recipe', query: 'How to prepare natural Jeevamrut for organic farming?' }
  ],
  fertilizer: [
    { label: '🧪 Ideal pH for Rice & Cotton', query: 'What is the ideal soil pH and NPK for rice and cotton?' },
    { label: '🪨 Acidic soil lime dosing', query: 'How to correct acidic soil pH using agricultural lime?' },
    { label: '🧂 Alkaline soil gypsum dose', query: 'How to treat alkaline soil using gypsum?' },
    { label: '💰 How profit is calculated', query: 'How does the Economic Studio calculate profit margin and yield?' }
  ],
  states: [
    { label: '🚜 Maharashtra Black Soil', query: 'What are the best crops for black soil in Maharashtra?' },
    { label: '🌾 Punjab & Haryana farming', query: 'What are the major crops and soil conditions in Punjab and Haryana?' },
    { label: '🌱 Uttar Pradesh Gangetic crops', query: 'Best crops and cropping calendar for Uttar Pradesh' },
    { label: '🏜️ Low water crops for Rajasthan', query: 'What crops grow best in arid sandy soil in Rajasthan?' }
  ]
};

// ─── Voice Priority Lists ─────────────────────────────────────────────────────
// Prefer neural/high-quality voices first; the first match from available voices wins.
const PREFERRED_EN_VOICES = [
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Zira - English (United States)',
  'Microsoft David - English (United States)',
  'Karen',      // macOS
  'Samantha',   // macOS
];
const PREFERRED_HI_VOICES = [
  'Google हिन्दी',
  'Microsoft Swara Online (Natural) - Hindi (India)',
  'Microsoft Hemant - Hindi (India)',
  'Lekha',      // macOS
];

// Pick the best available voice from a priority list, then fall back by lang prefix
function pickBestVoice(voices, preferredNames, langPrefix) {
  for (const name of preferredNames) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // Fallback: any voice starting with the lang prefix
  return voices.find(v => v.lang.startsWith(langPrefix)) || null;
}

// ─── Smart text cleaner for speech ────────────────────────────────────────────
// Converts markdown/emoji/technical annotations into natural spoken language.
function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    // Markdown bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Headers
    .replace(/#{1,6}\s*/g, '')
    // Code blocks & inline code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.*?)`/g, '$1')
    // Math
    .replace(/\$\$(.*?)\$\$/g, '$1')
    .replace(/\$(.*?)\$/g, '$1')
    .replace(/\\text\{(.*?)\}/g, '$1')
    .replace(/\\mu/g, 'mu')
    .replace(/\\sigma/g, 'sigma')
    .replace(/\\times/g, 'times')
    // Emoji — replace common ones with spoken words, drop the rest
    .replace(/🌾/g, '').replace(/🧪/g, '').replace(/💡/g, 'Tip: ')
    .replace(/⚠️/g, 'Warning: ').replace(/🎯/g, '').replace(/🐛/g, '')
    .replace(/🍄/g, '').replace(/📍/g, '').replace(/🚜/g, '')
    .replace(/[^\p{L}\p{N}\s.,!?;:()\-']/gu, '')
    // Bullet markers → natural pause
    .replace(/•\s*/g, '. ')
    .replace(/^\s*[-*]\s+/gm, '. ')
    // Numbered list markers — keep the number but soften the dot
    .replace(/^(\d+)\.\s+/gm, '$1. ')
    // Collapse multiple spaces / dots
    .replace(/\.{2,}/g, '.')
    .replace(/\s{2,}/g, ' ')
    // Newlines → sentence pause
    .replace(/\n+/g, '. ')
    .trim();
}

// ─── Split long text into natural sentence chunks ─────────────────────────────
// Keeps each utterance short so the browser TTS engine doesn't chop it abruptly.
function splitIntoSentences(text) {
  // Split on sentence-ending punctuation followed by a space or end-of-string
  const raw = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';
  for (const sentence of raw) {
    if ((current + ' ' + sentence).length > 160) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// Rich Markdown Formatter: renders headers, bolding, bullet points, numbers, and tip callouts
function renderFormattedMarkdown(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // Headers: ### or ## or #
    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      const cleanHeading = line.replace(/^#{1,3}\s+/, '');
      elements.push(
        <h5 key={`h-${i}`} className="font-extrabold text-sm sm:text-[14px] text-forest-950 dark:text-emerald-300 mt-2 mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>{renderInlineStyles(cleanHeading)}</span>
        </h5>
      );
      continue;
    }

    // Callout box: lines starting with 💡, ⚠️, 🎯, 🌿, 🐛, 🍄
    const calloutMatch = line.match(/^([💡⚠️🎯🌿🐛🍄])\s*(.*)/);
    if (calloutMatch) {
      elements.push(
        <div key={`callout-${i}`} className="my-2 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-forest-950/70 border border-emerald-200/80 dark:border-forest-800 text-xs text-forest-950 dark:text-emerald-200 flex items-start gap-2 shadow-2xs">
          <span className="text-base flex-shrink-0 mt-0.2">{calloutMatch[1]}</span>
          <div className="leading-relaxed">{renderInlineStyles(calloutMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Bullet points: lines starting with •, *, or -
    if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
      const cleanBullet = line.replace(/^[•*-]\s+/, '');
      elements.push(
        <div key={`b-${i}`} className="flex items-start gap-2 my-1 pl-1 text-xs sm:text-[13px] leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
          <div className="flex-1">{renderInlineStyles(cleanBullet)}</div>
        </div>
      );
      continue;
    }

    // Numbered lists: lines starting with 1. 2. 3.
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-1 pl-0.5 text-xs sm:text-[13px] leading-relaxed">
          <span className="w-4 h-4 rounded-md bg-emerald-100 dark:bg-forest-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1">{renderInlineStyles(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-[13px] leading-relaxed text-forest-950 dark:text-slate-100 my-1">
        {renderInlineStyles(line)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// Parses inline bold **text**, code `text`, and italic *text*
function renderInlineStyles(text) {
  if (!text) return text;

  // Split by bold **...** and inline code `...`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-forest-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-100/70 dark:bg-forest-800 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-forest-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Check italics
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-slate-500 dark:text-slate-400">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

// Embedded Local Fallback Engine
function generateAgriBotFallback(userInput, language = 'en') {
  const query = userInput.toLowerCase().trim();

  // 0. Cultural & Regional Greetings
  const salamGreetings = ['salam', 'salaam', 'salamwalekum', 'salaamwalekum', 'assalam', 'walekum', 'walaikum', 'adab'];
  if (salamGreetings.some(k => query.includes(k))) {
    return {
      text: `**Walekum Assalam kisan bhai! AgriSmart AI mein aapka dil se swagat hai.** 🌾\n\nMain aapka digital kheti advisor hoon. Aap mujhse bolkar ya likhkar apni kheti ke baare mein pooch sakte hain:\n• **Mitti ke anusaar Fasal:** N, P, K aur mausam ke anukool sabse laabhkari fasal\n• **Keeda & Rog:** Fasalon ke keedon aur bimariyon ka ilaj\n• **Khad Ganana:** Ek acre mein Urea, DAP kitne lagenge\n\nBataiye, aaj main aapki kya sahayata kar sakta hoon?`,
      tags: ['Walekum Assalam', 'AgriBot'],
      actions: [
        { type: 'trigger_weather_detect', label: '📍 Detect Local Weather', payload: true },
        { type: 'load_crop_sample', label: '🌾 Fill Rice Sample', crop: 'rice' },
        { type: 'navigate_tab', label: '🌾 Open Recommendation Form', payload: 'recommend' }
      ]
    };
  }

  const sikhGreetings = ['sat sri akaal', 'sat sri akal', 'sasrikal', 'waheguru'];
  if (sikhGreetings.some(k => query.includes(k))) {
    return {
      text: `**Sat Sri Akal kisan veere! AgriSmart AI vich tuhada swagat hai.** 🌾\n\nMain tuhada digital kheti advisor haan. Tussi bol ke ya likh ke fasal, khad (Urea, DAP), te bimariyan baare puch sakde ho.\n\nDasso, ajj tuhade khet layi ki madad karaan?`,
      tags: ['Sat Sri Akal', 'AgriBot'],
      actions: [
        { type: 'trigger_weather_detect', label: '📍 Check Live Weather', payload: true },
        { type: 'navigate_tab', label: '🌾 Open Recommendation Form', payload: 'recommend' }
      ]
    };
  }

  const generalGreetings = ['hello', 'hi', 'namaste', 'hey', 'namaskar', 'pranam', 'ram ram', 'vanakkam', 'kem cho', 'radhe radhe', 'good morning', 'good afternoon'];
  if (generalGreetings.some(k => query.includes(k))) {
    return {
      text: `**Namaste! AgriSmart AI mein aapka swagat hai.** 🌾\n\nMain aapka AI agricultural guide hoon. Aap mujhse bolkar (mic se) ya likhkar kheti ke sawal pooch sakte hain.\n\nBataiye, aaj aapko kis fasal ya mitti ki jaankari chahiye?`,
      tags: ['Namaste', 'AgriBot'],
      actions: [
        { type: 'trigger_weather_detect', label: '📍 Detect Live Weather', payload: true },
        { type: 'load_crop_sample', label: '🌾 Fill Rice Sample', crop: 'rice' }
      ]
    };
  }

  // 1. Kaise ho / Well-being
  const wellbeing = ['kaise ho', 'kaise hain', 'kya haal', 'kya haal chal', 'how are you', 'sab theek', 'kemon acho', 'kasa kay', 'sab kushal', 'haal chaal', 'kaisa chal raha hai'];
  if (wellbeing.some(k => query.includes(k))) {
    return {
      text: `**Namaste! Main bilkul badhiya hoon! (मैं बिल्कुल बढ़िया हूँ) 🌾**\n\nAapki kheti, mitti ki jaanch (soil test) aur fasal ki behtareen paidawar ke liye hamesha hazir hoon.\n\nAap batayein, aaj aapke khet ya bagiche ke liye main kya sahayata kar sakta hoon?\n• Apni mitti ke anusaar sabse sahi fasal janna chahte hain?\n• Khad (Urea, DAP, MOP) ki matra ka hisaab nikalna hai?\n• Ya kisi fasal ke keede aur bimari ka upchaar janna hai?`,
      tags: ['AgriBot AI', 'Friendly Chat', 'Kheti Saathi'],
      actions: [
        { type: 'load_crop_sample', label: '🌾 Fill Rice Sample', crop: 'rice' },
        { type: 'trigger_weather_detect', label: '📍 Detect Local Weather', payload: true },
        { type: 'navigate_tab', label: '🌾 Open Recommendation Form', payload: 'recommend' }
      ]
    };
  }

  // 2. Identity / Who are you
  const identity = ['who are you', 'aap kaun ho', 'tum kaun ho', 'naam kya', 'kya naam', 'who created you', 'who made you', 'kiska bot', 'apne bare me', 'who is agribot'];
  if (identity.some(k => query.includes(k))) {
    return {
      text: `**Mera naam AgriBot (एग्रीबॉट) hai! 🌾**\n\nMain **AgriSmart AI** ka dedicated AI Kheti Visheshagya (Agricultural Specialist) aur Voice Assistant hoon.\n\n**Main aapki in kaamo me madad karta hoon:**\n1. 🧪 **Mitti ki Jaanch:** 7 factors ko deep neural network se evaluate karke sabse laabhkari fasal batana.\n2. 🐛 **Keede aur Bimari:** Kapas ki gulabi sundi, dhaan ka blast, gehu ka rituwa ka sahi ilaj batana.\n3. ⚖️ **Khad ki Matra:** Prati acre Urea, DAP, aur Potash ke kutto ki ganna karna.\n4. 💰 **Munafa:** Fasal ki aamdaani, lagat aur profit margin ka vishleshan karna.`,
      tags: ['AgriBot Identity', 'AI Specialist'],
      actions: [
        { type: 'navigate_tab', label: '🌾 Test Crop Form', payload: 'recommend' },
        { type: 'navigate_tab', label: '📊 View AI Pipeline', payload: 'about' }
      ]
    };
  }

  // 3. Gratitude
  const gratitude = ['thanks', 'thank you', 'dhanyawad', 'shukriya', 'bahut accha', 'badhiya', 'bohot shukriya', 'thank u', 'shukran'];
  if (gratitude.some(k => query.includes(k))) {
    return {
      text: `**Aapka bohot bohot swagat hai! (आपका बहुत-बहुत स्वागत है!) 🌾**\n\nKheti, mitti aur fasal se juda koi bhi sawal ho — bina kisi jhijhak ke poochiye.\n\nEk khushhal kisan hi desh ki shaan hai! Jai Jawan, Jai Kisan! 🚜`,
      tags: ['Swagatam', 'Farmer Friendly'],
      actions: [
        { type: 'load_crop_sample', label: '🌽 Try Maize Sample', crop: 'maize' },
        { type: 'navigate_tab', label: '💰 Explore Economics', payload: 'analytics' }
      ]
    };
  }

  // 4. Units & Conversion queries
  if (query.includes('kg/ha') || query.includes('acre') || query.includes('convert') || query.includes('unit') || query.includes('हेक्टेयर') || query.includes('एकड़')) {
    return {
      text: `**Measurement Units & Conversions Guide (माप इकाइयां):**\n\n• **1 kg/ha = 0.4047 kg/acre** (लगभग 0.405 गुना)।\n• **Example:** If recommended Nitrogen is **100 kg/ha**, your requirement for 1 acre is **40.5 kg/acre**.\n• **Rainfall (mm):** 1 mm of rainfall equals **10,000 liters per hectare** (या **4,047 लीटर प्रति एकड़**)। 100 mm = 3.94 inches.\n• **Yield (Quintals):** 1 Quintal = **100 kg** (10 क्विंटल = 1 मीट्रिक टन)।\n• **Farmland Area:** 1 Hectare = **2.471 Acres** = **10,000 m²** (लगभग 43,560 वर्ग फीट प्रति एकड़)।\n\n💡 *Tip: Hover over any unit badge in the Recommendation Form to view instant live conversion cards!*`,
      tags: ['Units Guide', 'Conversions', 'Soil Health Card'],
      actions: []
    };
  }

  // 5. Default fallback
  return {
    text: `Aapne **'${userInput}'** ke baare mein poocha hai. 🌾\n\nKisan bhai/behan, main aapko kheti ke in mukhya vishayon par poori jankari de sakta hoon:\n• **Fasal Recommendation:** Apne 7 parameters batayein aur neural network model se sabse sahi fasal jaaniye.\n• **Khad & Urvarak (Fertilizers):** Urea, DAP, Potash aur Zinc ki sahi matra prati acre.\n• **Keede & Bimari (Pest & Disease):** Dhaan, Kapas, Gehu, Makkai, Dalhan ke rogon ka upchaar.\n• **Live Mausam (Weather):** Apne zile ka taapman, nami aur barish ka anumaan.\n\nAap neeche diye gaye quick buttons dabakar shuru kar sakte hain ya microphone se bol sakte hain!`,
    tags: ['Kheti Sahayata', 'AgriBot Guide'],
    actions: [
      {'type': 'trigger_weather_detect', 'label': '📍 Auto-Detect Local Weather', 'payload': true},
      {'type': 'navigate_tab', 'label': '🌾 Open Recommendation Form', 'payload': 'recommend'},
      {'type': 'navigate_tab', 'label': '💰 Explore Economic Studio', 'payload': 'analytics'}
    ]
  };
}

export default function AgriChatbot({ 
  setActiveTab, 
  setFormData, 
  onSelectSample 
}) {
  const { isDark, language, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreetingBadge, setShowGreetingBadge] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChipCategory, setActiveChipCategory] = useState('top');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);

  // Gemini API Key & Quota Guard States
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState({ configured: false, daily_used: 0, daily_cap: 500 });

  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `### Namaste! I'm AgriBot 🌾\nYour dedicated AI Agricultural Specialist. How can I assist your farm today?\n\n• **Instant Crop Inference:** Type your soil test (e.g. \`N: 90, P: 42, K: 43, rain: 200\`)\n• **Pest Diagnostics:** Ask about Pink Bollworm, Rice Blast, Fall Armyworm, or Rust\n• **Fertilizer Dosing:** Calculate commercial bags of Urea, DAP, and MOP per acre\n• **Regional Guidance:** Ask about Maharashtra, Punjab, UP, Gujarat, or Rajasthan soils`,
      tags: ['AgriBot AI', 'Voice Assistant'],
      actions: [
        { type: 'load_crop_sample', label: '🌾 Fill Rice Sample', crop: 'rice' },
        { type: 'trigger_weather_detect', label: '📍 Detect Live Weather', payload: true }
      ],
      timestamp: 'Just now'
    }
  ]);

  // Load Gemini status when chat opens
  useEffect(() => {
    fetch('/api/gemini/status')
      .then(res => res.json())
      .then(data => setGeminiStatus(data))
      .catch(() => {});
  }, [isOpen]);

  const handleSaveGeminiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setIsSavingKey(true);
    try {
      const res = await fetch('/api/gemini/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKeyInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setGeminiStatus(prev => ({ ...prev, configured: true }));
        setShowKeyModal(false);
        setApiKeyInput('');
      }
    } catch (err) {
      console.warn('Error saving Gemini key:', err);
    } finally {
      setIsSavingKey(false);
    }
  };

  // Check speech recognition and synthesis support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  // Toggle voice recognition
  const handleToggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  };

  // ─── Natural Human-Like Voice Speak ────────────────────────────────────────
  // Detects context (greeting, alert, advice) and tunes voice accordingly.
  // Splits text into short sentence chunks to prevent browser TTS clipping.
  const handleSpeakText = (text, msgId) => {
    if (!window.speechSynthesis) return;

    // Toggle off if already speaking this message
    if (activeSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const sentences = splitIntoSentences(cleaned);
    if (!sentences.length) return;

    // ── Context-aware tuning ──────────────────────────────────────────────────
    const lower = text.toLowerCase();
    const isHindi = language === 'hi' ||
      /[\u0900-\u097F]/.test(text) ||  // Devanagari Unicode block
      lower.includes('kisan') || lower.includes('fasal') || lower.includes('mitti');

    const isGreeting  = /namaste|welcome|swagat|hello|hi there|wassup|shukriya|dhanyawad/i.test(lower);
    const isWarning   = /warning|caution|careful|spray|pesticide|chemical|dose|⚠|alert/i.test(lower);
    const isTip       = /tip:|note:|advice:|💡|recommended|suggest/i.test(lower);
    const isLongReply = sentences.length > 4;

    // Rate: greetings a bit warmer/slower; warnings calmer; long replies slightly faster
    let rate  = 0.92;
    let pitch = 1.05;
    if (isGreeting) { rate = 0.88; pitch = 1.1; }
    if (isWarning)  { rate = 0.85; pitch = 0.97; }
    if (isTip)      { rate = 0.90; pitch = 1.02; }
    if (isLongReply){ rate = 0.95; }

    // ── Voice selection ───────────────────────────────────────────────────────
    const allVoices = window.speechSynthesis.getVoices();

    let chosenVoice = null;
    let chosenLang  = 'en-IN';

    if (isHindi) {
      chosenVoice = pickBestVoice(allVoices, PREFERRED_HI_VOICES, 'hi');
      chosenLang  = 'hi-IN';
      // Hindi text sounds more natural at a slightly slower rate
      rate  = Math.min(rate, 0.88);
      pitch = 1.0;
    } else {
      chosenVoice = pickBestVoice(allVoices, PREFERRED_EN_VOICES, 'en');
      chosenLang  = 'en-IN';
    }

    // ── Speak sentences one by one with micro pauses ──────────────────────────
    let idx = 0;
    setActiveSpeakingId(msgId);

    function speakNext() {
      if (idx >= sentences.length) {
        setActiveSpeakingId(null);
        return;
      }

      const utt = new SpeechSynthesisUtterance(sentences[idx]);
      utt.lang   = chosenLang;
      utt.rate   = rate;
      utt.pitch  = pitch;
      utt.volume = 1.0;
      if (chosenVoice) utt.voice = chosenVoice;

      utt.onend = () => {
        idx++;
        // Small natural pause between sentences (150ms)
        if (idx < sentences.length) {
          setTimeout(speakNext, 150);
        } else {
          setActiveSpeakingId(null);
        }
      };

      utt.onerror = () => {
        idx++;
        if (idx < sentences.length) {
          setTimeout(speakNext, 150);
        } else {
          setActiveSpeakingId(null);
        }
      };

      window.speechSynthesis.speak(utt);
    }

    // Voices may not be loaded yet on first call — wait if needed
    if (allVoices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', speakNext, { once: true });
    } else {
      speakNext();
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Hide greeting badge after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreetingBadge(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Send message to Backend AI / Fallback
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    setShowSuggestionsDrawer(false);

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    }

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const historyContext = messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }));
      const botResponse = await sendChatMessage(text, language, historyContext);
      
      const newBotId = (Date.now() + 1).toString();
      const botMsg = {
        id: newBotId,
        sender: 'bot',
        text: botResponse.text,
        tags: botResponse.tags || ['AgriBot AI'],
        actions: botResponse.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (voiceModeActive) {
        handleSpeakText(botResponse.text, newBotId);
      }
    } catch (err) {
      console.warn('Backend chat API offline, falling back to local engine:', err);
      const fallback = generateAgriBotFallback(text, language);
      const newBotId = (Date.now() + 1).toString();
      const botMsg = {
        id: newBotId,
        sender: 'bot',
        text: fallback.text,
        tags: fallback.tags || ['Local Advisory'],
        actions: fallback.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (voiceModeActive) {
        handleSpeakText(fallback.text, newBotId);
      }
    }
  };

  // Execute App Actions from Chat Buttons
  const handleExecuteAction = (action) => {
    if (!action) return;

    if (action.type === 'load_crop_sample') {
      const cropKey = (action.crop || '').toLowerCase();
      const sample = SAMPLE_CROP_VALUES[cropKey];
      if (sample && setFormData) {
        setFormData(sample);
      }
      if (setActiveTab) {
        setActiveTab('recommend');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsOpen(false);
    } else if (action.type === 'load_parameters') {
      if (action.payload && setFormData) {
        setFormData(action.payload);
      }
      if (setActiveTab) {
        setActiveTab('recommend');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsOpen(false);
    } else if (action.type === 'navigate_tab') {
      if (setActiveTab) {
        setActiveTab(action.payload || 'recommend');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsOpen(false);
    } else if (action.type === 'trigger_weather_detect') {
      if (setActiveTab) {
        setActiveTab('recommend');
      }
      setIsOpen(false);
      setTimeout(() => {
        const el = document.querySelector('button[title*="Auto-Detect"], button:has(svg.lucide-navigation)');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  // Copy advice to clipboard
  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(cleanTextForSpeech(text));
    setCopiedMessageId(id);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2500);
  };

  const handleResetChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setActiveSpeakingId(null);
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `### Chat Cleared 🌾\nWhat agricultural or crop questions can I help you with? You can speak using the microphone or type below!`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Bubble */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {showGreetingBadge && !isOpen && (
          <div className="mb-2 mr-1 px-4 py-2 rounded-2xl bg-forest-950/90 dark:bg-forest-900/95 text-white text-xs font-semibold shadow-xl border border-forest-800 animate-bounce flex items-center gap-2 backdrop-blur-md">
            <span className="text-base">🌾</span>
            <span>Ask AgriBot anything! • एग्रीबॉट</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowGreetingBadge(false); }}
              className="text-slate-400 hover:text-white ml-1 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowGreetingBadge(false);
          }}
          aria-label="Toggle AgriSmart AI Assistant Chatbot"
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-agri-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-xl shadow-agri-600/30 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-white/60 dark:ring-forest-900/60"
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <>
              <Bot className="w-7 h-7 stroke-[2.2]" />
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white dark:border-forest-900"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Slide-out / Pop-up Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[94vw] sm:w-[490px] h-[670px] max-h-[85vh] rounded-3xl bg-white/95 dark:bg-forest-950/95 border border-slate-200 dark:border-forest-800 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Streamlined, Elegant Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white flex items-center justify-between border-b border-forest-800/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-forest-950 shadow-md">
                  <Bot className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-forest-950"></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold tracking-tight">AgriBot AI</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    geminiStatus.configured 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-agri-500/20 text-agri-300 border border-agri-500/30'
                  }`}>
                    {geminiStatus.configured ? 'Gemini Flash' : 'AI Specialist'}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/80 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{geminiStatus.configured ? 'GenAI Active • Voice Enabled' : 'Online • Voice Enabled'}</span>
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1.5">
              {/* Gemini Quota Guard / Key Toggle */}
              <button
                type="button"
                onClick={() => setShowKeyModal(!showKeyModal)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  geminiStatus.configured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
                title={
                  geminiStatus.configured
                    ? `Gemini Active • Quota Guard: ${geminiStatus.daily_used}/${geminiStatus.daily_cap} today`
                    : 'Connect Free Gemini API Key'
                }
              >
                <Key className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden sm:inline">
                  {geminiStatus.configured ? `${geminiStatus.daily_used}/${geminiStatus.daily_cap}` : 'API Key'}
                </span>
              </button>

              {/* Auto Voice Mode Toggle */}
              <button
                type="button"
                onClick={() => setVoiceModeActive(!voiceModeActive)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  voiceModeActive
                    ? 'bg-emerald-500 text-forest-950 border-emerald-400 font-bold shadow-xs'
                    : 'bg-forest-900/60 text-slate-300 border-forest-700 hover:text-white'
                }`}
                title="Toggle Auto-Voice Output (Reads responses aloud)"
              >
                {voiceModeActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-forest-800/80 transition-colors"
                title="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-forest-800/80 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gemini API Key Configuration Banner with Quota Guard Info */}
          {showKeyModal && (
            <div className="p-4 bg-gradient-to-br from-emerald-950 via-forest-950 to-forest-900 border-b border-emerald-800 text-white animate-in fade-in duration-150 text-xs space-y-3 flex-shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <h5 className="font-bold text-white text-xs sm:text-sm">
                    Google Gemini Flash Lite (Free AI Studio)
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-700/60 text-[11px] text-emerald-200 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quota Exhaustion Guard Active</span>
                </div>
                <p>
                  • Capped at <strong>500 calls/day</strong> (safely below Google's 1,500 daily free limit).
                  • Sliding <strong>8 calls/minute</strong> throttle prevents rate spikes.
                  • In-memory <strong>response caching</strong> saves tokens on repeat questions.
                  • Automatic silent failover to our local engine on limit or 429.
                </p>
              </div>

              <form onSubmit={handleSaveGeminiKey} className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={geminiStatus.configured ? "Key active! Paste new key to update..." : "Paste Gemini API Key (AIzaSy...)"}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-forest-900 border border-forest-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={isSavingKey || !apiKeyInput.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs disabled:opacity-50 text-white cursor-pointer transition-colors"
                >
                  {isSavingKey ? 'Saving...' : 'Save Key'}
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                <span>Free tier: No credit card needed.</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 underline font-bold flex items-center gap-0.5"
                >
                  <span>Get Free Key at aistudio.google.com</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              const isSpeaking = activeSpeakingId === msg.id;
              const isCopied = copiedMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 animate-in fade-in duration-200 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Bot Avatar */}
                  {isBot && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  )}

                  <div className={`flex flex-col ${isBot ? 'items-start max-w-[88%]' : 'items-end max-w-[85%]'}`}>
                    
                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-sm transition-all ${
                        isBot
                          ? 'bg-slate-50/90 dark:bg-forest-900/80 border border-slate-200/80 dark:border-forest-800 text-forest-950 dark:text-slate-100 rounded-tl-xs'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-md font-medium'
                      }`}
                    >
                      {isBot ? renderFormattedMarkdown(msg.text) : msg.text}

                      {/* Interactive Action Buttons inside Bot Message */}
                      {isBot && msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-forest-800 flex flex-wrap gap-1.5">
                          {msg.actions.map((act, actIdx) => (
                            <button
                              key={actIdx}
                              onClick={() => handleExecuteAction(act)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-forest-950 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-50 dark:hover:bg-forest-800 transition-all cursor-pointer shadow-2xs hover:scale-102"
                            >
                              <span>{act.label}</span>
                              <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {isBot && msg.tags && msg.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-3 pt-2 border-t border-slate-200/50 dark:border-forest-800/60">
                          {msg.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-forest-950 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-forest-800"
                            >
                              🏷️ {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta bar: timestamp, audio play, copy */}
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>{msg.timestamp}</span>

                      {isBot && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleSpeakText(msg.text, msg.id)}
                            className={`flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer ${
                              isSpeaking ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                            }`}
                            title={isSpeaking ? 'Stop voice reading' : 'Listen aloud'}
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3 h-3 text-red-500 animate-pulse" />
                                <span className="text-red-500 font-bold">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>

                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.text, msg.id)}
                            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Copy advice to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2.5 animate-in fade-in duration-150">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-forest-900 border border-slate-200 dark:border-forest-800 rounded-2xl rounded-tl-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] text-slate-400 font-medium ml-1">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Pulse Banner */}
          {isListening && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-forest-900 dark:to-forest-950 border-t border-emerald-200 dark:border-forest-700 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Radio className="w-4 h-4 text-red-500 animate-ping" />
                <span>बोलिए / Listening... Speak your inquiry clearly</span>
              </div>
              <button
                type="button"
                onClick={handleToggleListening}
                className="text-xs text-red-600 dark:text-red-400 font-bold underline cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Collapsible Quick Suggestions Drawer (Above Input) */}
          <div className="border-t border-slate-100 dark:border-forest-800/80 bg-slate-50/70 dark:bg-forest-900/40">
            {showSuggestionsDrawer ? (
              <div className="p-3 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {CHIP_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveChipCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          activeChipCategory === cat.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-forest-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSuggestionsDrawer(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {(CATEGORIZED_QUESTIONS[activeChipCategory] || []).map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.query)}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-xl bg-white dark:bg-forest-950 border border-slate-200 dark:border-forest-700/80 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all cursor-pointer shadow-2xs"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowSuggestionsDrawer(true)}
                  className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t ? t('suggestedQuestions') : 'Suggested Questions'}</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] opacity-75">
                  {geminiStatus.configured ? (t ? t('poweredByGemini') : '⚡ Powered by Gemini Flash') : (t ? t('neuralAssistant') : '⚡ Neural Assistant')}
                </span>
              </div>
            )}
          </div>

          {/* Clean Input Footer */}
          <div className="p-3 bg-white dark:bg-forest-950 border-t border-slate-200/80 dark:border-forest-800 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Microphone Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white border-red-600 animate-pulse ring-2 ring-red-300 shadow-md'
                      : 'bg-slate-100 dark:bg-forest-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-forest-700 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-forest-800'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak using microphone'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? (t ? t('voiceListening') : 'Listening to speech...') : (t ? t('chatPlaceholder') : 'Ask about crops, fertilizers, pests, or seasons...')}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-forest-900 border border-slate-200 dark:border-forest-700 text-xs sm:text-sm text-forest-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-2xs"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white shadow-md transition-all cursor-pointer flex-shrink-0 active:scale-95"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
