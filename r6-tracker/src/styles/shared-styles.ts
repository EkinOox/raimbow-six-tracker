/**
 * Classes CSS réutilisables pour éviter la duplication de code
 */

// Gradients de fond
export const BACKGROUND_GRADIENTS = {
  primary: 'bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20',
  dark: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
  slate: 'bg-gradient-to-br from-slate-900 via-slate-800 to-black',
  darkBlue: 'bg-gradient-dark',
} as const;

// Effets Glass (Glassmorphism)
export const GLASS_EFFECTS = {
  card: 'bg-white/10 backdrop-blur-xl border border-white/20',
  cardHover: 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300',
  dark: 'bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark',
  button: 'bg-white/10 backdrop-blur-md border border-white/20',
  buttonHover: 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20',
} as const;

// Couleurs des sides (Attaquant/Défenseur)
export const SIDE_COLORS = {
  attacker: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    bgWithBorder: 'bg-orange-500/20 border-orange-500/30',
  },
  defender: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    bgWithBorder: 'bg-blue-500/20 border-blue-500/30',
  },
  ATK: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    bgWithBorder: 'bg-orange-500/20 border-orange-500/30',
  },
  DEF: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    bgWithBorder: 'bg-blue-500/20 border-blue-500/30',
  },
} as const;

// Boutons communs
export const BUTTON_STYLES = {
  primary: 'px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors',
  secondary: 'px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors',
  back: 'flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300',
  filter: 'text-blue-400 hover:text-blue-300 transition-colors flex items-center',
} as const;

// Inputs et formulaires
export const INPUT_STYLES = {
  text: 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500',
  select: 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
  search: 'w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
} as const;

// Cartes et conteneurs
export const CONTAINER_STYLES = {
  card: 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6',
  cardHover: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300',
  section: 'bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark rounded-2xl p-8',
  error: 'bg-red-500/20 border border-red-500/30 rounded-2xl p-6',
  success: 'bg-green-500/20 border border-green-500/30 rounded-2xl p-6',
  warning: 'bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6',
  info: 'bg-blue-500/20 border border-blue-500/30 rounded-2xl p-6',
} as const;

// Textes et typographie
export const TEXT_STYLES = {
  title: 'text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent',
  subtitle: 'text-xl text-gray-300 leading-relaxed',
  sectionTitle: 'text-2xl font-bold text-white',
  cardTitle: 'text-lg font-bold text-white',
  description: 'text-white/60 text-sm',
  muted: 'text-white/50 text-xs',
} as const;

// Loading states
export const LOADING_STYLES = {
  spinner: 'w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin',
  container: 'flex items-center justify-center py-12',
  text: 'flex items-center space-x-3 text-white/70',
} as const;

// Animations
export const MOTION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideInFromTop: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

/**
 * Fonctions utilitaires pour générer les classes dynamiquement
 */
export const getSideStyles = (side: 'attacker' | 'defender' | 'ATK' | 'DEF') => {
  return SIDE_COLORS[side] || SIDE_COLORS.defender;
};

export const getStatusStyles = (type: 'error' | 'success' | 'warning' | 'info') => {
  return CONTAINER_STYLES[type];
};
