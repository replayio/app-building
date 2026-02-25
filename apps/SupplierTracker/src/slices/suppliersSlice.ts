import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Supplier {
  id: string;
  name: string;
  address: string;
  contact_name: string;
  phone: string;
  email: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  open_orders_count?: number;
  open_orders_value?: number;
}

export interface SupplierComment {
  id: string;
  supplier_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export interface SupplierDocument {
  id: string;
  supplier_id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  upload_date: string;
}

interface SuppliersState {
  items: Supplier[];
  current: Supplier | null;
  comments: SupplierComment[];
  documents: SupplierDocument[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliersState = {
  items: [],
  current: null,
  comments: [],
  documents: [],
  loading: false,
  error: null,
};

export const fetchSuppliers = createAsyncThunk("suppliers/fetchAll", async () => {
  const res = await fetch("/.netlify/functions/suppliers");
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  return res.json();
});

export const fetchSupplier = createAsyncThunk("suppliers/fetchOne", async (id: string) => {
  const res = await fetch(`/.netlify/functions/suppliers/${id}`);
  if (!res.ok) throw new Error("Failed to fetch supplier");
  return res.json();
});

export const createSupplier = createAsyncThunk(
  "suppliers/create",
  async (data: Omit<Supplier, "id" | "created_at" | "updated_at" | "open_orders_count" | "open_orders_value">) => {
    const res = await fetch("/.netlify/functions/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create supplier");
    return res.json();
  }
);

export const updateSupplier = createAsyncThunk(
  "suppliers/update",
  async ({ id, ...data }: Partial<Supplier> & { id: string }) => {
    const res = await fetch(`/.netlify/functions/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update supplier");
    return res.json();
  }
);

export const deleteSupplier = createAsyncThunk("suppliers/delete", async (id: string) => {
  const res = await fetch(`/.netlify/functions/suppliers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete supplier");
  return id;
});

export const fetchSupplierComments = createAsyncThunk(
  "suppliers/fetchComments",
  async (supplierId: string) => {
    const res = await fetch(`/.netlify/functions/supplier-comments/${supplierId}`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json();
  }
);

export const addSupplierComment = createAsyncThunk(
  "suppliers/addComment",
  async ({ supplierId, text, authorName }: { supplierId: string; text: string; authorName: string }) => {
    const res = await fetch(`/.netlify/functions/supplier-comments/${supplierId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, author_name: authorName }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return res.json();
  }
);

export const fetchSupplierDocuments = createAsyncThunk(
  "suppliers/fetchDocuments",
  async (supplierId: string) => {
    const res = await fetch(`/.netlify/functions/supplier-documents/${supplierId}`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    return res.json();
  }
);

export const uploadSupplierDocument = createAsyncThunk(
  "suppliers/uploadDocument",
  async ({ supplierId, file, documentType }: { supplierId: string; file: File; documentType: string }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    const res = await fetch(`/.netlify/functions/supplier-documents/${supplierId}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload document");
    return res.json();
  }
);

export const deleteSupplierDocument = createAsyncThunk(
  "suppliers/deleteDocument",
  async ({ supplierId, documentId }: { supplierId: string; documentId: string }) => {
    const res = await fetch(`/.netlify/functions/supplier-documents/${supplierId}?documentId=${documentId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete document");
    return documentId;
  }
);

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch suppliers";
      })
      .addCase(fetchSupplier.pending, (state) => {
        if (!state.current) state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplier.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(fetchSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch supplier";
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      })
      .addCase(fetchSupplierComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(addSupplierComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload);
      })
      .addCase(fetchSupplierDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
      })
      .addCase(uploadSupplierDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload);
      })
      .addCase(deleteSupplierDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
      });
  },
});

export const suppliersReducer = suppliersSlice.reducer;
