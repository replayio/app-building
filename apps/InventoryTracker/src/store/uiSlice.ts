import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  modalOpen: string | null;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  modalOpen: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    openModal(state, action: PayloadAction<string>) {
      state.modalOpen = action.payload;
    },
    closeModal(state) {
      state.modalOpen = null;
    },
  },
});

export const { toggleSidebar, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
