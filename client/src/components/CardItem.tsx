import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import type { Card } from "../types";

interface Props {
  card: Card;
  accent: string;
  onDelete: (cardId: string) => void;
}

export function CardItem({ card, accent, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative flex cursor-grab items-start gap-2.5 overflow-hidden rounded-lg border border-slate-200 bg-white py-2.5 pl-3.5 pr-2 text-sm shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card active:cursor-grabbing"
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
      <span className="flex-1 text-slate-700">{card.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
        className="hidden h-5 w-5 shrink-0 items-center justify-center rounded text-slate-300 hover:bg-red-50 hover:text-red-500 group-hover:flex"
        aria-label="Delete card"
      >
        <X size={13} />
      </button>
    </div>
  );
}
