import { Card } from '@/components/ui';

type CurrentWeather = {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  observedAt: string;
};

// Maps OpenWeatherMap's icon codes to a simple drawn glyph, so we don't depend
// on their image CDN (and so the art matches the rest of the dashboard).
function WeatherGlyph({ icon }: { icon: string }) {
  const isNight = icon.endsWith('n');
  const code = icon.slice(0, 2);

  const sun = (
    <>
      <circle cx="24" cy="24" r="9" fill="#C9A24B" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="24"
          x2="24"
          y2="9"
          stroke="#C9A24B"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${deg} 24 24)`}
          opacity="0.75"
        />
      ))}
    </>
  );

  const moon = <path d="M30 14 A11 11 0 1 0 34 28 A9 9 0 0 1 30 14 Z" fill="#B08D57" />;

  const cloud = (
    <path
      d="M16 32 A7 7 0 0 1 17 18 A9 9 0 0 1 34 20 A6 6 0 0 1 34 32 Z"
      fill="#DCD3C4"
      stroke="#B8AE9C"
      strokeWidth="1"
    />
  );

  const rain = [14, 22, 30].map((x) => (
    <line key={x} x1={x} y1="35" x2={x - 2} y2="42" stroke="#7A1F2B" strokeWidth="2" strokeLinecap="round" />
  ));

  const snow = [14, 22, 30].map((x) => <circle key={x} cx={x} cy="38" r="2" fill="#7A1F2B" opacity="0.5" />);

  const bolt = <path d="M24 32 L19 41 L23 41 L21 47 L28 38 L24 38 Z" fill="#C9A24B" />;

  return (
    <svg width="56" height="56" viewBox="0 0 48 48" role="img" aria-label={code}>
      {code === '01' && (isNight ? moon : sun)}
      {code === '02' && (
        <>
          {isNight ? moon : sun}
          {cloud}
        </>
      )}
      {(code === '03' || code === '04' || code === '50') && cloud}
      {code === '09' && (
        <>
          {cloud}
          {rain}
        </>
      )}
      {code === '10' && (
        <>
          {isNight ? moon : sun}
          {cloud}
          {rain}
        </>
      )}
      {code === '11' && (
        <>
          {cloud}
          {bolt}
        </>
      )}
      {code === '13' && (
        <>
          {cloud}
          {snow}
        </>
      )}
    </svg>
  );
}

export function WeatherCard({ weather }: { weather: CurrentWeather | null }) {
  if (!weather) {
    return (
      <Card className="flex items-center justify-center min-h-[168px]">
        <p className="text-sm text-ink/40 text-center">
          Weather unavailable
          <span className="block text-xs mt-1">Check OPENWEATHER_API_KEY</span>
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-4xl font-bold text-ledger leading-none">{weather.temp}&deg;</p>
          <p className="text-xs text-ink/60 mt-1.5 capitalize">{weather.description}</p>
          <p className="text-xs text-ink/40">Feels like {weather.feelsLike}&deg;</p>
        </div>
        <WeatherGlyph icon={weather.icon} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate/60">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ochre">High / Low</p>
          <p className="text-sm mt-0.5">
            {weather.tempMax}&deg; / {weather.tempMin}&deg;
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ochre">Humidity</p>
          <p className="text-sm mt-0.5">{weather.humidity}%</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ochre">Wind</p>
          <p className="text-sm mt-0.5">{weather.windSpeed} mph</p>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/35">McLean, VA</p>
        <p className="font-mono text-[10px] text-ink/35">{weather.observedAt}</p>
      </div>
    </Card>
  );
}
