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

**Infra**
- Docker + Docker Compose

## How it works

Two communication channels between client and server:

- **REST (HTTP)** — used only for login. `POST /api/auth/login` issues a JWT.
- **WebSocket (Socket.io)** — everything about boards: fetching initial state, creating/moving/deleting cards, and presence. The client connects with the JWT in the handshake, joins a room per board (`board:<id>`), and after that all updates flow as socket events (`card:create`, `card:move`, `card:delete`, `presence:update`) broadcast to everyone in that room.

Card moves are applied **optimistically** on the client (instant feedback) before being sent to the server, which then rebroadcasts to every other connected client on that board.

### Data storage

Boards currently live in an **in-memory `Map`** on the server ([server/src/store/boardStore.js](server/src/store/boardStore.js)) — there is no database yet. This means:
- Data is lost on server restart.
- A board is auto-created the first time its ID is requested.
- Running multiple server instances would give each its own disconnected set of boards.

Swapping in Postgres/Redis is the natural next step (see Roadmap).

## Project structure

```
node-js/
├── docker-compose.yml
├── server/
│   └── src/
│       ├── index.js            # Express + HTTP server + Socket.io bootstrap
│       ├── middleware/auth.js  # JWT sign/verify, REST + socket auth
│       ├── routes/             # /api/auth, /api/boards
│       ├── socket/             # room join/leave, card events
│       └── store/               # in-memory board + presence state
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

**Server**
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

**Client** (in a separate terminal)
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
