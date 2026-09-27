import { useTheme } from '@/context/ThemeContext';

/** Recharts needs concrete colours (SVG attributes can't read CSS variables reliably). */
export function useChartTheme() {
  const dark = useTheme().theme === 'dark';
  return {
    experimental: dark ? '#4ac48b' : '#1f8a5b',
    control: dark ? '#92a2b5' : '#748496',
    signal: dark ? '#e8aa46' : '#b87812',
    humidity: dark ? '#6fb3d9' : '#3b82b0',
    grid: dark ? '#263a33' : '#e3ebe6',
    axis: dark ? '#96aca2' : '#586e65',
    tooltipBg: dark ? '#14201c' : '#ffffff',
    tooltipBorder: dark ? '#2c443b' : '#dae4de',
    ink: dark ? '#e2eee7' : '#113228',
  };
}
