export type Role = "ADMIN" | "END_USER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
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
  name: string;
  columns: Column[];
  cards: Record<string, Card>;
}

export interface PresenceUser {
  id: string;
  name: string;
}

export interface BoardSummary {
  id: string;
  name: string;
  createdAt: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  boardIds: string[];
}
