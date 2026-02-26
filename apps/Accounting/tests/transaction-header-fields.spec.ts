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
});
