import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'

export interface DealRow {
  id: string
  name: string
  client_id: string
  client_name: string
  stage: string
  value: number | string | null
  owner: string | null
  status: string
  probability: number | null
  expected_close_date: string | null
  close_date: string | null
  created_at: string
  updated_at: string
}

export interface DealsSummary {
  totalActive: number
  pipelineValue: number
  wonCount: number
  wonValue: number
  lostCount: number
  lostValue: number
  currentQuarter: number
}

interface DealsState {
  items: DealRow[]
  total: number
  page: number
  pageSize: number
  loading: boolean
  error: string | null
  filters: {
    search: string
    stage: string
    client: string
    status: string
    sort: string
    dateFrom: string
    dateTo: string
  }
  summary: DealsSummary
  availableClients: string[]
  viewMode: 'table' | 'pipeline'
}

const initialState: DealsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 15,
  loading: false,
  error: null,
  filters: {
    search: '',
    stage: '',
    client: '',
    status: 'Active',
    sort: 'close_date_newest',
    dateFrom: '',
    dateTo: '',
  },
  summary: {
    totalActive: 0,
    pipelineValue: 0,
    wonCount: 0,
    wonValue: 0,
    lostCount: 0,
    lostValue: 0,
    currentQuarter: 1,
  },
  availableClients: [],
  viewMode: 'table',
}

export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (_, { getState }) => {
    const state = (getState() as RootState).deals
    const params = new URLSearchParams()
    params.set('page', state.page.toString())
    params.set('pageSize', state.pageSize.toString())
    if (state.filters.search) params.set('search', state.filters.search)
    if (state.filters.stage) params.set('stage', state.filters.stage)
    if (state.filters.client) params.set('client', state.filters.client)
    if (state.filters.status) params.set('status', state.filters.status)
    if (state.filters.sort) params.set('sort', state.filters.sort)
    if (state.filters.dateFrom) params.set('date_from', state.filters.dateFrom)
    if (state.filters.dateTo) params.set('date_to', state.filters.dateTo)

    const res = await fetch(`/.netlify/functions/deals?${params}`)
    if (!res.ok) throw new Error('Failed to fetch deals')
    return res.json()
  }
)

export const createDeal = createAsyncThunk(
  'deals/createDeal',
  async (data: {
    name: string
    client_id: string
    stage: string
    owner: string
    value: string
    close_date: string
    status: string
  }) => {
    const res = await fetch('/.netlify/functions/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        value: data.value ? parseFloat(data.value.replace(/[$,]/g, '')) : null,
        close_date: data.close_date || null,
      }),
    })
    if (!res.ok) throw new Error('Failed to create deal')
    return res.json()
  }
)

export const updateDeal = createAsyncThunk(
  'deals/updateDeal',
  async (data: {
    id: string
    name: string
    client_id: string
    stage: string
    owner: string
    value: string
    close_date: string
    status: string
  }) => {
    const { id, ...rest } = data
    const res = await fetch(`/.netlify/functions/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...rest,
        value: rest.value ? parseFloat(rest.value.replace(/[$,]/g, '')) : null,
        close_date: rest.close_date || null,
      }),
    })
    if (!res.ok) throw new Error('Failed to update deal')
    return res.json()
  }
)

export const deleteDeal = createAsyncThunk(
  'deals/deleteDeal',
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/deals/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete deal')
    return id
  }
)

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setDealsSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
      state.page = 1
    },
    setDealsStageFilter(state, action: PayloadAction<string>) {
      state.filters.stage = action.payload
      state.page = 1
    },
    setDealsClientFilter(state, action: PayloadAction<string>) {
      state.filters.client = action.payload
      state.page = 1
    },
    setDealsStatusFilter(state, action: PayloadAction<string>) {
      state.filters.status = action.payload
      state.page = 1
    },
    setDealsSort(state, action: PayloadAction<string>) {
      state.filters.sort = action.payload
      state.page = 1
    },
    setDealsDateRange(state, action: PayloadAction<{ from: string; to: string }>) {
      state.filters.dateFrom = action.payload.from
      state.filters.dateTo = action.payload.to
      state.page = 1
    },
    setDealsPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setDealsViewMode(state, action: PayloadAction<'table' | 'pipeline'>) {
      state.viewMode = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.deals
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
        state.summary = action.payload.summary
        state.availableClients = action.payload.availableClients
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch deals'
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.items = state.items.filter(d => d.id !== action.payload)
        state.total = Math.max(0, state.total - 1)
      })
  },
})

export const {
  setDealsSearch,
  setDealsStageFilter,
  setDealsClientFilter,
  setDealsStatusFilter,
  setDealsSort,
  setDealsDateRange,
  setDealsPage,
  setDealsViewMode,
} = dealsSlice.actions
export default dealsSlice.reducer
