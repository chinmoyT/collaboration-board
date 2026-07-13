const COLORS = [
  "bg-rose-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-violet-400",
  "bg-pink-400",
];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  id: string;
  name: string;
  size?: "sm" | "md";
  ring?: boolean;
  showTitle?: boolean;
}

export function Avatar({ id, name, size = "md", ring = false, showTitle = true }: AvatarProps) {
  const dimension = size === "sm" ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-xs";
  return (
    <div
      title={showTitle ? name : undefined}
      className={`flex ${dimension} shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(id)} ${
        ring ? "border-2 border-white" : ""
      }`}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
