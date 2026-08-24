// Fetch weather for McLean, VA.

export async function getWeatherBrief(): Promise<string> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!apiKey) return 'Weather unavailable';

    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=McLean,VA,US&units=imperial&appid=${apiKey}`);
    if (!res.ok) return 'Weather unavailable';
    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const condition = data.weather[0]?.main || 'Unknown';
    return `${temp}°F, ${condition}`;
  } catch {
    return 'Weather unavailable';
  }
}
