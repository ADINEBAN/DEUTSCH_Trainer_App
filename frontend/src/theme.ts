// Liquid Glass theme — inspired by 3D glossy jelly glass, refractive caustics, and specular highlights.
export const colors = {
  // Base backdrop
  sky: '#EBF3FA',
  skyDeep: '#D5E6F6',
  skyLight: '#F3F8FC',

  // Liquid glass surfaces (translucent & crystalline)
  glass: 'rgba(255, 255, 255, 0.08)',
  glassClear: 'rgba(255, 255, 255, 0.05)',
  glassStrong: 'rgba(255, 255, 255, 0.18)',
  glassUltra: 'rgba(255, 255, 255, 0.28)',
  glassSubtle: 'rgba(255, 255, 255, 0.04)',

  // Specular borders & highlights
  glassBorder: 'rgba(255, 255, 255, 0.65)',
  glassBorderHighlight: 'rgba(255, 255, 255, 0.95)',
  glassBorderShadow: 'rgba(255, 255, 255, 0.35)',
  glassHighlight: 'rgba(255, 255, 255, 0.85)',
  glassSpecular: 'rgba(255, 255, 255, 0.95)',
  glassPrism: 'rgba(186, 230, 253, 0.65)',

  // Brand & Accent colors
  primary: '#1D7FE0',
  primaryDark: '#0F5FB8',
  primaryLight: '#52A7FC',
  primarySoft: 'rgba(29, 127, 224, 0.12)',

  teal: '#10B981',
  tealDark: '#059669',
  tealSoft: 'rgba(16, 185, 129, 0.12)',

  orange: '#FF6B2B',
  orangeDark: '#E05316',
  orangeSoft: 'rgba(255, 107, 43, 0.14)',

  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  purpleSoft: 'rgba(139, 92, 246, 0.14)',

  rose: '#F43F5E',
  roseSoft: 'rgba(244, 63, 94, 0.14)',

  ink: '#102A43',
  inkSoft: '#334E68',
  inkMuted: '#627D98',
  line: 'rgba(16, 42, 67, 0.08)',
  white: '#FFFFFF',

  // Status colors
  success: '#10B981',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
};

// Liquid color gradient stops
export const liquidGradients = {
  // Vibrant warm amber liquid (like "Start project" button in reference)
  amber: ['#FF7A3D', '#FFA742', '#FF5B22'] as const,
  amberCaustic: '#FF6B00',

  // Ocean cyan liquid
  ocean: ['#38BDF8', '#1D7FE0', '#0F5FB8'] as const,
  oceanCaustic: '#0284C7',

  // Mint / emerald liquid (like toggle switch in reference)
  emerald: ['#34D399', '#10B981', '#059669'] as const,
  emeraldCaustic: '#10B981',

  // Violet jewel liquid
  violet: ['#C084FC', '#8B5CF6', '#6D28D9'] as const,
  violetCaustic: '#8B5CF6',

  // Clear liquid glass
  clear: ['rgba(255,255,255,0.42)', 'rgba(240,246,255,0.14)'] as const,

  // Specular top highlight curve
  specularMeniscus: [
    'rgba(255, 255, 255, 0.85)',
    'rgba(255, 255, 255, 0.35)',
    'rgba(255, 255, 255, 0.0)',
  ] as const,

  // Prismatic caustics edge
  prismRainbow: ['rgba(255, 150, 150, 0.4)', 'rgba(255, 220, 120, 0.5)', 'rgba(130, 240, 255, 0.6)'] as const,
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 12, md: 16, lg: 24, xl: 32, pill: 9999 };

// Refractive 3D Shadows & Caustics
export const shadow = {
  shadowColor: '#102A43',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 3 },
} as const;

export const liquidShadow = {
  plate: {
    shadowColor: '#2B4360',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  card: {
    shadowColor: '#102A43',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonAmber: {
    shadowColor: '#FF6B00',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonBlue: {
    shadowColor: '#1D7FE0',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonTeal: {
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  buttonClear: {
    shadowColor: '#38BDF8',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonDanger: {
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
} as const;

export const glassCard = {
  backgroundColor: colors.glass,
  borderColor: colors.glassBorder,
  borderWidth: 1.2,
  borderRadius: radius.lg,
  ...liquidShadow.card,
} as const;
