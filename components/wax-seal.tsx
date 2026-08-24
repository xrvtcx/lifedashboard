// A rustic wax-seal graphic in dark burgundy, stamped with an R.
// Pure SVG (no image asset) — texture comes from filter primitives, and the
// silhouette is a hand-plotted irregular blob with drips, so it reads as
// pressed wax rather than a circular logo badge.

export function WaxSeal({
  size = 44,
  className,
  id = 'seal',
}: {
  size?: number;
  className?: string;
  // SVG filter/gradient ids are document-global; pass a distinct id if two
  // seals ever render on the same page, or the second reuses the first's fill.
  id?: string;
}) {
  // Deliberately lopsided: wax squeezes out unevenly under the die, so no two
  // lobes match and the lower-right carries a heavier spill.
  const blob = `
    M50 4
    C58 3 65 6 72 10
    C80 14 88 18 92 26
    C96 34 95 42 94 50
    C93 58 96 65 93 72
    C90 80 83 85 76 90
    C69 95 60 98 51 97
    C42 96 34 93 27 88
    C19 83 11 78 8 70
    C5 62 7 54 6 46
    C5 37 5 28 11 21
    C17 14 25 9 33 6
    C38 4 44 4 50 4
    Z`;

  // Small squeeze-out lobes and a drip, drawn as separate shapes so they can
  // sit slightly outside the main body.
  const spills = (
    <>
      <ellipse cx="90" cy="63" rx="7" ry="5" transform="rotate(-18 90 63)" />
      <ellipse cx="17" cy="34" rx="5.5" ry="4" transform="rotate(24 17 34)" />
      <ellipse cx="63" cy="96" rx="6" ry="4" transform="rotate(8 63 96)" />
      <ellipse cx="34" cy="8" rx="5" ry="3.5" transform="rotate(-12 34 8)" />
    </>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 108"
      className={className}
      role="img"
      aria-label="Wax seal monogram R"
    >
      <defs>
        {/* Roughens every edge so the silhouette never reads as a clean curve */}
        <filter id={`${id}-rough`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Mottled grain across the wax surface */}
        <filter id={`${id}-grain`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" result="g" />
          <feColorMatrix
            in="g"
            type="matrix"
            values="0 0 0 0 0.16  0 0 0 0 0.05  0 0 0 0 0.08  0 0 0 0.5 0"
          />
        </filter>

        <radialGradient id={`${id}-fill`} cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#94293A" />
          <stop offset="42%" stopColor="#7A1F2B" />
          <stop offset="78%" stopColor="#571520" />
          <stop offset="100%" stopColor="#330B13" />
        </radialGradient>

        {/* Darkens the rim so the disc looks domed */}
        <radialGradient id={`${id}-depth`} cx="50%" cy="47%" r="55%">
          <stop offset="62%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#240709" stopOpacity="0.7" />
        </radialGradient>

        {/* Confines the grain wash to the wax body */}
        <clipPath id={`${id}-clip`}>
          <path d={blob} />
          {spills}
        </clipPath>
      </defs>

      <g filter={`url(#${id}-rough)`}>
        {/* Cast shadow, offset down-right */}
        <g transform="translate(1.5,2.5)" opacity="0.28">
          <path d={blob} fill="#2A0509" />
          <g fill="#2A0509">{spills}</g>
        </g>

        <path d={blob} fill={`url(#${id}-fill)`} />
        <g fill={`url(#${id}-fill)`}>{spills}</g>

        <g clipPath={`url(#${id}-clip)`}>
          <rect x="0" y="0" width="100" height="108" filter={`url(#${id}-grain)`} opacity="0.55" />
          <path d={blob} fill={`url(#${id}-depth)`} />
        </g>

        {/* Impressed die ring — off-center and not quite closed, as a real
            stamp lands slightly crooked */}
        <ellipse
          cx="50"
          cy="49"
          rx="34"
          ry="33"
          transform="rotate(-4 50 49)"
          fill="none"
          stroke="#2A0509"
          strokeOpacity="0.45"
          strokeWidth="2"
          strokeDasharray="180 8 26 5"
        />
        <ellipse
          cx="50"
          cy="47.6"
          rx="34"
          ry="33"
          transform="rotate(-4 50 49)"
          fill="none"
          stroke="#D9A9AF"
          strokeOpacity="0.16"
          strokeWidth="0.9"
          strokeDasharray="180 8 26 5"
        />

        {/* Monogram: dark press-shadow under, pale catch-light above */}
        <g transform="rotate(-3 50 50)">
          <text
            x="50.8"
            y="51.4"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-display), Georgia, serif"
            fontSize="44"
            fontWeight="700"
            fill="#26070C"
            fillOpacity="0.62"
          >
            R
          </text>
          <text
            x="49.3"
            y="49.4"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-display), Georgia, serif"
            fontSize="44"
            fontWeight="700"
            fill="#E0AEB4"
            fillOpacity="0.3"
          >
            R
          </text>
        </g>

        {/* Specular sheen on the upper-left shoulder */}
        <path
          d="M20 30 C25 19 34 11 46 7"
          fill="none"
          stroke="#EFC3C8"
          strokeOpacity="0.26"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M78 82 C84 76 88 68 90 60"
          fill="none"
          stroke="#EFC3C8"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
