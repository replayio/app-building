import type { AccountCategory } from "../types";

export interface SubCategory {
  id: string;
  label: string;
}

export interface CategoryNode {
  category: AccountCategory;
  label: string;
  subCategories: SubCategory[];
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    category: "assets",
    label: "Assets",
    subCategories: [
      { id: "assets-current", label: "Current Assets" },
      { id: "assets-fixed", label: "Fixed Assets" },
      { id: "assets-other", label: "Other Assets" },
    ],
  },
  {
    category: "liabilities",
    label: "Liabilities",
    subCategories: [
      { id: "liabilities-current", label: "Current Liabilities" },
      { id: "liabilities-longterm", label: "Long-Term Liabilities" },
    ],
  },
  {
    category: "equity",
    label: "Equity",
    subCategories: [
      { id: "equity-owner", label: "Owner's Equity" },
      { id: "equity-retained", label: "Retained Earnings" },
    ],
  },
  {
    category: "revenue",
    label: "Revenue",
    subCategories: [
      { id: "revenue-operating", label: "Operating Revenue" },
      { id: "revenue-nonoperating", label: "Non-Operating Revenue" },
    ],
  },
  {
    category: "expenses",
    label: "Expenses",
    subCategories: [
      { id: "expenses-operating", label: "Operating Expenses" },
      { id: "expenses-cogs", label: "Cost of Goods Sold" },
      { id: "expenses-nonoperating", label: "Non-Operating Expenses" },
    ],
  },
];

/** Build default state with all sub-categories checked */
export function buildDefaultCategoryState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const node of CATEGORY_TREE) {
    for (const sub of node.subCategories) {
      state[sub.id] = true;
    }
  }
  return state;
}

/** Compute which top-level categories are active based on sub-category state */
export function getSelectedCategories(subCategoryState: Record<string, boolean>): AccountCategory[] {
  const selected: AccountCategory[] = [];
  for (const node of CATEGORY_TREE) {
    const anyChecked = node.subCategories.some((s) => subCategoryState[s.id]);
    if (anyChecked) selected.push(node.category);
  }
  return selected;
}
