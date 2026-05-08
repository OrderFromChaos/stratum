import { T, STATUS_CONFIG, PRIORITY_CONFIG, FONT_FAMILY } from "../theme";
import { inputStyle, labelStyle, closeBtnStyle, toggleBtnStyle } from "../styles";

export default function Sidebar({
  selectedNode, nodes, edges, setNodes, setEdges,
  projects, onClose,
}) {
  const data = selectedNode?.data;
  if (!data) return null;

  const update = (field, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, [field]: value } }
          : n
      )
    );
  };

  const deleteTask = () => {
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      )
    );
    onClose();
  };

  const deps = edges
    .filter((e) => e.target === selectedNode.id)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter(Boolean);

  const dependents = edges
    .filter((e) => e.source === selectedNode.id)
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter(Boolean);

  return (
    <div style={{
      width: 300, background: T.surface,
      borderLeft: `1px solid ${T.border}`,
      padding: "20px 16px", overflowY: "auto",
      fontFamily: FONT_FAMILY, color: T.text,
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>Edit Task</span>
        <button onClick={onClose} style={{ ...closeBtnStyle, fontSize: 18 }}>✕</button>
      </div>

      {/* title */}
      <div>
        <label style={labelStyle}>Title</label>
        <input
          value={data.label}
          onChange={(e) => update("label", e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={data.description || ""}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* status */}
      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => update("status", key)}
              style={{
                ...toggleBtnStyle(data.status === key, cfg.color),
                background: data.status === key
                  ? (cfg.bg || cfg.color + "20")
                  : "transparent",
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* priority */}
      <div>
        <label style={labelStyle}>Priority</label>
        <div style={{ display: "flex", gap: 4 }}>
          {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => update("priority", key)}
              style={toggleBtnStyle(data.priority === key, cfg.color)}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* project */}
      <div>
        <label style={labelStyle}>Project</label>
        <select
          value={data.project || ""}
          onChange={(e) => update("project", e.target.value || null)}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* dependency lists */}
      <DependencyList label="Blocked By" items={deps} prefix="↑" />
      <DependencyList label="Blocks" items={dependents} prefix="↓" />

      <div style={{ flex: 1 }} />

      {/* delete */}
      <button
        onClick={deleteTask}
        style={{
          padding: "8px 0", fontSize: 12, fontWeight: 600,
          borderRadius: 6, border: `1px solid ${T.red}40`,
          background: T.redMuted, color: T.red,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        Delete Task
      </button>
    </div>
  );
}

/* ─── Small sub-component for dep lists ─── */
function DependencyList({ label, items, prefix }) {
  if (items.length === 0) return null;

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((d) => (
          <span key={d.id} style={{
            fontSize: 12, color: T.text, padding: "3px 8px",
            background: T.bg, borderRadius: 4,
          }}>
            {prefix} {d.data.label}
          </span>
        ))}
      </div>
    </div>
  );
}
