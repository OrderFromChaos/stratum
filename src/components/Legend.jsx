import { T } from "../theme";
import { panelStyle } from "../styles";

export default function Legend() {
  return (
    <div style={{
      ...panelStyle,
      position: "absolute", top: 12, right: 12,
      padding: "8px 12px", fontSize: 10,
      color: T.textMuted, zIndex: 50,
      display: "flex", flexDirection: "column", gap: 3,
      borderRadius: 8,
    }}>
      <span style={{ fontWeight: 700, color: T.textDim, marginBottom: 2 }}>
        TIPS
      </span>
      <span><span style={{ color: T.accent }}>●</span> Top handle = depends on</span>
      <span><span style={{ color: T.green }}>●</span> Bottom handle = blocks</span>
      <span style={{ color: T.textDim, marginTop: 3 }}>Drag handle → handle to link</span>
      <span style={{ color: T.textDim }}>Double-click canvas to add task</span>
      <span style={{ color: T.textDim }}>Click edge + Delete to remove</span>
      <span style={{ color: T.textDim }}>Right-click edge to delete</span>
    </div>
  );
}
