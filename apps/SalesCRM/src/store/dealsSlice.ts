import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Deal } from '../types'

interface DealsState {
  items: Deal[]
  currentDeal: Deal | null
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
}

const initialState: DealsState = {
  items: [],
  currentDeal: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
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
    return res.json() as Promise<{ deals: Deal[]; total: number }>
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
  },
})

export const { setPage: setDealsPage } = dealsSlice.actions
