/* ─── ID Generators ─── */
let idCounter = Date.now();

export const newTaskId = () => `task_${idCounter++}`;
export const newProjectId = () => `proj_${idCounter++}`;

/* ─── Graph: BFS blocked propagation ─── */
/**
 * Walk downstream from every node whose status === "blocked"
 * and return the set of transitively-blocked node IDs.
 */
export function computeBlockedSet(nodes, edges) {
  // Build adjacency: source → [targets]
  const downstream = {};
  for (const e of edges) {
    if (!downstream[e.source]) downstream[e.source] = [];
    downstream[e.source].push(e.target);
  }

  const explicitlyBlocked = new Set(
    nodes.filter((n) => n.data.status === "blocked").map((n) => n.id)
  );

  const propagated = new Set();
  const queue = [...explicitlyBlocked];

  while (queue.length > 0) {
    const curr = queue.shift();
    for (const child of downstream[curr] || []) {
      if (!propagated.has(child) && !explicitlyBlocked.has(child)) {
        propagated.add(child);
        queue.push(child);
      }
    }
  }

  return { explicitlyBlocked, propagated };
}
