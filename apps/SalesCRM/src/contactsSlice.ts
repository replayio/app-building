import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface AssociatedClient {
  id: string;
  name: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  createdAt: string;
  associatedClients: AssociatedClient[];
}

interface ContactsState {
  items: Contact[];
  loading: boolean;
  error: string | null;
}

const initialState: ContactsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchContacts = createAsyncThunk("contacts/fetchContacts", async () => {
  const resp = await fetch("/.netlify/functions/individuals?mode=all");
  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.error || "Failed to fetch contacts");
  }
  return resp.json() as Promise<Contact[]>;
});

export const createContact = createAsyncThunk(
  "contacts/createContact",
  async (contact: {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    clientId?: string;
  }) => {
    const resp = await fetch("/.netlify/functions/individuals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.error || "Failed to create contact");
    }
    return resp.json() as Promise<Contact>;
  }
);

export const importContacts = createAsyncThunk(
  "contacts/importContacts",
  async (rows: Record<string, string>[]) => {
    const resp = await fetch("/.netlify/functions/individuals/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await resp.json();
    if (data.errors && data.errors.length > 0) {
      return { errors: data.errors as { row: number; errors: string[] }[] };
    }
    return { errors: undefined };
  }
);

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<Contact[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch contacts";
      })
      .addCase(createContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        state.items.unshift(action.payload);
      });
  },
});

export const contactsReducer = contactsSlice.reducer;
