import { motion } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  CloudSun,
  Droplets,
  Sunset,
  Umbrella,
  Moon,
  Camera,
  Leaf,
} from 'lucide-react';
import { useEventWeather, type WeatherSuggestion } from '../hooks/useEventWeather';

const weatherIcons: Record<string, React.ReactNode> = {
  sun: <Sun className="text-[#C4A67D]" size={36} strokeWidth={1.2} />,
  'cloud-sun': <CloudSun className="text-[#C4A67D]" size={36} strokeWidth={1.2} />,
  cloud: <Cloud className="text-[#8a8d86]" size={36} strokeWidth={1.2} />,
  'cloud-rain': <CloudRain className="text-[#8a8d86]" size={36} strokeWidth={1.2} />,
  'cloud-drizzle': <CloudDrizzle className="text-[#8a8d86]" size={36} strokeWidth={1.2} />,
  'cloud-lightning': <CloudLightning className="text-[#8a8d86]" size={36} strokeWidth={1.2} />,
  'cloud-fog': <CloudFog className="text-[#8a8d86]" size={36} strokeWidth={1.2} />,
};

const suggestionIcons: Record<string, React.ReactNode> = {
  umbrella: <Umbrella className="text-[#566247]" size={14} strokeWidth={1.5} />,
  sun: <Sun className="text-[#566247]" size={14} strokeWidth={1.5} />,
  droplets: <Droplets className="text-[#566247]" size={14} strokeWidth={1.5} />,
  moon: <Moon className="text-[#566247]" size={14} strokeWidth={1.5} />,
  camera: <Camera className="text-[#566247]" size={14} strokeWidth={1.5} />,
  shirt: <Leaf className="text-[#566247]" size={14} strokeWidth={1.5} />,
  footprints: <Leaf className="text-[#566247]" size={14} strokeWidth={1.5} />,
};

function SuggestionItem({ suggestion }: { suggestion: WeatherSuggestion }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className="mt-0.5 flex-shrink-0 opacity-70">
        {suggestionIcons[suggestion.icon] ?? <Leaf className="text-[#566247]" size={14} strokeWidth={1.5} />}
      </span>
      <span className="text-[0.8rem] text-[#44483f] leading-relaxed">{suggestion.text}</span>
    </div>
  );
}

export default function WeatherCard() {
  const weather = useEventWeather();

  if (weather.isLoading) {
    return (
      <div className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/20 shadow-[0_4px_20px_rgba(44,53,37,0.05)] flex flex-col items-center gap-3 animate-pulse">
        <div className="w-8 h-8 bg-[#e7f2da] rounded-full" />
        <div className="h-3 bg-[#e7f2da] rounded w-40" />
        <div className="h-3 bg-[#e7f2da] rounded w-28 mt-1" />
      </div>
    );
  }

  if (weather.error) {
    return (
      <div className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/20 shadow-[0_4px_20px_rgba(44,53,37,0.05)] text-center">
        <Cloud className="text-[#D1C4B0] mx-auto mb-2" size={28} strokeWidth={1.2} />
        <p className="text-[0.85rem] text-[#44483f] italic">{weather.error}</p>
      </div>
    );
  }

  const isHistorical = weather.proximityType === 'historical';

  return (
    <motion.div
      className="w-full bg-white rounded-xl p-6 border border-[#D1C4B0]/20 shadow-[0_4px_20px_rgba(44,53,37,0.05)] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title */}
      <h3 className="text-center font-serif text-[1.25rem] text-[#2C3525] mb-1">
        Prepárate para el día
      </h3>
      <p className="text-center text-[0.8rem] text-[#8a8d86] italic mb-5">
        27 de noviembre · Rivera, Huila
      </p>

      {/* Proximity badge */}
      <p className="text-center text-[0.7rem] font-medium text-[#566247] bg-[#e7f2da] px-4 py-1.5 rounded-full self-center mb-5">
        {weather.proximityMessage}
      </p>

      {/* Main weather */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {weatherIcons[weather.weatherIcon] ?? weatherIcons['cloud']}
        </motion.div>

        <div>
          <p className="text-[2rem] font-serif text-[#2C3525] leading-none">
            {weather.tempMax}°
            <span className="text-[1rem] text-[#8a8d86] font-normal">/{weather.tempMin}°</span>
          </p>
          <p className="text-[0.8rem] text-[#44483f] italic mt-1">{weather.weatherDescription}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-around py-4 border-t border-b border-[#D1C4B0]/25">
        <div className="flex flex-col items-center gap-1">
          <Droplets className="text-[#8a8d86]" size={16} strokeWidth={1.2} />
          <span className="text-[0.85rem] font-semibold text-[#2C3525]">{weather.precipitationProbability}%</span>
          <span className="text-[0.65rem] text-[#8a8d86]">Lluvia</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sun className="text-[#8a8d86]" size={16} strokeWidth={1.2} />
          <span className="text-[0.85rem] font-semibold text-[#2C3525]">{weather.uvIndex}</span>
          <span className="text-[0.65rem] text-[#8a8d86]">UV</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sunset className="text-[#8a8d86]" size={16} strokeWidth={1.2} />
          <span className="text-[0.85rem] font-semibold text-[#2C3525]">{weather.sunset}</span>
          <span className="text-[0.65rem] text-[#8a8d86]">Atardecer</span>
        </div>
      </div>

      {/* Suggestions */}
      {weather.suggestions.length > 0 && (
        <div className="flex flex-col pt-4">
          <p className="text-[0.7rem] font-semibold text-[#8a8d86] uppercase tracking-[0.15em] text-center mb-2">
            Sugerencias
          </p>
          <div className="flex flex-col divide-y divide-[#D1C4B0]/15">
            {weather.suggestions.map((s, i) => (
              <SuggestionItem key={i} suggestion={s} />
            ))}
          </div>
        </div>
      )}

      {/* Historical disclaimer */}
      {isHistorical && (
        <p className="text-[0.65rem] text-[#8a8d86] text-center italic mt-4 leading-relaxed">
          Basado en promedios históricos de los últimos 5 años.
          El pronóstico real estará disponible 16 días antes del evento.
        </p>
      )}
    </motion.div>
  );
}
