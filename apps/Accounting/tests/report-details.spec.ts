import { test, expect, type APIRequestContext } from "@playwright/test";

// Test data: accounts and their budget/actual amounts
// variance = budget_amount - budget_actual (in the reports function)
// Marketing: budget=38000, actual=42000 → var=-4000, pct=10.5% (over budget, red)
// Operations: budget=14500, actual=17000 → var=-2500, pct=17.2% (over budget, red)
// R&D: budget=25000, actual=30000 → var=-5000, pct=20% (over budget, red)
// Sales: budget=30000, actual=28000 → var=+2000, pct=6.7% (under budget, green)
// G&A: budget=25000, actual=22000 → var=+3000, pct=12% (under budget, green)
// Total: budget=132500, actual=139000, var=-6500 (over budget)

const TEST_ACCOUNTS = [
  {
    name: "Marketing",
    code: "T001",
    category: "expenses",
    balance: 0,
    budget_amount: 38000,
    budget_actual: 42000,
  },
  {
    name: "Operations",
    code: "T002",
    category: "expenses",
    balance: 0,
    budget_amount: 14500,
    budget_actual: 17000,
  },
  {
    name: "R&D",
    code: "T003",
    category: "expenses",
    balance: 0,
    budget_amount: 25000,
    budget_actual: 30000,
  },
  {
    name: "Sales",
    code: "T004",
    category: "expenses",
    balance: 0,
    budget_amount: 30000,
    budget_actual: 28000,
  },
  {
    name: "G&A",
    code: "T005",
    category: "expenses",
    balance: 0,
    budget_amount: 25000,
    budget_actual: 22000,
  },
];

// Operations sub-items (budgets)
const OPERATIONS_BUDGETS = [
  { name: "Cloud Infrastructure", amount: 5000, actual_amount: 8500, period: "monthly" },
  { name: "Office Lease", amount: 6000, actual_amount: 6000, period: "monthly" },
  { name: "Travel", amount: 3500, actual_amount: 2500, period: "monthly" },
];

// Marketing sub-items (budgets) for expand tests
const MARKETING_BUDGETS = [
  { name: "Digital Ads", amount: 20000, actual_amount: 22000, period: "monthly" },
  { name: "Events", amount: 18000, actual_amount: 20000, period: "monthly" },
];

interface TestContext {
  reportId: string;
  reportName: string;
  accountIds: Record<string, string>;
}

let ctx: TestContext;

async function createTestData(request: APIRequestContext): Promise<TestContext> {
  const accountIds: Record<string, string> = {};

  // Create test accounts
  for (const acct of TEST_ACCOUNTS) {
    const resp = await request.post("/.netlify/functions/accounts", { data: acct });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    accountIds[acct.name] = body.id;
  }

  // Create budgets for Operations
  for (const budget of OPERATIONS_BUDGETS) {
    const resp = await request.post("/.netlify/functions/budgets", {
      data: { ...budget, account_id: accountIds["Operations"] },
    });
    expect(resp.ok()).toBeTruthy();
  }

  // Create budgets for Marketing
  for (const budget of MARKETING_BUDGETS) {
    const resp = await request.post("/.netlify/functions/budgets", {
      data: { ...budget, account_id: accountIds["Marketing"] },
    });
    expect(resp.ok()).toBeTruthy();
  }

  // Create a report
  const reportResp = await request.post("/.netlify/functions/reports", {
    data: {
      name: "Q3 2024 Budget Variance Report",
      report_type: "budget_vs_actual",
      date_range_start: "2024-07-01",
      date_range_end: "2024-09-30",
      categories_filter: "expenses",
      include_zero_balance: true,
    },
  });
  expect(reportResp.ok()).toBeTruthy();
  const report = await reportResp.json();

  return {
    reportId: report.id,
    reportName: report.name,
    accountIds,
  };
}

async function cleanupTestData(request: APIRequestContext, context: TestContext) {
  // Delete report
  await request.delete(`/.netlify/functions/reports/${context.reportId}`);
  // Delete accounts (this also cleans up related data)
  for (const id of Object.values(context.accountIds)) {
    await request.delete(`/.netlify/functions/accounts/${id}`);
  }
}

test.describe("ReportHeader", () => {
  test.beforeAll(async ({ request }) => {
    ctx = await createTestData(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, ctx);
  });

  test("ReportHeader displays report title with ID", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

    const title = page.getByTestId("report-header-title");
    await expect(title).toContainText(ctx.reportName);
    await expect(title).toContainText(`(ID: ${ctx.reportId})`);
  });

  test("ReportHeader displays breadcrumb navigation", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

    // Scope to the ReportHeader's breadcrumb (inside report-header)
    const reportHeader = page.getByTestId("report-header");
    const breadcrumb = reportHeader.getByTestId("breadcrumb");
    await expect(breadcrumb).toContainText("Reports");
    await expect(breadcrumb).toContainText(ctx.reportName);

    // "Reports" is a clickable link (breadcrumb-item-0)
    const reportsLink = breadcrumb.getByTestId("breadcrumb-item-0");
    await expect(reportsLink).toBeVisible();
    // It should be an anchor tag (clickable)
    await expect(reportsLink).toHaveAttribute("href", "#");

    // Current report name is the last non-clickable segment
    const currentSegment = breadcrumb.getByTestId("breadcrumb-item-1");
    await expect(currentSegment).toHaveText(ctx.reportName);
  });

  test("ReportHeader breadcrumb Reports link navigates to ReportList", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

    // Click the "Reports" breadcrumb link (inside report-header)
    const reportHeader = page.getByTestId("report-header");
    await reportHeader.getByTestId("breadcrumb").getByTestId("breadcrumb-item-0").click();

    // Verify navigation to ReportList
    await expect(page).toHaveURL(/\/reports$/);
    await expect(page.getByTestId("report-list-page")).toBeVisible({ timeout: 30000 });
  });

  test("ReportHeader displays Export PDF button with outline style", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

    const pdfBtn = page.getByTestId("export-pdf-btn");
    await expect(pdfBtn).toBeVisible();
    await expect(pdfBtn).toHaveText("Export PDF");
    await expect(pdfBtn).toHaveClass(/btn--secondary/);
  });

  test("ReportHeader displays Export CSV button with primary style", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

    const csvBtn = page.getByTestId("export-csv-btn");
    await expect(csvBtn).toBeVisible();
    await expect(csvBtn).toHaveText("Export CSV");
    await expect(csvBtn).toHaveClass(/btn--primary/);
  });

  test("ReportHeader Export PDF button downloads a PDF file", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

    // The implementation uses window.print() for PDF export
    // We verify the button is clickable and triggers the print dialog
    let printCalled = false;
    await page.exposeFunction("__testPrintCalled", () => {
      printCalled = true;
    });
    await page.evaluate(() => {
      window.print = () => {
        (window as unknown as Record<string, () => void>).__testPrintCalled();
      };
    });

    await page.getByTestId("export-pdf-btn").click();
    expect(printCalled).toBeTruthy();
  });

  test("ReportHeader Export CSV button downloads a CSV file", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

    // Listen for the download event
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-csv-btn").click();
    const download = await downloadPromise;

    // Verify the filename includes report name
    const filename = download.suggestedFilename();
    expect(filename).toContain(".csv");
    expect(filename).toContain("Q3_2024");
  });

  test("ReportHeader title reflects the specific report from the database", async ({
    page,
    request,
  }) => {
    // Create a second report to verify correct data isolation
    // We need another report with a different name
    const resp = await request.post("/.netlify/functions/reports", {
      data: {
        name: "Q2 2024 Summary Report",
        report_type: "summary",
        date_range_start: "2024-04-01",
        date_range_end: "2024-06-30",
        categories_filter: "expenses",
        include_zero_balance: true,
      },
    });
    expect(resp.ok()).toBeTruthy();
    const q2Report = await resp.json();

    try {
      // Navigate to the Q2 report
      await page.goto(`/reports/${q2Report.id}`);
      await expect(page.getByTestId("report-header")).toBeVisible({ timeout: 30000 });

      // Verify the Q2 report heading
      const title = page.getByTestId("report-header-title");
      await expect(title).toContainText("Q2 2024 Summary Report");
      await expect(title).toContainText(`(ID: ${q2Report.id})`);

      // Verify breadcrumb shows Q2 report name
      const reportHeader = page.getByTestId("report-header");
      await expect(reportHeader.getByTestId("breadcrumb")).toContainText("Q2 2024 Summary Report");
    } finally {
      await request.delete(`/.netlify/functions/reports/${q2Report.id}`);
    }
  });
});

test.describe("VarianceSummary", () => {
  test.beforeAll(async ({ request }) => {
    ctx = await createTestData(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, ctx);
  });

  test("VarianceSummary displays Total Variance with amount and percentage", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-summary")).toBeVisible({ timeout: 30000 });

    const totalVariance = page.getByTestId("total-variance");
    await expect(totalVariance).toContainText("Total Variance:");
    // Should display amount and percentage together
    await expect(totalVariance).toContainText("$");
    await expect(totalVariance).toContainText("%");
  });

  test("VarianceSummary negative variance shown in red with down arrow", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-summary")).toBeVisible({ timeout: 30000 });

    const totalVariance = page.getByTestId("total-variance");
    // Variance value should have the negative class
    const varianceValue = totalVariance.locator(".variance-summary-value--negative");
    await expect(varianceValue).toBeVisible();

    // Down arrow should be shown
    await expect(page.getByTestId("variance-arrow-down")).toBeVisible();
    await expect(page.getByTestId("variance-arrow-down")).toContainText("↓");
  });

  test("VarianceSummary positive variance shown in green with up arrow", async ({
    page,
    request,
  }) => {
    // Create an account with favorable variance in "revenue" category
    // to isolate from other test data (seed revenue accounts have 0 budget)
    const posAcct = await request.post("/.netlify/functions/accounts", {
      data: {
        name: "PosVarTestAcct",
        code: "PV01",
        category: "revenue",
        balance: 0,
        budget_amount: 50000,
        budget_actual: 45000,
      },
    });
    expect(posAcct.ok()).toBeTruthy();
    const posAcctData = await posAcct.json();

    const posReport = await request.post("/.netlify/functions/reports", {
      data: {
        name: "Positive Variance Test Report",
        report_type: "budget_vs_actual",
        date_range_start: "2024-01-01",
        date_range_end: "2024-03-31",
        categories_filter: "revenue",
        include_zero_balance: false,
      },
    });
    expect(posReport.ok()).toBeTruthy();
    const posReportData = await posReport.json();

    try {
      await page.goto(`/reports/${posReportData.id}`);
      await expect(page.getByTestId("variance-summary")).toBeVisible({ timeout: 30000 });

      // Look for positive variance styling
      const totalVariance = page.getByTestId("total-variance");
      const varianceValue = totalVariance.locator(".variance-summary-value--positive");
      await expect(varianceValue).toBeVisible();

      // Up arrow should be shown
      await expect(page.getByTestId("variance-arrow-up")).toBeVisible();
      await expect(page.getByTestId("variance-arrow-up")).toContainText("↑");
    } finally {
      await request.delete(`/.netlify/functions/reports/${posReportData.id}`);
      await request.delete(`/.netlify/functions/accounts/${posAcctData.id}`);
    }
  });

  test("VarianceSummary displays Actual Spend with dollar amount", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-summary")).toBeVisible({ timeout: 30000 });

    const actualSpend = page.getByTestId("actual-spend");
    await expect(actualSpend).toContainText("Actual Spend:");
    await expect(actualSpend).toContainText("$");
  });

  test("VarianceSummary displays Budgeted Spend with dollar amount", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-summary")).toBeVisible({ timeout: 30000 });

    const budgetedSpend = page.getByTestId("budgeted-spend");
    await expect(budgetedSpend).toContainText("Budgeted Spend:");
    await expect(budgetedSpend).toContainText("$");
  });

  test("VarianceSummary displays mini trend chart on the right", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-summary")).toBeVisible({ timeout: 30000 });

    const trendChart = page.getByTestId("variance-trend-chart");
    await expect(trendChart).toBeVisible();

    // Should contain a sparkline SVG
    await expect(page.getByTestId("variance-sparkline")).toBeVisible();
  });

  test("VarianceSummary card layout shows all metrics in a single row", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-summary")).toBeVisible({ timeout: 30000 });

    // All four sections should be visible within the summary card
    await expect(page.getByTestId("total-variance")).toBeVisible();
    await expect(page.getByTestId("actual-spend")).toBeVisible();
    await expect(page.getByTestId("budgeted-spend")).toBeVisible();
    await expect(page.getByTestId("variance-trend-chart")).toBeVisible();

    // Verify the card uses flexbox row layout
    const card = page.getByTestId("variance-summary");
    await expect(card).toHaveClass(/variance-summary-card/);
  });
});

test.describe("VarianceChart", () => {
  test.beforeAll(async ({ request }) => {
    ctx = await createTestData(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, ctx);
  });

  test("VarianceChart displays heading and subtitle", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    const section = page.getByTestId("variance-chart");
    await expect(section.locator(".variance-chart-heading")).toHaveText("Top Account Variances");
    await expect(section.locator(".variance-chart-subtitle")).toHaveText("Actual vs. Budgeted");
  });

  test("VarianceChart displays bar chart with paired bars per account", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    // SVG chart should be rendered
    const svg = page.getByTestId("variance-chart-svg");
    await expect(svg).toBeVisible();

    // Each account should have a bar group
    await expect(page.getByTestId("chart-bar-marketing")).toBeVisible();
    await expect(page.getByTestId("chart-bar-operations")).toBeVisible();
    await expect(page.getByTestId("chart-bar-r-d")).toBeVisible();
    await expect(page.getByTestId("chart-bar-sales")).toBeVisible();
    await expect(page.getByTestId("chart-bar-g-a")).toBeVisible();
  });

  test("VarianceChart displays account labels on x-axis", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    const svg = page.getByTestId("variance-chart-svg");

    // Account names should appear as text labels in the SVG
    await expect(svg.locator("text").filter({ hasText: "Marketing" })).toBeVisible();
    await expect(svg.locator("text").filter({ hasText: "Operations" })).toBeVisible();
    await expect(svg.locator("text").filter({ hasText: "R&D" })).toBeVisible();
    await expect(svg.locator("text").filter({ hasText: "Sales" })).toBeVisible();
    await expect(svg.locator("text").filter({ hasText: "G&A" })).toBeVisible();
  });

  test("VarianceChart y-axis shows dollar amounts", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    const svg = page.getByTestId("variance-chart-svg");

    // Y-axis should contain dollar-formatted text labels
    // The ticks show values like $5k, -$5k, $0, etc.
    await expect(svg.locator("text").filter({ hasText: "$" }).first()).toBeVisible();
  });

  test("VarianceChart over-budget accounts displayed with red bars", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    // Marketing, Operations, and R&D are over budget (actual > budget)
    // Their bars should have fill set to the error color (red)
    const marketingBar = page.getByTestId("chart-bar-marketing").locator("rect");
    await expect(marketingBar).toBeVisible();
    const marketingFill = await marketingBar.getAttribute("fill");
    expect(marketingFill).toBe("var(--status-error)");

    const opsBar = page.getByTestId("chart-bar-operations").locator("rect");
    const opsFill = await opsBar.getAttribute("fill");
    expect(opsFill).toBe("var(--status-error)");

    const rdBar = page.getByTestId("chart-bar-r-d").locator("rect");
    const rdFill = await rdBar.getAttribute("fill");
    expect(rdFill).toBe("var(--status-error)");
  });

  test("VarianceChart under-budget accounts displayed with green bars", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    // Sales and G&A are under budget (actual < budget)
    const salesBar = page.getByTestId("chart-bar-sales").locator("rect");
    await expect(salesBar).toBeVisible();
    const salesFill = await salesBar.getAttribute("fill");
    expect(salesFill).toBe("var(--status-success)");

    const gaBar = page.getByTestId("chart-bar-g-a").locator("rect");
    const gaFill = await gaBar.getAttribute("fill");
    expect(gaFill).toBe("var(--status-success)");
  });

  test("VarianceChart displays data for all accounts in the report", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    // All 5 account bar groups should be present
    const barGroups = page.locator("[data-testid^='chart-bar-']");
    // Filter to only our test accounts (exclude any others from seed data)
    await expect(page.getByTestId("chart-bar-marketing")).toBeVisible();
    await expect(page.getByTestId("chart-bar-operations")).toBeVisible();
    await expect(page.getByTestId("chart-bar-r-d")).toBeVisible();
    await expect(page.getByTestId("chart-bar-sales")).toBeVisible();
    await expect(page.getByTestId("chart-bar-g-a")).toBeVisible();

    // Verify at least 5 bar groups exist (could have more from seed data)
    const count = await barGroups.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("VarianceChart bar heights are proportional to variance amounts", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("variance-chart")).toBeVisible({ timeout: 30000 });

    // Marketing variance: actual-budget = 42000-38000 = 4000 (over budget)
    // R&D variance: actual-budget = 30000-25000 = 5000 (over budget)
    // R&D has a larger variance than Marketing, so its bar should be taller
    const marketingRect = page.getByTestId("chart-bar-marketing").locator("rect");
    const rdRect = page.getByTestId("chart-bar-r-d").locator("rect");

    const marketingHeight = parseFloat(
      (await marketingRect.getAttribute("height")) ?? "0"
    );
    const rdHeight = parseFloat((await rdRect.getAttribute("height")) ?? "0");

    expect(rdHeight).toBeGreaterThan(marketingHeight);
  });
});

test.describe("DetailedReportTable", () => {
  test.beforeAll(async ({ request }) => {
    ctx = await createTestData(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupTestData(request, ctx);
  });

  test("DetailedReportTable displays heading", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    await expect(
      page.getByTestId("detailed-report-table").locator(".detailed-report-heading")
    ).toHaveText("Detailed Report");
  });

  test("DetailedReportTable displays correct column headers", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    const table = page.getByTestId("detailed-report-table");
    const headers = table.locator("thead th");

    await expect(headers.nth(0)).toHaveText("Account / Item");
    await expect(headers.nth(1)).toHaveText("Actual ($)");
    await expect(headers.nth(2)).toHaveText("Budget ($)");
    await expect(headers.nth(3)).toHaveText("Variance ($)");
    await expect(headers.nth(4)).toHaveText("Variance (%)");
    await expect(headers.nth(5)).toHaveText("Trend");
    await expect(headers.nth(6)).toHaveText("Actions");
  });

  test("DetailedReportTable displays account rows with name and label", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Check that account rows show name in bold with (Account) label
    const marketingRow = page.getByTestId("report-row-marketing");
    await expect(marketingRow).toBeVisible();
    await expect(marketingRow.locator(".detailed-report-item-name")).toContainText("Marketing");
    await expect(marketingRow.locator(".detailed-report-item-label")).toContainText("(Account)");

    const operationsRow = page.getByTestId("report-row-operations");
    await expect(operationsRow).toBeVisible();
    await expect(operationsRow.locator(".detailed-report-item-name")).toContainText("Operations");
    await expect(operationsRow.locator(".detailed-report-item-label")).toContainText("(Account)");
  });

  test("DetailedReportTable account rows display Actual, Budget, Variance, and Variance % values", async ({
    page,
  }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    const marketingRow = page.getByTestId("report-row-marketing");
    await expect(marketingRow).toBeVisible();

    // Marketing: actual=42000, budget=38000, variance=-4000, pct=10.5%
    await expect(marketingRow).toContainText("$42,000.00");
    await expect(marketingRow).toContainText("$38,000.00");
    await expect(marketingRow).toContainText("-$4,000.00");
    await expect(marketingRow).toContainText("(10.5%)");
  });

  test("DetailedReportTable account rows have expand/collapse chevron", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Operations has sub-items so its expand button should be visible
    const expandBtn = page.getByTestId("expand-btn-operations");
    await expect(expandBtn).toBeVisible();

    // The button contains an SVG chevron
    await expect(expandBtn.locator("svg")).toBeVisible();
  });

  test("DetailedReportTable clicking expand chevron reveals sub-item rows", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Click expand on Operations
    await page.getByTestId("expand-btn-operations").click();

    // Sub-item rows should appear
    const cloudRow = page.getByTestId("report-subrow-cloud-infrastructure");
    await expect(cloudRow).toBeVisible();
    await expect(cloudRow).toContainText("Cloud Infrastructure");
    await expect(cloudRow).toContainText("$8,500.00");
    await expect(cloudRow).toContainText("$5,000.00");
    await expect(cloudRow).toContainText("-$3,500.00");
    await expect(cloudRow).toContainText("(70.0%)");

    const officeRow = page.getByTestId("report-subrow-office-lease");
    await expect(officeRow).toBeVisible();
    await expect(officeRow).toContainText("Office Lease");
    await expect(officeRow).toContainText("$6,000.00");
    await expect(officeRow).toContainText("$6,000.00");
    await expect(officeRow).toContainText("$0.00");
    await expect(officeRow).toContainText("(0%)");

    const travelRow = page.getByTestId("report-subrow-travel");
    await expect(travelRow).toBeVisible();
    await expect(travelRow).toContainText("Travel");
    await expect(travelRow).toContainText("$2,500.00");
    await expect(travelRow).toContainText("$3,500.00");
    await expect(travelRow).toContainText("+$1,000.00");
    await expect(travelRow).toContainText("28.6%");

    // Chevron should be rotated (expanded class)
    await expect(
      page.getByTestId("expand-btn-operations").locator("svg")
    ).toHaveClass(/detailed-report-chevron--expanded/);
  });

  test("DetailedReportTable sub-item rows display item name with Item label", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations
    await page.getByTestId("expand-btn-operations").click();

    const cloudRow = page.getByTestId("report-subrow-cloud-infrastructure");
    await expect(cloudRow.locator(".detailed-report-item-name")).toContainText(
      "Cloud Infrastructure"
    );
    await expect(cloudRow.locator(".detailed-report-item-label")).toContainText("(Item)");

    const officeRow = page.getByTestId("report-subrow-office-lease");
    await expect(officeRow.locator(".detailed-report-item-name")).toContainText("Office Lease");
    await expect(officeRow.locator(".detailed-report-item-label")).toContainText("(Item)");

    const travelRow = page.getByTestId("report-subrow-travel");
    await expect(travelRow.locator(".detailed-report-item-name")).toContainText("Travel");
    await expect(travelRow.locator(".detailed-report-item-label")).toContainText("(Item)");

    // Sub-item rows should have indentation class
    await expect(cloudRow).toHaveClass(/detailed-report-subitem-row/);
  });

  test("DetailedReportTable clicking collapse chevron hides sub-item rows", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations first
    await page.getByTestId("expand-btn-operations").click();
    await expect(page.getByTestId("report-subrow-cloud-infrastructure")).toBeVisible();

    // Collapse Operations
    await page.getByTestId("expand-btn-operations").click();

    // Sub-items should be hidden
    await expect(page.getByTestId("report-subrow-cloud-infrastructure")).not.toBeVisible();
    await expect(page.getByTestId("report-subrow-office-lease")).not.toBeVisible();
    await expect(page.getByTestId("report-subrow-travel")).not.toBeVisible();

    // Chevron should no longer have expanded class
    await expect(
      page.getByTestId("expand-btn-operations").locator("svg")
    ).not.toHaveClass(/detailed-report-chevron--expanded/);
  });

  test("DetailedReportTable negative variance amounts shown in red", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Marketing has negative variance (-$4,000)
    const marketingRow = page.getByTestId("report-row-marketing");
    const varianceCells = marketingRow.locator("td.report-variance--negative");
    // Both Variance ($) and Variance (%) cells should have the negative class
    await expect(varianceCells.first()).toBeVisible();
  });

  test("DetailedReportTable negative variance percentages shown in red with parentheses", async ({
    page,
  }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Marketing: negative variance percentage should show (10.5%) in red
    const marketingRow = page.getByTestId("report-row-marketing");
    await expect(marketingRow).toContainText("(10.5%)");

    // The Variance (%) cell should have the negative class
    const pctCell = marketingRow.locator("td.report-variance--negative").nth(1);
    await expect(pctCell).toContainText("(10.5%)");
  });

  test("DetailedReportTable positive variance amounts shown in green with plus prefix", async ({
    page,
  }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations to see Travel (which has positive variance)
    await page.getByTestId("expand-btn-operations").click();

    const travelRow = page.getByTestId("report-subrow-travel");
    await expect(travelRow).toBeVisible();

    // Travel: positive variance +$1,000
    await expect(travelRow).toContainText("+$1,000.00");

    // Should have positive class (green)
    const posVarianceCell = travelRow.locator("td.report-variance--positive").first();
    await expect(posVarianceCell).toBeVisible();
    await expect(posVarianceCell).toContainText("+$1,000.00");
  });

  test("DetailedReportTable positive variance percentages shown in green", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations to see Travel
    await page.getByTestId("expand-btn-operations").click();

    const travelRow = page.getByTestId("report-subrow-travel");
    await expect(travelRow).toBeVisible();

    // Travel: positive variance percentage 28.6% (no parentheses)
    await expect(travelRow).toContainText("28.6%");

    // The Variance (%) cell should have positive class
    const pctCell = travelRow.locator("td.report-variance--positive").nth(1);
    await expect(pctCell).toContainText("28.6%");
  });

  test("DetailedReportTable zero variance displayed correctly", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations to see Office Lease (zero variance)
    await page.getByTestId("expand-btn-operations").click();

    const officeRow = page.getByTestId("report-subrow-office-lease");
    await expect(officeRow).toBeVisible();

    // Zero variance: $0.00 and (0%)
    await expect(officeRow).toContainText("$0.00");
    await expect(officeRow).toContainText("(0%)");

    // Should NOT have red or green class (neutral color)
    const varianceCells = officeRow.locator("td");
    // The variance cells should not have negative or positive classes
    const varianceDollarCell = varianceCells.nth(3);
    await expect(varianceDollarCell).not.toHaveClass(/report-variance--negative/);
    await expect(varianceDollarCell).not.toHaveClass(/report-variance--positive/);
  });

  test("DetailedReportTable Trend column displays sparkline for each row", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Account rows should have sparklines
    const marketingRow = page.getByTestId("report-row-marketing");
    await expect(marketingRow.getByTestId("row-sparkline")).toBeVisible();

    // Expand Operations to check sub-items too
    await page.getByTestId("expand-btn-operations").click();
    const cloudRow = page.getByTestId("report-subrow-cloud-infrastructure");
    await expect(cloudRow.getByTestId("row-sparkline")).toBeVisible();
  });

  test("DetailedReportTable Actions column displays View button for account rows", async ({
    page,
  }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Marketing should have a View button
    const viewBtn = page.getByTestId("view-btn-marketing");
    await expect(viewBtn).toBeVisible();
    await expect(viewBtn).toHaveText("View");
    await expect(viewBtn).toHaveClass(/btn--secondary/);
  });

  test("DetailedReportTable View button navigates to AccountDetailPage", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Click the View button for Marketing
    await page.getByTestId("view-btn-marketing").click();

    // Should navigate to the account detail page
    await expect(page).toHaveURL(/\/accounts\/.+/);
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });
  });

  test("DetailedReportTable sub-item rows do not display View button", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations
    await page.getByTestId("expand-btn-operations").click();

    // Sub-item rows should NOT have View buttons
    const cloudRow = page.getByTestId("report-subrow-cloud-infrastructure");
    await expect(cloudRow).toBeVisible();
    await expect(cloudRow.locator("button")).not.toBeVisible();

    const officeRow = page.getByTestId("report-subrow-office-lease");
    await expect(officeRow.locator("button")).not.toBeVisible();

    const travelRow = page.getByTestId("report-subrow-travel");
    await expect(travelRow.locator("button")).not.toBeVisible();
  });

  test("DetailedReportTable multiple accounts are listed", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // All five test accounts should be listed
    await expect(page.getByTestId("report-row-marketing")).toBeVisible();
    await expect(page.getByTestId("report-row-operations")).toBeVisible();
    await expect(page.getByTestId("report-row-r-d")).toBeVisible();
    await expect(page.getByTestId("report-row-sales")).toBeVisible();
    await expect(page.getByTestId("report-row-g-a")).toBeVisible();
  });

  test("DetailedReportTable expanding one account does not affect others", async ({ page }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations
    await page.getByTestId("expand-btn-operations").click();

    // Operations sub-items visible
    await expect(page.getByTestId("report-subrow-cloud-infrastructure")).toBeVisible();

    // Other accounts should remain collapsed — their expand buttons should not show expanded chevrons
    await expect(
      page.getByTestId("expand-btn-marketing").locator("svg")
    ).not.toHaveClass(/detailed-report-chevron--expanded/);
    await expect(
      page.getByTestId("expand-btn-r-d").locator("svg")
    ).not.toHaveClass(/detailed-report-chevron--expanded/);
    await expect(
      page.getByTestId("expand-btn-sales").locator("svg")
    ).not.toHaveClass(/detailed-report-chevron--expanded/);
    await expect(
      page.getByTestId("expand-btn-g-a").locator("svg")
    ).not.toHaveClass(/detailed-report-chevron--expanded/);
  });

  test("DetailedReportTable multiple accounts can be expanded simultaneously", async ({
    page,
  }) => {
    await page.goto(`/reports/${ctx.reportId}`);
    await expect(page.getByTestId("detailed-report-table")).toBeVisible({ timeout: 30000 });

    // Expand Operations
    await page.getByTestId("expand-btn-operations").click();
    await expect(page.getByTestId("report-subrow-cloud-infrastructure")).toBeVisible();

    // Expand Marketing
    await page.getByTestId("expand-btn-marketing").click();

    // Both should remain expanded
    // Operations sub-items still visible
    await expect(page.getByTestId("report-subrow-cloud-infrastructure")).toBeVisible();
    await expect(page.getByTestId("report-subrow-office-lease")).toBeVisible();
    await expect(page.getByTestId("report-subrow-travel")).toBeVisible();

    // Marketing sub-items visible
    await expect(page.getByTestId("report-subrow-digital-ads")).toBeVisible();
    await expect(page.getByTestId("report-subrow-events")).toBeVisible();

    // Marketing chevron should show expanded
    await expect(
      page.getByTestId("expand-btn-marketing").locator("svg")
    ).toHaveClass(/detailed-report-chevron--expanded/);

    // Operations chevron should still show expanded
    await expect(
      page.getByTestId("expand-btn-operations").locator("svg")
    ).toHaveClass(/detailed-report-chevron--expanded/);
  });
});
