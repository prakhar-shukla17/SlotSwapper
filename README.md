# SlotSwapper

> Repository: https://github.com/your-username/SlotSwapper *(replace with the actual public URL once pushed)*

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

Optional scripts:

- `npm run lint` (frontend/backend) – ensure code quality.
- `npm run build` (frontend) – generate production bundle.

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

- Users operate within a single organisation; email-based registration is sufficient.
- Events use 24-hour `HH:mm` strings and represent same-day scheduling (no cross-day validation implemented).
- JWT authentication uses HTTP-only cookies; HTTPS termination is handled upstream in production.
- No seed data is provided; testers will create events manually.

## Challenges & Future Enhancements

- **Realtime Consistency:** Coordinating event status transitions across multiple clients required transactional updates and duplicate-event guards on the client.
- **Socket Identification:** Introduced explicit `user:identify` handshake to route notifications to the correct user room.
- **UI/UX Modernisation:** Tailwind 4 utilities replaced third-party component libraries to prevent compatibility issues while keeping the design modern.
- **Potential Improvements:**
  - Add comprehensive automated tests for swap edge cases.
  - Provide pagination/filters for large event sets.
  - Implement email notifications alongside in-app toasts.

---

> Once the repository is public, update the repository link above and share it with reviewers alongside this README for a smooth verification process.
