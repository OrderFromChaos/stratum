import { T, FONT_FAMILY } from "./theme";

/* ─── Reusable input style ─── */
export const inputStyle = {
  width: "100%",
  background: T.bg,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  padding: "7px 10px",
  color: T.text,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

/* ─── Form label ─── */
export const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: T.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 4,
  display: "block",
};

/* ─── Floating panel container ─── */
export const panelStyle = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  fontFamily: FONT_FAMILY,
  color: T.text,
  boxShadow: "0 8px 30px #00000060",
};

/* ─── Select dropdown ─── */
export const selectStyle = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.text,
  padding: "5px 8px",
  fontSize: 11,
  fontFamily: "inherit",
  cursor: "pointer",
  outline: "none",
};

/* ─── Close button ─── */
export const closeBtnStyle = {
  background: "none",
  border: "none",
  color: T.textMuted,
  cursor: "pointer",
  padding: 0,
  lineHeight: 1,
};

/* ─── Toggle button factory ─── */
export const toggleBtnStyle = (active, color = T.accent) => ({
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 5,
  border: `1px solid ${active ? color : T.border}`,
  background: active ? color + "20" : "transparent",
  color: active ? color : T.textMuted,
  cursor: "pointer",
  fontFamily: "inherit",
});
