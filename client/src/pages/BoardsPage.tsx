import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const RECENT_KEY = "collab-board-recent";

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function BoardsPage() {
  const [boardId, setBoardId] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const goToBoard = (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    navigate(`/boards/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-800">Collab Board</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500">
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
        <h2 className="mb-1 text-base font-medium text-slate-800">
          Open or create a board
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Boards are created on first visit — share the same name with
          teammates to collaborate live.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToBoard(boardId);
          }}
          className="flex gap-2"
        >
          <input
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            placeholder="e.g. sprint-planning"
            autoFocus
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Go
          </button>
        </form>

        {recent.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Recent
            </h3>
            <ul className="space-y-1">
              {recent.map((id) => (
                <li key={id}>
                  <button
                    onClick={() => goToBoard(id)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-400"
                  >
                    {id}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
