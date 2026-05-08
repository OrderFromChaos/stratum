import { useState, useRef } from "react";
import { T, FONT_FAMILY } from "../theme";
import { panelStyle } from "../styles";

export default function QuickAdd({ onAdd }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div style={{
      ...panelStyle,
      position: "absolute", bottom: 16, left: "50%",
      transform: "translateX(-50%)",
      display: "flex", gap: 8,
      padding: "8px 12px", zIndex: 50, minWidth: 340,
    }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Quick add task… (Enter to create)"
        style={{
          flex: 1, background: "transparent", border: "none",
          color: T.text, fontSize: 13, fontFamily: FONT_FAMILY,
          outline: "none",
        }}
      />
      <button onClick={submit} style={{
        background: T.accent, border: "none", borderRadius: 6,
        color: "#fff", padding: "6px 14px", fontSize: 12,
        fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      }}>Add</button>
    </div>
  );
}
