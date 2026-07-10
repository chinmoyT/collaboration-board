import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../types";

interface Props {
  card: Card;
  onDelete: (cardId: string) => void;
}

export function CardItem({ card, onDelete }: Props) {
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
      className="group flex items-start justify-between gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <span className="text-slate-800">{card.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
        className="hidden text-slate-400 hover:text-red-500 group-hover:block"
        aria-label="Delete card"
      >
        ×
      </button>
    </div>
  );
}
