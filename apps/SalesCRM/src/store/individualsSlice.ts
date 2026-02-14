import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Individual } from '../types'

interface IndividualsState {
  currentIndividual: Individual | null
  loading: boolean
  error: string | null
}

const initialState: IndividualsState = {
  currentIndividual: null,
  loading: false,
  error: null,
}

export const fetchIndividual = createAsyncThunk(
  'individuals/fetchIndividual',
  async (individualId: string) => {
    const res = await fetch(`/.netlify/functions/individuals/${individualId}`)
    if (!res.ok) throw new Error('Failed to fetch individual')
    return res.json() as Promise<Individual>
  }
)

export const individualsSlice = createSlice({
  name: 'individuals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
