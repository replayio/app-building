import { neon } from "@neondatabase/serverless";

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Usage: npx tsx scripts/seed-db.ts <DATABASE_URL>");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed() {
  // Clear existing data
  await sql`DELETE FROM transaction_tags`;
  await sql`DELETE FROM transaction_entries`;
  await sql`DELETE FROM transactions`;
  await sql`DELETE FROM budgets`;
  await sql`DELETE FROM report_items`;
  await sql`DELETE FROM reports`;
  await sql`DELETE FROM accounts`;

  // ---- Assets ----
  await sql`
    INSERT INTO accounts (name, code, category, balance, institution, description,
      budget_amount, budget_actual, debits_ytd, credits_ytd,
      savings_goal_name, savings_goal_target, savings_goal_current,
      performance_pct, interest_rate, credit_limit, monthly_payment)
    VALUES
      ('Checking Account', '1001', 'assets', 12500.00, 'Chase Bank', 'Primary checking account',
       12500.00, 10000.00, 45200.00, 57700.00,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL),
      ('Savings Account', '1002', 'assets', 40000.00, 'Ally', 'High-yield savings',
       0, 0, 45200.00, 57700.00,
       'Vacation Fund', 42105.00, 40000.00, NULL, NULL, NULL, NULL),
      ('Investment Portfolio', '1003', 'assets', 98450.00, 'Vanguard', 'Diversified investment portfolio',
       0, 0, 0, 0,
       NULL, NULL, NULL, 7.5, NULL, NULL, NULL),

    -- ---- Liabilities ----
      ('Credit Card', '2001', 'liabilities', -2500.00, 'Visa', 'Primary credit card',
       5000.00, 3500.00, 8500.00, 6000.00,
       NULL, NULL, NULL, NULL, NULL, 7143.00, NULL),
      ('Mortgage Loan', '2002', 'liabilities', -78000.00, 'Wells Fargo', 'Home mortgage',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, 3.5, NULL, 1200.00),
      ('Car Loan', '2003', 'liabilities', -4700.00, 'Toyota Financial', 'Auto loan',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL),

    -- ---- Equity ----
      ('Retained Earnings', '3001', 'equity', 50000.00, NULL, 'Accumulated retained earnings',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL),
      ('Owner''s Equity', '3002', 'equity', 17250.00, NULL, 'Owner equity stake',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL),

    -- ---- Revenue ----
      ('Service Revenue', '4001', 'revenue', 80000.00, NULL, 'Revenue from services',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL),
      ('Product Revenue', '4002', 'revenue', 30000.00, NULL, 'Revenue from product sales',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL),

    -- ---- Expenses ----
      ('Operating Expenses', '5001', 'expenses', 35000.00, NULL, 'General operating expenses',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL),
      ('Payroll Expenses', '5002', 'expenses', 20500.00, NULL, 'Employee payroll',
       0, 0, 0, 0,
       NULL, NULL, NULL, NULL, NULL, NULL, NULL)
  `;

  console.log("Seed data inserted successfully.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
