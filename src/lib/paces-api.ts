const API_BASE = (process.env.NEXT_PUBLIC_PACES_API_URL || "http://127.0.0.1:5001").replace(/\/$/, "");

export type PacesProject = {
  id: string;
  name: string;
  county: string;
  state: string;
  capacityMw: number;
  acres: number;
  buildableAcres: number;
  score: number;
  stage: string;
  risk: "Low" | "Medium" | "High";
  owner: string;
  dueDate: string | null;
  updatedAt: string;
};

export type PacesReport = {
  id: string;
  projectId: string | null;
  project: string;
  type: string;
  priority: string;
  status: string;
  requestedAt: string;
};

export type PacesAgentRun = {
  id: string;
  prompt: string;
  status: string;
  summary: string;
  resultCount: number;
  results: PacesProject[];
  createdAt: string;
};

export type PacesSettings = {
  workspaceName: string;
  primaryMarket: string;
  projectType: string;
  capacityUnit: string;
  expertReviewNotifications: boolean;
  weeklyPipelineSummary: boolean;
};

export type PacesBootstrap = {
  projects: PacesProject[];
  savedSearches: Array<{ id: string; name: string; query: string; filters: Record<string, unknown>; updatedAt: string }>;
  reports: PacesReport[];
  agentRuns: PacesAgentRun[];
  settings: PacesSettings;
  team: Array<{ id: string; name: string; role: string; status: string }>;
  dataCategories: Array<{ name: string; layers: number; freshness: string }>;
};

export class PacesApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "PacesApiError";
  }
}

let sessionToken: string | null = null;

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  if (path !== "/session" && !sessionToken) await createSession();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE}/api/paces${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== "/session" && retry) {
      sessionToken = null;
      await createSession();
      return request<T>(path, init, false);
    }
    if (!response.ok) throw new PacesApiError(body.error || "The Paces demo service could not complete this request.", response.status);
    return body as T;
  } catch (error) {
    if (error instanceof PacesApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new PacesApiError("The Paces demo service timed out.", 408);
    throw new PacesApiError("The Paces demo service is offline. Start the local backend on port 5001.", 0);
  } finally {
    window.clearTimeout(timeout);
  }
}

async function createSession() {
  const response = await fetch(`${API_BASE}/api/paces/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new PacesApiError("Unable to start a secure Paces demo session.", response.status);
  const body = await response.json();
  sessionToken = body.token;
}

export const pacesApi = {
  bootstrap: () => request<PacesBootstrap>("/bootstrap"),
  createProject: (project: Partial<PacesProject> & Pick<PacesProject, "name" | "county" | "state" | "capacityMw" | "acres">) =>
    request<PacesProject>("/projects", { method: "POST", body: JSON.stringify(project) }),
  updateProject: (id: string, updates: Pick<Partial<PacesProject>, "stage" | "owner" | "dueDate">) =>
    request<PacesProject>(`/projects/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(updates) }),
  saveSearch: (payload: { name: string; query: string; filters?: Record<string, unknown> }) =>
    request<PacesBootstrap["savedSearches"][number]>("/saved-searches", { method: "POST", body: JSON.stringify(payload) }),
  createReport: (payload: { projectId?: string; project?: string; type: string; priority: string }) =>
    request<PacesReport>("/reports", { method: "POST", body: JSON.stringify(payload) }),
  createAgentRun: (prompt: string) =>
    request<PacesAgentRun>("/agent/runs", { method: "POST", body: JSON.stringify({ prompt }) }),
  updateSettings: (settings: Partial<PacesSettings>) =>
    request<PacesSettings>("/settings", { method: "PATCH", body: JSON.stringify(settings) }),
};
