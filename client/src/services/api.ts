import type { Board, BoardSummary, Organization, User } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function login(name: string): Promise<{ token: string; user: User }> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getBoard(boardId: string, token: string): Promise<Board> {
  return request(`/api/boards/${boardId}`, {
    headers: authHeaders(token),
  });
}

export function listOrganizations(token: string): Promise<Organization[]> {
  return request("/api/organizations", {
    headers: authHeaders(token),
  });
}

export function createOrganization(name: string, token: string): Promise<Organization> {
  return request("/api/organizations", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
}

export function listBoards(orgId: string, token: string): Promise<BoardSummary[]> {
  return request(`/api/organizations/${orgId}/boards`, {
    headers: authHeaders(token),
  });
}

export function createBoard(
  orgId: string,
  name: string,
  token: string
): Promise<BoardSummary> {
  return request(`/api/organizations/${orgId}/boards`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
}
