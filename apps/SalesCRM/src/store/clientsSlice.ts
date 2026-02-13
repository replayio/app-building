import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Client } from '../types'

interface ClientsState {
  items: Client[]
  currentClient: Client | null
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: ClientsState = {
  items: [],
  currentClient: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 50,
}

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params: { page?: number; search?: string; status?: string; tag?: string; source?: string; sort?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    if (params.tag) query.set('tag', params.tag)
    if (params.source) query.set('source', params.source)
    if (params.sort) query.set('sort', params.sort)
    const res = await fetch(`/.netlify/functions/clients?${query}`)
    if (!res.ok) throw new Error('Failed to fetch clients')
    return res.json() as Promise<{ clients: Client[]; total: number }>
  }
)

export const fetchClient = createAsyncThunk(
  'clients/fetchClient',
  async (clientId: string) => {
    const res = await fetch(`/.netlify/functions/clients/${clientId}`)
    if (!res.ok) throw new Error('Failed to fetch client')
    return res.json() as Promise<Client>
  }
)

export const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.clients
        state.total = action.payload.total
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchClient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClient.fulfilled, (state, action) => {
        state.loading = false
        state.currentClient = action.payload
      })
      .addCase(fetchClient.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
  },
})

export const { setPage } = clientsSlice.actions
