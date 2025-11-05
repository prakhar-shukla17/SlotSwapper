# SlotSwapper



SlotSwapper is a peer-to-peer time-slot scheduling platform that helps teams coordinate meetings by marking events as swappable, proposing exchanges, and handling requests in real time. The project consists of an Express/MongoDB backend and a React/Vite frontend connected via REST APIs and Socket.IO to deliver instant marketplace updates and notifications.


---

## Overview

```
frontend/ (React 19 + Vite + Tailwind)
 ├── Zustand stores (auth, events, swaps, notifications)
 ├── Socket.IO client abstraction (context provider)
 └── Dashboard pages (My Events, Marketplace, Requests)

backend/ (Node.js + Express + MongoDB)
 ├── Routes (auth, events, swaps)
 ├── Controllers 
 ├── Socket.IO server + room management
 └── Mongoose models (User, Event, SwapRequest)
```

- **State Management:** Zustand stores keep client state lean while allowing simple optimistic updates.
- **API Layer:** Axios instance handles authenticated requests (JWT cookie) with `withCredentials` enabled.
- **Realtime Layer:** Socket.IO  identify each authenticated user so swap request notifications can be pushed selectively.


## Design Choices

- **Realtime Marketplace Sync:** Swappable slots appear/disappear instantly for every user through Socket.IO broadcasts.
- **Swap Lifecycle Management:** Requests transition through pending → accepted/rejected/cancelled with backend transactions guarding consistency.
- **Notifications:** Toasts (via `sonner`) surface incoming requests, acceptances, rejections, and cancellations with popups.


## Getting Started

### Prerequisites

- Node.js **>= 18** (recommended)
- npm **>= 9**
- MongoDB instance (local or hosted)

### Environment Variables

Create the following environment files before running the project:

**`backend/.env`**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/slotswapper
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000
```

> Ensure the `CLIENT_URL` matches the frontend origin so CORS and Socket.IO handshakes succeed.

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:5000` and exposes REST endpoints under `/api/v1`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` by default and proxies API calls directly to the backend URL defined in `VITE_API_URL`.

### Running the Full Stack

1. Start MongoDB (e.g., `mongod` or your managed instance).
2. Launch the backend (`npm run dev` in `backend/`).
3. Launch the frontend (`npm run dev` in `frontend/`).
4. Open `http://localhost:5173` and register/login to begin testing.

### Docker Compose (One-Command Setup)

> Make sure Docker Desktop (or an equivalent engine) is running.

```bash
docker compose up --build
```

This starts three containers:

| Service    | Description                         | Port |
|------------|-------------------------------------|------|
| backend    | Express API + Socket.IO             | 5000 |
| frontend   | Vite dev server (hot reload enabled)| 5173 |
| mongo      | MongoDB database                    | 27017 |

The frontend container points to `http://backend:5000`, so once all services are healthy you can visit `http://localhost:5173` in your browser as usual. To stop everything, press `Ctrl+C` and run `docker compose down` to clean up containers (the MongoDB data persists in the named `mongo-data` volume).


## API Reference

All endpoints are prefixed with `/api/v1`. Authentication-protected routes require the JWT cookie issued by `POST /auth/login`.

### Authentication

| Method | Endpoint        | Description                | Body / Query |
|--------|-----------------|----------------------------|--------------|
| POST   | `/auth/register`| Register a new user        | `{ name, email, password }` |
| POST   | `/auth/login`   | Login and receive JWT cookie| `{ email, password }` |
| POST   | `/auth/logout`  | Clear authentication cookie | — |
| GET    | `/auth/me`      | Fetch current user profile | — |
| POST   | `/auth/refresh` | Refresh session token      | — |

### Events

| Method | Endpoint           | Description                         | Body |
|--------|--------------------|-------------------------------------|------|
| GET    | `/events`          | List current user's events (optional query: `startDate`, `endDate`, `status`) | — |
| POST   | `/events`          | Create an event                     | `{ title, date, startTime, endTime, status?, location? }` |
| GET    | `/events/:id`      | Fetch a single event                | — |
| PATCH  | `/events/:id`      | Update event fields                 | partial event payload |
| DELETE | `/events/:id`      | Delete an event                     | — |
| PATCH  | `/events/:id/status` | Toggle/assign event status (`busy`, `swappable`, `swap_pending`) | `{ status }` |

### Swaps

| Method | Endpoint                      | Description                                      | Body |
|--------|-------------------------------|--------------------------------------------------|------|
| GET    | `/swaps/swappable-slots`      | List other users' swappable slots (future-only)  | — |
| POST   | `/swaps`                      | Create swap request                              | `{ requesterEventId, requestedEventId, message? }` |
| GET    | `/swaps/sent`                 | Fetch requests initiated by current user         | — |
| GET    | `/swaps/received`             | Fetch requests targeting current user            | — |
| GET    | `/swaps/:id`                  | Retrieve specific swap request                   | — |
| PATCH  | `/swaps/:requestId/respond`   | Accept or reject a swap request                  | `{ accepted, message? }` |
| DELETE | `/swaps/:id`                  | Cancel a pending request (requester only)        | — |

## Realtime Socket Events

After authenticating, the frontend identifies the user with the Socket.IO server and joins a private room. Key events:

| Channel            | Payload                                         | Trigger |
|--------------------|--------------------------------------------------|---------|
| `events:created`   | `{ event, userId }`                              | Event creation (broadcast) |
| `events:updated`   | `{ event, userId }`                              | Event edits |
| `events:deleted`   | `{ eventId, userId }`                            | Event deletion |
| `events:statusChanged` | `{ event, userId }`                          | Status toggles / swap state changes |
| `swaps:new`        | `{ swapRequest, actorId }` (to requested user)   | New swap request |
| `swaps:updated`    | `{ swapRequest, action, actorId }` (both parties)| Swap accepted/rejected/cancelled |

The client listens to these channels, refreshes the relevant stores (events/swaps), and surfaces toast notifications through the `NotificationCenter` component.

## Assumptions

- The system assumes all users belong to the same organization or workspace.Everyone can potentially view or request swaps with everyone else.
- Events occur within a single day.Events use a 24-hour HH:mm format and do not span across days
- The system assumes all users are in the same timezone.
- While users’ full calendars are private, events marked as “swappable” become visible to other users in the public marketplace.


## Challenges & Future Enhancements

- **Making sure both events swap correctly**: When someone accepts a request, we have to swap just the dates and times and leave the titles or descriptions alone. I used MongoDB transactions so both event updates happen together—otherwise one event could change and the other might fail.
- **Keeping event statuses in sync**: Events bounce between swappable, swap_pending, and busy. I got confused a few times, especially when a swap was cancelled or rejected—I had to double-check that both events went back to swappable so the marketplace stayed accurate.
- **Blocking duplicate swap requests**: At first users could accidentally send multiple pending requests for the same pair of events. I added a backend check to stop that, then reloaded the lists right after each action so everyone sees the latest state.
- **Identifying users over Socket.IO**: I learned that sockets don’t automatically know which user is connected. I had to emit a user:identify event right after login so the server could join that socket to a room based on the user ID. Without that, notifications were going to the wrong people.
- **Dealing with reconnections**: When the browser refreshed, the socket reconnected but lost the room info. Re-sending the identify event on each connection made sure private notifications started flowing again.
---
