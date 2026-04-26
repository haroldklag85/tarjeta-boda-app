import { useState, useEffect } from 'react';

// ══════════════════════════════════════════════════════════════
// Evento: 27 de Noviembre de 2026
// Ubicación: Rivera, Huila, Colombia
// API: Open-Meteo (100% gratis, sin API key)
// ══════════════════════════════════════════════════════════════

const EVENT_DATE = '2026-11-27';
const LAT = 2.7769;
const LON = -75.2564;
const TIMEZONE = 'America/Bogota';

// WMO Weather Codes → description + icon key
const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: 'Cielo despejado', icon: 'sun' },
  1: { description: 'Mayormente despejado', icon: 'sun' },
  2: { description: 'Parcialmente nublado', icon: 'cloud-sun' },
  3: { description: 'Nublado', icon: 'cloud' },
  45: { description: 'Niebla', icon: 'cloud-fog' },
  48: { description: 'Niebla con escarcha', icon: 'cloud-fog' },
  51: { description: 'Llovizna ligera', icon: 'cloud-drizzle' },
  53: { description: 'Llovizna moderada', icon: 'cloud-drizzle' },
  55: { description: 'Llovizna intensa', icon: 'cloud-drizzle' },
  61: { description: 'Lluvia ligera', icon: 'cloud-rain' },
  63: { description: 'Lluvia moderada', icon: 'cloud-rain' },
  65: { description: 'Lluvia intensa', icon: 'cloud-rain' },
  80: { description: 'Chubascos ligeros', icon: 'cloud-rain' },
  81: { description: 'Chubascos moderados', icon: 'cloud-rain' },
  82: { description: 'Chubascos intensos', icon: 'cloud-rain' },
  95: { description: 'Tormenta eléctrica', icon: 'cloud-lightning' },
  96: { description: 'Tormenta con granizo', icon: 'cloud-lightning' },
  99: { description: 'Tormenta severa', icon: 'cloud-lightning' },
};

export interface WeatherSuggestion {
  icon: string; // lucide icon name
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WeatherData {
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  uvIndex: number;
  sunset: string;
  suggestions: WeatherSuggestion[];
  proximityMessage: string;
  proximityType: 'historical' | 'forecast' | 'today';
  daysUntilEvent: number;
  isLoading: boolean;
  error: string | null;
}

function generateSuggestions(
  tempMax: number,
  tempMin: number,
  precipProb: number,
  uvIndex: number,
  weatherCode: number
): WeatherSuggestion[] {
  const suggestions: WeatherSuggestion[] = [];

  // Rain warnings (HIGH PRIORITY — user specifically asked for this)
  if (precipProb >= 70 || [63, 65, 81, 82, 95, 96, 99].includes(weatherCode)) {
    suggestions.push({
      icon: 'umbrella',
      text: '¡Lleva paraguas o sombrilla! Alta probabilidad de lluvia.',
      priority: 'high',
    });
    suggestions.push({
      icon: 'shirt',
      text: 'Si llueve puede refrescar: considera llevar un chal, pashmina o chaqueta ligera.',
      priority: 'high',
    });
    suggestions.push({
      icon: 'footprints',
      text: 'Opta por calzado cómodo que no resbale si el piso se moja.',
      priority: 'medium',
    });
  } else if (precipProb >= 40 || [51, 53, 55, 61, 80].includes(weatherCode)) {
    suggestions.push({
      icon: 'umbrella',
      text: 'Hay posibilidad de lloviznas. Lleva una sombrilla por precaución.',
      priority: 'medium',
    });
    suggestions.push({
      icon: 'shirt',
      text: 'Un chal o pashmina puede ser útil si refresca por la lluvia.',
      priority: 'low',
    });
  }

  // UV protection
  if (uvIndex >= 8) {
    suggestions.push({
      icon: 'sun',
      text: 'Índice UV muy alto. Usa protector solar FPS 50+ y gafas de sol.',
      priority: 'high',
    });
  } else if (uvIndex >= 5) {
    suggestions.push({
      icon: 'sun',
      text: 'Usa protector solar, el sol estará fuerte.',
      priority: 'medium',
    });
  }

  // Hydration
  if (tempMax >= 30) {
    suggestions.push({
      icon: 'droplets',
      text: 'Hidrátate bien. Hará bastante calor durante la tarde.',
      priority: 'high',
    });
  } else if (tempMax >= 26) {
    suggestions.push({
      icon: 'droplets',
      text: 'Recuerda mantenerte hidratado, será una tarde cálida.',
      priority: 'medium',
    });
  }

  // Night temperature
  if (tempMin <= 20) {
    suggestions.push({
      icon: 'moon',
      text: 'La noche puede ser fresca. Lleva algo para abrigarte.',
      priority: 'low',
    });
  }

  // Clear sky suggestion
  if ([0, 1].includes(weatherCode) && precipProb < 20) {
    suggestions.push({
      icon: 'camera',
      text: '¡Cielo despejado! Perfecto para fotos al atardecer.',
      priority: 'low',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}

function getProximityMessage(daysUntil: number): { message: string; type: 'historical' | 'forecast' | 'today' } {
  if (daysUntil <= 0) {
    return { message: '¡Hoy es el gran día! Así está el clima para celebrar 🎉', type: 'today' };
  } else if (daysUntil === 1) {
    return { message: '¡Mañana es el gran día! Pronóstico actualizado', type: 'forecast' };
  } else if (daysUntil <= 7) {
    return { message: `Faltan ${daysUntil} días. Pronóstico actualizado en tiempo real`, type: 'forecast' };
  } else if (daysUntil <= 16) {
    return { message: `Faltan ${daysUntil} días. Pronóstico extendido para el día del evento`, type: 'forecast' };
  } else if (daysUntil <= 60) {
    return { message: `Faltan ${daysUntil} días. Así suele ser el clima en Rivera para esta fecha`, type: 'historical' };
  } else {
    return { message: `Faltan ${daysUntil} días. Clima histórico promedio para noviembre en Rivera`, type: 'historical' };
  }
}

async function fetchForecast(): Promise<Partial<WeatherData>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,uv_index_max,sunset&start_date=${EVENT_DATE}&end_date=${EVENT_DATE}&timezone=${TIMEZONE}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener el pronóstico');
  const data = await res.json();

  const d = data.daily;
  return {
    tempMax: Math.round(d.temperature_2m_max[0]),
    tempMin: Math.round(d.temperature_2m_min[0]),
    precipitationProbability: d.precipitation_probability_max[0] ?? 0,
    weatherCode: d.weathercode[0],
    uvIndex: Math.round(d.uv_index_max[0] ?? 0),
    sunset: d.sunset?.[0]?.split('T')[1]?.slice(0, 5) ?? '18:00',
  };
}

async function fetchHistoricalAverage(): Promise<Partial<WeatherData>> {
  // Fetch Nov 27 from last 5 years and average
  const years = [2021, 2022, 2023, 2024, 2025];
  const fetches = years.map(async (year) => {
    const date = `${year}-11-27`;
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,uv_index_max&start_date=${date}&end_date=${date}&timezone=${TIMEZONE}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  });

  const results = (await Promise.all(fetches)).filter(Boolean);

  if (results.length === 0) throw new Error('No se pudieron obtener datos históricos');

  let totalMax = 0, totalMin = 0, totalPrecip = 0, totalUv = 0;
  const codes: number[] = [];

  for (const data of results) {
    const d = data.daily;
    totalMax += d.temperature_2m_max[0] ?? 0;
    totalMin += d.temperature_2m_min[0] ?? 0;
    totalPrecip += d.precipitation_sum[0] ?? 0;
    totalUv += d.uv_index_max?.[0] ?? 0;
    codes.push(d.weathercode[0] ?? 0);
  }

  const n = results.length;
  // Estimate precipitation probability from historical precipitation amounts
  const rainyDays = results.filter(
    (d) => (d.daily.precipitation_sum[0] ?? 0) > 1
  ).length;
  const precipProb = Math.round((rainyDays / n) * 100);

  // Most frequent weather code
  const codeFreq: Record<number, number> = {};
  codes.forEach((c) => (codeFreq[c] = (codeFreq[c] || 0) + 1));
  const dominantCode = Number(
    Object.entries(codeFreq).sort((a, b) => b[1] - a[1])[0][0]
  );

  return {
    tempMax: Math.round(totalMax / n),
    tempMin: Math.round(totalMin / n),
    precipitationProbability: precipProb,
    weatherCode: dominantCode,
    uvIndex: Math.round(totalUv / n),
    sunset: '17:50', // Approx sunset for Nov 27 in Rivera, Huila
  };
}

export function useEventWeather(): WeatherData {
  const [data, setData] = useState<WeatherData>({
    tempMax: 0,
    tempMin: 0,
    precipitationProbability: 0,
    weatherCode: 0,
    weatherDescription: '',
    weatherIcon: 'sun',
    uvIndex: 0,
    sunset: '',
    suggestions: [],
    proximityMessage: '',
    proximityType: 'historical',
    daysUntilEvent: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function loadWeather() {
      try {
        const today = new Date();
        const event = new Date(EVENT_DATE + 'T00:00:00');
        const diffMs = event.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const { message, type } = getProximityMessage(daysUntil);

        let weatherResult: Partial<WeatherData>;

        if (daysUntil <= 16) {
          weatherResult = await fetchForecast();
        } else {
          weatherResult = await fetchHistoricalAverage();
        }

        const code = weatherResult.weatherCode ?? 0;
        const mapping = weatherCodeMap[code] ?? { description: 'Variable', icon: 'cloud' };

        const suggestions = generateSuggestions(
          weatherResult.tempMax ?? 0,
          weatherResult.tempMin ?? 0,
          weatherResult.precipitationProbability ?? 0,
          weatherResult.uvIndex ?? 0,
          code
        );

        setData({
          tempMax: weatherResult.tempMax ?? 0,
          tempMin: weatherResult.tempMin ?? 0,
          precipitationProbability: weatherResult.precipitationProbability ?? 0,
          weatherCode: code,
          weatherDescription: mapping.description,
          weatherIcon: mapping.icon,
          uvIndex: weatherResult.uvIndex ?? 0,
          sunset: weatherResult.sunset ?? '',
          suggestions,
          proximityMessage: message,
          proximityType: type,
          daysUntilEvent: daysUntil,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: 'No pudimos cargar el pronóstico. Intenta más tarde.',
        }));
      }
    }

    loadWeather();
  }, []);

  return data;
}
