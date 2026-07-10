import { create } from "zustand";
import type { Board, Card, PresenceUser } from "../types";

interface BoardState {
  board: Board | null;
  presence: PresenceUser[];
  setBoard: (board: Board) => void;
  setPresence: (presence: PresenceUser[]) => void;
  addCard: (columnId: string, card: Card) => void;
  moveCard: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number
  ) => void;
  removeCard: (cardId: string) => void;
  reset: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  presence: [],

  setBoard: (board) => set({ board }),
  setPresence: (presence) => set({ presence }),

  addCard: (columnId, card) =>
    set((state) => {
      if (!state.board) return state;
      const columns = state.board.columns.map((col) =>
        col.id === columnId
          ? { ...col, cardIds: [...col.cardIds, card.id] }
          : col
      );
      return {
        board: {
          ...state.board,
          columns,
          cards: { ...state.board.cards, [card.id]: card },
        },
      };
    }),

  moveCard: (cardId, fromColumnId, toColumnId, toIndex) =>
    set((state) => {
      if (!state.board) return state;
      const columns = state.board.columns.map((col) => {
        if (col.id === fromColumnId) {
          return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
        }
        return col;
      });

      const targetIndex = columns.findIndex((col) => col.id === toColumnId);
      const target = columns[targetIndex];
      const newCardIds = [...target.cardIds];
      const insertAt = Math.max(0, Math.min(toIndex, newCardIds.length));
      newCardIds.splice(insertAt, 0, cardId);
      columns[targetIndex] = { ...target, cardIds: newCardIds };

      return { board: { ...state.board, columns } };
    }),

  removeCard: (cardId) =>
    set((state) => {
      if (!state.board) return state;
      const columns = state.board.columns.map((col) => ({
        ...col,
        cardIds: col.cardIds.filter((id) => id !== cardId),
      }));
      const cards = { ...state.board.cards };
      delete cards[cardId];
      return { board: { ...state.board, columns, cards } };
    }),

  reset: () => set({ board: null, presence: [] }),
}));
