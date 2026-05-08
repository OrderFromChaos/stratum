/* ─── Design Tokens ─── */
export const T = {
  bg: "#0e1117",
  surface: "#161b22",
  surfaceHover: "#1c2129",
  border: "#30363d",
  borderFocus: "#58a6ff",
  text: "#e6edf3",
  textMuted: "#8b949e",
  textDim: "#484f58",
  accent: "#58a6ff",
  accentMuted: "#1f6feb33",
  green: "#3fb950",
  greenMuted: "#23863620",
  orange: "#d29922",
  orangeMuted: "#bb800926",
  red: "#f85149",
  redMuted: "#f8514920",
  purple: "#bc8cff",
  purpleMuted: "#bc8cff20",
};

export const STATUS_CONFIG = {
  todo: { label: "To Do", color: T.textMuted, bg: T.surface },
  "in-progress": { label: "In Progress", color: T.orange, bg: T.orangeMuted },
  blocked: { label: "Blocked", color: T.red, bg: T.redMuted },
  done: { label: "Done", color: T.green, bg: T.greenMuted },
};

export const PRIORITY_CONFIG = {
  low: { label: "Low", color: T.textMuted },
  medium: { label: "Med", color: T.orange },
  high: { label: "High", color: T.red },
};

export const PROJECT_COLORS = [
  "#58a6ff", "#3fb950", "#d29922", "#f85149",
  "#bc8cff", "#f778ba", "#79c0ff", "#56d364",
];

export const FONT_FAMILY = "'IBM Plex Sans', 'SF Pro Text', system-ui, sans-serif";
