// Weather for McLean, VA via OpenWeatherMap.
// Requires OPENWEATHER_API_KEY.

const LOCATION = 'McLean,VA,US';

export type CurrentWeather = {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  observedAt: string; // e.g. "Mon, Aug 24 · 3:42 PM" (Eastern)
};

function easternDateKey(d: Date): string {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}

function easternStamp(d: Date): string {
  return d.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Today's true high/low, computed from the 3-hourly forecast filtered to the
// current Eastern-time calendar day. The current-conditions endpoint also
// returns temp_min/temp_max, but those are a momentary spread across nearby
// stations — not the day's range — so using them makes "high/low" wrong.
async function todayRange(apiKey: string, currentTemp: number): Promise<{ min: number; max: number }> {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(LOCATION)}&units=imperial&appid=${apiKey}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { min: currentTemp, max: currentTemp };
    const data = await res.json();

    const today = easternDateKey(new Date());
    const temps: number[] = (data.list || [])
      .filter((e: any) => easternDateKey(new Date(e.dt * 1000)) === today)
      .map((e: any) => e.main?.temp)
      .filter((t: any) => typeof t === 'number');

    // Include the current reading so the range always contains right now, even
    // late in the day when few forecast slots remain.
    temps.push(currentTemp);

    return { min: Math.round(Math.min(...temps)), max: Math.round(Math.max(...temps)) };
  } catch {
    return { min: currentTemp, max: currentTemp };
  }
}

// Returns null rather than throwing so a missing/invalid API key degrades to
// "unavailable" in the UI instead of taking down the whole page.
export async function getCurrentWeather(): Promise<CurrentWeather | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(LOCATION)}&units=imperial&appid=${apiKey}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const { min, max } = await todayRange(apiKey, temp);

    return {
      temp,
      feelsLike: Math.round(data.main.feels_like),
      tempMin: min,
      tempMax: max,
      condition: data.weather?.[0]?.main || 'Unknown',
      description: data.weather?.[0]?.description || '',
      icon: data.weather?.[0]?.icon || '01d',
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed ?? 0),
      // dt is the observation time from OWM, not our server clock.
      observedAt: easternStamp(new Date((data.dt ?? Date.now() / 1000) * 1000)),
    };
  } catch {
    return null;
  }
}

// Short one-line form used by the morning briefing SMS.
export async function getWeatherBrief(): Promise<string> {
  const w = await getCurrentWeather();
  if (!w) return 'Weather unavailable';
  return `${w.temp}\u00B0F (feels ${w.feelsLike}\u00B0), ${w.condition}, high ${w.tempMax}\u00B0/low ${w.tempMin}\u00B0`;
}
