// Generates a colored SVG with song title initials when album art is missing
const COVER_COLORS = [
  ['#1a1a2e', '#e94560'],
  ['#0f3460', '#a8dadc'],
  ['#533483', '#e2b4ff'],
  ['#2c003e', '#c77dff'],
  ['#0d7377', '#14ffec'],
  ['#132226', '#1ed760'],
  ['#1b1b2f', '#f5a623'],
  ['#2d132c', '#ee4540'],
  ['#1a472a', '#52b788'],
  ['#03045e', '#90e0ef'],
];

export const getInitialsCover = (title) => {
  const str = title || 'Song';
  const words = str.trim().split(/\s+/);
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : words[0].slice(0, 2).toUpperCase();
  const idx = (str.charCodeAt(0) || 0) % COVER_COLORS.length;
  const [bg, fg] = COVER_COLORS[idx];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="${fg}33"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="${bg}"/>
    <rect width="200" height="200" fill="url(#g)"/>
    <text x="100" y="122" font-family="system-ui,sans-serif" font-size="76" font-weight="800"
      fill="${fg}" text-anchor="middle" letter-spacing="3">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
