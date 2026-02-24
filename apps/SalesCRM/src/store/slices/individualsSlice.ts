import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Individual {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  location: string | null
  created_at: string
  updated_at: string
  client_names?: string[]
}

export interface IndividualClient {
  id: string
  name: string
  status: string
  type: string
}

export interface IndividualRelationship {
  id: string
  related_individual_id: string
  related_individual_name: string
  related_individual_title: string | null
  relationship_type: string
  related_individual_clients: string
}

export interface ContactHistoryEntry {
  id: string
  type: string
  summary: string
  notes: string | null
  performed_by: string | null
  performer_name: string
  performer_role: string
  contact_date: string
  created_at: string
}

export interface IndividualDetail extends Individual {
  clients: IndividualClient[]
  relationships: IndividualRelationship[]
  contact_history: ContactHistoryEntry[]
}

interface IndividualsState {
  items: Individual[]
  current: IndividualDetail | null
  loading: boolean
  error: string | null
  search: string
  page: number
  total: number
}

const initialState: IndividualsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  search: '',
  page: 1,
  total: 0,
}

export const fetchIndividuals = createAsyncThunk(
  'individuals/fetchIndividuals',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as { individuals: IndividualsState }).individuals
      const params = new URLSearchParams()
      if (state.search) params.set('search', state.search)
      params.set('page', String(state.page))
      const res = await fetch(`/.netlify/functions/individuals?${params}`)
      if (!res.ok) return rejectWithValue('Failed to fetch individuals')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const fetchIndividual = createAsyncThunk(
  'individuals/fetchIndividual',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/.netlify/functions/individuals/${id}`)
      if (!res.ok) return rejectWithValue('Failed to fetch individual')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

const individualsSlice = createSlice({
  name: 'individuals',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload
      state.page = 1
    },
    setPage(state, action) {
      state.page = action.payload
    },
    clearCurrent(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndividuals.pending, (state) => {
        if (state.items.length === 0) state.loading = true
        state.error = null
      })
      .addCase(fetchIndividuals.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.individuals
        state.total = action.payload.total
      })
      .addCase(fetchIndividuals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchIndividual.pending, (state) => {
        if (!state.current) state.loading = true
        state.error = null
      })
      .addCase(fetchIndividual.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchIndividual.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSearch, setPage, clearCurrent } = individualsSlice.actions
export default individualsSlice.reducer
