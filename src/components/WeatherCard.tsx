import { motion } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  CloudSun,
  Thermometer,
  Droplets,
  Sunset,
  ShieldAlert,
  Umbrella,
  Moon,
  Camera,
  Shirt,
  Footprints,
} from 'lucide-react';
import { useEventWeather, type WeatherSuggestion } from '../hooks/useEventWeather';

const weatherIcons: Record<string, React.ReactNode> = {
  sun: <Sun className="text-amber-400" size={40} strokeWidth={1.5} />,
  'cloud-sun': <CloudSun className="text-amber-300" size={40} strokeWidth={1.5} />,
  cloud: <Cloud className="text-gray-400" size={40} strokeWidth={1.5} />,
  'cloud-rain': <CloudRain className="text-blue-400" size={40} strokeWidth={1.5} />,
  'cloud-drizzle': <CloudDrizzle className="text-blue-300" size={40} strokeWidth={1.5} />,
  'cloud-lightning': <CloudLightning className="text-yellow-500" size={40} strokeWidth={1.5} />,
  'cloud-fog': <CloudFog className="text-gray-300" size={40} strokeWidth={1.5} />,
};

const suggestionIcons: Record<string, React.ReactNode> = {
  umbrella: <Umbrella size={16} strokeWidth={1.5} />,
  sun: <Sun size={16} strokeWidth={1.5} />,
  droplets: <Droplets size={16} strokeWidth={1.5} />,
  moon: <Moon size={16} strokeWidth={1.5} />,
  camera: <Camera size={16} strokeWidth={1.5} />,
  shirt: <Shirt size={16} strokeWidth={1.5} />,
  footprints: <Footprints size={16} strokeWidth={1.5} />,
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-amber-50 border-amber-200 text-amber-800',
  low: 'bg-green-50 border-green-200 text-green-800',
};

function SuggestionPill({ suggestion }: { suggestion: WeatherSuggestion }) {
  return (
    <motion.div
      className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs leading-relaxed ${priorityColors[suggestion.priority]}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="mt-0.5 flex-shrink-0">{suggestionIcons[suggestion.icon] ?? <ShieldAlert size={16} />}</span>
      <span>{suggestion.text}</span>
    </motion.div>
  );
}

export default function WeatherCard() {
  const weather = useEventWeather();

  if (weather.isLoading) {
    return (
      <div className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/40 shadow-sm flex flex-col items-center gap-3 animate-pulse">
        <div className="w-10 h-10 bg-[#e7f2da] rounded-full" />
        <div className="h-4 bg-[#e7f2da] rounded w-48" />
        <div className="h-3 bg-[#e7f2da] rounded w-32" />
        <div className="h-16 bg-[#e7f2da] rounded w-full mt-2" />
      </div>
    );
  }

  if (weather.error) {
    return (
      <div className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/40 shadow-sm text-center">
        <Cloud className="text-[#D1C4B0] mx-auto mb-2" size={32} strokeWidth={1.5} />
        <p className="text-sm text-[#44483f]">{weather.error}</p>
      </div>
    );
  }

  const isHistorical = weather.proximityType === 'historical';

  return (
    <motion.div
      className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/40 shadow-sm flex flex-col gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 justify-center">
        <Thermometer className="text-primary" size={20} strokeWidth={1.5} />
        <h3 className="font-serif text-lg text-[#2C3525]">Clima del Evento</h3>
      </div>

      {/* Proximity badge */}
      <div className="text-center">
        <span className={`inline-block text-[11px] font-medium px-3 py-1 rounded-full ${
          isHistorical 
            ? 'bg-[#e7f2da] text-[#566247]' 
            : weather.proximityType === 'today'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {weather.proximityMessage}
        </span>
      </div>

      {/* Main weather display */}
      <div className="flex items-center justify-center gap-6">
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {weatherIcons[weather.weatherIcon] ?? weatherIcons['cloud']}
        </motion.div>

        {/* Temperature */}
        <div className="text-center">
          <p className="text-3xl font-bold text-[#2C3525]">
            {weather.tempMax}°
            <span className="text-lg text-[#8a8d86] font-normal ml-1">/ {weather.tempMin}°</span>
          </p>
          <p className="text-sm text-[#44483f] italic">{weather.weatherDescription}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-around border-t border-[#D1C4B0]/30 pt-4">
        <div className="flex flex-col items-center gap-1">
          <Droplets className="text-blue-400" size={18} strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#2C3525]">{weather.precipitationProbability}%</span>
          <span className="text-[10px] text-[#8a8d86]">Lluvia</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sun className="text-amber-400" size={18} strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#2C3525]">{weather.uvIndex}</span>
          <span className="text-[10px] text-[#8a8d86]">Índice UV</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sunset className="text-orange-400" size={18} strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[#2C3525]">{weather.sunset}</span>
          <span className="text-[10px] text-[#8a8d86]">Atardecer</span>
        </div>
      </div>

      {/* Suggestions */}
      {weather.suggestions.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-[#D1C4B0]/30 pt-4">
          <p className="text-[11px] font-bold text-[#44483f] uppercase tracking-wider text-center mb-1">
            Sugerencias para el día
          </p>
          {weather.suggestions.map((s, i) => (
            <SuggestionPill key={i} suggestion={s} />
          ))}
        </div>
      )}

      {/* Historical disclaimer */}
      {isHistorical && (
        <p className="text-[10px] text-[#8a8d86] text-center italic mt-1">
          * Basado en promedios históricos de los últimos 5 años para esta fecha en Rivera, Huila.
          El pronóstico real estará disponible 16 días antes del evento.
        </p>
      )}

      {/* Date */}
      <p className="text-center text-xs text-[#566247] font-serif italic">
        27 de noviembre de 2026 · Rivera, Huila
      </p>
    </motion.div>
  );
}
