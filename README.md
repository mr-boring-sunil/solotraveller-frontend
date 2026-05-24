# ✈️ SoloTraveller — Frontend

> React + Vite travel planner. Fully wired to connect to a REST backend via a single API client (`src/api.js`). Every endpoint is defined and ready — just point `VITE_API_URL` at your server.

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Set backend URL
cp .env.example .env
# Edit .env → VITE_API_URL=http://localhost:5000

# 3. Run
npm run dev        # → http://localhost:5173
npm run build      # production build → dist/
```

---

## 📁 File Structure

```
solotraveller/
├── .env                          ← VITE_API_URL goes here (not committed)
├── .env.example                  ← template for .env
├── index.html                    ← Bootstrap 5 + Font Awesome 6 CDN
├── vite.config.js
│
└── src/
    ├── main.jsx                  ← BrowserRouter + AuthProvider entry
    ├── App.jsx                   ← Routes, PrivateRoute, PublicRoute guards
    ├── index.css                 ← Full design system (CSS variables, layout, components)
    │
    ├── api.js                    ← ★ ALL API CALLS LIVE HERE
    │
    ├── context/
    │   ├── AuthContext.jsx       ← user state, login/logout/signup, token restore on mount
    │   └── TripContext.jsx       ← trips, itinerary, safety checklist — all from API
    │
    ├── data/
    │   └── questions.js          ← 6-question onboarding array (static data)
    │
    ├── pages/
    │   ├── Login.jsx             ← /login
    │   ├── Signup.jsx            ← /signup
    │   ├── Questionnaire.jsx     ← /questionnaire  (calls POST /api/trips)
    │   ├── Dashboard.jsx         ← /dashboard      (reads trips from TripContext)
    │   ├── Itinerary.jsx         ← /itinerary      (calls GET /api/trips/:id/itinerary)
    │   ├── Safety.jsx            ← /safety         (checklist + SOS)
    │   └── Profile.jsx           ← /profile        (GET + PUT /api/user/profile)
    │
    └── components/
        ├── Navbar.jsx            ← bottom nav, hidden on auth pages
        ├── ProgressBar.jsx
        ├── QuestionCard.jsx
        ├── OptionCard.jsx
        ├── InputStep.jsx
        └── SummaryScreen.jsx
```

---

## 🔌 API Reference — `src/api.js`

This is the only file you need to worry about when connecting a backend. It exports:

### Core `api()` function
Sends every request with a `Bearer <token>` header from `localStorage`.

```js
import { api } from './api'

const data = await api('/some/path', {
  method: 'POST',
  body: JSON.stringify({ ... })
})
```

### Token helpers
```js
import { saveToken, clearToken, getToken } from './api'

saveToken('eyJ...')   // stores JWT in localStorage key 'st_token'
clearToken()          // removes it
getToken()            // returns current token or null
```

---

## 📋 Complete Backend Endpoint Contract

### Auth — `authAPI`

| Method | Endpoint | Request Body | Expected Response |
|--------|----------|-------------|-------------------|
| `POST` | `/api/auth/login` | `{ email, password, remember }` | `{ token, user: { id, name, email } }` |
| `POST` | `/api/auth/signup` | `{ name, email, password }` | `{ token, user: { id, name, email } }` |
| `POST` | `/api/auth/logout` | — | `{ success: true }` |
| `GET`  | `/api/auth/me` | — (token in header) | `{ user: { id, name, email } }` |

> `GET /api/auth/me` is called on every app load to restore session from saved token. If the token is expired, return `401` and the frontend will clear it and show the login page.

---

### Trips — `tripsAPI`

| Method | Endpoint | Request Body | Expected Response |
|--------|----------|-------------|-------------------|
| `GET`  | `/api/trips` | — | `{ trips: [ TripObject, ... ] }` |
| `GET`  | `/api/trips/:id` | — | `{ trip: TripObject }` |
| `POST` | `/api/trips` | `{ destination, days, pace, budget, tripType, food }` | `{ trip: TripObject }` |
| `PUT`  | `/api/trips/:id` | any trip fields | `{ trip: TripObject }` |
| `DELETE` | `/api/trips/:id` | — | `{ success: true }` |
| `GET`  | `/api/trips/:id/itinerary` | — | `{ days: [ DayObject, ... ] }` |

**TripObject shape:**
```json
{
  "id": 1,
  "destination": "Goa, India",
  "emoji": "🏖️",
  "days": 5,
  "budget": 3000,
  "pace": "Moderate",
  "tripType": "Relaxation",
  "food": "Non-Veg",
  "status": "active",
  "startDate": "2025-05-01",
  "endDate": "2025-05-05",
  "color": "linear-gradient(135deg,#1e3a5f,#0d5c63)"
}
```

> `status` must be one of: `"active"` | `"upcoming"` | `"past"`

**DayObject shape (itinerary):**
```json
{
  "day": 1,
  "date": "May 1",
  "theme": "Arrival & Beach Chill",
  "items": [
    {
      "time": "10:00 AM",
      "title": "Arrive at Goa Airport",
      "detail": "Pick up rental scooter, check in to hostel",
      "emoji": "✈️",
      "cost": 0,
      "type": "transport"
    }
  ]
}
```

> `item.type` must be one of: `"transport"` | `"food"` | `"activity"`

---

### User Profile — `userAPI`

| Method | Endpoint | Request Body | Expected Response |
|--------|----------|-------------|-------------------|
| `GET`  | `/api/user/profile` | — | `{ user: ProfileObject }` |
| `PUT`  | `/api/user/profile` | any profile fields | `{ user: ProfileObject }` |

**ProfileObject shape:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": "25",
  "place": "Mumbai",
  "address": "Street, Area, City",
  "phone": "+91 987654321",
  "tripType": "Adventure",
  "food": "Vegetarian",
  "pace": "Moderate",
  "budget": "3000"
}
```

---

### Safety — `safetyAPI`

| Method | Endpoint | Request Body | Expected Response |
|--------|----------|-------------|-------------------|
| `GET`  | `/api/safety/checklist` | — | `{ checklist: { "night_stay_0": true, ... } }` |
| `POST` | `/api/safety/checklist` | `{ key: "night_stay_0", value: true }` | `{ checklist }` |
| `POST` | `/api/safety/sos` | `{ lat, lng, timestamp }` | `{ success: true }` |

> The checklist key format is `{categoryId}_{tipIndex}`, e.g. `"night_stay_0"`, `"public_transport_3"`.

---

## 🔐 Authentication Flow

```
User submits login form
  → authAPI.login(email, password)
  → Backend returns { token, user }
  → saveToken(token)         stores JWT in localStorage
  → setUser(user)            updates React state
  → navigate('/dashboard')

On every page refresh:
  → getToken()               reads JWT from localStorage
  → authAPI.me()             GET /api/auth/me with token in Authorization header
  → If 200: setUser(data.user)
  → If 401: clearToken(), setUser(null), redirect to /login

User clicks logout:
  → authAPI.logout()         POST /api/auth/logout (invalidates server session)
  → clearToken()             removes JWT from localStorage
  → setUser(null)            clears React state
  → navigate('/login')
```

---

## 🌐 CORS Setup (Backend)

Your backend **must** allow requests from the frontend origin:

```js
// Express.js example
const cors = require('cors')

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend base URL | `http://localhost:5000` |

Change for production:
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
```

---

## 🗺️ Navigation & Route Guards

```
/login   ─── PublicRoute  → redirects to /dashboard if already logged in
/signup  ─── PublicRoute  → redirects to /dashboard if already logged in

/questionnaire  ─── PrivateRoute ─┐
/dashboard      ─── PrivateRoute  │ redirect to /login if no user
/itinerary      ─── PrivateRoute  │
/safety         ─── PrivateRoute  │
/profile        ─── PrivateRoute ─┘
```

While `AuthContext` is checking the saved token on mount, every route shows a centered spinner. This prevents flashing the login page on refresh.

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI |
| `react-router-dom` v7 | Routing |
| `framer-motion` | Animations |
| `vite` | Build tool |
| Bootstrap 5 (CDN) | Grid + utilities |
| Font Awesome 6 (CDN) | Icons |
| Google Fonts (CDN) | Syne + DM Sans + DM Mono |

---

## ✅ What's Ready

- [x] JWT token stored and sent automatically on every request
- [x] Session restored from saved token on page refresh
- [x] All 5 page areas wired to their API endpoints
- [x] Loading spinners and error messages on every async operation
- [x] SOS button gets live GPS coordinates before calling backend
- [x] Safety checklist synced to backend with optimistic UI updates
- [x] Profile loaded from API on mount, saved via PUT
- [x] Trips list loaded from API, cleared on logout
- [x] Questionnaire saves trip via POST /api/trips
