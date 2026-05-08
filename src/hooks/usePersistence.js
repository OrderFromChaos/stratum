import { useEffect, useRef } from "react";

const STORAGE_KEY = "taskgraph-state-v2";

/**
 * Persist the entire app state (workspaces + active workspace ID) to localStorage.
 * Loads once on mount, saves debounced on every change.
 */
export function usePersistence(state, onLoad) {
  const hasLoaded = useRef(false);
  const saveTimer = useRef(null);

  // Load once on mount
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        onLoad(parsed);
      }
    } catch (err) {
      console.warn("[taskgraph] Failed to load state:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save on every change
  useEffect(() => {
    if (!hasLoaded.current) return;
    if (state === null) return; // caller signals "not ready yet"

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn("[taskgraph] Failed to save state:", err);
      }
    }, 300);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);
}

/* ─── Manual export / import ─── */

export function exportToFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stratum-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return reject(new Error("No file selected"));
      try {
        const text = await file.text();
        resolve(JSON.parse(text));
      } catch (err) {
        reject(err);
      }
    };
    input.click();
  });
}