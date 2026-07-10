import { useNavigate, useParams } from "react-router-dom";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useAuthStore } from "../store/authStore";
import { useBoardStore } from "../store/boardStore";
import { useBoardSocket } from "../hooks/useBoardSocket";
import { ColumnView } from "../components/ColumnView";
import { PresenceBar } from "../components/PresenceBar";
import type { Column } from "../types";

function findColumn(columns: Column[], cardOrColumnId: string): Column | undefined {
  return columns.find(
    (col) => col.id === cardOrColumnId || col.cardIds.includes(cardOrColumnId)
  );
}

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const board = useBoardStore((s) => s.board);
  const presence = useBoardStore((s) => s.presence);
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

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading board...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/boards")}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Back to boards"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-slate-800">{boardId}</h1>
        </div>
        <div className="flex items-center gap-4">
          <PresenceBar users={presence} />
          <span className="text-sm text-slate-400">{user?.name}</span>
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
