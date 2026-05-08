import { useMemo } from "react";
import { T, STATUS_CONFIG, FONT_FAMILY } from "../theme";

export default function RightRail({
  nodes, edges, projects,
  selectedNodeId, onSelectNode,
  onFocusNode,
}) {
  /* ─── Compute graph entry points (no parents) + in-progress ─── */
  const nextUp = useMemo(() => {
    const hasParent = new Set(edges.map((e) => e.target));
    const entryPoints = nodes.filter(
      (n) => !hasParent.has(n.id) && n.data.status !== "done"
    );
    const inProgress = nodes.filter(
      (n) => n.data.status === "in-progress" && !entryPoints.includes(n)
    );
    // entry points first, then in-progress that's deeper in the graph
    return [...entryPoints, ...inProgress];
  }, [nodes, edges]);

  /* ─── Terminal goals: nodes with no outgoing edges ─── */
  const terminals = useMemo(() => {
    const hasChild = new Set(edges.map((e) => e.source));
    return nodes.filter(
      (n) => !hasChild.has(n.id) && n.data.status !== "done"
    );
  }, [nodes, edges]);

  return (
    <div style={{
      width: 260,
      background: T.surface,
      borderLeft: `1px solid ${T.border}`,
      fontFamily: FONT_FAMILY,
      color: T.text,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      flexShrink: 0,
    }}>
      <Section
        title="Next Up"
        subtitle="Entry points + in-progress"
        items={nextUp}
        emptyMsg="No active starting tasks"
        projects={projects}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
        onFocusNode={onFocusNode}
      />
      <Section
        title="Terminal Goals"
        subtitle="Tasks with no dependents"
        items={terminals}
        emptyMsg="No terminal tasks"
        projects={projects}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
        onFocusNode={onFocusNode}
      />
    </div>
  );
}

/* ─── Reusable list section ─── */
function Section({
  title, subtitle, items, emptyMsg,
  projects, selectedNodeId, onSelectNode, onFocusNode,
}) {
  return (
    <div style={{
      padding: "16px 14px",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.textMuted,
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: 2,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 10, color: T.textDim, marginBottom: 10,
      }}>
        {subtitle}
      </div>

      {items.length === 0 ? (
        <div style={{
          fontSize: 11, color: T.textDim, fontStyle: "italic",
          padding: "6px 0",
        }}>
          {emptyMsg}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((node) => (
            <TaskRow
              key={node.id}
              node={node}
              project={projects.find((p) => p.id === node.data.project)}
              selected={node.id === selectedNodeId}
              onSelect={() => onSelectNode(node.id)}
              onFocus={() => onFocusNode(node.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Compact task row ─── */
function TaskRow({ node, project, selected, onSelect, onFocus }) {
  const sc = STATUS_CONFIG[node.data.status] || STATUS_CONFIG.todo;
  const isUpstreamBlocked =
    node.data.propagatedBlocked && node.data.status !== "blocked";

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onFocus}
      title="Click to select • Double-click to focus on canvas"
      style={{
        padding: "6px 8px",
        borderRadius: 6,
        background: selected ? T.accentMuted : T.bg,
        border: `1px solid ${selected ? T.accent : T.border}40`,
        cursor: "pointer",
        transition: "background 0.1s, border-color 0.1s",
      }}
    >
      {/* project tag */}
      {project && (
        <div style={{
          fontSize: 9, fontWeight: 600, color: project.color,
          textTransform: "uppercase", letterSpacing: "0.05em",
          marginBottom: 2, display: "flex", alignItems: "center", gap: 3,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: project.color, display: "inline-block",
          }} />
          {project.name}
        </div>
      )}

      {/* title */}
      <div style={{
        fontSize: 12, fontWeight: 500, color: T.text,
        lineHeight: 1.3, marginBottom: 4,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {node.data.label}
      </div>

      {/* status badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{
          fontSize: 9, fontWeight: 600, color: sc.color,
          background: sc.bg, padding: "1px 6px", borderRadius: 3,
          border: `1px solid ${sc.color}30`,
        }}>
          {sc.label}
        </span>
        {isUpstreamBlocked && (
          <span style={{ fontSize: 9, color: T.red }}>⚠ blocked</span>
        )}
      </div>
    </div>
  );
}