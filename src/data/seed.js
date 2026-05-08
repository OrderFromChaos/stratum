import { MarkerType } from "@xyflow/react";
import { T } from "../theme";

const defaultEdgeStyle = {
  markerEnd: { type: MarkerType.ArrowClosed, color: T.accent },
  style: { stroke: T.accent, strokeWidth: 1.5 },
};

const SEED_PROJECTS = [
  { id: "proj_demo1", name: "Side Project", color: "#58a6ff" },
  { id: "proj_demo2", name: "Homelab", color: "#3fb950" },
];

const SEED_NODES = [
  {
    id: "t1", type: "task", position: { x: 250, y: 40 },
    data: {
      label: "Set up Docker host", status: "done", priority: "high",
      project: "proj_demo2", description: "Provision VM and install Docker + Compose",
    },
  },
  {
    id: "t2", type: "task", position: { x: 80, y: 200 },
    data: {
      label: "Deploy Plane", status: "in-progress", priority: "medium",
      project: "proj_demo2", description: "Use setup.sh with .env config",
    },
  },
  {
    id: "t3", type: "task", position: { x: 420, y: 200 },
    data: {
      label: "Configure reverse proxy", status: "todo", priority: "medium",
      project: "proj_demo2",
    },
  },
  {
    id: "t4", type: "task", position: { x: 250, y: 380 },
    data: {
      label: "Set up SSL certs", status: "blocked", priority: "high",
      project: "proj_demo2",
    },
  },
  {
    id: "t5", type: "task", position: { x: 600, y: 40 },
    data: {
      label: "Design data model", status: "todo", priority: "high",
      project: "proj_demo1",
    },
  },
  {
    id: "t6", type: "task", position: { x: 600, y: 200 },
    data: {
      label: "Build React Flow prototype", status: "todo", priority: "medium",
      project: "proj_demo1", description: "Task graph UI with dependency edges",
    },
  },
];

const SEED_EDGES = [
  { id: "e1-2", source: "t1", target: "t2", ...defaultEdgeStyle },
  { id: "e1-3", source: "t1", target: "t3", ...defaultEdgeStyle },
  { id: "e3-4", source: "t3", target: "t4", ...defaultEdgeStyle },
  { id: "e2-4", source: "t2", target: "t4", ...defaultEdgeStyle },
  { id: "e5-6", source: "t5", target: "t6", ...defaultEdgeStyle },
];

/* Default top-level state — used on first launch */
export const SEED_STATE = {
  workspaces: [
    {
      id: "ws_personal",
      name: "Personal",
      projects: SEED_PROJECTS,
      nodes: SEED_NODES,
      edges: SEED_EDGES,
    },
    {
      id: "ws_work",
      name: "Work",
      projects: [],
      nodes: [],
      edges: [],
    },
  ],
  activeWorkspaceId: "ws_personal",
};

/* Empty workspace template for newly-created ones */
export function createEmptyWorkspace(id, name) {
  return {
    id,
    name,
    projects: [],
    nodes: [],
    edges: [],
  };
}
