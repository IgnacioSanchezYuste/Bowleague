// Paleta de colores de la aplicación.
// Hay dos variantes: lightColors (modo claro) y darkColors (modo oscuro).
// Los componentes nunca usan hex directamente; siempre consumen colors.xxx
// a través del hook useTheme(), lo que hace el cambio de tema automático.

// Interfaz que deben cumplir ambas paletas para garantizar que todos los
// tokens de color existen en los dos temas.
export interface ThemeColors {
  primary: string;       // Color principal: botones, iconos clave (rojo)
  secondary: string;     // Color secundario: headers, texto de énfasis
  accent: string;        // Acento: trofeos, destacados (naranja dorado)
  background: string;    // Fondo general de las pantallas
  white: string;         // Fondo de tarjetas y modales (blanco en claro, oscuro en dark)
  text: string;          // Texto principal
  textLight: string;     // Texto secundario y placeholders
  border: string;        // Líneas separadoras
  success: string;       // Confirmaciones y estados activos
  danger: string;        // Errores y acciones destructivas
  gold: string;          // 1.er puesto en ranking
  silver: string;        // 2.º puesto en ranking
  bronze: string;        // 3.er puesto en ranking
  overlay: string;       // Fondo semitransparente de modales
  cardHighlight: string; // Fondo suave para tarjetas destacadas
  badgeOpen: string;     // Fondo del badge de estado "abierto"
  // Fondos de acento para iconos de sección (suaves en claro, semitransparentes en oscuro)
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
