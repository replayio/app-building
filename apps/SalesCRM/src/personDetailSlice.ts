import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// --- Types ---

export interface PersonDetail {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  createdAt: string;
}

export interface RelationshipItem {
  id: string;
  relatedIndividualId: string;
  relatedIndividualName: string;
  relationshipType: string;
  title: string | null;
  organizations: string | null;
  createdAt: string;
}

export interface ContactHistoryItem {
  id: string;
  individualId: string;
  type: string;
  summary: string;
  contactDate: string;
  performedBy: string;
  createdAt: string;
}

export interface AssociatedClient {
  id: string;
  name: string;
  type: string;
  status: string;
  industry: string | null;
}

export interface IndividualOption {
  id: string;
  name: string;
  title: string | null;
}

interface PersonDetailState {
  person: PersonDetail | null;
  relationships: RelationshipItem[];
  contactHistory: ContactHistoryItem[];
  associatedClients: AssociatedClient[];
  allIndividuals: IndividualOption[];
  loading: boolean;
  error: string | null;
}

const initialState: PersonDetailState = {
  person: null,
  relationships: [],
  contactHistory: [],
  associatedClients: [],
  allIndividuals: [],
  loading: false,
  error: null,
};

// --- Helper ---

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// --- Thunks ---

export const fetchPersonDetail = createAsyncThunk(
  "personDetail/fetchPerson",
  async (individualId: string) => {
    const resp = await fetch(`/.netlify/functions/individuals/${individualId}`);
    if (!resp.ok) throw new Error("Failed to fetch person");
    return resp.json() as Promise<PersonDetail>;
  }
);

export const fetchRelationships = createAsyncThunk(
  "personDetail/fetchRelationships",
  async (individualId: string) => {
    const resp = await fetch(`/.netlify/functions/relationships?individualId=${individualId}`);
    if (!resp.ok) throw new Error("Failed to fetch relationships");
    return resp.json() as Promise<RelationshipItem[]>;
  }
);

export const createRelationship = createAsyncThunk(
  "personDetail/createRelationship",
  async (data: { individualId: string; relatedIndividualId: string; relationshipType: string }) => {
    const resp = await fetch("/.netlify/functions/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to create relationship");
    return resp.json() as Promise<RelationshipItem>;
  }
);

export const deleteRelationship = createAsyncThunk(
  "personDetail/deleteRelationship",
  async (relationshipId: string) => {
    const resp = await fetch(`/.netlify/functions/relationships/${relationshipId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!resp.ok) throw new Error("Failed to delete relationship");
    return relationshipId;
  }
);

export const fetchContactHistory = createAsyncThunk(
  "personDetail/fetchContactHistory",
  async (individualId: string) => {
    const resp = await fetch(`/.netlify/functions/contact-history?individualId=${individualId}`);
    if (!resp.ok) throw new Error("Failed to fetch contact history");
    return resp.json() as Promise<ContactHistoryItem[]>;
  }
);

export const createContactHistoryEntry = createAsyncThunk(
  "personDetail/createContactHistoryEntry",
  async (data: {
    individualId: string;
    type: string;
    summary: string;
    contactDate: string;
    performedBy: string;
  }) => {
    const resp = await fetch("/.netlify/functions/contact-history", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to create contact history entry");
    return resp.json() as Promise<ContactHistoryItem>;
  }
);

export const updateContactHistoryEntry = createAsyncThunk(
  "personDetail/updateContactHistoryEntry",
  async ({ entryId, data }: { entryId: string; data: Partial<ContactHistoryItem> }) => {
    const resp = await fetch(`/.netlify/functions/contact-history/${entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to update contact history entry");
    return resp.json() as Promise<ContactHistoryItem>;
  }
);

export const fetchAssociatedClients = createAsyncThunk(
  "personDetail/fetchAssociatedClients",
  async (individualId: string) => {
    const resp = await fetch(`/.netlify/functions/individuals?mode=clients&individualId=${individualId}`);
    if (!resp.ok) throw new Error("Failed to fetch associated clients");
    return resp.json() as Promise<AssociatedClient[]>;
  }
);

export const fetchAllIndividuals = createAsyncThunk(
  "personDetail/fetchAllIndividuals",
  async () => {
    const resp = await fetch("/.netlify/functions/individuals");
    if (!resp.ok) throw new Error("Failed to fetch individuals");
    return resp.json() as Promise<IndividualOption[]>;
  }
);

// --- Slice ---

const personDetailSlice = createSlice({
  name: "personDetail",
  initialState,
  reducers: {
    clearPersonDetail(state) {
      state.person = null;
      state.relationships = [];
      state.contactHistory = [];
      state.associatedClients = [];
      state.allIndividuals = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Person
      .addCase(fetchPersonDetail.pending, (state) => {
        if (!state.person) state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonDetail.fulfilled, (state, action: PayloadAction<PersonDetail>) => {
        state.loading = false;
        state.person = action.payload;
      })
      .addCase(fetchPersonDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch person";
      })
      // Relationships
      .addCase(fetchRelationships.fulfilled, (state, action: PayloadAction<RelationshipItem[]>) => {
        state.relationships = action.payload;
      })
      .addCase(createRelationship.fulfilled, (state, action: PayloadAction<RelationshipItem>) => {
        state.relationships.push(action.payload);
      })
      .addCase(deleteRelationship.fulfilled, (state, action: PayloadAction<string>) => {
        state.relationships = state.relationships.filter((r) => r.id !== action.payload);
      })
      // Contact History
      .addCase(fetchContactHistory.fulfilled, (state, action: PayloadAction<ContactHistoryItem[]>) => {
        state.contactHistory = action.payload;
      })
      .addCase(createContactHistoryEntry.fulfilled, (state, action: PayloadAction<ContactHistoryItem>) => {
        state.contactHistory.unshift(action.payload);
      })
      .addCase(updateContactHistoryEntry.fulfilled, (state, action: PayloadAction<ContactHistoryItem>) => {
        const idx = state.contactHistory.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.contactHistory[idx] = action.payload;
      })
      // Associated Clients
      .addCase(fetchAssociatedClients.fulfilled, (state, action: PayloadAction<AssociatedClient[]>) => {
        state.associatedClients = action.payload;
      })
      // All Individuals
      .addCase(fetchAllIndividuals.fulfilled, (state, action: PayloadAction<IndividualOption[]>) => {
        state.allIndividuals = action.payload;
      });
  },
});

export const { clearPersonDetail } = personDetailSlice.actions;
export const personDetailReducer = personDetailSlice.reducer;
