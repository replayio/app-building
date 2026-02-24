export interface Account {
  id: string;
  name: string;
  type: 'stock' | 'input' | 'output';
  description: string;
  isDefault: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unitOfMeasure: string;
  description: string;
  stock: number;
  reorderPoint?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  materialId: string;
  materialName: string;
  accountId: string;
  accountName: string;
  quantity: number;
  unit: string;
  status: 'active' | 'depleted' | 'expired';
  lotNumber?: string;
  expirationDate?: string;
  qualityGrade?: string;
  storageCondition?: string;
  location?: string;
  originatingTransactionId?: string;
  parentBatchIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionTransfer {
  id: string;
  sourceAccountId: string;
  sourceAccountName: string;
  sourceAmount: number;
  sourceBatchId?: string;
  destinationAccountId: string;
  destinationAccountName: string;
  destinationAmount: number;
  unit: string;
  netTransfer: number;
}

export interface TransactionBatchCreated {
  id: string;
  batchId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
}

export interface Transaction {
  id: string;
  referenceId: string;
  description: string;
  type: 'purchase' | 'consumption' | 'transfer' | 'production' | 'adjustment';
  date: string;
  createdBy: string;
  status: 'completed' | 'pending' | 'cancelled';
  transfers: TransactionTransfer[];
  batchesCreated: TransactionBatchCreated[];
  accountsAffected: string;
  materialsAndAmounts: string;
  createdAt: string;
  updatedAt: string;
}

export interface LowInventoryAlert {
  id: string;
  materialId: string;
  materialName: string;
  currentStock: number;
  reorderPoint: number;
  unit: string;
  severity: 'warning' | 'critical';
  dismissed: boolean;
}

export interface DashboardCategoryOverview {
  id: string;
  name: string;
  totalItems: number;
  totalUnits: number;
  topMaterials: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
}

export interface DashboardData {
  alerts: LowInventoryAlert[];
  categories: DashboardCategoryOverview[];
  recentTransactions: Transaction[];
}

export interface AccountMaterial {
  materialId: string;
  materialName: string;
  categoryName: string;
  unitOfMeasure: string;
  totalQuantity: number;
  numberOfBatches: number;
}

export interface MaterialAccountDistribution {
  accountId: string;
  accountName: string;
  accountType: string;
  quantity: number;
  numberOfBatches: number;
  batches: Batch[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
