import type { Account, AccountMaterial, Batch, Category, Material, MaterialAccountDistribution, Transaction } from '../types';

const API_BASE = '/.netlify/functions';

// Snake_case to camelCase transformation
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toCamelCase(key)] = transformKeys(value);
    }
    return result;
  }
  return obj;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return transformKeys(data) as T;
}

// Dashboard
export async function fetchDashboardData(params?: {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.dateFrom) searchParams.set('date_from', params.dateFrom);
  if (params?.dateTo) searchParams.set('date_to', params.dateTo);
  if (params?.categoryId) searchParams.set('category', params.categoryId);
  const qs = searchParams.toString();
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/dashboard${qs ? `?${qs}` : ''}`);

  // Map dashboard response to expected format
  const alerts = (raw.alerts as Record<string, unknown>[]) || [];
  const categories = (raw.categories as Record<string, unknown>[]) || [];
  const recentTxns = (raw.recentTransactions as Record<string, unknown>[]) || [];

  return {
    alerts: alerts.map((a) => ({
      id: a.materialId as string,
      materialId: a.materialId as string,
      materialName: a.materialName as string,
      currentStock: Number(a.currentStock),
      reorderPoint: Number(a.reorderPoint),
      unit: a.unitOfMeasure as string,
      severity: Number(a.currentStock) / Number(a.reorderPoint) <= 0.5 ? 'critical' as const : 'warning' as const,
      dismissed: a.dismissed as boolean,
    })),
    categories: categories.map((c) => ({
      id: c.categoryId as string,
      name: c.categoryName as string,
      totalItems: Number(c.itemCount),
      totalUnits: Number(c.totalUnits),
      topMaterials: ((c.topMaterials as Record<string, unknown>[]) || []).map((m) => ({
        id: m.materialId as string,
        name: m.materialName as string,
        quantity: Number(m.totalQuantity),
        unit: m.unitOfMeasure as string,
      })),
    })),
    recentTransactions: recentTxns.map((t) => mapTransaction(t)),
  };
}

function mapTransaction(t: Record<string, unknown>): import('../types').Transaction {
  const transfers = (t.transfers as Record<string, unknown>[]) || [];
  const accountNames = transfers
    .map((tr) => {
      const src = tr.sourceAccountName as string;
      const dst = tr.destinationAccountName as string;
      return `${src || 'N/A'} -> ${dst || 'N/A'}`;
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .join('; ');

  const materialAmounts = transfers
    .map((tr) => {
      const mat = tr.materialName as string;
      const amt = Number(tr.amount);
      const unit = tr.unit as string;
      return mat ? `${mat}: ${amt > 0 ? '+' : ''}${amt} ${unit}` : '';
    })
    .filter(Boolean)
    .join('; ');

  return {
    id: t.id as string,
    referenceId: (t.referenceId || t.reference_id || '') as string,
    description: (t.description || '') as string,
    type: (t.transactionType || t.type || 'transfer') as 'purchase' | 'consumption' | 'transfer' | 'production' | 'adjustment',
    date: (t.date || '') as string,
    createdBy: (t.creator || t.createdBy || 'System') as string,
    status: (t.status || 'completed') as 'completed' | 'pending' | 'cancelled',
    transfers: transfers.map((tr) => ({
      id: (tr.id || '') as string,
      sourceAccountId: (tr.sourceAccountId || '') as string,
      sourceAccountName: (tr.sourceAccountName || '') as string,
      sourceAmount: -Number(tr.amount),
      sourceBatchId: (tr.sourceBatchId || undefined) as string | undefined,
      destinationAccountId: (tr.destinationAccountId || '') as string,
      destinationAccountName: (tr.destinationAccountName || '') as string,
      destinationAmount: Number(tr.amount),
      unit: (tr.unit || 'units') as string,
      netTransfer: Math.abs(Number(tr.amount)),
    })),
    batchesCreated: ((t.batchesCreated as Record<string, unknown>[]) || []).map((b) => ({
      id: (b.id || '') as string,
      batchId: (b.batchId || b.id || '') as string,
      materialId: (b.materialId || '') as string,
      materialName: (b.materialName || '') as string,
      quantity: Number(b.quantity),
      unit: (b.unit || 'units') as string,
    })),
    accountsAffected: accountNames || 'N/A',
    materialsAndAmounts: materialAmounts || 'N/A',
    createdAt: (t.createdAt || '') as string,
    updatedAt: (t.createdAt || '') as string,
  };
}

// Accounts
export async function fetchAccounts(type?: string): Promise<Account[]> {
  const qs = type ? `?type=${type}` : '';
  const rows = await fetchJson<Record<string, unknown>[]>(`${API_BASE}/accounts${qs}`);
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    type: r.type as 'stock' | 'input' | 'output',
    description: (r.description || '') as string,
    isDefault: r.isDefault as boolean,
    status: (r.status || 'active') as 'active' | 'archived',
    createdAt: (r.createdAt || '') as string,
    updatedAt: (r.createdAt || '') as string,
  }));
}

export async function fetchAccountDetail(accountId: string) {
  return fetchJson<Record<string, unknown>>(`${API_BASE}/account-detail?id=${accountId}`);
}

export async function createAccount(data: {
  name: string;
  type: string;
  description: string;
}) {
  return fetchJson<Record<string, unknown>>(`${API_BASE}/accounts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAccount(
  accountId: string,
  data: { name?: string; description?: string; status?: string }
) {
  return fetchJson<Record<string, unknown>>(`${API_BASE}/accounts?id=${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function archiveAccount(accountId: string) {
  return fetchJson<Record<string, unknown>>(`${API_BASE}/accounts?id=${accountId}`, {
    method: 'DELETE',
  });
}

// Materials
export async function fetchMaterials(params?: {
  search?: string;
  categoryId?: string;
  accountId?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.categoryId) searchParams.set('category', params.categoryId);
  if (params?.accountId) searchParams.set('account', params.accountId);
  if (params?.sortBy) searchParams.set('sort', params.sortBy);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('limit', String(params.pageSize));
  const qs = searchParams.toString();
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/materials${qs ? `?${qs}` : ''}`);
  const materials = (raw.materials as Record<string, unknown>[]) || [];
  const total = Number(raw.total || 0);
  const page = Number(raw.page || 1);
  const limit = Number(raw.limit || 20);
  return {
    data: materials.map((m) => ({
      id: m.id as string,
      name: m.name as string,
      categoryId: (m.categoryId || '') as string,
      categoryName: (m.categoryName || '') as string,
      unitOfMeasure: (m.unitOfMeasure || 'units') as string,
      description: (m.description || '') as string,
      stock: Number(m.stock || m.totalStock || 0),
      reorderPoint: Number(m.reorderPoint || 0),
      createdAt: (m.createdAt || '') as string,
      updatedAt: (m.createdAt || '') as string,
    })),
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function fetchMaterialDetail(materialId: string) {
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/material-detail?id=${materialId}`);
  return raw;
}

export async function createMaterial(data: {
  name: string;
  categoryId: string;
  unitOfMeasure: string;
  description?: string;
}): Promise<Material> {
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/materials`, {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      category_id: data.categoryId,
      unit_of_measure: data.unitOfMeasure,
      description: data.description || '',
    }),
  });
  return raw as unknown as Material;
}

export async function updateMaterial(
  materialId: string,
  data: { name?: string; categoryId?: string; unitOfMeasure?: string; description?: string }
): Promise<Material> {
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/materials?id=${materialId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      category_id: data.categoryId,
      unit_of_measure: data.unitOfMeasure,
      description: data.description,
    }),
  });
  return raw as unknown as Material;
}

// Batches
export async function fetchBatchDetail(batchId: string) {
  return fetchJson<Record<string, unknown>>(`${API_BASE}/batch-detail?id=${batchId}`);
}

export async function createBatch(data: {
  materialId: string;
  accountId: string;
  quantity: number;
  lotNumber?: string;
  expirationDate?: string;
}) {
  return fetchJson<Record<string, unknown>>(`${API_BASE}/batches`, {
    method: 'POST',
    body: JSON.stringify({
      id: `BATCH-${Date.now()}`,
      material_id: data.materialId,
      account_id: data.accountId,
      quantity: data.quantity,
      lot_number: data.lotNumber,
      expiration_date: data.expirationDate,
    }),
  });
}

// Transactions
export async function fetchTransactions(params?: {
  dateFrom?: string;
  dateTo?: string;
  accountIds?: string[];
  materialIds?: string[];
  type?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.dateFrom) searchParams.set('date_from', params.dateFrom);
  if (params?.dateTo) searchParams.set('date_to', params.dateTo);
  if (params?.accountIds?.length) searchParams.set('accounts', params.accountIds.join(','));
  if (params?.materialIds?.length) searchParams.set('materials', params.materialIds.join(','));
  if (params?.type) searchParams.set('type', params.type);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sortBy) searchParams.set('sort', params.sortBy);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('limit', String(params.pageSize));
  const qs = searchParams.toString();
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/transactions${qs ? `?${qs}` : ''}`);
  const transactions = (raw.transactions as Record<string, unknown>[]) || [];
  const total = Number(raw.total || 0);
  const page = Number(raw.page || 1);
  const limit = Number(raw.limit || 20);
  return {
    data: transactions.map(mapTransaction),
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function fetchTransactionDetail(transactionId: string) {
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/transaction-detail?id=${transactionId}`);
  return raw;
}

export async function createTransaction(data: {
  date: string;
  referenceId: string;
  description: string;
  type: string;
  transfers: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    unit: string;
    sourceBatchId?: string;
  }[];
  batchAllocations: {
    materialId: string;
    quantity: number;
  }[];
}): Promise<Transaction> {
  const id = `TXN-${Date.now().toString(36).toUpperCase()}`;
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/transactions`, {
    method: 'POST',
    body: JSON.stringify({
      id,
      date: data.date,
      reference_id: data.referenceId,
      description: data.description,
      transaction_type: data.type,
      creator: 'Current User',
      transfers: data.transfers.map((t) => ({
        source_account_id: t.sourceAccountId,
        destination_account_id: t.destinationAccountId,
        amount: t.amount,
        unit: t.unit,
        source_batch_id: t.sourceBatchId,
      })),
      batches_created: data.batchAllocations.map((b) => ({
        material_id: b.materialId,
        quantity: b.quantity,
      })),
    }),
  });
  return raw as unknown as Transaction;
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  const rows = await fetchJson<Record<string, unknown>[]>(`${API_BASE}/categories`);
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    createdAt: (r.createdAt || '') as string,
    updatedAt: (r.createdAt || '') as string,
  }));
}

export async function createCategory(data: { name: string }): Promise<Category> {
  const raw = await fetchJson<Record<string, unknown>>(`${API_BASE}/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return raw as unknown as Category;
}

// Dismiss alert
export async function dismissAlert(materialId: string) {
  return fetchJson<Record<string, unknown>>(`${API_BASE}/dismiss-alert`, {
    method: 'POST',
    body: JSON.stringify({ material_id: materialId }),
  });
}

// Compatibility aliases for slices that reference old function names

export async function fetchMaterial(materialId: string): Promise<Material> {
  const raw = await fetchMaterialDetail(materialId);
  return {
    id: raw.id as string,
    name: raw.name as string,
    categoryId: (raw.categoryId || '') as string,
    categoryName: (raw.categoryName || '') as string,
    unitOfMeasure: (raw.unitOfMeasure || 'units') as string,
    description: (raw.description || '') as string,
    stock: 0,
    reorderPoint: Number(raw.reorderPoint || 0),
    createdAt: (raw.createdAt || '') as string,
    updatedAt: (raw.createdAt || '') as string,
  };
}

export async function fetchMaterialDistribution(materialId: string): Promise<MaterialAccountDistribution[]> {
  const raw = await fetchMaterialDetail(materialId);
  return ((raw.accounts as unknown[]) || []) as unknown as MaterialAccountDistribution[];
}

export async function fetchMaterialBatches(
  materialId: string,
  _params?: { accountId?: string; dateFrom?: string; dateTo?: string }
): Promise<Batch[]> {
  const raw = await fetchMaterialDetail(materialId);
  return ((raw.batches as unknown[]) || []) as unknown as Batch[];
}

export async function fetchMaterialTransactions(
  materialId: string,
  _params?: { type?: string; dateFrom?: string; dateTo?: string }
): Promise<Transaction[]> {
  const raw = await fetchMaterialDetail(materialId);
  return ((raw.transactions as unknown[]) || []) as unknown as Transaction[];
}

export async function fetchBatch(batchId: string): Promise<Batch> {
  const raw = await fetchBatchDetail(batchId);
  return raw as unknown as Batch;
}

export async function fetchBatchLineage(batchId: string): Promise<{
  sourceTransaction: Transaction | null;
  inputBatches: Batch[];
  outputBatch: Batch;
}> {
  const raw = await fetchBatchDetail(batchId);
  return {
    sourceTransaction: (raw.createdIn || null) as unknown as Transaction | null,
    inputBatches: ((raw.lineage as unknown[]) || []) as unknown as Batch[],
    outputBatch: raw as unknown as Batch,
  };
}

export async function fetchBatchUsageHistory(batchId: string): Promise<{
  date: string;
  transactionId: string;
  type: string;
  movement: 'in' | 'out';
  amount: number;
  unit: string;
  createdBatches: { id: string; materialName: string }[];
}[]> {
  const raw = await fetchBatchDetail(batchId);
  return ((raw.usageHistory as unknown[]) || []) as unknown as {
    date: string;
    transactionId: string;
    type: string;
    movement: 'in' | 'out';
    amount: number;
    unit: string;
    createdBatches: { id: string; materialName: string }[];
  }[];
}

export async function fetchTransaction(transactionId: string): Promise<Transaction> {
  const raw = await fetchTransactionDetail(transactionId);
  return mapTransaction(raw);
}

export async function fetchAccountMaterials(accountId: string): Promise<AccountMaterial[]> {
  const raw = await fetchAccountDetail(accountId);
  return ((raw.materials as unknown[]) || []) as unknown as AccountMaterial[];
}

export async function fetchAccount(accountId: string): Promise<Account> {
  const raw = await fetchAccountDetail(accountId);
  return {
    id: raw.id as string,
    name: raw.name as string,
    type: raw.type as 'stock' | 'input' | 'output',
    description: (raw.description || '') as string,
    isDefault: raw.isDefault as boolean,
    status: (raw.status || 'active') as 'active' | 'archived',
    createdAt: (raw.createdAt || '') as string,
    updatedAt: (raw.createdAt || '') as string,
  };
}
