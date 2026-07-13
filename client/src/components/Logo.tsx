import { LayoutGrid } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "sm" ? 16 : 19;
  const text = size === "sm" ? "text-[15px]" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex ${box} shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-soft`}
      >
        <LayoutGrid size={icon} strokeWidth={2.5} />
      </div>
      <span className={`font-semibold tracking-tight text-slate-800 ${text}`}>
        Collab Board
      </span>
    </div>
  );
}
