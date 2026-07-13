import { useState } from "react";
import type { PresenceUser } from "../types";
import { Avatar } from "./Avatar";

export function PresenceBar({ users }: { users: PresenceUser[] }) {
  const [hovered, setHovered] = useState(false);
  if (users.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center -space-x-2">
        {users.map((u) => (
          <Avatar key={u.id} id={u.id} name={u.name} ring showTitle={false} />
        ))}
      </div>

      {hovered && (
        <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-lg border border-slate-200 bg-white py-2 shadow-lift">
          <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {users.length} {users.length === 1 ? "person" : "people"} viewing
          </p>
          <ul className="max-h-48 overflow-y-auto">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-2 px-3 py-1.5">
                <Avatar id={u.id} name={u.name} size="sm" />
                <span className="truncate text-sm text-slate-700">{u.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
