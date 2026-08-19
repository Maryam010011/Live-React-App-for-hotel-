/**
 * LuxeStay Design System — Color Palette
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTHORITATIVE SOURCE: Extracted EXACTLY from web app's index.css CSS variables
 * (e:\SprintX\React\live app\Live-React-App-for-hotel-\src\index.css)
 *
 * BEFORE → AFTER corrections:
 *   SECONDARY:     #d97706 (wrong amber)   → #d4a373 (--secondary-color, index.css:13)
 *   SECONDARY_LIGHT: #fef3c7 (wrong)       → #e6c9a8 (--secondary-light, index.css:14)
 *   TEXT_PRIMARY:  #0f172a (slate-900)     → #2d3436 (--text-primary, index.css:16)
 *   TEXT_SECONDARY:#64748b (slate-500)     → #636e72 (--text-secondary, index.css:17)
 *   TEXT_MUTED:    #94a3b8 (wrong)         → #b2bec3 (--text-light, index.css:18)
 *   BG_SECONDARY:  #f1f5f9 (slate-100)     → #f8f9fa (--bg-secondary, index.css:21)
 *   BG_HOVER:      #e2e8f0 (wrong)         → #e9ecef (--bg-hover, index.css:22)
 *   SUCCESS:       #166534 (wrong)         → #27ae60 (--success-color, index.css:24)
 *   ERROR:         #dc2626 (wrong)         → #e74c3c (--error-color, index.css:25)
 *   WARNING:       varies (wrong)          → #f39c12 (--warning-color, index.css:26)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const COLORS = {
  // ─── Primary Brand (index.css:10-12) ──────────────────────────────────────
  PRIMARY: '#1a5f7a',        // --primary-color  → header, hero, buttons, links
  PRIMARY_DARK: '#0f3d52',   // --primary-dark   → header gradient end, hover states
  PRIMARY_LIGHT: '#2c7fa3',  // --primary-light  → lighter accent
  PRIMARY_SURFACE: '#e0f2fe',// Light blue surface (not from vars but used in web card chips)
  PRIMARY_TINT: '#bae6fd',   // Light blue tint for borders

  // ─── Secondary / Elegant Gold (index.css:13-14) ───────────────────────────
  SECONDARY: '#d4a373',        // --secondary-color → badges, accents, CTA button fills
  SECONDARY_GOLD: '#d4a373',   // Alias for SECONDARY — used by hotel cards & detail screens
  SECONDARY_LIGHT: '#e6c9a8',  // --secondary-light → light tint for secondary elements
  SECONDARY_MUTED: '#e6c9a8',  // Alias for SECONDARY_LIGHT — used for muted gold text
  SECONDARY_DARK: '#b8895a',   // Derived darker shade for shadow/hover

  // ─── Rating Badge (AdminHotelList.css:169 .rating-pill) ───────────────────
  RATING_BG: '#fef3c7',      // Rating pill background
  RATING_TEXT: '#92400e',    // Rating pill text

  // ─── Dark Navigation Shades ───────────────────────────────────────────────
  // Header.css:2 → linear-gradient(135deg, #1a5f7a 0%, #0f3d52 100%)
  // Used for header, admin banners — derived from primary/primary-dark
  NAVY_DARK: '#0f172a',      // Slate-900 — hero title color (Home.css:67)
  NAVY_BORDER: '#334155',    // Slate-700 — field labels (Auth.css:107)

  // ─── Text Colors (index.css:16-18) ────────────────────────────────────────
  TEXT_PRIMARY: '#2d3436',   // --text-primary   → body text, headings
  TEXT_SECONDARY: '#636e72', // --text-secondary → subtitles, descriptions
  TEXT_MUTED: '#b2bec3',     // --text-light     → placeholders, helper text
  TEXT_DARK: '#334155',      // Field labels (Auth.css:107, Booking.css:117)

  // ─── Background Colors (index.css:20-22) ──────────────────────────────────
  BG_PRIMARY: '#ffffff',     // --bg-primary  → cards, modals, inputs
  BG_SECONDARY: '#f8f9fa',   // --bg-secondary → page background, table rows
  BG_PAGE: '#f8f9fa',        // Same as bg-secondary (body background)
  BG_HOVER: '#e9ecef',       // --bg-hover   → hover states, dividers
  WHITE: '#ffffff',
  TRANSPARENT: 'transparent',

  // ─── Status Colors (index.css:24-26) ──────────────────────────────────────
  SUCCESS: '#27ae60',        // --success-color
  SUCCESS_BG: '#d4edda',     // Derived light green surface
  SUCCESS_BORDER: '#c3e6cb', // Derived green border

  WARNING: '#f39c12',        // --warning-color
  WARNING_BG: '#fff3cd',     // Derived amber surface
  WARNING_BORDER: '#ffeeba', // Derived amber border

  ERROR: '#e74c3c',          // --error-color
  ERROR_BG: '#fef2f2',       // (Booking.css, Auth.css) error banner background
  ERROR_BORDER: '#fecaca',   // Error banner border (Auth.css:69)

  // ─── Borders & Dividers ───────────────────────────────────────────────────
  BORDER: '#e2e8f0',         // Used across HotelCard.css, Booking.css, AdminHotelList.css
  BORDER_STRONG: '#cbd5e1',  // Stronger border (Booking.css:125, AdminHotelList.css:72)

  // ─── Dark overlays (Home.css / HotelDetail hero) ──────────────────────────
  OVERLAY_HERO: 'rgba(15, 23, 42, 0.85)',
  OVERLAY_DARK: 'rgba(15, 23, 42, 0.75)',
  OVERLAY_CARD: 'rgba(15, 23, 42, 0.55)',
};
