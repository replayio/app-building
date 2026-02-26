import { test, expect } from "@playwright/test";

async function openNewTransactionModal(page: import("@playwright/test").Page) {
  await page.goto("/accounts");
  await expect(page.getByTestId("navbar")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("navbar-new-transaction-btn").click();
  await expect(page.getByTestId("new-transaction-modal")).toBeVisible({ timeout: 10000 });
}

test.describe("TransactionHeaderFields", () => {
  test("TransactionHeaderFields displays Date field with calendar icon", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify the header fields container is visible
    const headerFields = page.getByTestId("transaction-header-fields");
    await expect(headerFields).toBeVisible();

    // Verify the date input is visible
    const dateInput = page.getByTestId("transaction-date");
    await expect(dateInput).toBeVisible();

    // Verify the calendar icon is visible on the left side of the date field
    const calendarIcon = page.getByTestId("date-calendar-icon");
    await expect(calendarIcon).toBeVisible();

    // Verify the date input defaults to today's date for new transactions
    const today = new Date().toISOString().split("T")[0];
    await expect(dateInput).toHaveValue(today);
  });

  test("TransactionHeaderFields Date picker allows selecting a date", async ({ page }) => {
    await openNewTransactionModal(page);

    const dateInput = page.getByTestId("transaction-date");
    await expect(dateInput).toBeVisible();

    // Select a new date by filling the date input
    await dateInput.fill("2023-11-15");

    // Verify the date field updates to the selected date
    await expect(dateInput).toHaveValue("2023-11-15");
  });

  test("TransactionHeaderFields displays Description input with placeholder", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify the description input is visible
    const descInput = page.getByTestId("transaction-description");
    await expect(descInput).toBeVisible();

    // Verify the placeholder text is displayed
    await expect(descInput).toHaveAttribute("placeholder", "Enter transaction description...");

    // Verify the field is empty (placeholder visible)
    await expect(descInput).toHaveValue("");
  });

  test("TransactionHeaderFields Description input accepts text", async ({ page }) => {
    await openNewTransactionModal(page);

    const descInput = page.getByTestId("transaction-description");
    await expect(descInput).toBeVisible();

    // Type text into the description field
    await descInput.fill("October Rent & Utilities Payment");

    // Verify the typed text is displayed in the field
    await expect(descInput).toHaveValue("October Rent & Utilities Payment");
  });

  test("TransactionHeaderFields displays Currency dropdown with default value", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify the currency input is visible
    const currencyInput = page.getByTestId("transaction-currency");
    await expect(currencyInput).toBeVisible();

    // Verify the default value is "USD ($)"
    await expect(currencyInput).toHaveValue("USD ($)");

    // Verify the chevron icon is visible indicating it is a dropdown
    const chevronIcon = page.getByTestId("transaction-currency-chevron");
    await expect(chevronIcon).toBeVisible();
  });

  test("TransactionHeaderFields Currency dropdown allows selecting other currencies", async ({ page }) => {
    await openNewTransactionModal(page);

    // Verify default is USD
    const currencyInput = page.getByTestId("transaction-currency");
    await expect(currencyInput).toHaveValue("USD ($)");

    // Click the currency dropdown to open it
    await currencyInput.click();

    // Verify the dropdown menu opens with currency options
    const dropdown = page.locator(".searchable-select-dropdown");
    await expect(dropdown).toBeVisible();

    // Verify all currency options are available
    await expect(dropdown.locator(".searchable-select-option").filter({ hasText: "USD ($)" })).toBeVisible();
    await expect(dropdown.locator(".searchable-select-option").filter({ hasText: "EUR (€)" })).toBeVisible();
    await expect(dropdown.locator(".searchable-select-option").filter({ hasText: "GBP (£)" })).toBeVisible();
    await expect(dropdown.locator(".searchable-select-option").filter({ hasText: "JPY (¥)" })).toBeVisible();

    // Select EUR
    await dropdown.locator(".searchable-select-option").filter({ hasText: "EUR (€)" }).click();

    // Verify the dropdown updates to show the selected value
    await expect(currencyInput).toHaveValue("EUR (€)");
  });

  test("TransactionHeaderFields layout shows Date, Description, Currency in a single row", async ({ page }) => {
    await openNewTransactionModal(page);

    const headerFields = page.getByTestId("transaction-header-fields");
    await expect(headerFields).toBeVisible();

    // Verify the container uses flexbox for horizontal layout
    await expect(headerFields).toHaveCSS("display", "flex");

    // Get bounding boxes for all three fields to verify horizontal arrangement
    const dateField = page.getByTestId("transaction-date");
    const descField = page.getByTestId("transaction-description");
    const currencyField = page.getByTestId("transaction-currency");

    const dateBox = await dateField.boundingBox();
    const descBox = await descField.boundingBox();
    const currencyBox = await currencyField.boundingBox();

    // All three fields should exist
    expect(dateBox).not.toBeNull();
    expect(descBox).not.toBeNull();
    expect(currencyBox).not.toBeNull();

    // Verify left-to-right order: Date, Description, Currency
    expect(dateBox!.x).toBeLessThan(descBox!.x);
    expect(descBox!.x).toBeLessThan(currencyBox!.x);

    // Verify all fields are on the same row (similar vertical position)
    expect(Math.abs(dateBox!.y - descBox!.y)).toBeLessThan(10);
    expect(Math.abs(descBox!.y - currencyBox!.y)).toBeLessThan(10);

    // Verify Description field is the widest
    expect(descBox!.width).toBeGreaterThan(dateBox!.width);
    expect(descBox!.width).toBeGreaterThan(currencyBox!.width);
  });
});
