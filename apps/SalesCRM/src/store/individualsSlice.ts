import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Individual, ContactListItem } from '../types'

interface IndividualsState {
  items: ContactListItem[]
  total: number
  page: number
  pageSize: number
  currentIndividual: Individual | null
  loading: boolean
  error: string | null
}

const initialState: IndividualsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  currentIndividual: null,
  loading: false,
  error: null,
}

export const fetchIndividuals = createAsyncThunk(
  'individuals/fetchIndividuals',
  async (params: { page?: number; search?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.search) query.set('search', params.search)
    const res = await fetch(`/.netlify/functions/individuals?${query}`)
    if (!res.ok) throw new Error('Failed to fetch contacts')
    return res.json() as Promise<{ individuals: ContactListItem[]; total: number }>
  }
)

export const fetchIndividual = createAsyncThunk(
  'individuals/fetchIndividual',
  async (individualId: string) => {
    const res = await fetch(`/.netlify/functions/individuals/${individualId}`)
    if (!res.ok) throw new Error('Failed to fetch individual')
    return res.json() as Promise<Individual>
  }
)

export const createIndividual = createAsyncThunk(
  'individuals/createIndividual',
  async (data: { name: string; title?: string; email?: string; phone?: string; location?: string; client_name?: string }) => {
    const res = await fetch('/.netlify/functions/individuals?action=import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts: [data] }),
    })
    if (!res.ok) throw new Error('Failed to create contact')
    return res.json() as Promise<{ imported: number; errors: string[] }>
  }
)

export const individualsSlice = createSlice({
  name: 'individuals',
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndividuals.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchIndividuals.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.individuals
        state.total = action.payload.total
      })
      .addCase(fetchIndividuals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchIndividual.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIndividual.fulfilled, (state, action) => {
        state.loading = false
        state.currentIndividual = action.payload
      })
      .addCase(fetchIndividual.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
  },
})

export const { setPage } = individualsSlice.actions
