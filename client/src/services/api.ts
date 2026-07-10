import type { Board, User } from "../types";

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

export function login(name: string): Promise<{ token: string; user: User }> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getBoard(boardId: string, token: string): Promise<Board> {
  return request(`/api/boards/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
