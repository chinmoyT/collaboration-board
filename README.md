# Collab Board

A real-time collaborative Kanban board with role-based access — Admins create boards and provision End Users, End Users only see boards they've been assigned to. Drag-and-drop cards across columns and see changes sync instantly across every connected browser, with live presence avatars showing who's currently on the board.

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
- JWT auth (email + password, bcrypt-hashed)
- PostgreSQL + Prisma ORM

**Infra**
- Docker + Docker Compose

## How it works

**Roles**: there are exactly two — **Admin** (singular; there's no self-signup and Admins can't create other Admins) and **End User**. Admin creates boards, creates End User accounts with a temporary password, and assigns/reassigns End Users to boards on a dedicated **Manage Users** page. An End User's board list only shows boards they've been assigned to; an Admin's shows every board.

**Bootstrapping the one Admin account**: since there's no signup flow, the Admin is created directly with a script — see [Creating the Admin account](#creating-the-admin-account) below.

Two communication channels between client and server:

- **REST (HTTP)** — login, and everything about boards/users as static lists: `GET/POST /api/boards`, `DELETE /api/boards/:id`, `GET/POST /api/users`, `DELETE /api/users/:id`, `POST/DELETE /api/users/:id/boards/:boardId` (assignment).
- **WebSocket (Socket.io)** — everything happening *inside* a specific board: fetching its live state, creating/moving/deleting cards, and presence. The client connects with the JWT in the handshake, joins a room per board (`board:<id>`), and after that all updates flow as socket events (`card:create`, `card:move`, `card:delete`, `presence:update`) broadcast to everyone in that room.

Card moves are applied **optimistically** on the client (instant feedback) before being sent to the server, which then rebroadcasts to every other connected client on that board.

### Authorization

Every board-scoped action — REST fetch, `board:join`, `card:create`, `card:move`, `card:delete` — checks `req.user`/`socket.user` (decoded server-side from the JWT, never trusted from client input) against the `BoardMember` table before doing anything. Admins bypass the membership check; End Users get a 403 / socket error if they're not assigned. This is enforced independently on both the REST layer and the socket layer, since a client could otherwise emit socket events directly without ever going through a REST call.

### Data storage

Users, boards, columns, cards, and board memberships are all persisted in **PostgreSQL** via **Prisma** (schema in [server/prisma/schema.prisma](server/prisma/schema.prisma)). `BoardMember` is a many-to-many join table between `User` and `Board`. Card ordering within a column is tracked with a `position` column rather than array order, which is re-numbered on every move inside a transaction.

Presence (who's currently viewing a board) stays in an in-memory map ([server/src/store/presenceStore.js](server/src/store/presenceStore.js)) — it's ephemeral by nature, tied to live socket connections, so it doesn't need to be persisted.

## Project structure

```
node-js/
├── docker-compose.yml
├── server/
│   ├── prisma/schema.prisma    # User (role), Board, Column, Card, BoardMember models
│   ├── scripts/create-admin.js # bootstraps the one Admin account
│   └── src/
│       ├── index.js            # Express + HTTP server + Socket.io bootstrap + error middleware
│       ├── prismaClient.js     # Prisma client singleton
│       ├── middleware/         # auth.js (JWT, requireAdmin), asyncHandler.js (rejects → next(err))
│       ├── routes/             # /api/auth, /api/boards, /api/users
│       ├── socket/             # room join/leave, card events, per-action authorization
│       └── store/               # boardStore (Postgres) + presenceStore (in-memory)
└── client/
    └── src/
        ├── services/           # REST client (api.ts), socket client (socket.ts)
        ├── store/               # Zustand: auth, board state
        ├── hooks/useBoardSocket.ts  # wires socket events to the store
        ├── components/          # ColumnView, CardItem, PresenceBar, ProtectedRoute, AdminRoute
        └── pages/                # Login, Boards, Board, Users (admin-only)
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

## Creating the Admin account

There's no signup form and an Admin can't create another Admin, so the one Admin account is created directly:

```bash
cd server
node scripts/create-admin.js admin@example.com "some-password" "Admin Name"
```

From there, log in as that Admin to create End User accounts and assign them to boards.

## Deploying

**The client and server deploy to different kinds of platforms** — the server needs a persistent process for Socket.io (WebSockets don't work on serverless), so it can't live on Vercel alongside the client.

| Piece | Where | Why |
|---|---|---|
| `client/` | Vercel | Static Vite build, ships as `dist/` |
| `server/` | Render / Railway / Fly.io | Needs a long-running Node process for WebSockets |
| Postgres | Render/Railway managed Postgres, or Neon/Supabase | Needs to be reachable from wherever the server runs |

Both `CLIENT_URL` (server-side, for CORS) and `VITE_API_URL` (client-side, for API/socket calls) are already read from environment variables — no code changes needed, just setting them correctly per environment.

**1. Server** (example: Render)
- New Web Service → point at this repo, root directory `server`
- Build command: `npm install` (runs `prisma generate` via `postinstall`)
- Start command: `npm start`
- Add a managed Postgres instance, set `DATABASE_URL` to its connection string
- Set `JWT_SECRET` (long random string) and `PORT` (most platforms inject this automatically — `server/src/index.js` already reads `process.env.PORT`)
- After the first deploy, open a shell on the service and run:
  ```bash
  npx prisma migrate deploy
  node scripts/create-admin.js admin@example.com "some-password" "Admin Name"
  ```
- Note the server's public URL

**2. Client** (Vercel)
- New Project → import this repo, set **Root Directory** to `client`
- Framework preset: Vite (auto-detected)
- Environment variable: `VITE_API_URL` = the server URL from step 1
- Deploy — `client/vercel.json` handles the SPA rewrite so client-side routes (e.g. `/boards/:id`) don't 404 on refresh

**3. Close the loop**
- Back on the server platform, set `CLIENT_URL` to the resulting Vercel URL and redeploy — CORS is origin-locked, so the server won't accept requests from the client until this matches exactly.
