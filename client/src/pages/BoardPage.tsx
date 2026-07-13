import { useNavigate, useParams } from "react-router-dom";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { AlertCircle, ArrowLeft, LayoutGrid, Loader2 } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { useBoardSocket } from "../hooks/useBoardSocket";
import { ColumnView } from "../components/ColumnView";
import { PresenceBar } from "../components/PresenceBar";
import { ProfileMenu } from "../components/ProfileMenu";
import type { Column } from "../types";

function findColumn(columns: Column[], cardOrColumnId: string): Column | undefined {
  return columns.find(
    (col) => col.id === cardOrColumnId || col.cardIds.includes(cardOrColumnId)
  );
}

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const board = useBoardStore((s) => s.board);
  const presence = useBoardStore((s) => s.presence);
  const error = useBoardStore((s) => s.error);
  const { createCard, moveCard, deleteCard } = useBoardSocket(boardId!);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const fromColumn = findColumn(board.columns, activeId);
    const toColumn = findColumn(board.columns, overId);
    if (!fromColumn || !toColumn) return;

    let toIndex = toColumn.cardIds.indexOf(overId);
    if (toIndex === -1) toIndex = toColumn.cardIds.length;

    moveCard(activeId, fromColumn.id, toColumn.id, toIndex);
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle size={22} />
        </div>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          onClick={() => navigate("/boards")}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={14} />
          Back to boards
        </button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-slate-50 text-sm text-slate-400">
        <Loader2 size={16} className="animate-spin" />
        Loading board...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/boards")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Back to boards"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <LayoutGrid size={16} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">{board.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <PresenceBar users={presence} />
          <div className="h-5 w-px bg-slate-200" />
          <ProfileMenu />
        </div>
      </header>

      <main className="overflow-x-auto p-6">
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="flex gap-4">
            {board.columns.map((column) => (
              <ColumnView
                key={column.id}
                column={column}
                cards={column.cardIds.map((id) => board.cards[id]).filter(Boolean)}
                onCreateCard={createCard}
                onDeleteCard={deleteCard}
              />
            ))}
          </div>
        </DndContext>
      </main>
    </div>
  );
}
