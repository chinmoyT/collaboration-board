import { useCallback, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useAuthStore } from "../store/authStore";
import { useBoardStore } from "../store/boardStore";
import type { Board, Card, PresenceUser } from "../types";

export function useBoardSocket(boardId: string) {
  const token = useAuthStore((s) => s.token);
  const { setBoard, setPresence, setError, addCard, moveCard, removeCard, reset } =
    useBoardStore();

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.emit(
      "board:join",
      boardId,
      (res: { board?: Board; presence?: PresenceUser[]; error?: string }) => {
        if (res.error) {
          setError(res.error);
          return;
        }
        setBoard(res.board!);
        setPresence(res.presence!);
      }
    );

    const onPresenceUpdate = (presence: PresenceUser[]) => setPresence(presence);

    const onCardCreated = ({
      columnId,
      card,
    }: {
      columnId: string;
      card: Card;
    }) => addCard(columnId, card);

    const onCardMoved = ({
      cardId,
      fromColumnId,
      toColumnId,
      toIndex,
    }: {
      cardId: string;
      fromColumnId: string;
      toColumnId: string;
      toIndex: number;
    }) => moveCard(cardId, fromColumnId, toColumnId, toIndex);

    const onCardDeleted = ({ cardId }: { cardId: string }) => removeCard(cardId);

    socket.on("presence:update", onPresenceUpdate);
    socket.on("card:created", onCardCreated);
    socket.on("card:moved", onCardMoved);
    socket.on("card:deleted", onCardDeleted);

    return () => {
      socket.emit("board:leave", boardId);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("card:created", onCardCreated);
      socket.off("card:moved", onCardMoved);
      socket.off("card:deleted", onCardDeleted);
      reset();
    };
  }, [boardId, token]);

  const createCard = useCallback(
    (columnId: string, title: string) => {
      const socket = connectSocket(token!);
      socket.emit("card:create", { boardId, columnId, title });
    },
    [boardId, token]
  );

  // Applies the move locally first (instant feedback), then tells the
  // server. Other clients receive it via the card:moved broadcast.
  const moveCardOptimistic = useCallback(
    (
      cardId: string,
      fromColumnId: string,
      toColumnId: string,
      toIndex: number
    ) => {
      moveCard(cardId, fromColumnId, toColumnId, toIndex);
      const socket = connectSocket(token!);
      socket.emit("card:move", {
        boardId,
        cardId,
        fromColumnId,
        toColumnId,
        toIndex,
      });
    },
    [boardId, token, moveCard]
  );

  const deleteCard = useCallback(
    (cardId: string) => {
      const socket = connectSocket(token!);
      socket.emit("card:delete", { boardId, cardId });
    },
    [boardId, token]
  );

  return { createCard, moveCard: moveCardOptimistic, deleteCard };
}

export function logoutSocket() {
  disconnectSocket();
}
