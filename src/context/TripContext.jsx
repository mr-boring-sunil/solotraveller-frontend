import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { tripsAPI, safetyAPI } from '../api'
import { useAuth } from './AuthContext'

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const { user } = useAuth()

  const [trips,         setTrips]         = useState([])
  const [itinerary,     setItinerary]     = useState({})   // { [tripId]: [...days] } — SAVED in DB
  const [unsavedItinerary, setUnsaved]    = useState(null) // { tripId, days } — preview only, NOT yet in DB
  const [checklist,     setChecklist]     = useState({})
  const [tripsLoading,  setTripsLoading]  = useState(false)
  const [tripsError,    setTripsError]    = useState(null)

  // ── Fetch all trips when user logs in ──────────────────────────
  const fetchTrips = useCallback(async () => {
    if (!user) return
    setTripsLoading(true)
    setTripsError(null)
    try {
      const data = await tripsAPI.getAll()         // GET /api/trips
      setTrips(data.trips || [])
    } catch (err) {
      setTripsError(err.message)
    } finally {
      setTripsLoading(false)
    }
  }, [user])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  // ── Fetch saved itinerary for a trip (lazy) ─────────────────────
  // Only fetches from DB — does NOT affect unsaved preview state
  async function fetchItinerary(tripId) {
    if (itinerary[tripId]) return   // already cached
    try {
      const data = await tripsAPI.getItinerary(tripId)  // GET /api/trips/:id/itinerary
      if (data.days?.length) {
        setItinerary(prev => ({ ...prev, [tripId]: data.days }))
      }
    } catch (err) {
      console.error('Failed to fetch itinerary:', err.message)
    }
  }

  // ── Generate itinerary via Gemini (preview — NOT saved to DB) ────
  async function generateItinerary(tripId) {
    const data = await tripsAPI.generateItinerary(tripId)  // POST /api/trips/:id/generate
    // Put generated days into unsaved preview state
    setUnsaved({ tripId, days: data.days })
    return data.days
  }

  // ── Set an unsaved (AI-generated) itinerary for preview ─────────
  // Call this when the backend generates an itinerary but user hasn't saved it yet.
  // days are stored in state only — NOT sent to DB.
  function previewItinerary(tripId, days) {
    setUnsaved({ tripId, days })
  }

  // ── Save the previewed itinerary to DB ──────────────────────────
  // Only called when user explicitly clicks "Save Itinerary".
  async function saveItinerary(tripId, days) {
    const data = await tripsAPI.saveItinerary(tripId, days)  // POST /api/trips/:id/itinerary
    // Move from unsaved → saved cache
    setItinerary(prev => ({ ...prev, [tripId]: data.days }))
    setUnsaved(null)
    return data.days
  }

  // ── Discard the unsaved preview ─────────────────────────────────
  function discardItinerary() {
    setUnsaved(null)
  }

  // ── Create a new trip ────────────────────────────────────────────
  async function createTrip(payload) {
    const data = await tripsAPI.create(payload)  // POST /api/trips
    setTrips(prev => [...prev, data.trip])
    return data.trip
  }

  // ── Delete a trip ────────────────────────────────────────────────
  async function deleteTrip(tripId) {
    await tripsAPI.remove(tripId)  // DELETE /api/trips/:id
    setTrips(prev => prev.filter(t => t.id !== tripId && t._id !== tripId))
    // Also clear any cached itinerary for this trip
    setItinerary(prev => {
      const next = { ...prev }
      delete next[tripId]
      return next
    })
    if (unsavedItinerary?.tripId === tripId) setUnsaved(null)
  }

  // ── Update trip status ───────────────────────────────────────────
  async function updateTripStatus(tripId, status) {
    const data = await tripsAPI.update(tripId, { status })
    setTrips(prev => prev.map(t => (t.id === tripId || t._id === tripId) ? data.trip : t))
    return data.trip
  }

  // ── Safety checklist ─────────────────────────────────────────────
  const fetchChecklist = useCallback(async () => {
    if (!user) return
    try {
      const data = await safetyAPI.getChecklist()
      setChecklist(data.checklist || {})
    } catch { setChecklist({}) }
  }, [user])

  useEffect(() => { fetchChecklist() }, [fetchChecklist])

  async function toggleChecklist(key) {
    const newVal = !checklist[key]
    setChecklist(prev => ({ ...prev, [key]: newVal }))  // optimistic
    try {
      await safetyAPI.updateChecklist(key, newVal)
    } catch {
      setChecklist(prev => ({ ...prev, [key]: !newVal }))  // revert
    }
  }

  function getActiveTrip() {
    // 1. Search for active (ongoing) trip
    const activeTrip = trips.find(t => t.status === 'active')
    if (activeTrip) return activeTrip

    // 2. Search for completed (past) trips
    const completedTrips = trips.filter(t => t.status === 'past')
    if (completedTrips.length > 0) {
      // Sort completed trips by endDate descending (latest first) or createdAt descending
      return [...completedTrips].sort((a, b) => {
        if (a.endDate && b.endDate) return b.endDate.localeCompare(a.endDate)
        return new Date(b.createdAt) - new Date(a.createdAt)
      })[0]
    }

    // 3. Search for upcoming trips sorted by startDate ascending (earliest first)
    const upcomingTrips = trips.filter(t => t.status === 'upcoming')
    if (upcomingTrips.length > 0) {
      return [...upcomingTrips].sort((a, b) => {
        if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate)
        return new Date(a.createdAt) - new Date(b.createdAt)
      })[0]
    }

    return null
  }

  function getTripItinerary(tripId) {
    return itinerary[tripId] || []
  }

  function hasUnsavedItinerary(tripId) {
    return unsavedItinerary?.tripId === tripId
  }

  function getUnsavedDays(tripId) {
    return unsavedItinerary?.tripId === tripId ? unsavedItinerary.days : []
  }

  // ── Clear on logout ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setTrips([])
      setItinerary({})
      setUnsaved(null)
      setChecklist({})
    }
  }, [user])

  return (
    <TripContext.Provider value={{
      trips, tripsLoading, tripsError,
      itinerary, checklist,
      unsavedItinerary,
      fetchTrips, fetchItinerary,
      generateItinerary,
      previewItinerary, saveItinerary, discardItinerary,
      createTrip, deleteTrip, updateTripStatus,
      toggleChecklist,
      getActiveTrip, getTripItinerary,
      hasUnsavedItinerary, getUnsavedDays,
    }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  return useContext(TripContext)
}
