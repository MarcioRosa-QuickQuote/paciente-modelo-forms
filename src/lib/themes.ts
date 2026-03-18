export interface Theme {
  id: string;
  name: string;
  preview: string[]; // gradient colors for preview swatch
  primary: string;
  primaryHover: string;
  gradientFrom: string;
  gradientTo: string;
  gradientVia?: string;
  accent: string;
  accentLight: string;
  iconBg: string;
  progressFrom: string;
  progressTo: string;
  yesBtn: string;
  yesBtnHover: string;
}

export const THEMES: Record<string, Theme> = {
  purple: {
    id: 'purple',
    name: 'Roxo & Rosa',
    preview: ['#7c3aed', '#ec4899'],
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    gradientFrom: '#7c3aed',
    gradientTo: '#ec4899',
    gradientVia: '#ec4899',
    accent: '#7c3aed',
    accentLight: 'rgba(124, 58, 237, 0.1)',
    iconBg: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    progressFrom: '#7c3aed',
    progressTo: '#ec4899',
    yesBtn: 'linear-gradient(to right, #7c3aed, #ec4899)',
    yesBtnHover: 'linear-gradient(to right, #6d28d9, #db2777)',
  },
  rose: {
    id: 'rose',
    name: 'Bordô & Rose',
    preview: ['#6B1C3A', '#e11d48'],
    primary: '#6B1C3A',
    primaryHover: '#5A1731',
    gradientFrom: '#6B1C3A',
    gradientTo: '#e11d48',
    accent: '#6B1C3A',
    accentLight: 'rgba(107, 28, 58, 0.1)',
    iconBg: 'linear-gradient(135deg, #6B1C3A, #e11d48)',
    progressFrom: '#6B1C3A',
    progressTo: '#e11d48',
    yesBtn: 'linear-gradient(to right, #6B1C3A, #e11d48)',
    yesBtnHover: 'linear-gradient(to right, #5A1731, #be123c)',
  },
  blue: {
    id: 'blue',
    name: 'Azul & Ciano',
    preview: ['#2563eb', '#06b6d4'],
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    gradientFrom: '#2563eb',
    gradientTo: '#06b6d4',
    accent: '#2563eb',
    accentLight: 'rgba(37, 99, 235, 0.1)',
    iconBg: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    progressFrom: '#2563eb',
    progressTo: '#06b6d4',
    yesBtn: 'linear-gradient(to right, #2563eb, #06b6d4)',
    yesBtnHover: 'linear-gradient(to right, #1d4ed8, #0891b2)',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde & Esmeralda',
    preview: ['#059669', '#10b981'],
    primary: '#059669',
    primaryHover: '#047857',
    gradientFrom: '#059669',
    gradientTo: '#10b981',
    accent: '#059669',
    accentLight: 'rgba(5, 150, 105, 0.1)',
    iconBg: 'linear-gradient(135deg, #059669, #10b981)',
    progressFrom: '#059669',
    progressTo: '#10b981',
    yesBtn: 'linear-gradient(to right, #059669, #10b981)',
    yesBtnHover: 'linear-gradient(to right, #047857, #059669)',
  },
  orange: {
    id: 'orange',
    name: 'Laranja & Âmbar',
    preview: ['#ea580c', '#f59e0b'],
    primary: '#ea580c',
    primaryHover: '#c2410c',
    gradientFrom: '#ea580c',
    gradientTo: '#f59e0b',
    accent: '#ea580c',
    accentLight: 'rgba(234, 88, 12, 0.1)',
    iconBg: 'linear-gradient(135deg, #ea580c, #f59e0b)',
    progressFrom: '#ea580c',
    progressTo: '#f59e0b',
    yesBtn: 'linear-gradient(to right, #ea580c, #f59e0b)',
    yesBtnHover: 'linear-gradient(to right, #c2410c, #d97706)',
  },
  gold: {
    id: 'gold',
    name: 'Dourado & Luxo',
    preview: ['#92400e', '#d4a843'],
    primary: '#92400e',
    primaryHover: '#78350f',
    gradientFrom: '#92400e',
    gradientTo: '#d4a843',
    accent: '#92400e',
    accentLight: 'rgba(146, 64, 14, 0.1)',
    iconBg: 'linear-gradient(135deg, #92400e, #d4a843)',
    progressFrom: '#92400e',
    progressTo: '#d4a843',
    yesBtn: 'linear-gradient(to right, #92400e, #d4a843)',
    yesBtnHover: 'linear-gradient(to right, #78350f, #b8942e)',
  },
  pink: {
    id: 'pink',
    name: 'Pink & Fúcsia',
    preview: ['#db2777', '#f472b6'],
    primary: '#db2777',
    primaryHover: '#be185d',
    gradientFrom: '#db2777',
    gradientTo: '#f472b6',
    accent: '#db2777',
    accentLight: 'rgba(219, 39, 119, 0.1)',
    iconBg: 'linear-gradient(135deg, #db2777, #f472b6)',
    progressFrom: '#db2777',
    progressTo: '#f472b6',
    yesBtn: 'linear-gradient(to right, #db2777, #f472b6)',
    yesBtnHover: 'linear-gradient(to right, #be185d, #ec4899)',
  },
  dark: {
    id: 'dark',
    name: 'Escuro & Elegante',
    preview: ['#1e293b', '#475569'],
    primary: '#1e293b',
    primaryHover: '#0f172a',
    gradientFrom: '#1e293b',
    gradientTo: '#475569',
    accent: '#1e293b',
    accentLight: 'rgba(30, 41, 59, 0.1)',
    iconBg: 'linear-gradient(135deg, #1e293b, #475569)',
    progressFrom: '#1e293b',
    progressTo: '#475569',
    yesBtn: 'linear-gradient(to right, #1e293b, #475569)',
    yesBtnHover: 'linear-gradient(to right, #0f172a, #334155)',
  },
};

export function getTheme(themeId?: string): Theme {
  return THEMES[themeId || 'purple'] || THEMES.purple;
}
