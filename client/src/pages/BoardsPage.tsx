import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, LayoutGrid, Loader2, Plus, Trash2, Users } from "lucide-react";
import { createBoard, deleteBoard, listBoards } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Logo } from "../components/Logo";
import { ProfileMenu } from "../components/ProfileMenu";
import type { BoardSummary } from "../types";

export function BoardsPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [creating, setCreating] = useState(false);

  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);
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
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin/users"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Users size={15} />
                Manage Users
              </Link>
            )}
            <div className="mx-1 h-5 w-px bg-slate-200" />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Boards</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isAdmin
                ? "All boards across the workspace."
                : "Boards you've been assigned to."}
            </p>
          </div>

          {isAdmin && (
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="New board name"
                className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:w-56"
              />
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-indigo-500 disabled:opacity-60"
              >
                {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                New
              </button>
            </form>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Loading boards...
          </div>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
            <LayoutGrid size={28} className="text-slate-300" />
            <p className="text-sm text-slate-500">
              {isAdmin ? "No boards yet — create one above." : "No boards assigned to you yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => navigate(`/boards/${board.id}`)}
                className="group relative flex flex-col items-start rounded-xl border border-slate-200 bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-card"
              >
                {isAdmin && (
                  <span
                    onClick={(e) => removeBoard(e, board.id)}
                    title="Delete board"
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </span>
                )}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <LayoutGrid size={18} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">{board.name}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
