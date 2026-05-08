import { T, STATUS_CONFIG } from "../theme";
import { selectStyle } from "../styles";

export default function Toolbar({
  onToggleProjects, projectsOpen,
  filterProject, setFilterProject, projects,
  filterStatus, setFilterStatus,
}) {
  const btnStyle = (active) => ({
    background: active ? T.accentMuted : "transparent",
    border: `1px solid ${active ? T.accent : T.border}`,
    borderRadius: 6,
    color: active ? T.accent : T.textMuted,
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  });

  return (
    <div style={{
      position: "absolute", top: 12, left: 12,
      display: "flex", gap: 6, zIndex: 50,
      flexWrap: "wrap", alignItems: "center",
    }}>
      <button onClick={onToggleProjects} style={btnStyle(projectsOpen)}>
        ◆ Projects
      </button>

      <select
        value={filterProject || ""}
        onChange={(e) => setFilterProject(e.target.value || null)}
        style={selectStyle}
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        value={filterStatus || ""}
        onChange={(e) => setFilterStatus(e.target.value || null)}
        style={selectStyle}
      >
        <option value="">All Statuses</option>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>{cfg.label}</option>
        ))}
      </select>
    </div>
  );
}
