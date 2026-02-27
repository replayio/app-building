/** Account categories in the inventory system */
export type AccountCategory = "stock" | "input" | "output";

/** An inventory account */
export interface Account {
  id: string;
  name: string;
  account_type: AccountCategory;
  description: string;
  is_default: boolean;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

/** A material category */
export interface MaterialCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

/** A material tracked in the system */
export interface Material {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  unit_of_measure: string;
  description: string;
  reorder_point: number;
  stock?: number;
  created_at: string;
  updated_at: string;
}

/** A batch of material within an account */
export interface Batch {
  id: string;
  material_id: string;
  material_name?: string;
  account_id: string;
  account_name?: string;
  quantity: number;
  unit: string;
  location: string;
  lot_number: string;
  expiration_date: string | null;
  quality_grade: string;
  storage_condition: string;
  status: "active" | "depleted" | "expired";
  originating_transaction_id: string | null;
  originating_transaction_description?: string;
  originating_transaction_type?: string;
  created_at: string;
  updated_at: string;
}

/** Transaction types */
export type TransactionType =
  | "purchase"
  | "consumption"
  | "transfer"
  | "production"
  | "adjustment";

/** A double-entry transaction */
export interface Transaction {
  id: string;
  date: string;
  reference_id: string;
  description: string;
  transaction_type: TransactionType;
  status: "posted" | "draft" | "void";
  created_by: string;
  created_at: string;
  updated_at: string;
  transfers?: QuantityTransfer[];
  batches_created?: BatchCreated[];
}

/** A quantity transfer line within a transaction (double-entry) */
export interface QuantityTransfer {
  id: string;
  transaction_id: string;
  source_account_id: string;
  source_account_name?: string;
  destination_account_id: string;
  destination_account_name?: string;
  material_id: string;
  material_name?: string;
  amount: number;
  unit: string;
  source_batch_id: string | null;
  source_batch_label?: string;
}

/** A batch created by a transaction */
export interface BatchCreated {
  id: string;
  transaction_id: string;
  batch_id: string;
  material_id: string;
  material_name?: string;
  quantity: number;
  unit: string;
}

/** Batch lineage: source batches used to create a batch */
export interface BatchLineage {
  id: string;
  batch_id: string;
  source_batch_id: string;
  source_material_name?: string;
  source_account_name?: string;
  quantity_used: number;
  unit: string;
}

/** Low inventory alert */
export interface LowInventoryAlert {
  material_id: string;
  material_name: string;
  current_quantity: number;
  reorder_point: number;
  unit: string;
  severity: "warning" | "critical";
  dismissed: boolean;
}

/** Dashboard category overview */
export interface CategoryOverview {
  category_id: string;
  category_name: string;
  total_items: number;
  total_quantity: number;
  materials: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
}

/** Material stock summary across accounts */
export interface MaterialStock {
  material_id: string;
  total_quantity: number;
}

/** Account material summary */
export interface AccountMaterial {
  material_id: string;
  material_name: string;
  category_name: string;
  unit_of_measure: string;
  total_quantity: number;
  batch_count: number;
}

/** Batch usage history entry */
export interface BatchUsageEntry {
  transaction_id: string;
  reference_id: string;
  date: string;
  created_at: string;
  transaction_type: string;
  movement: "in" | "out";
  amount: number;
  unit: string;
  created_batches: { batch_id: string; reference: string }[];
}
