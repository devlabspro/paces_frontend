"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PacesAgentRun, PacesBootstrap, PacesProject, PacesReport, PacesSettings, pacesApi } from "@/lib/paces-api";

type DemoContextValue = {
  data: PacesBootstrap | null;
  loading: boolean;
  syncing: boolean;
  error: string;
  refresh: () => Promise<void>;
  createProject: (project: Parameters<typeof pacesApi.createProject>[0]) => Promise<PacesProject>;
  moveProject: (id: string, stage: string) => Promise<PacesProject>;
  saveSearch: (name: string, query: string, filters?: Record<string, unknown>) => Promise<void>;
  createReport: (payload: Parameters<typeof pacesApi.createReport>[0]) => Promise<PacesReport>;
  createAgentRun: (prompt: string) => Promise<PacesAgentRun>;
  saveSettings: (settings: Partial<PacesSettings>) => Promise<PacesSettings>;
};

const DemoContext = createContext<DemoContextValue | null>(null);
let bootstrapCache: PacesBootstrap | null = null;

export function PacesDemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PacesBootstrap | null>(bootstrapCache);
  const [loading, setLoading] = useState(!bootstrapCache);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const didLoad = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await pacesApi.bootstrap();
      bootstrapCache = next;
      setData(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load the Paces demo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didLoad.current || data) return;
    didLoad.current = true;
    void refresh();
  }, [data, refresh]);

  const commitData = useCallback((updater: (current: PacesBootstrap) => PacesBootstrap) => {
    setData((current) => {
      if (!current) return current;
      const next = updater(current);
      bootstrapCache = next;
      return next;
    });
  }, []);

  const mutate = useCallback(async <T,>(operation: () => Promise<T>, apply: (value: T) => void) => {
    setSyncing(true);
    setError("");
    try {
      const value = await operation();
      apply(value);
      return value;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this change.");
      throw caught;
    } finally {
      setSyncing(false);
    }
  }, []);

  const value = useMemo<DemoContextValue>(() => ({
    data, loading, syncing, error, refresh,
    createProject: (project) => mutate(() => pacesApi.createProject(project), (created) => commitData((current) => ({ ...current, projects: [created, ...current.projects] }))),
    moveProject: (id, stage) => mutate(() => pacesApi.updateProject(id, { stage }), (updated) => commitData((current) => ({ ...current, projects: current.projects.map((item) => item.id === id ? updated : item) }))),
    saveSearch: (name, query, filters) => mutate(() => pacesApi.saveSearch({ name, query, filters }), (created) => commitData((current) => ({ ...current, savedSearches: [created, ...current.savedSearches] }))).then(() => undefined),
    createReport: (payload) => mutate(() => pacesApi.createReport(payload), (created) => commitData((current) => ({ ...current, reports: [created, ...current.reports] }))),
    createAgentRun: (prompt) => mutate(() => pacesApi.createAgentRun(prompt), (created) => commitData((current) => ({ ...current, agentRuns: [created, ...current.agentRuns] }))),
    saveSettings: (settings) => mutate(() => pacesApi.updateSettings(settings), (updated) => commitData((current) => ({ ...current, settings: updated }))),
  }), [commitData, data, error, loading, mutate, refresh, syncing]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function usePacesDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("usePacesDemo must be used inside PacesDemoProvider");
  return context;
}
