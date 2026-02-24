/**
 * Double-entry transaction validation utilities.
 *
 * Used by Accounting (debit/credit balancing) and InventoryTracker (quantity transfer balancing).
 * In both systems, every transaction must have balanced entries — the sum of debits equals
 * the sum of credits (Accounting) or the sum of outgoing quantities equals the sum of incoming
 * quantities (InventoryTracker).
 */

export interface TransactionEntry {
  /** The account being affected. */
  accountId: string;
  /** The amount for this entry. Positive = debit, negative = credit (Accounting convention). */
  amount: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate that a set of transaction entries is balanced.
 * The sum of all entry amounts must equal zero (debits equal credits).
 */
export function validateEntriesBalanced(
  entries: TransactionEntry[],
  tolerance = 0.005
): ValidationResult {
  const errors: string[] = [];

  if (entries.length < 2) {
    errors.push("A transaction must have at least two entries.");
  }

  const sum = entries.reduce((acc, entry) => acc + entry.amount, 0);

  if (Math.abs(sum) > tolerance) {
    errors.push(
      `Transaction is not balanced. Difference: ${sum > 0 ? "+" : ""}${sum.toFixed(2)}`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate that no entry has a zero amount.
 */
export function validateNonZeroAmounts(
  entries: TransactionEntry[]
): ValidationResult {
  const errors: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    if (entries[i].amount === 0) {
      errors.push(`Entry ${i + 1} has a zero amount.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate that all entries reference valid (non-empty) account IDs.
 */
export function validateAccountIds(
  entries: TransactionEntry[]
): ValidationResult {
  const errors: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    if (!entries[i].accountId || entries[i].accountId.trim() === "") {
      errors.push(`Entry ${i + 1} is missing an account.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Run all standard validations on a set of transaction entries.
 */
export function validateTransaction(
  entries: TransactionEntry[]
): ValidationResult {
  const results = [
    validateEntriesBalanced(entries),
    validateNonZeroAmounts(entries),
    validateAccountIds(entries),
  ];

  const allErrors = results.flatMap((r) => r.errors);
  return { valid: allErrors.length === 0, errors: allErrors };
}

/**
 * Compute the total debits and credits from a set of entries.
 * Returns separate sums for positive (debit) and negative (credit) amounts.
 */
export function computeDebitCreditTotals(entries: TransactionEntry[]): {
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
} {
  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    if (entry.amount > 0) {
      totalDebits += entry.amount;
    } else {
      totalCredits += Math.abs(entry.amount);
    }
  }

  return {
    totalDebits,
    totalCredits,
    isBalanced: Math.abs(totalDebits - totalCredits) < 0.005,
  };
}
