import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Order {
  id: string;
  order_id: string;
  supplier_id: string;
  supplier_name?: string;
  order_date: string;
  expected_delivery: string;
  status: string;
  total_cost: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_label: string;
  discount_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  order_id: string;
  sku: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  upload_date: string;
}

export interface OrderHistoryEntry {
  id: string;
  order_id: string;
  event_type: string;
  description: string;
  actor: string;
  created_at: string;
}

interface OrdersState {
  items: Order[];
  current: Order | null;
  lineItems: LineItem[];
  documents: OrderDocument[];
  history: OrderHistoryEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  current: null,
  lineItems: [],
  documents: [],
  history: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
  const res = await fetch("/.netlify/functions/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
});

export const fetchOrdersBySupplier = createAsyncThunk(
  "orders/fetchBySupplier",
  async (supplierId: string) => {
    const res = await fetch(`/.netlify/functions/orders?supplierId=${supplierId}`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  }
);

export const fetchOrder = createAsyncThunk("orders/fetchOne", async (id: string) => {
  const res = await fetch(`/.netlify/functions/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
});

export const createOrder = createAsyncThunk(
  "orders/create",
  async (data: {
    supplier_id: string;
    order_date: string;
    expected_delivery: string;
    line_items: { sku: string; item_name: string; quantity: number; unit_price: number }[];
  }) => {
    const res = await fetch("/.netlify/functions/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  }
);

export const updateOrder = createAsyncThunk(
  "orders/update",
  async ({ id, ...data }: { id: string; expected_delivery?: string; status?: string }) => {
    const res = await fetch(`/.netlify/functions/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update order");
    return res.json();
  }
);

export const fetchLineItems = createAsyncThunk("orders/fetchLineItems", async (orderId: string) => {
  const res = await fetch(`/.netlify/functions/order-line-items/${orderId}`);
  if (!res.ok) throw new Error("Failed to fetch line items");
  return res.json();
});

export const addLineItem = createAsyncThunk(
  "orders/addLineItem",
  async ({
    orderId,
    ...data
  }: {
    orderId: string;
    sku: string;
    item_name: string;
    quantity: number;
    unit_price: number;
  }) => {
    const res = await fetch(`/.netlify/functions/order-line-items/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add line item");
    return res.json();
  }
);

export const updateLineItem = createAsyncThunk(
  "orders/updateLineItem",
  async ({
    orderId,
    lineItemId,
    ...data
  }: {
    orderId: string;
    lineItemId: string;
    sku: string;
    item_name: string;
    quantity: number;
    unit_price: number;
  }) => {
    const res = await fetch(`/.netlify/functions/order-line-items/${orderId}?lineItemId=${lineItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update line item");
    return res.json();
  }
);

export const deleteLineItem = createAsyncThunk(
  "orders/deleteLineItem",
  async ({ orderId, lineItemId }: { orderId: string; lineItemId: string }) => {
    const res = await fetch(`/.netlify/functions/order-line-items/${orderId}?lineItemId=${lineItemId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete line item");
    return lineItemId;
  }
);

export const fetchOrderDocuments = createAsyncThunk(
  "orders/fetchDocuments",
  async (orderId: string) => {
    const res = await fetch(`/.netlify/functions/order-documents/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    return res.json();
  }
);

export const uploadOrderDocument = createAsyncThunk(
  "orders/uploadDocument",
  async ({ orderId, file, documentType }: { orderId: string; file: File; documentType: string }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    const res = await fetch(`/.netlify/functions/order-documents/${orderId}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload document");
    return res.json();
  }
);

export const fetchOrderHistory = createAsyncThunk(
  "orders/fetchHistory",
  async (orderId: string) => {
    const res = await fetch(`/.netlify/functions/order-history/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch orders";
      })
      .addCase(fetchOrdersBySupplier.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchOrder.pending, (state) => {
        if (!state.current) state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch order";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(fetchLineItems.fulfilled, (state, action) => {
        state.lineItems = action.payload;
      })
      .addCase(addLineItem.fulfilled, (state, action) => {
        state.lineItems.push(action.payload);
      })
      .addCase(updateLineItem.fulfilled, (state, action) => {
        const idx = state.lineItems.findIndex((li) => li.id === action.payload.id);
        if (idx >= 0) state.lineItems[idx] = action.payload;
      })
      .addCase(deleteLineItem.fulfilled, (state, action) => {
        state.lineItems = state.lineItems.filter((li) => li.id !== action.payload);
      })
      .addCase(fetchOrderDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
      })
      .addCase(uploadOrderDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload);
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const ordersReducer = ordersSlice.reducer;
