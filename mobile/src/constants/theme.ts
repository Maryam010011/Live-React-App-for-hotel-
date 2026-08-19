/**
 * LuxeStay Design System — Spacing, Typography, Radii & Elevation
 * Audited from web application CSS and adapted for mobile device density
 */
export const SPACING = {
  XXS: 2,
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 40,
};

export const FONT_SIZE = {
  CAPTION: 11,
  BODY_SMALL: 13,
  BODY_MEDIUM: 14,
  BODY_LARGE: 16,
  H4: 18,
  H3: 20,
  H2: 24,
  H1: 28,
  HERO: 32,
};

export const BORDER_RADIUS = {
  XS: 4,
  SM: 6,
  MD: 10,
  LG: 16,
  XL: 20,
  XXL: 24,
  ROUND: 9999,
};

export const SHADOWS = {
  NONE: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  SM: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  MD: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  LG: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  PRIMARY_GLOW: {
    shadowColor: '#1a5f7a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  GOLD_GLOW: {
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};
