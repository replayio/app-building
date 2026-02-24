import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
}

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        return rejectWithValue(data.error || 'Sign in failed')
      }
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }: { email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password, name }),
      })
      if (!res.ok) {
        const data = await res.json()
        return rejectWithValue(data.error || 'Sign up failed')
      }
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

export const loadSession = createAsyncThunk(
  'auth/loadSession',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState }
    const token = state.auth.token
    if (!token) return rejectWithValue('No token')
    try {
      const res = await fetch('/.netlify/functions/auth?action=me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return rejectWithValue('Invalid session')
      return await res.json()
    } catch {
      return rejectWithValue('Network error')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut(state) {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
    },
    clearError(state) {
      state.error = null
    },
    setSession(state, action: { payload: { user: User; token: string } }) {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.token) {
          state.user = action.payload.user
          state.token = action.payload.token
          localStorage.setItem('token', action.payload.token)
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.user = action.payload.user
      })
      .addCase(loadSession.rejected, (state) => {
        state.user = null
        state.token = null
        localStorage.removeItem('token')
      })
  },
})

export const { signOut, clearError, setSession } = authSlice.actions
export default authSlice.reducer
