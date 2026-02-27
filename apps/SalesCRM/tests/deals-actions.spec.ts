import { test, expect, type Page } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

interface DealResponse {
  id: string;
  name: string;
  clientId: string;
  clientName: string | null;
  value: number | null;
  stage: string;
  ownerId: string | null;
  ownerName: string | null;
  probability: number | null;
  expectedCloseDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientResponse {
  id: string;
  name: string;
}

interface TimelineEvent {
  id: string;
  clientId: string | null;
  eventType: string;
  description: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdBy: string;
  createdByUserId: string | null;
  createdAt: string;
}

async function getFirstClient(page: Page): Promise<ClientResponse> {
  const resp = await page.request.get("/.netlify/functions/clients");
  const clients: ClientResponse[] = await resp.json();
  if (clients.length === 0) throw new Error("No clients found");
  return clients[0];
}

async function createTestDeal(
  page: Page,
  clientId: string,
  overrides?: Record<string, unknown>
): Promise<DealResponse> {
  const resp = await page.request.post("/.netlify/functions/deals", {
    data: {
      name: `Test Deal ${Date.now()}`,
      clientId,
      value: 50000,
      stage: "Discovery",
      status: "active",
      expectedCloseDate: "2099-12-31",
      ...overrides,
    },
  });
  expect(resp.status()).toBe(201);
  return resp.json();
}

async function navigateToDeals(page: Page): Promise<void> {
  await page.goto("/deals");
  await expect(page.getByTestId("deals-list-page")).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByTestId("deals-table")).toBeVisible({
    timeout: 30000,
  });
}

async function openActionsMenu(
  page: Page,
  dealId: string
): Promise<void> {
  await page.getByTestId(`deal-actions-${dealId}`).click();
  await expect(page.getByTestId(`deal-menu-${dealId}`)).toBeVisible();
}

async function openEditModal(
  page: Page,
  dealId: string
): Promise<void> {
  await openActionsMenu(page, dealId);
  await page.getByTestId(`deal-edit-${dealId}`).click();
  await expect(page.getByTestId("edit-deal-modal")).toBeVisible();
}

async function getTimelineEvents(
  page: Page,
  clientId: string
): Promise<TimelineEvent[]> {
  const resp = await page.request.get(
    `/.netlify/functions/timeline?clientId=${clientId}`
  );
  return resp.json();
}

async function signUpUser(
  page: Page,
  email: string
): Promise<{ id: string; token: string }> {
  const resp = await page.request.post("/.netlify/functions/auth", {
    data: { action: "signup", email, password: "TestPass123!" },
  });
  const data = await resp.json();
  return { id: data.user.id, token: data.token };
}

async function followClient(
  page: Page,
  clientId: string,
  token: string
): Promise<void> {
  await page.request.post(
    `/.netlify/functions/client-follow?clientId=${clientId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// ─── Edit Modal Tests ───

test.describe("DealsListPage - EditDealModal", () => {
  test("Actions menu Edit modal saves edits", async ({ page }) => {
    const client = await getFirstClient(page);
    const deal = await createTestDeal(page, client.id);

    await navigateToDeals(page);
    await openEditModal(page, deal.id);

    // Verify modal is pre-populated
    await expect(page.getByTestId("edit-deal-name")).toHaveValue(deal.name);

    // Modify fields
    const newName = `Edited Deal ${Date.now()}`;
    await page.getByTestId("edit-deal-name").clear();
    await page.getByTestId("edit-deal-name").fill(newName);

    await page.getByTestId("edit-deal-value").clear();
    await page.getByTestId("edit-deal-value").fill("75000");

    // Change stage to Qualification via FilterSelect
    await page.getByTestId("edit-deal-stage-trigger").click();
    await expect(
      page.getByTestId("edit-deal-stage-dropdown")
    ).toBeVisible();
    await page.getByTestId("edit-deal-stage-option-Qualification").click();

    // Click save
    await page.getByTestId("edit-deal-submit").click();

    // Verify modal closes
    await expect(page.getByTestId("edit-deal-modal")).not.toBeVisible({
      timeout: 30000,
    });

    // Verify table row reflects updated values
    const row = page.getByTestId(`deal-row-${deal.id}`);
    await expect(row).toContainText(newName, { timeout: 30000 });
    await expect(row).toContainText("$75,000");
    await expect(row).toContainText("Qualification");
  });

  test("Actions menu Edit modal cancel closes without saving", async ({
    page,
  }) => {
    const client = await getFirstClient(page);
    const deal = await createTestDeal(page, client.id);

    await navigateToDeals(page);
    await openEditModal(page, deal.id);

    // Modify the name
    const originalName = deal.name;
    await page.getByTestId("edit-deal-name").clear();
    await page.getByTestId("edit-deal-name").fill(
      "This should not be saved"
    );

    // Click cancel
    await page.getByTestId("edit-deal-cancel").click();

    // Verify modal closes
    await expect(page.getByTestId("edit-deal-modal")).not.toBeVisible();

    // Verify original name is still in the row
    const row = page.getByTestId(`deal-row-${deal.id}`);
    await expect(row).toContainText(originalName);
    await expect(row).not.toContainText("This should not be saved");
  });

  test("Actions menu Edit modal validates required fields", async ({
    page,
  }) => {
    const client = await getFirstClient(page);
    const deal = await createTestDeal(page, client.id);

    await navigateToDeals(page);
    await openEditModal(page, deal.id);

    // Clear the required name field
    await page.getByTestId("edit-deal-name").clear();

    // Click save
    await page.getByTestId("edit-deal-submit").click();

    // Verify error message is displayed
    await expect(page.getByTestId("edit-deal-error")).toBeVisible();
    await expect(page.getByTestId("edit-deal-error")).toContainText(
      "Deal name is required"
    );

    // Verify modal stays open
    await expect(page.getByTestId("edit-deal-modal")).toBeVisible();
  });
});

// ─── Edit Deal Timeline & Notifications ───

test.describe("DealsListPage - EditDeal Side Effects", () => {
  test("Actions menu Edit deal creates a timeline entry on the client", async ({
    page,
  }) => {
    const client = await getFirstClient(page);
    const deal = await createTestDeal(page, client.id);

    // Get timeline events before the edit
    const timelineBefore = await getTimelineEvents(page, client.id);

    await navigateToDeals(page);
    await openEditModal(page, deal.id);

    // Change stage to trigger a timeline entry
    await page.getByTestId("edit-deal-stage-trigger").click();
    await expect(
      page.getByTestId("edit-deal-stage-dropdown")
    ).toBeVisible();
    await page.getByTestId("edit-deal-stage-option-Qualification").click();

    // Save
    await page.getByTestId("edit-deal-submit").click();
    await expect(page.getByTestId("edit-deal-modal")).not.toBeVisible({
      timeout: 30000,
    });

    // Verify timeline entry was created
    const timelineAfter = await getTimelineEvents(page, client.id);

    // Filter to only new "Deal Stage Changed" entries for this deal
    const newEntries = timelineAfter.filter(
      (e) =>
        e.eventType === "Deal Stage Changed" &&
        e.relatedEntityId === deal.id &&
        !timelineBefore.some((b) => b.id === e.id)
    );

    // Exactly one timeline entry should have been created
    expect(newEntries).toHaveLength(1);
    expect(newEntries[0].description).toContain(deal.name);
    expect(newEntries[0].description).toContain("Discovery");
    expect(newEntries[0].description).toContain("Qualification");
    expect(newEntries[0].createdBy).toBeTruthy();
  });

  test("Actions menu Edit deal triggers follower notifications on the client", async ({
    page,
  }) => {
    test.slow();

    const client = await getFirstClient(page);

    // Create a follower user
    const followerEmail = `follower-edit-${Date.now()}@example.com`;
    const { id: followerId, token: followerToken } = await signUpUser(
      page,
      followerEmail
    );

    // Follow the client
    await followClient(page, client.id, followerToken);

    // Create a deal for this client
    const deal = await createTestDeal(page, client.id);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    const sql = neon(dbUrl);

    // Edit the deal (change stage) — as unauthenticated user
    await navigateToDeals(page);
    await openEditModal(page, deal.id);

    await page.getByTestId("edit-deal-stage-trigger").click();
    await expect(
      page.getByTestId("edit-deal-stage-dropdown")
    ).toBeVisible();
    await page.getByTestId("edit-deal-stage-option-Negotiation").click();

    await page.getByTestId("edit-deal-submit").click();
    await expect(page.getByTestId("edit-deal-modal")).not.toBeVisible({
      timeout: 30000,
    });

    // Verify notification token was created for the follower
    const tokens = await sql(
      `SELECT * FROM email_tokens WHERE type = 'notification' AND token LIKE $1`,
      [`stage-change-${deal.id}-%`]
    );

    // At least one notification for this deal's stage change
    expect(tokens.length).toBeGreaterThanOrEqual(1);

    // Find the notification for our specific follower
    const followerNotification = tokens.find(
      (t: Record<string, unknown>) =>
        (t.token as string).includes(followerId)
    );
    expect(followerNotification).toBeTruthy();
  });
});

// ─── Delete Deal Timeline & Notifications ───

test.describe("DealsListPage - DeleteDeal Side Effects", () => {
  test("Actions menu Delete creates a timeline entry on the client", async ({
    page,
  }) => {
    const client = await getFirstClient(page);
    const deal = await createTestDeal(page, client.id);
    const dealName = deal.name;

    // Get timeline events before the delete
    const timelineBefore = await getTimelineEvents(page, client.id);

    await navigateToDeals(page);

    // Open actions menu and click Delete
    await openActionsMenu(page, deal.id);
    await page.getByTestId(`deal-delete-${deal.id}`).click();

    // Confirm deletion
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await page.getByTestId("confirm-dialog-confirm").click();

    // Wait for the deal row to be removed
    await expect(
      page.getByTestId(`deal-row-${deal.id}`)
    ).not.toBeVisible({ timeout: 30000 });

    // Verify timeline entry was created
    const timelineAfter = await getTimelineEvents(page, client.id);

    // Filter to only new "Deal Deleted" entries for this deal
    const newEntries = timelineAfter.filter(
      (e) =>
        e.eventType === "Deal Deleted" &&
        e.relatedEntityId === deal.id &&
        !timelineBefore.some((b) => b.id === e.id)
    );

    // Exactly one timeline entry should have been created
    expect(newEntries).toHaveLength(1);
    expect(newEntries[0].description).toContain(dealName);
    expect(newEntries[0].createdBy).toBeTruthy();
  });

  test("Actions menu Delete triggers follower notifications on the client", async ({
    page,
  }) => {
    test.slow();

    const client = await getFirstClient(page);

    // Create a follower user
    const followerEmail = `follower-del-${Date.now()}@example.com`;
    const { id: followerId, token: followerToken } = await signUpUser(
      page,
      followerEmail
    );

    // Follow the client
    await followClient(page, client.id, followerToken);

    // Create a deal for this client
    const deal = await createTestDeal(page, client.id);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");
    const sql = neon(dbUrl);

    // Navigate to deals and delete the deal
    await navigateToDeals(page);

    await openActionsMenu(page, deal.id);
    await page.getByTestId(`deal-delete-${deal.id}`).click();

    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await page.getByTestId("confirm-dialog-confirm").click();

    // Wait for the deal row to be removed
    await expect(
      page.getByTestId(`deal-row-${deal.id}`)
    ).not.toBeVisible({ timeout: 30000 });

    // Verify notification token was created for the follower
    const tokens = await sql(
      `SELECT * FROM email_tokens WHERE type = 'notification' AND token LIKE $1`,
      [`deal-deleted-${deal.id}-%`]
    );

    // At least one notification for this deal's deletion
    expect(tokens.length).toBeGreaterThanOrEqual(1);

    // Find the notification for our specific follower
    const followerNotification = tokens.find(
      (t: Record<string, unknown>) =>
        (t.token as string).includes(followerId)
    );
    expect(followerNotification).toBeTruthy();
  });
});
