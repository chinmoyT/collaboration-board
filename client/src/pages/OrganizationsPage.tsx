import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrganization, listOrganizations } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { Organization } from "../types";

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  useEffect(() => {
    listOrganizations(token)
      .then(setOrganizations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const org = await createOrganization(newOrgName.trim(), token);
      setOrganizations((orgs) => [...orgs, org].sort((a, b) => a.name.localeCompare(b.name)));
      setNewOrgName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setCreating(false);
    }
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
        <h2 className="mb-1 text-base font-medium text-slate-800">Organizations</h2>
        <p className="mb-4 text-sm text-slate-500">
          Pick an organization to see its boards, or create a new one.
        </p>

        <form onSubmit={submit} className="flex gap-2">
          <input
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="e.g. Acme Inc"
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
            <p className="text-sm text-slate-400">Loading organizations...</p>
          ) : organizations.length === 0 ? (
            <p className="text-sm text-slate-400">No organizations yet — create one above.</p>
          ) : (
            <ul className="space-y-1">
              {organizations.map((org) => (
                <li key={org.id}>
                  <button
                    onClick={() => navigate(`/organizations/${org.id}`)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-400"
                  >
                    {org.name}
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
