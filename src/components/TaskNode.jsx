import { Handle, Position } from "@xyflow/react";
import { T, STATUS_CONFIG, FONT_FAMILY } from "../theme";

export default function TaskNode({ id, data, selected }) {
  const sc = STATUS_CONFIG[data.status] || STATUS_CONFIG.todo;
  const pc = data.project
    ? data.projects?.find((p) => p.id === data.project)
    : null;
  const isUpstreamBlocked =
    data.propagatedBlocked &&
    data.status !== "done" &&
    data.status !== "blocked";

  const borderColor = selected
    ? T.accent
    : isUpstreamBlocked || data.status === "blocked"
      ? T.red + "80"
      : T.border;

  return (
    <div
      style={{
        background: T.surface,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: "10px 14px",
        minWidth: 180,
        maxWidth: 260,
        fontFamily: FONT_FAMILY,
        color: T.text,
        boxShadow: selected
          ? `0 0 0 2px ${T.accent}40, 0 4px 20px #00000060`
          : "0 2px 10px #00000040",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: T.accent,
          border: `2px solid ${T.surface}`,
          width: 10, height: 10, top: -5,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: T.green,
          border: `2px solid ${T.surface}`,
          width: 10, height: 10, bottom: -5,
        }}
      />

      {/* project tag */}
      {pc && (
        <div style={{
          fontSize: 10, fontWeight: 600, color: pc.color,
          textTransform: "uppercase", letterSpacing: "0.05em",
          marginBottom: 4, display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: pc.color, display: "inline-block",
          }} />
          {pc.name}
        </div>
      )}

      {/* title */}
      <div style={{
        fontSize: 13, fontWeight: 600, lineHeight: 1.35,
        marginBottom: 6, wordBreak: "break-word",
      }}>
        {data.label}
      </div>

      {/* meta row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: 10, fontWeight: 600, color: sc.color,
          background: sc.bg, padding: "2px 7px", borderRadius: 4,
          border: `1px solid ${sc.color}30`,
        }}>
          {sc.label}
        </span>

        {isUpstreamBlocked && (
          <span style={{ fontSize: 10, color: T.red }}>⚠ blocked upstream</span>
        )}
      </div>

      {/* description */}
      {data.description && (
        <div style={{
          fontSize: 11, color: T.textMuted, marginTop: 6,
          lineHeight: 1.4, maxHeight: 40, overflow: "hidden",
        }}>
          {data.description}
        </div>
      )}
    </div>
  );
}