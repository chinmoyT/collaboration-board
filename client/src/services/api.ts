import type { Board, BoardSummary, ManagedUser, User } from "../types";

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

  if (res.status === 204) return undefined as T;
  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function listBoards(token: string): Promise<BoardSummary[]> {
  return request("/api/boards", {
    headers: authHeaders(token),
  });
}

export function getBoard(boardId: string, token: string): Promise<Board> {
  return request(`/api/boards/${boardId}`, {
    headers: authHeaders(token),
  });
}

export function createBoard(name: string, token: string): Promise<BoardSummary> {
  return request("/api/boards", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
}

export function deleteBoard(boardId: string, token: string): Promise<void> {
  return request(`/api/boards/${boardId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function listUsers(token: string): Promise<ManagedUser[]> {
  return request("/api/users", {
    headers: authHeaders(token),
  });
}

export function createUser(
  data: { email: string; name: string; password: string },
  token: string
): Promise<ManagedUser> {
  return request("/api/users", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export function deleteUser(userId: string, token: string): Promise<void> {
  return request(`/api/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function assignUserToBoard(
  userId: string,
  boardId: string,
  token: string
): Promise<void> {
  return request(`/api/users/${userId}/boards/${boardId}`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function unassignUserFromBoard(
  userId: string,
  boardId: string,
  token: string
): Promise<void> {
  return request(`/api/users/${userId}/boards/${boardId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
