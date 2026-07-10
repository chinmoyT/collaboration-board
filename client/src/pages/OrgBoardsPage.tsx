import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createBoard, listBoards } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { BoardSummary } from "../types";

export function OrgBoardsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [creating, setCreating] = useState(false);

  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    listBoards(orgId!, token)
      .then(setBoards)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orgId, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const board = await createBoard(orgId!, newBoardName.trim(), token);
      setBoards((b) => [...b, board]);
      setNewBoardName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/organizations")}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Back to organizations"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-slate-800">Boards</h1>
        </div>
        <span className="text-sm text-slate-400">{user?.name}</span>
      </header>

      <main className="mx-auto max-w-md px-6 py-12">
        <h2 className="mb-1 text-base font-medium text-slate-800">
          Open or create a board
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Every board here is shared with anyone in this organization.
        </p>

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

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-slate-400">Loading boards...</p>
          ) : boards.length === 0 ? (
            <p className="text-sm text-slate-400">No boards yet — create one above.</p>
          ) : (
            <ul className="space-y-1">
              {boards.map((board) => (
                <li key={board.id}>
                  <button
                    onClick={() => navigate(`/organizations/${orgId}/boards/${board.id}`)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-400"
                  >
                    {board.name}
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
