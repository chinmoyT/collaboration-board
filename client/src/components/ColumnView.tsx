import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Card, Column } from "../types";
import { CardItem } from "./CardItem";

interface Props {
  column: Column;
  cards: Card[];
  onCreateCard: (columnId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
}

const ACCENTS: Record<string, string> = {
  "To Do": "bg-slate-400",
  "In Progress": "bg-amber-400",
  Done: "bg-emerald-400",
};

function accentFor(title: string): string {
  return ACCENTS[title] ?? "bg-indigo-400";
}

export function ColumnView({ column, cards, onCreateCard, onDeleteCard }: Props) {
  const [title, setTitle] = useState("");
  const { setNodeRef } = useDroppable({ id: column.id });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateCard(column.id, title.trim());
    setTitle("");
  };

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-100/80 p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${accentFor(column.title)}`} />
        <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-soft">
          {cards.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex min-h-[40px] flex-col gap-2">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem key={card.id} card={card} accent={accentFor(column.title)} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
      </div>

      <form onSubmit={submit} className="mt-2">
        <div className="relative">
          <Plus
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a card"
            className="w-full rounded-lg border border-transparent bg-transparent py-1.5 pl-7 pr-2 text-sm text-slate-600 transition-colors hover:border-slate-300 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </form>
    </div>
  );
}
