export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  white: string;
  text: string;
  textLight: string;
  border: string;
  success: string;
  danger: string;
  gold: string;
  silver: string;
  bronze: string;
  overlay: string;
  cardHighlight: string;
  badgeOpen: string;
  accentBgWarm: string;
  accentBgRed: string;
  accentBgOrange: string;
  accentBgBlue: string;
  accentBgPurple: string;
}

export const lightColors: ThemeColors = {
  primary: '#E74C3C',
  secondary: '#2C3E50',
  accent: '#F39C12',
  background: '#F5F6FA',
  white: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  border: '#DFE6E9',
  success: '#27AE60',
  danger: '#E74C3C',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  overlay: 'rgba(0,0,0,0.5)',
  cardHighlight: '#FFF8E7',
  badgeOpen: '#E8F8F0',
  accentBgWarm: '#FFF8E7',
  accentBgRed: '#FDEAEA',
  accentBgOrange: '#FDF2E9',
  accentBgBlue: '#EBF5FB',
  accentBgPurple: '#F5EEF8',
};

export const darkColors: ThemeColors = {
  primary: '#E74C3C',
  secondary: '#8FA3B0',
  accent: '#F39C12',
  background: '#0F1123',
  white: '#1A1D36',
  text: '#E8ECF1',
  textLight: '#8B92A8',
  border: '#282D47',
  success: '#2ECC71',
  danger: '#E74C3C',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  overlay: 'rgba(0,0,0,0.7)',
  cardHighlight: 'rgba(255, 215, 0, 0.08)',
  badgeOpen: 'rgba(46, 204, 113, 0.15)',
  accentBgWarm: 'rgba(243, 156, 18, 0.15)',
  accentBgRed: 'rgba(231, 76, 60, 0.15)',
  accentBgOrange: 'rgba(230, 126, 34, 0.15)',
  accentBgBlue: 'rgba(52, 152, 219, 0.15)',
  accentBgPurple: 'rgba(142, 68, 173, 0.15)',
};

const Colors = lightColors;
export default Colors;
