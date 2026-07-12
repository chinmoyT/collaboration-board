import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  assignUserToBoard,
  createUser,
  deleteUser,
  listBoards,
  listUsers,
  unassignUserFromBoard,
} from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { BoardSummary, ManagedUser } from "../types";

export function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const token = useAuthStore((s) => s.token)!;
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([listUsers(token), listBoards(token)])
      .then(([u, b]) => {
        setUsers(u);
        setBoards(b);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password) return;
    setCreating(true);
    setError(null);
    try {
      const user = await createUser(
        { email: email.trim(), name: name.trim(), password },
        token
      );
      setUsers((u) => [...u, user]);
      setEmail("");
      setName("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const removeUser = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(userId, token);
      setUsers((u) => u.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const toggleAssignment = async (user: ManagedUser, boardId: string, assigned: boolean) => {
    try {
      if (assigned) {
        await unassignUserFromBoard(user.id, boardId, token);
      } else {
        await assignUserToBoard(user.id, boardId, token);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id !== user.id
            ? u
            : {
                ...u,
                boardIds: assigned
                  ? u.boardIds.filter((id) => id !== boardId)
                  : [...u.boardIds, boardId],
              }
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update assignment");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/boards")}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Back to boards"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-slate-800">Manage Users</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h2 className="mb-1 text-base font-medium text-slate-800">Create end user</h2>
        <p className="mb-4 text-sm text-slate-500">
          Set a temporary password — the user can change it later.
        </p>

        <form onSubmit={submit} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 sm:col-span-3"
          >
            Create user
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-10">
          <h2 className="mb-3 text-base font-medium text-slate-800">Users</h2>
          {loading ? (
            <p className="text-sm text-slate-400">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-400">No end users yet — create one above.</p>
          ) : (
            <ul className="space-y-4">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="rounded-md border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => removeUser(user.id)}
                      className="text-xs text-slate-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {boards.map((board) => {
                      const assigned = user.boardIds.includes(board.id);
                      return (
                        <button
                          key={board.id}
                          onClick={() => toggleAssignment(user, board.id, assigned)}
                          className={
                            assigned
                              ? "rounded-full bg-slate-800 px-2.5 py-1 text-xs text-white hover:bg-slate-700"
                              : "rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-500 hover:border-slate-400"
                          }
                        >
                          {board.name}
                        </button>
                      );
                    })}
                    {boards.length === 0 && (
                      <span className="text-xs text-slate-400">No boards exist yet.</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
