/**
 * ─────────────────────────────────────────────────────────────
 *  SoloTraveller — API Client
 *  Single file for all HTTP calls to the backend.
 *  Set VITE_API_URL in your .env file.
 * ─────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Core fetch wrapper.
 * - Attaches JWT token from localStorage (if present) as Bearer header
 * - Throws an Error with the server's message on non-2xx responses
 */
export async function api(path, options = {}) {
  const token = localStorage.getItem('st_token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  }

  const res  = await fetch(`${BASE_URL}${path}`, config)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`)
  }

  return data
}

/* ─── Token helpers ─────────────────────────────────────── */
export function saveToken(token)  { localStorage.setItem('st_token', token) }
export function clearToken()      { localStorage.removeItem('st_token') }
export function getToken()        { return localStorage.getItem('st_token') }

/* ─── Auth endpoints ────────────────────────────────────── */
export const authAPI = {
  // POST /api/auth/login → { token, user: { id, name, email } }
  login:   (email, password, remember) =>
    api('/api/auth/login',  { method: 'POST', body: JSON.stringify({ email, password, remember }) }),

  // POST /api/auth/signup → { token, user: { id, name, email } }
  signup:  (name, email, password) =>
    api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  // POST /api/auth/logout → { success: true }
  logout:  () =>
    api('/api/auth/logout', { method: 'POST' }),

  // GET /api/auth/me → { user: { id, name, email } }
  // Used on app mount to restore session from saved token
  me:      () =>
    api('/api/auth/me'),
}

/* ─── Trips endpoints ───────────────────────────────────── */
export const tripsAPI = {
  // GET /api/trips → { trips: [...] }
  getAll:       () =>
    api('/api/trips'),

  // GET /api/trips/:id → { trip }
  getOne:       (id) =>
    api(`/api/trips/${id}`),

  // POST /api/trips → { trip }
  // Body: { destination, days, pace, budget, tripType, food }
  create:       (payload) =>
    api('/api/trips', { method: 'POST', body: JSON.stringify(payload) }),

  // PUT /api/trips/:id → { trip }
  update:       (id, payload) =>
    api(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // DELETE /api/trips/:id → { success: true }
  remove:       (id) =>
    api(`/api/trips/${id}`, { method: 'DELETE' }),

  // GET /api/trips/:id/itinerary → { days: [...] }
  getItinerary: (id) =>
    api(`/api/trips/${id}/itinerary`),

  // POST /api/trips/:id/itinerary → { days: [...] }
  // Body: { days: [...] } — call this ONLY when user clicks "Save Itinerary"
  saveItinerary: (id, days) =>
    api(`/api/trips/${id}/itinerary`, { method: 'POST', body: JSON.stringify({ days }) }),

  // POST /api/trips/:id/generate → { days: [...], saved: false }
  // Calls Gemini on the backend — returns preview days, does NOT save to DB
  generateItinerary: (id) =>
    api(`/api/trips/${id}/generate`, { method: 'POST' }),

  // POST /api/trips/recommend-places → { places: [...] }
  // Body: { source, destination, tripType, days }
  recommendPlaces: (payload) =>
    api('/api/trips/recommend-places', { method: 'POST', body: JSON.stringify(payload) }),
}

/* ─── User/Profile endpoints ────────────────────────────── */
export const userAPI = {
  // GET /api/user/profile → { user }
  getProfile:    () =>
    api('/api/user/profile'),

  // PUT /api/user/profile → { user }
  updateProfile: (payload) =>
    api('/api/user/profile', { method: 'PUT', body: JSON.stringify(payload) }),
}

/* ─── Safety endpoints ──────────────────────────────────── */
export const safetyAPI = {
  // GET /api/safety/checklist → { checklist: { "night_stay_0": true, ... } }
  getChecklist:    () =>
    api('/api/safety/checklist'),

  // POST /api/safety/checklist → { checklist }
  // Body: { key: "night_stay_0", value: true }
  updateChecklist: (key, value) =>
    api('/api/safety/checklist', { method: 'POST', body: JSON.stringify({ key, value }) }),

  // POST /api/safety/sos → { success: true }
  // Body: { lat, lng, timestamp }
  sendSOS:         (lat, lng) =>
    api('/api/safety/sos', { method: 'POST', body: JSON.stringify({ lat, lng, timestamp: new Date().toISOString() }) }),
}
