// ─── Paleta oficial da marca (tema único, sempre escuro) ──────────────────────
export const brandColors = {
  // Fundos e superfícies
  background:    '#0A0519',              // Navy — fundo de todas as telas
  card:          '#140D28',              // Superfície elevada (cards, modais)
  cardAlt:       '#1C1535',             // Superfície alternativa
  darkCard:      '#0A0519',

  // Texto
  text:          '#F5F4F8',             // Primário
  textSecondary: 'rgba(255,255,255,0.38)',  // Secundário / placeholder
  textLight:     '#F5F4F8',

  // Marca: Laranja — ação e identidade
  primary:       '#ED7921',
  primaryDark:   '#ED7921',

  // Marca: Azul — suporte e informação
  secondary:     '#1287AF',
  secondaryDark: '#1287AF',
  accent:        '#1287AF',

  navy:          '#0A0519',

  // Bordas e campos
  border:        'rgba(18,135,175,0.20)',   // Borda padrão (cards, headers)
  inputBg:       'rgba(18,135,175,0.08)',   // Background de inputs
  divider:       'rgba(18,135,175,0.15)',   // Dividers

  overlay:       'rgba(10,5,25,0.90)',

  // Estados
  success: '#22C55E',
  warning: '#F59E0B',
  danger:  '#FF453A',

  // Neutros
  white:     '#FFFFFF',
  black:     '#0A0519',                    // Texto sobre fundo laranja (botão primário)
  gray:      'rgba(255,255,255,0.38)',
  grayLight: 'rgba(255,255,255,0.30)',     // Elementos inativos (30% opacidade)
  grayDark:  'rgba(255,255,255,0.60)',
  premium:   '#ED7921',
};

// Compatibilidade com o sistema existente de light/dark — ambos apontam para a paleta da marca
export const lightColors = brandColors;
export const darkColors  = brandColors;

export type AppColors = typeof brandColors;

// ─── Estáticos (independem do tema) ───────────────────────────────────────────
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1:      { fontSize: 34, fontWeight: '700' as const, lineHeight: 40 },
  h2:      { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h3:      { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  body:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  small:   { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

export const shadow = {
  sm: {
    shadowColor: '#0A0519',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0A0519',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A0519',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.60,
    shadowRadius: 24,
    elevation: 8,
  },
};

// ─── Export legado (mantido para não quebrar imports diretos de `theme.colors`) ─
export const theme = {
  colors: brandColors,
  spacing,
  borderRadius,
  typography,
  shadow,
};
