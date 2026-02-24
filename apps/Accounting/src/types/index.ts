export type AccountCategory =
  | "assets"
  | "liabilities"
  | "equity"
  | "revenue"
  | "expenses";

export interface Account {
  id: string;
  name: string;
  code: string | null;
  category: AccountCategory;
  balance: number;
  institution: string | null;
  description: string | null;
  budget_amount: number;
  budget_actual: number;
  interest_rate: number | null;
  credit_limit: number | null;
  monthly_payment: number | null;
  savings_goal_name: string | null;
  savings_goal_target: number | null;
  savings_goal_current: number | null;
  performance_pct: number | null;
  debits_ytd: number;
  credits_ytd: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  currency: string;
  created_at: string;
  updated_at: string;
  entries?: TransactionEntry[];
  tags?: Tag[];
}

export interface TransactionEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  entry_type: "debit" | "credit";
  amount: number;
  account_name?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Budget {
  id: string;
  account_id: string;
  name: string;
  amount: number;
  actual_amount: number;
  period: string;
  created_at: string;
}

export interface Report {
  id: string;
  name: string;
  report_type: "summary" | "detailed" | "budget_vs_actual";
  date_range_start: string;
  date_range_end: string;
  accounts_included: string;
  categories_filter: string | null;
  include_zero_balance: boolean;
  status: string;
  created_at: string;
}

export interface ReportItem {
  id: string;
  report_id: string;
  account_id: string | null;
  item_name: string | null;
  item_type: "account" | "category" | "item";
  parent_item_id: string | null;
  budget_amount: number;
  actual_amount: number;
  variance: number;
  variance_pct: number;
  sort_order: number;
}
