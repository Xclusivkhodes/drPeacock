/**
 * Plain-JS mirror of the color tokens defined in global.css's @theme block.
 * Needed for AGENTS.md's StyleSheet-exception cases (shadows, SafeAreaView,
 * Modal backgrounds, etc.) that can't read NativeWind/Tailwind classes.
 */
export const Colors = {
  primary: "#1565C0",
  primaryDark: "#0D47A1",
  accentTeal: "#26A69A",

  bgPage: "#E8EEF6",
  bgCard: "#FFFFFF",
  bgCardAlt: "#F5F7FA",
  chipInactive: "#F0F3F8",

  success: "#43A047",
  successDark: "#2E7D32",
  danger: "#E53935",
  dangerDark: "#C62828",
  warning: "#FFB300",
  warningDark: "#96650B",
  infoBg: "#E0F2F1",
  infoText: "#00695C",
} as const;

export const Radius = {
  card: 20,
  chip: 14,
  pill: 99,
} as const;
