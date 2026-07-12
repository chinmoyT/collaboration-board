import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBoard, deleteBoard, listBoards } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { BoardSummary } from "../types";

export function BoardsPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [creating, setCreating] = useState(false);

  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAdmin = user?.role === "ADMIN";
  const navigate = useNavigate();

  useEffect(() => {
    listBoards(token)
      .then(setBoards)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const board = await createBoard(newBoardName.trim(), token);
      setBoards((b) => [...b, board]);
      setNewBoardName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  const removeBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this board? This cannot be undone.")) return;
    try {
      await deleteBoard(boardId, token);
      setBoards((b) => b.filter((board) => board.id !== boardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-800">Collab Board</h1>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {isAdmin && (
            <Link to="/admin/users" className="text-slate-600 hover:text-slate-900">
              Manage Users
            </Link>
          )}
          <span>{user?.name}</span>
          <button
            onClick={() => {
              clearAuth();
              navigate("/login");
            }}
            className="text-slate-400 hover:text-slate-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-12">
        <h2 className="mb-1 text-base font-medium text-slate-800">Boards</h2>
        <p className="mb-4 text-sm text-slate-500">
          {isAdmin
            ? "All boards. Create a new one or open an existing board."
            : "Boards you've been assigned to."}
        </p>

        {isAdmin && (
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="e.g. Sprint Planning"
              autoFocus
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              New
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-slate-400">Loading boards...</p>
          ) : boards.length === 0 ? (
            <p className="text-sm text-slate-400">
              {isAdmin ? "No boards yet — create one above." : "No boards assigned to you yet."}
            </p>
          ) : (
            <ul className="space-y-1">
              {boards.map((board) => (
                <li key={board.id}>
                  <button
                    onClick={() => navigate(`/boards/${board.id}`)}
                    className="group flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-400"
                  >
                    {board.name}
                    {isAdmin && (
                      <span
                        onClick={(e) => removeBoard(e, board.id)}
                        className="hidden text-slate-400 hover:text-red-500 group-hover:inline"
                      >
                        Delete
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
