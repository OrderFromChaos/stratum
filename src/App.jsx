import { useState, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import FlowCanvas from "./FlowCanvas";
import WorkspaceSwitcher from "./components/WorkspaceSwitcher";
import { SEED_STATE, createEmptyWorkspace } from "./data/seed";
import { newWorkspaceId } from "./utils";
import { usePersistence, exportToFile, importFromFile } from "./hooks/usePersistence";
import { T } from "./theme";

export default function App() {
  const [state, setState] = useState(SEED_STATE);
  const [hasLoaded, setHasLoaded] = useState(false);
  // Bumped on every full state replacement (load/import) to force FlowCanvas remount
  const [stateVersion, setStateVersion] = useState(0);

  /* ─── Persistence: load on mount, auto-save on change ─── */
  usePersistence(hasLoaded ? state : null, (loaded) => {
    if (loaded?.workspaces?.length > 0) {
      setState(loaded);
    }
    setHasLoaded(true);
  });

  const activeWorkspace =
    state.workspaces.find((w) => w.id === state.activeWorkspaceId) ||
    state.workspaces[0];

  /* ─── Update the currently active workspace's contents ─── */
  const updateActiveWorkspace = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      workspaces: prev.workspaces.map((w) =>
        w.id === prev.activeWorkspaceId
          ? (typeof updater === "function" ? updater(w) : { ...w, ...updater })
          : w
      ),
    }));
  }, []);

  /* ─── Workspace operations ─── */
  const selectWorkspace = useCallback((id) => {
    setState((prev) => ({ ...prev, activeWorkspaceId: id }));
  }, []);

  const createWorkspace = useCallback((name) => {
    const id = newWorkspaceId();
    setState((prev) => ({
      ...prev,
      workspaces: [...prev.workspaces, createEmptyWorkspace(id, name)],
      activeWorkspaceId: id,
    }));
  }, []);

  const renameWorkspace = useCallback((id, name) => {
    setState((prev) => ({
      ...prev,
      workspaces: prev.workspaces.map((w) =>
        w.id === id ? { ...w, name } : w
      ),
    }));
  }, []);

  const deleteWorkspace = useCallback((id) => {
    setState((prev) => {
      if (prev.workspaces.length <= 1) return prev; // never delete the last one
      const remaining = prev.workspaces.filter((w) => w.id !== id);
      const nextActive =
        prev.activeWorkspaceId === id
          ? remaining[0].id
          : prev.activeWorkspaceId;
      return {
        ...prev,
        workspaces: remaining,
        activeWorkspaceId: nextActive,
      };
    });
  }, []);

  /* ─── Export / Import ─── */
  const handleExport = useCallback(() => exportToFile(state), [state]);

  const handleImport = useCallback(async () => {
    try {
      const imported = await importFromFile();
      if (imported?.workspaces?.length > 0) {
        if (confirm("Importing will replace your current data. Continue?")) {
          setState(imported);
          setStateVersion((v) => v + 1); // force FlowCanvas remount
        }
      } else {
        alert("That file doesn't look like a Stratum export.");
      }
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      width: "100%", height: "100%",
      background: T.bg,
    }}>
      <WorkspaceSwitcher
        workspaces={state.workspaces}
        activeId={state.activeWorkspaceId}
        onSelect={selectWorkspace}
        onCreate={createWorkspace}
        onRename={renameWorkspace}
        onDelete={deleteWorkspace}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Wait until persistence has loaded so we don't overwrite saved data */}
      {hasLoaded && (
        /* key forces a clean remount when switching workspaces or after import */
        <ReactFlowProvider key={`${activeWorkspace.id}-${stateVersion}`}>
          <FlowCanvas
            workspace={activeWorkspace}
            updateWorkspace={updateActiveWorkspace}
          />
        </ReactFlowProvider>
      )}
    </div>
  );
}