import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  MarkerType, useReactFlow,
} from "@xyflow/react";

import { T, FONT_FAMILY } from "./theme";
import { newTaskId } from "./utils";
import { useBlockPropagation } from "./hooks/useBlockPropagation";
import { SEED_PROJECTS, SEED_NODES, SEED_EDGES } from "./data/seed";

import TaskNode from "./components/TaskNode";
import Sidebar from "./components/Sidebar";
import ProjectPanel from "./components/ProjectPanel";
import QuickAdd from "./components/QuickAdd";
import Toolbar from "./components/Toolbar";
import Legend from "./components/Legend";

const nodeTypes = { task: TaskNode };

export default function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const [projects, setProjects] = useState(SEED_PROJECTS);

  // Inject project list into seed data for initial render
  const initialNodes = useMemo(
    () => SEED_NODES.map((n) => ({ ...n, data: { ...n.data, projects } })),
    [] // only on mount
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(SEED_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [filterProject, setFilterProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  /* ─── Sync project list into all nodes ─── */
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, projects } }))
    );
  }, [projects, setNodes]);

  /* ─── BFS block propagation ─── */
  useBlockPropagation(nodes, edges, setNodes, setEdges);

  /* ─── Edge creation ─── */
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: T.accent },
            style: { stroke: T.accent, strokeWidth: 1.5 },
            animated: false,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  /* ─── Selection ─── */
  const onNodeClick = useCallback((_, node) => setSelectedNodeId(node.id), []);
  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  /* ─── Double-click to add ─── */
  const onDoubleClick = useCallback(
    (event) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const id = newTaskId();
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "task",
          position,
          data: {
            label: "New Task",
            status: "todo",
            priority: "medium",
            project: null,
            description: "",
            projects,
          },
        },
      ]);
      setSelectedNodeId(id);
    },
    [screenToFlowPosition, setNodes, projects]
  );

  /* ─── Quick add ─── */
  const onQuickAdd = useCallback(
    (title) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
      });
      const id = newTaskId();
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "task",
          position,
          data: {
            label: title,
            status: "todo",
            priority: "medium",
            project: filterProject || null,
            description: "",
            projects,
          },
        },
      ]);
    },
    [screenToFlowPosition, setNodes, projects, filterProject]
  );

  /* ─── Visibility filtering ─── */
  const visibleNodes = useMemo(() => {
    return nodes.map((n) => {
      let hidden = false;
      if (filterProject && n.data.project !== filterProject) hidden = true;
      if (filterStatus && n.data.status !== filterStatus) hidden = true;
      return { ...n, hidden };
    });
  }, [nodes, filterProject, filterStatus]);

  const visibleEdges = useMemo(() => {
    const hiddenIds = new Set(
      visibleNodes.filter((n) => n.hidden).map((n) => n.id)
    );
    return edges.map((e) => ({
      ...e,
      hidden: hiddenIds.has(e.source) || hiddenIds.has(e.target),
    }));
  }, [edges, visibleNodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div style={{
      display: "flex", width: "100vw", height: "100vh",
      background: T.bg, fontFamily: FONT_FAMILY,
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div ref={reactFlowWrapper} style={{ flex: 1, position: "relative" }}>
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDoubleClick={onDoubleClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
          style={{ background: T.bg }}
          deleteKeyCode={["Backspace", "Delete"]}
          multiSelectionKeyCode="Shift"
        >
          <Background color={T.textDim} gap={20} size={1} style={{ opacity: 0.3 }} />
          <Controls style={{
            borderRadius: 8, overflow: "hidden",
            border: `1px solid ${T.border}`,
          }} />
          <MiniMap
            nodeColor={(n) => {
              const pc = n.data?.project
                ? projects.find((p) => p.id === n.data.project)
                : null;
              return pc?.color || T.textDim;
            }}
            maskColor={T.bg + "cc"}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
            }}
          />
        </ReactFlow>

        <Toolbar
          onToggleProjects={() => setProjectsOpen((o) => !o)}
          projectsOpen={projectsOpen}
          filterProject={filterProject}
          setFilterProject={setFilterProject}
          projects={projects}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {projectsOpen && (
          <ProjectPanel
            projects={projects}
            setProjects={setProjects}
            onClose={() => setProjectsOpen(false)}
          />
        )}

        <Legend />
        <QuickAdd onAdd={onQuickAdd} />
      </div>

      {selectedNode && (
        <Sidebar
          selectedNode={selectedNode}
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          projects={projects}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
