import { useState } from "react";
import { T, PROJECT_COLORS } from "../theme";
import { newProjectId } from "../utils";
import { inputStyle, panelStyle, closeBtnStyle } from "../styles";

export default function ProjectPanel({ projects, setProjects, onClose }) {
  const [newName, setNewName] = useState("");

  const addProject = () => {
    if (!newName.trim()) return;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    setProjects((prev) => [
      ...prev,
      { id: newProjectId(), name: newName.trim(), color },
    ]);
    setNewName("");
  };

  const removeProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{
      ...panelStyle,
      position: "absolute", top: 60, left: 16,
      width: 260, padding: 16, zIndex: 100,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Projects</span>
        <button onClick={onClose} style={{ ...closeBtnStyle, fontSize: 16 }}>✕</button>
      </div>

      {projects.map((p) => (
        <div key={p.id} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 0", borderBottom: `1px solid ${T.border}20`,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: p.color, flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, flex: 1 }}>{p.name}</span>
          <button onClick={() => removeProject(p.id)} style={{
            background: "none", border: "none", color: T.textDim,
            cursor: "pointer", fontSize: 14, padding: 0,
          }}>×</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addProject()}
          placeholder="New project…"
          style={{ ...inputStyle, flex: 1, width: "auto" }}
        />
        <button onClick={addProject} style={{
          background: T.accent, border: "none", borderRadius: 6,
          color: "#fff", padding: "0 12px", fontSize: 16,
          cursor: "pointer", fontWeight: 700,
        }}>+</button>
      </div>
    </div>
  );
}
