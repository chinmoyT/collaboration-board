export interface User {
  id: string;
  name: string;
}

export interface Card {
  id: string;
  title: string;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  columns: Column[];
  cards: Record<string, Card>;
}

export interface PresenceUser {
  id: string;
  name: string;
}
