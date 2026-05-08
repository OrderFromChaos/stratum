import { useState } from "react";
import { T, FONT_FAMILY } from "../theme";
import { exportToFile, importFromFile } from "../hooks/usePersistence";

export default function WorkspaceSwitcher({
  workspaces, activeId, onSelect,
  onCreate, onRename, onDelete,
  onExport, onImport,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const startEdit = (ws) => {
    setEditingId(ws.id);
    setEditValue(ws.name);
  };

  const commitEdit = () => {
    if (editValue.trim()) onRename(editingId, editValue.trim());
    setEditingId(null);
  };

  const commitCreate = () => {
    if (newName.trim()) onCreate(newName.trim());
    setNewName("");
    setCreating(false);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: T.surface,
      borderBottom: `1px solid ${T.border}`,
      padding: "6px 10px", gap: 4,
      fontFamily: FONT_FAMILY,
      flexShrink: 0,
    }}>
      {/* logo / title */}
      <span style={{
        fontSize: 13, fontWeight: 700, color: T.accent,
        marginRight: 12, paddingLeft: 4,
        letterSpacing: "0.02em",
      }}>
        ◆ Stratum
      </span>

      {/* workspace tabs */}
      <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => ws.id !== activeId && onSelect(ws.id)}
            onDoubleClick={() => startEdit(ws)}
            style={{
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: ws.id === activeId ? T.text : T.textMuted,
              background: ws.id === activeId ? T.bg : "transparent",
              border: `1px solid ${ws.id === activeId ? T.border : "transparent"}`,
              borderBottom: ws.id === activeId ? `1px solid ${T.bg}` : "none",
              borderRadius: "6px 6px 0 0",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              whiteSpace: "nowrap",
              userSelect: "none",
              position: "relative",
              top: 1,
            }}
          >
            {editingId === ws.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "transparent",
                  border: `1px solid ${T.accent}`,
                  borderRadius: 3,
                  color: T.text,
                  fontSize: 12,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  padding: "1px 4px",
                  width: 110,
                  outline: "none",
                }}
              />
            ) : (
              <>
                {ws.name}
                {workspaces.length > 1 && ws.id === activeId && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete workspace "${ws.name}"?`)) {
                        onDelete(ws.id);
                      }
                    }}
                    style={{
                      color: T.textDim, fontSize: 14,
                      lineHeight: 1, marginLeft: 4,
                      cursor: "pointer",
                    }}
                    title="Delete workspace"
                  >×</span>
                )}
              </>
            )}
          </div>
        ))}

        {/* new workspace */}
        {creating ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={commitCreate}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitCreate();
              if (e.key === "Escape") { setCreating(false); setNewName(""); }
            }}
            placeholder="Workspace name…"
            style={{
              background: T.bg,
              border: `1px solid ${T.accent}`,
              borderRadius: 4,
              color: T.text,
              fontSize: 12,
              fontFamily: "inherit",
              padding: "3px 8px",
              marginLeft: 4,
              width: 140,
              outline: "none",
            }}
          />
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{
              background: "transparent",
              border: "none",
              color: T.textMuted,
              fontSize: 14, fontWeight: 700,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            title="New workspace"
          >+</button>
        )}
      </div>

      {/* export/import */}
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={onImport} style={iconBtnStyle} title="Import from file">
          ↓ Import
        </button>
        <button onClick={onExport} style={iconBtnStyle} title="Export to file">
          ↑ Export
        </button>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: "transparent",
  border: `1px solid ${T.border}`,
  borderRadius: 5,
  color: T.textMuted,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};