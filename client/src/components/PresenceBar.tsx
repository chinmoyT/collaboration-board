import type { PresenceUser } from "../types";

function colorFor(id: string): string {
  const colors = [
    "bg-rose-400", "bg-amber-400", "bg-emerald-400",
    "bg-sky-400", "bg-violet-400", "bg-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function PresenceBar({ users }: { users: PresenceUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {users.map((u) => (
        <div
          key={u.id}
          title={u.name}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${colorFor(u.id)}`}
        >
          {u.name.slice(0, 2).toUpperCase()}
        </div>
      ))}
    </div>
  );
}
