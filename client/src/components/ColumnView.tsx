import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column } from "../types";
import { CardItem } from "./CardItem";

interface Props {
  column: Column;
  cards: Card[];
  onCreateCard: (columnId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
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
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-slate-100 p-3">
      <h3 className="mb-3 px-1 text-sm font-semibold text-slate-600">
        {column.title}
        <span className="ml-2 text-slate-400">{cards.length}</span>
      </h3>

      <div ref={setNodeRef} className="flex min-h-[40px] flex-col gap-2">
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
      </div>

      <form onSubmit={submit} className="mt-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="+ Add a card"
          className="w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-600 hover:border-slate-300 focus:border-slate-300 focus:bg-white focus:outline-none"
        />
      </form>
    </div>
  );
}
