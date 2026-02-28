import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppRequestAssessment } from '../types';

interface RequestState {
  step: number;
  name: string;
  description: string;
  requirements: string;
  assessing: boolean;
  assessment: AppRequestAssessment | null;
  error: string | null;
}

const initialState: RequestState = {
  step: 1,
  name: '',
  description: '',
  requirements: '',
  assessing: false,
  assessment: null,
  error: null,
};

export const submitRequest = createAsyncThunk(
  'request/submit',
  async (payload: { name: string; description: string; requirements: string }) => {
    const res = await fetch('/.netlify/functions/request-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit request');
    return (await res.json()) as AppRequestAssessment;
  }
);

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setName(state, action: { payload: string }) {
      state.name = action.payload;
    },
    setDescription(state, action: { payload: string }) {
      state.description = action.payload;
    },
    setRequirements(state, action: { payload: string }) {
      state.requirements = action.payload;
    },
    setStep(state, action: { payload: number }) {
      state.step = action.payload;
    },
    resetRequest() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRequest.pending, (state) => {
        state.assessing = true;
        state.assessment = null;
        state.error = null;
        state.step = 2;
      })
      .addCase(submitRequest.fulfilled, (state, action) => {
        state.assessing = false;
        state.assessment = action.payload;
        state.step = 3;
      })
      .addCase(submitRequest.rejected, (state, action) => {
        state.assessing = false;
        state.error = action.error.message || 'Assessment failed';
        state.step = 3;
      });
  },
});

export const { setName, setDescription, setRequirements, setStep, resetRequest } = requestSlice.actions;
export default requestSlice.reducer;
