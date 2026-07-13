import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Mail,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import {
  assignUserToBoard,
  createUser,
  deleteUser,
  listBoards,
  listUsers,
  unassignUserFromBoard,
} from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Avatar } from "../components/Avatar";
import { ProfileMenu } from "../components/ProfileMenu";
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
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/boards")}
              aria-label="Back to boards"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ArrowLeft size={17} />
            </button>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Manage Users</h1>
          </div>
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-1 flex items-center gap-2">
            <UserPlus size={17} className="text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-800">Create end user</h2>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Set a temporary password — the user can change it later.
          </p>

          <form onSubmit={submit} className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="submit"
              disabled={creating}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-indigo-500 disabled:opacity-60 sm:col-span-3"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              Create user
            </button>
          </form>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-base font-semibold text-slate-800">
            Users {!loading && <span className="text-slate-400">({users.length})</span>}
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-10 text-center text-sm text-slate-400">
              No end users yet — create one above.
            </div>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar id={user.id} name={user.name} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUser(user.id)}
                      title="Delete user"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                    {boards.map((board) => {
                      const assigned = user.boardIds?.includes(board.id);
                      return (
                        <button
                          key={board.id}
                          onClick={() => toggleAssignment(user, board.id, assigned)}
                          className={
                            assigned
                              ? "flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
                              : "flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
                          }
                        >
                          {assigned && <Check size={11} />}
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
