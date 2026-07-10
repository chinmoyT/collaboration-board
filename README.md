# Collab Board

A real-time collaborative Kanban board — drag-and-drop cards across columns and see changes sync instantly across every connected browser, with live presence avatars showing who's currently on the board.

## Tech stack

**Frontend** (`client/`)
- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (state)
- React Router
- Socket.io client
- dnd-kit (drag and drop)

**Backend** (`server/`)
- Node.js + Express
- Socket.io
- JWT auth
- PostgreSQL + Prisma ORM

**Infra**
- Docker + Docker Compose

## How it works

Two communication channels between client and server:

- **REST (HTTP)** — used only for login. `POST /api/auth/login` issues a JWT.
- **WebSocket (Socket.io)** — everything about boards: fetching initial state, creating/moving/deleting cards, and presence. The client connects with the JWT in the handshake, joins a room per board (`board:<id>`), and after that all updates flow as socket events (`card:create`, `card:move`, `card:delete`, `presence:update`) broadcast to everyone in that room.

Card moves are applied **optimistically** on the client (instant feedback) before being sent to the server, which then rebroadcasts to every other connected client on that board.

### Data storage

Boards, columns, and cards are persisted in **PostgreSQL** via **Prisma** ([server/src/store/boardStore.js](server/src/store/boardStore.js), schema in [server/prisma/schema.prisma](server/prisma/schema.prisma)). A board is auto-created the first time its ID is requested. Card ordering within a column is tracked with a `position` column rather than array order, which is re-numbered on every move inside a transaction.

Presence (who's currently viewing a board) stays in an in-memory map ([server/src/store/presenceStore.js](server/src/store/presenceStore.js)) — it's ephemeral by nature, tied to live socket connections, so it doesn't need to be persisted.

## Project structure

```
node-js/
├── docker-compose.yml
├── server/
│   ├── prisma/schema.prisma    # Board, Column, Card models
│   └── src/
│       ├── index.js            # Express + HTTP server + Socket.io bootstrap
│       ├── prismaClient.js     # Prisma client singleton
│       ├── middleware/auth.js  # JWT sign/verify, REST + socket auth
│       ├── routes/             # /api/auth, /api/boards
│       ├── socket/             # room join/leave, card events
│       └── store/               # boardStore (Postgres) + presenceStore (in-memory)
└── client/
    └── src/
        ├── services/           # REST client (api.ts), socket client (socket.ts)
        ├── store/               # Zustand: auth, board state
        ├── hooks/useBoardSocket.ts  # wires socket events to the store
        ├── components/          # ColumnView, CardItem, PresenceBar
        └── pages/                # Login, Boards, Board
```

## Running locally

### With Docker (recommended)

```bash
docker compose up --build
```

- Client: http://localhost:5173
- Server: http://localhost:4000

Both services bind-mount their `src/` folders, so code changes hot-reload without rebuilding the image.

### Without Docker

Postgres still needs to be running somewhere reachable — easiest is `docker compose up -d postgres`, or point `DATABASE_URL` in `server/.env` at your own instance.

**Server**
```bash
cd server
cp .env.example .env
npm install          # also generates the Prisma client (postinstall)
npx prisma migrate dev
npm run dev
```

**Client** (in a separate terminal)
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
