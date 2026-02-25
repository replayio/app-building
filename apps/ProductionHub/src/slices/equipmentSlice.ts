import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Equipment, EquipmentNote } from "../types";

interface EquipmentState {
  items: Equipment[];
  currentEquipment: Equipment | null;
  notes: EquipmentNote[];
  loading: boolean;
  error: string | null;
}

const initialState: EquipmentState = {
  items: [],
  currentEquipment: null,
  notes: [],
  loading: false,
  error: null,
};

export const fetchEquipment = createAsyncThunk(
  "equipment/fetchEquipment",
  async () => {
    const res = await fetch("/.netlify/functions/equipment");
    if (!res.ok) throw new Error("Failed to fetch equipment");
    return (await res.json()) as Equipment[];
  }
);

export const fetchEquipmentById = createAsyncThunk(
  "equipment/fetchEquipmentById",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/equipment/${id}`);
    if (!res.ok) throw new Error("Failed to fetch equipment");
    return (await res.json()) as Equipment;
  }
);

export const createEquipment = createAsyncThunk(
  "equipment/createEquipment",
  async (data: Partial<Equipment>) => {
    const res = await fetch("/.netlify/functions/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create equipment");
    return (await res.json()) as Equipment;
  }
);

export const updateEquipment = createAsyncThunk(
  "equipment/updateEquipment",
  async (data: Partial<Equipment> & { id: string }) => {
    const res = await fetch(`/.netlify/functions/equipment/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update equipment");
    return (await res.json()) as Equipment;
  }
);

export const deleteEquipment = createAsyncThunk(
  "equipment/deleteEquipment",
  async (id: string) => {
    const res = await fetch(`/.netlify/functions/equipment/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete equipment");
    return id;
  }
);

export const fetchEquipmentNotes = createAsyncThunk(
  "equipment/fetchEquipmentNotes",
  async (equipmentId: string) => {
    const res = await fetch(
      `/.netlify/functions/equipment-notes?equipment_id=${equipmentId}`
    );
    if (!res.ok) throw new Error("Failed to fetch equipment notes");
    return (await res.json()) as EquipmentNote[];
  }
);

export const createEquipmentNote = createAsyncThunk(
  "equipment/createEquipmentNote",
  async (data: {
    equipment_id: string;
    author_name: string;
    author_role: string;
    text: string;
  }) => {
    const res = await fetch("/.netlify/functions/equipment-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create equipment note");
    return (await res.json()) as EquipmentNote;
  }
);

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    clearCurrentEquipment(state) {
      state.currentEquipment = null;
      state.notes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipment.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch equipment";
      })
      .addCase(fetchEquipmentById.pending, (state) => {
        if (!state.currentEquipment) state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipmentById.fulfilled, (state, action) => {
        state.currentEquipment = action.payload;
        state.loading = false;
      })
      .addCase(fetchEquipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch equipment";
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentEquipment?.id === action.payload.id) {
          state.currentEquipment = action.payload;
        }
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      })
      .addCase(fetchEquipmentNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
      })
      .addCase(createEquipmentNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      });
  },
});

export const { clearCurrentEquipment } = equipmentSlice.actions;
export const equipmentReducer = equipmentSlice.reducer;
