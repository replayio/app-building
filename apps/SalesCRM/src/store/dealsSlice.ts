import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Deal } from '../types'

interface DealMetrics {
  total_active: number
  pipeline_value: number
  won_count: number
  won_value: number
  lost_count: number
  lost_value: number
}

interface ClientOption {
  id: string
  name: string
}

interface DealsState {
  items: Deal[]
  currentDeal: Deal | null
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  metrics: DealMetrics
  availableClients: ClientOption[]
}

const initialState: DealsState = {
  items: [],
  currentDeal: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
  metrics: {
    total_active: 0,
    pipeline_value: 0,
    won_count: 0,
    won_value: 0,
    lost_count: 0,
    lost_value: 0,
  },
  availableClients: [],
}

export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (params: { page?: number; search?: string; stage?: string; client?: string; status?: string; sort?: string; dateFrom?: string; dateTo?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.search) query.set('search', params.search)
    if (params.stage) query.set('stage', params.stage)
    if (params.client) query.set('client', params.client)
    if (params.status) query.set('status', params.status)
    if (params.sort) query.set('sort', params.sort)
    if (params.dateFrom) query.set('dateFrom', params.dateFrom)
    if (params.dateTo) query.set('dateTo', params.dateTo)
    const res = await fetch(`/.netlify/functions/deals?${query}`)
    if (!res.ok) throw new Error('Failed to fetch deals')
    return res.json() as Promise<{ deals: Deal[]; total: number; metrics: DealMetrics; clients: ClientOption[] }>
  }
)

export const fetchDeal = createAsyncThunk(
  'deals/fetchDeal',
  async (dealId: string) => {
    const res = await fetch(`/.netlify/functions/deals/${dealId}`)
    if (!res.ok) throw new Error('Failed to fetch deal')
    return res.json() as Promise<Deal>
  }
)

export const createDeal = createAsyncThunk(
  'deals/createDeal',
  async (data: { name: string; client_id: string; value?: number; stage?: string; owner?: string; probability?: number; expected_close_date?: string }) => {
    const res = await fetch('/.netlify/functions/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create deal')
    return res.json() as Promise<Deal>
  }
)

export const updateDeal = createAsyncThunk(
  'deals/updateDeal',
  async ({ dealId, data }: { dealId: string; data: Record<string, unknown> }) => {
    const res = await fetch(`/.netlify/functions/deals/${dealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update deal')
    return res.json() as Promise<Deal>
  }
)

export const deleteDeal = createAsyncThunk(
  'deals/deleteDeal',
  async (dealId: string) => {
    const res = await fetch(`/.netlify/functions/deals/${dealId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete deal')
    return dealId
  }
)

export const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.deals
        state.total = action.payload.total
        state.metrics = action.payload.metrics
        state.availableClients = action.payload.clients
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchDeal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeal.fulfilled, (state, action) => {
        state.loading = false
        state.currentDeal = action.payload
      })
      .addCase(fetchDeal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        state.currentDeal = action.payload
        state.items = state.items.map((d) => d.id === action.payload.id ? action.payload : d)
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
  },
})

export const { setPage: setDealsPage } = dealsSlice.actions
