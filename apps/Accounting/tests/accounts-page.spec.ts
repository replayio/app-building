import { test, expect } from "@playwright/test";

test.describe("NavBar", () => {
  test("NavBar displays logo and navigation links", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // Logo
    await expect(page.getByTestId("navbar-logo")).toHaveText("FINANCEWEB");

    // Navigation links
    await expect(page.getByTestId("navbar-link-dashboard")).toBeVisible();
    await expect(page.getByTestId("navbar-link-accounts")).toBeVisible();
    await expect(page.getByTestId("navbar-link-reports")).toBeVisible();
    await expect(page.getByTestId("navbar-link-budgets")).toBeVisible();

    // Accounts link is active
    await expect(page.getByTestId("navbar-link-accounts")).toHaveClass(/navbar-link--active/);

    // Breadcrumb shows Home > Accounts
    const breadcrumb = page.getByTestId("breadcrumb");
    await expect(breadcrumb).toContainText("Home");
    await expect(breadcrumb).toContainText("Accounts");
  });

  test("NavBar Accounts link navigates to AccountsPage", async ({ page }) => {
    // Start on Dashboard
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });

    // Click Accounts link in the NavBar on the Dashboard page
    await page.getByTestId("navbar-link-accounts").click();

    // Verify navigation to AccountsPage
    await expect(page).toHaveURL(/\/accounts$/);
    await expect(page.getByTestId("accounts-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("navbar-link-accounts")).toHaveClass(/navbar-link--active/);
  });

  test("NavBar Dashboard link navigates to Dashboard", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // Click Dashboard link
    await page.getByTestId("navbar-link-dashboard").click();

    // Verify navigation to Dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("navbar-link-dashboard")).toHaveClass(/navbar-link--active/);
  });

  test("NavBar Reports link navigates to ReportList", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // Click Reports link
    await page.getByTestId("navbar-link-reports").click();

    // Verify navigation to ReportList
    await expect(page).toHaveURL(/\/reports/);
    await expect(page.getByTestId("report-list-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("navbar-link-reports")).toHaveClass(/navbar-link--active/);
  });

  test("NavBar Budgets link navigates to Budgets page", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // Click Budgets link
    await page.getByTestId("navbar-link-budgets").click();

    // Verify navigation to Budgets page
    await expect(page).toHaveURL(/\/budgets/);
    await expect(page.getByTestId("budgets-page")).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId("navbar-link-budgets")).toHaveClass(/navbar-link--active/);
  });

  test("NavBar New Transaction button opens NewTransactionModal", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // Verify the button shows plus icon and text
    const newTxnBtn = page.getByTestId("navbar-new-transaction-btn");
    await expect(newTxnBtn).toBeVisible();
    await expect(newTxnBtn).toContainText("New Transaction");

    // Click the button
    await newTxnBtn.click();

    // Verify the modal opens
    await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
  });

  test("NavBar displays user name and avatar", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // User info area
    await expect(page.getByTestId("navbar-user")).toBeVisible();
    await expect(page.getByTestId("navbar-avatar")).toBeVisible();
    await expect(page.getByTestId("navbar-user-name")).toHaveText("John Doe");
  });

  test("NavBar Log Out button logs the user out", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });

    // Click Log Out
    await page.getByTestId("navbar-logout-btn").click();

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-page")).toBeVisible({ timeout: 30000 });
  });
});

test.describe("AccountsOverviewHeader", () => {
  test("AccountsOverviewHeader displays page title", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("accounts-overview-header")).toBeVisible({ timeout: 30000 });

    // Title is displayed
    await expect(page.getByTestId("accounts-overview-title")).toHaveText("Accounts Overview");
  });

  test("AccountsOverviewHeader Generate Reports button opens CreateReportDialog", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("accounts-overview-header")).toBeVisible({ timeout: 30000 });

    // Button is visible with text
    const btn = page.getByTestId("generate-reports-btn");
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("Generate Reports");

    // Click button
    await btn.click();

    // Verify dialog opens
    await expect(page.getByTestId("create-report-dialog")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("CategorySection", () => {
  test("CategorySection displays all five accounting categories", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("accounts-page")).toBeVisible({ timeout: 30000 });

    // Wait for accounts to load
    await expect(page.getByTestId("category-section-assets")).toBeVisible({ timeout: 30000 });

    // All five categories in order
    const categories = ["assets", "liabilities", "equity", "revenue", "expenses"];
    for (const cat of categories) {
      await expect(page.getByTestId(`category-section-${cat}`)).toBeVisible();
      await expect(page.getByTestId(`category-title-${cat}`)).toBeVisible();
      await expect(page.getByTestId(`category-total-${cat}`)).toBeVisible();
    }

    // Verify order
    const sections = page.locator("[data-testid^='category-section-']");
    await expect(sections).toHaveCount(5);
    await expect(sections.nth(0)).toHaveAttribute("data-testid", "category-section-assets");
    await expect(sections.nth(1)).toHaveAttribute("data-testid", "category-section-liabilities");
    await expect(sections.nth(2)).toHaveAttribute("data-testid", "category-section-equity");
    await expect(sections.nth(3)).toHaveAttribute("data-testid", "category-section-revenue");
    await expect(sections.nth(4)).toHaveAttribute("data-testid", "category-section-expenses");
  });

  test("CategorySection shows correct category totals", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-section-assets")).toBeVisible({ timeout: 30000 });

    // Verify each category total matches the sum of account balances
    // Assets: 12,500 + 40,000 + 98,450 = $150,950.00
    await expect(page.getByTestId("category-total-assets")).toContainText("$150,950.00");

    // Liabilities: -2,500 + -78,000 + -4,700 = -$85,200.00
    await expect(page.getByTestId("category-total-liabilities")).toContainText("-$85,200.00");

    // Equity: 50,000 + 17,250 = $67,250.00
    await expect(page.getByTestId("category-total-equity")).toContainText("$67,250.00");

    // Revenue: 80,000 + 30,000 = $110,000.00
    await expect(page.getByTestId("category-total-revenue")).toContainText("$110,000.00");

    // Expenses: 35,000 + 20,500 = $55,500.00
    await expect(page.getByTestId("category-total-expenses")).toContainText("$55,500.00");
  });

  test("CategorySection expand reveals account cards", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-section-equity")).toBeVisible({ timeout: 30000 });

    // Equity is collapsed by default
    await expect(page.getByTestId("category-content-equity")).not.toBeVisible();

    // Click to expand
    await page.getByTestId("category-header-equity").click();

    // Content should be visible now
    await expect(page.getByTestId("category-content-equity")).toBeVisible();

    // Chevron should show expanded state
    const chevron = page.getByTestId("category-chevron-equity");
    await expect(chevron).toHaveAttribute("data-expanded", "true");
  });

  test("CategorySection collapse hides account cards", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-section-assets")).toBeVisible({ timeout: 30000 });

    // Assets is expanded by default
    await expect(page.getByTestId("category-content-assets")).toBeVisible();

    // Click to collapse
    await page.getByTestId("category-header-assets").click();

    // Content should be hidden
    await expect(page.getByTestId("category-content-assets")).not.toBeVisible();

    // Chevron should show collapsed state
    const chevron = page.getByTestId("category-chevron-assets");
    await expect(chevron).toHaveAttribute("data-expanded", "false");
  });

  test("CategorySection Assets expanded by default with three accounts", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-section-assets")).toBeVisible({ timeout: 30000 });

    // Assets is expanded by default
    await expect(page.getByTestId("category-content-assets")).toBeVisible();

    // Three account cards visible
    const assetsContent = page.getByTestId("category-content-assets");
    const cards = assetsContent.locator(".account-card");
    await expect(cards).toHaveCount(3);

    // Verify specific accounts by name
    await expect(assetsContent).toContainText("Checking Account (Chase Bank)");
    await expect(assetsContent).toContainText("Savings Account (Ally)");
    await expect(assetsContent).toContainText("Investment Portfolio (Vanguard)");
  });

  test("CategorySection Liabilities expanded by default with three accounts", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-section-liabilities")).toBeVisible({ timeout: 30000 });

    // Liabilities is expanded by default
    await expect(page.getByTestId("category-content-liabilities")).toBeVisible();

    // Three account cards visible
    const liabilitiesContent = page.getByTestId("category-content-liabilities");
    const cards = liabilitiesContent.locator(".account-card");
    await expect(cards).toHaveCount(3);

    // Verify specific accounts by name
    await expect(liabilitiesContent).toContainText("Credit Card (Visa)");
    await expect(liabilitiesContent).toContainText("Mortgage Loan (Wells Fargo)");
    await expect(liabilitiesContent).toContainText("Car Loan (Toyota Financial)");
  });
});

test.describe("AccountCard", () => {
  test("AccountCard displays account name and balance", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    // Find the Checking Account card
    const assetsContent = page.getByTestId("category-content-assets");
    const checkingCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Checking Account (Chase Bank)",
    });
    await expect(checkingCard).toBeVisible();

    // Verify name and balance
    await expect(checkingCard.getByTestId("account-card-name")).toHaveText("Checking Account (Chase Bank)");
    await expect(checkingCard.getByTestId("account-card-balance")).toContainText("$12,500.00");
  });

  test("AccountCard displays debits and credits YTD", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    const assetsContent = page.getByTestId("category-content-assets");
    const checkingCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Checking Account (Chase Bank)",
    });

    const ytd = checkingCard.getByTestId("account-card-ytd");
    await expect(ytd).toContainText("Debits (YTD): $45,200.00");
    await expect(ytd).toContainText("Credits (YTD): $57,700.00");
  });

  test("AccountCard displays budget vs actual progress bar", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    const assetsContent = page.getByTestId("category-content-assets");
    const checkingCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Checking Account (Chase Bank)",
    });

    // Budget bar section
    const budgetSection = checkingCard.getByTestId("budget-bar-section");
    await expect(budgetSection).toBeVisible();
    await expect(budgetSection).toContainText("Budget vs Actual");
    await expect(budgetSection).toContainText("$10,000.00");
    await expect(budgetSection).toContainText("$12,500.00");
    await expect(budgetSection).toContainText("Budgeted");

    // Progress bar fill is present
    await expect(checkingCard.getByTestId("budget-bar-fill")).toBeVisible();
  });

  test("AccountCard View Budget Details link navigates to budget details", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    const assetsContent = page.getByTestId("category-content-assets");
    const checkingCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Checking Account (Chase Bank)",
    });

    // Click View Budget Details link
    await checkingCard.getByTestId("view-budget-details-link").click();

    // Verify navigation to account detail page
    await expect(page).toHaveURL(/\/accounts\/.+/);
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });
  });

  test("AccountCard three-dot menu opens actions", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    // Find the checking account card and its menu button
    const assetsContent = page.getByTestId("category-content-assets");
    const checkingCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Checking Account (Chase Bank)",
    });

    // Get the account ID from the card's data-testid
    const cardTestId = await checkingCard.getAttribute("data-testid");
    const accountId = cardTestId!.replace("account-card-", "");

    // Click the three-dot menu button
    await page.getByTestId(`account-card-menu-btn-${accountId}`).click();

    // Verify menu appears with expected actions
    const menu = page.getByTestId(`account-card-menu-${accountId}`);
    await expect(menu).toBeVisible();
    await expect(page.getByTestId("menu-edit-account")).toBeVisible();
    await expect(page.getByTestId("menu-view-transactions")).toBeVisible();
    await expect(page.getByTestId("menu-delete-account")).toBeVisible();
  });

  test("AccountCard click navigates to AccountDetailPage", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    const assetsContent = page.getByTestId("category-content-assets");
    const checkingCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Checking Account (Chase Bank)",
    });

    // Click the card body
    await checkingCard.click();

    // Verify navigation to account detail page
    await expect(page).toHaveURL(/\/accounts\/.+/);
    await expect(page.getByTestId("account-detail-page")).toBeVisible({ timeout: 30000 });
  });

  test("AccountCard displays savings goal progress", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    const assetsContent = page.getByTestId("category-content-assets");
    const savingsCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Savings Account (Ally)",
    });
    await expect(savingsCard).toBeVisible();

    // Verify balance
    await expect(savingsCard.getByTestId("account-card-balance")).toContainText("$40,000.00");

    // Verify YTD
    await expect(savingsCard.getByTestId("account-card-ytd")).toContainText("Debits (YTD): $45,200.00");
    await expect(savingsCard.getByTestId("account-card-ytd")).toContainText("Credits (YTD): $57,700.00");

    // Verify savings goal
    const savingsGoal = savingsCard.getByTestId("savings-goal");
    await expect(savingsGoal).toBeVisible();
    await expect(savingsGoal).toContainText("Vacation Fund");
    await expect(savingsGoal).toContainText("95%");
  });

  test("AccountCard displays investment performance", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-assets")).toBeVisible({ timeout: 30000 });

    const assetsContent = page.getByTestId("category-content-assets");
    const investmentCard = assetsContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Investment Portfolio (Vanguard)",
    });
    await expect(investmentCard).toBeVisible();

    // Verify balance
    await expect(investmentCard.getByTestId("account-card-balance")).toContainText("$98,450.00");

    // Verify performance indicator
    const performance = investmentCard.getByTestId("performance-indicator");
    await expect(performance).toBeVisible();
    await expect(performance).toContainText("Performance: +7.5%");
  });

  test("AccountCard displays liability-specific information", async ({ page }) => {
    await page.goto("/accounts");
    await expect(page.getByTestId("category-content-liabilities")).toBeVisible({ timeout: 30000 });

    const liabilitiesContent = page.getByTestId("category-content-liabilities");

    // Credit Card (Visa)
    const visaCard = liabilitiesContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Credit Card (Visa)",
    });
    await expect(visaCard).toBeVisible();
    await expect(visaCard.getByTestId("account-card-balance")).toContainText("-$2,500.00");
    await expect(visaCard.getByTestId("account-card-ytd")).toContainText("Debits (YTD): $8,500.00");
    await expect(visaCard.getByTestId("account-card-ytd")).toContainText("Credits (YTD): $6,000.00");
    await expect(visaCard.getByTestId("budget-bar-section")).toBeVisible();
    await expect(visaCard.getByTestId("credit-limit-usage")).toContainText("Credit Limit Usage: 35%");

    // Mortgage Loan (Wells Fargo)
    const mortgageCard = liabilitiesContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Mortgage Loan (Wells Fargo)",
    });
    await expect(mortgageCard).toBeVisible();
    await expect(mortgageCard.getByTestId("account-card-balance")).toContainText("-$78,000.00");
    await expect(mortgageCard.getByTestId("account-monthly-payment")).toContainText("$1,200.00");
    await expect(mortgageCard.getByTestId("account-interest-rate")).toContainText("3.5%");

    // Car Loan (Toyota Financial)
    const carLoanCard = liabilitiesContent.locator("[data-testid^='account-card-']").filter({
      hasText: "Car Loan (Toyota Financial)",
    });
    await expect(carLoanCard).toBeVisible();
    await expect(carLoanCard.getByTestId("account-card-balance")).toContainText("-$4,700.00");
  });
});
