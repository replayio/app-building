import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export type WizardStep = 'describe' | 'assessment' | 'confirmation'
export type AssessmentResult = 'pending' | 'accepted' | 'rejected'

interface RequestState {
  step: WizardStep
  appName: string
  appDescription: string
  appRequirements: string
  assessmentResult: AssessmentResult
  rejectionReason: string
  createdAppId: string | null
  submitting: boolean
  error: string | null
}

const initialState: RequestState = {
  step: 'describe',
  appName: '',
  appDescription: '',
  appRequirements: '',
  assessmentResult: 'pending',
  rejectionReason: '',
  createdAppId: null,
  submitting: false,
  error: null,
}

export const submitRequest = createAsyncThunk(
  'request/submit',
  async (data: { name: string; description: string; requirements: string }) => {
    const response = await fetch('/.netlify/functions/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to submit request')
    return response.json() as Promise<{
      result: AssessmentResult
      rejectionReason?: string
      appId?: string
    }>
  },
)

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    setAppName(state, action: { payload: string }) {
      state.appName = action.payload
    },
    setAppDescription(state, action: { payload: string }) {
      state.appDescription = action.payload
    },
    setAppRequirements(state, action: { payload: string }) {
      state.appRequirements = action.payload
    },
    goToStep(state, action: { payload: WizardStep }) {
      state.step = action.payload
    },
    resetRequest() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRequest.pending, (state) => {
        state.submitting = true
        state.error = null
        state.step = 'assessment'
      })
      .addCase(submitRequest.fulfilled, (state, action) => {
        state.submitting = false
        state.assessmentResult = action.payload.result
        state.rejectionReason = action.payload.rejectionReason || ''
        state.createdAppId = action.payload.appId || null
        state.step = 'confirmation'
      })
      .addCase(submitRequest.rejected, (state, action) => {
        state.submitting = false
        state.error = action.error.message || 'Failed to submit request'
        state.step = 'describe'
      })
  },
})

export const { setAppName, setAppDescription, setAppRequirements, goToStep, resetRequest } =
  requestSlice.actions
export default requestSlice.reducer
