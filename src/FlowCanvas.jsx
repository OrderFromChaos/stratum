import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  MarkerType, useReactFlow,
} from "@xyflow/react";

import { T, FONT_FAMILY } from "./theme";
import { newTaskId, newEdgeId } from "./utils";
import { useBlockPropagation } from "./hooks/useBlockPropagation";

import TaskNode from "./components/TaskNode";
import Sidebar from "./components/Sidebar";
import ProjectPanel from "./components/ProjectPanel";
import QuickAdd from "./components/QuickAdd";
import Toolbar from "./components/Toolbar";
import Legend from "./components/Legend";
import RightRail from "./components/RightRail";

const nodeTypes = { task: TaskNode };

export default function FlowCanvas({ workspace, updateWorkspace }) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, setCenter } = useReactFlow();

  /* ─── Initialize from workspace prop ─── */
  // The parent uses a `key` to force remount on workspace switch, so initial
  // state is always correct for the current workspace.
  const initialNodes = useMemo(
    () => workspace.nodes.map((n) => ({
      ...n,
      data: { ...n.data, projects: workspace.projects },
    })),
    [] // mount only
     
  );

  const [projects, setProjects] = useState(workspace.projects);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workspace.edges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [filterProject, setFilterProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  /* ─── Sync internal state back to parent (workspace store) ─── */
  // Strip `projects` from node data before persisting (it's reinjected on load)
  useEffect(() => {
    const cleanNodes = nodes.map((n) => {
      const { projects: _p, propagatedBlocked: _b, ...rest } = n.data;
      return { ...n, data: rest };
    });
    updateWorkspace({ nodes: cleanNodes, edges, projects });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, projects]);

  /* ─── Sync project list into all nodes ─── */
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, projects } }))
    );
  }, [projects, setNodes]);

  /* ─── BFS block propagation ─── */
  useBlockPropagation(nodes, edges, setNodes, setEdges);

  /* ─── Edge creation ─── */
  // QoL: when linking two tasks where one has a project and the other doesn't,
  // adopt the assigned project onto the unassigned node. If both are unassigned
  // or if they conflict, leave them alone.
  const onConnect = useCallback(
    (params) => {
      setNodes((nds) => {
        const source = nds.find((n) => n.id === params.source);
        const target = nds.find((n) => n.id === params.target);
        if (!source || !target) return nds;

        const sp = source.data.project;
        const tp = target.data.project;

        // Only act when exactly one side is unassigned.
        if (sp && !tp) {
          return nds.map((n) =>
            n.id === target.id
              ? { ...n, data: { ...n.data, project: sp } }
              : n
          );
        }
        if (tp && !sp) {
          return nds.map((n) =>
            n.id === source.id
              ? { ...n, data: { ...n.data, project: tp } }
              : n
          );
        }
        return nds;
      });

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: newEdgeId(),
            markerEnd: { type: MarkerType.ArrowClosed, color: T.accent },
            style: { stroke: T.accent, strokeWidth: 1.5 },
            animated: false,
          },
          eds
        )
      );
    },
    [setNodes, setEdges]
  );

  /* ─── Selection ─── */
  const onNodeClick = useCallback((_, node) => setSelectedNodeId(node.id), []);
  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  /* ─── Edge interactions ─── */
  // Right-click to delete an edge immediately
  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  /* ─── Double-click canvas to add task ─── */
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
          id, type: "task", position,
          data: {
            label: "New Task", status: "todo", priority: "medium",
            project: null, description: "", projects,
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
          id, type: "task", position,
          data: {
            label: title, status: "todo", priority: "medium",
            project: filterProject || null, description: "", projects,
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
      if (filterStatus === "__not_done__") {
        if (n.data.status === "done") hidden = true;
      } else if (filterStatus && n.data.status !== filterStatus) {
        hidden = true;
      }
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
      display: "flex", flex: 1, minHeight: 0,
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
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
          style={{ background: T.bg }}
          deleteKeyCode={["Backspace", "Delete"]}
          multiSelectionKeyCode="Shift"
          edgesFocusable={true}
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

      <RightRail
        nodes={nodes}
        edges={edges}
        projects={projects}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        onFocusNode={(nodeId) => {
          const node = nodes.find((n) => n.id === nodeId);
          if (!node) return;
          // Center on the node with a smooth pan
          setCenter(
            node.position.x + 100,
            node.position.y + 50,
            { zoom: 1, duration: 400 }
          );
          setSelectedNodeId(nodeId);
        }}
      />
    </div>
  );
}