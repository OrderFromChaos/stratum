import { useEffect } from "react";
import { MarkerType } from "@xyflow/react";
import { T } from "../theme";
import { computeBlockedSet } from "../utils";

/**
 * Reacts to status changes and edge additions.
 * Runs BFS from explicitly-blocked nodes and:
 *  1. Sets `propagatedBlocked` on downstream nodes
 *  2. Styles edges red/animated along the blocked path
 */
export function useBlockPropagation(nodes, edges, setNodes, setEdges) {
  // Derive a stable cache key from statuses + edge count
  const statusKey = nodes.map((n) => `${n.id}:${n.data.status}`).join(",");
  const edgeKey = edges.map((e) => e.id).join(",");

  useEffect(() => {
    const { explicitlyBlocked, propagated } = computeBlockedSet(nodes, edges);
    const allBlocked = new Set([...explicitlyBlocked, ...propagated]);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, propagatedBlocked: propagated.has(n.id) },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => {
        const sourceBlocked = explicitlyBlocked.has(e.source) || propagated.has(e.source);
        const targetBlocked = allBlocked.has(e.target) || explicitlyBlocked.has(e.target);
        const isBlockingEdge = sourceBlocked && targetBlocked;

        return {
          ...e,
          animated: false,
          style: {
            stroke: isBlockingEdge ? T.red : T.accent,
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isBlockingEdge ? T.red : T.accent,
          },
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusKey, edgeKey]);
}