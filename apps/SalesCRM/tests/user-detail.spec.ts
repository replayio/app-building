import { test, expect, type Page } from "@playwright/test";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  activeDeals: number;
  openTasks: number;
}

interface UserDetailResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  activeDeals: number;
  totalDeals: number;
  openTasks: number;
  deals: Array<{
    id: string;
    name: string;
    clientName: string | null;
    value: number | null;
    stage: string;
    status: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    priority: string;
    status: string;
    clientName: string | null;
  }>;
  activity: Array<{
    id: string;
    eventType: string;
    description: string;
    createdAt: string;
  }>;
}

async function getUserByName(
  page: Page,
  name: string
): Promise<UserSummary> {
  const resp = await page.request.get("/.netlify/functions/users");
  const users: UserSummary[] = await resp.json();
  const user = users.find((u) => u.name === name);
  if (!user) throw new Error(`User "${name}" not found`);
  return user;
}

async function navigateToUser(page: Page, name: string): Promise<string> {
  const user = await getUserByName(page, name);
  await page.goto(`/users/${user.id}`);
  await expect(page.getByTestId("user-header")).toBeVisible({
    timeout: 30000,
  });
  return user.id;
}

async function getUserDetail(
  page: Page,
  userId: string
): Promise<UserDetailResponse> {
  const resp = await page.request.get(
    `/.netlify/functions/users/${userId}`
  );
  return resp.json();
}

// ─── UserHeader ───

test.describe("UserDetailPage - UserHeader", () => {
  test("User name is displayed prominently", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const nameEl = page.getByTestId("user-name");
    await expect(nameEl).toBeVisible();
    await expect(nameEl).toHaveText("Alice Johnson");
    await expect(
      page.getByRole("heading", { name: "Alice Johnson", level: 1 })
    ).toBeVisible();
  });

  test("User email is displayed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const emailEl = page.getByTestId("user-email");
    await expect(emailEl).toBeVisible();
    await expect(emailEl).toHaveText("alice@example.com");
  });

  test("User join date is displayed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const joinDateEl = page.getByTestId("user-join-date");
    await expect(joinDateEl).toBeVisible();
    await expect(joinDateEl).toHaveText(/Joined \w+ \d{1,2}, \d{4}/);
  });

  test("User avatar is displayed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const avatarEl = page.getByTestId("user-avatar");
    await expect(avatarEl).toBeVisible();
    // Alice has no avatar URL so initials fallback "AJ" is shown
    await expect(avatarEl).toContainText("AJ");
  });

  test("Back navigation to team page", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const backBtn = page.getByTestId("back-to-team");
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toContainText("Back to Team");
    await backBtn.click();
    await expect(page).toHaveURL(/\/users$/, { timeout: 30000 });
    await expect(page.getByTestId("users-list-page")).toBeVisible({
      timeout: 30000,
    });
  });
});

// ─── UserStats ───

test.describe("UserDetailPage - UserStats", () => {
  test("Active deals count is displayed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const statEl = page.getByTestId("user-stat-active-deals");
    await expect(statEl).toBeVisible();
    await expect(statEl).toContainText("Active Deals");
    await expect(
      statEl.locator(".user-detail-stat-value")
    ).toHaveText("2");
  });

  test("Open tasks count is displayed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const statEl = page.getByTestId("user-stat-open-tasks");
    await expect(statEl).toBeVisible();
    await expect(statEl).toContainText("Open Tasks");
    await expect(
      statEl.locator(".user-detail-stat-value")
    ).toHaveText("2");
  });

  test("Total deals count is displayed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const statEl = page.getByTestId("user-stat-total-deals");
    await expect(statEl).toBeVisible();
    await expect(statEl).toContainText("Total Deals");
    await expect(
      statEl.locator(".user-detail-stat-value")
    ).toHaveText("3");
  });

  test("Stats show zero when user has no deals or tasks", async ({
    page,
  }) => {
    await navigateToUser(page, "Irene Davis");
    await expect(
      page
        .getByTestId("user-stat-active-deals")
        .locator(".user-detail-stat-value")
    ).toHaveText("0");
    await expect(
      page
        .getByTestId("user-stat-open-tasks")
        .locator(".user-detail-stat-value")
    ).toHaveText("0");
    await expect(
      page
        .getByTestId("user-stat-total-deals")
        .locator(".user-detail-stat-value")
    ).toHaveText("0");
  });

  test("Stats reflect current data accurately", async ({ page }) => {
    const userId = await navigateToUser(page, "Alice Johnson");
    const userData = await getUserDetail(page, userId);

    await expect(
      page
        .getByTestId("user-stat-active-deals")
        .locator(".user-detail-stat-value")
    ).toHaveText(String(userData.activeDeals));
    await expect(
      page
        .getByTestId("user-stat-open-tasks")
        .locator(".user-detail-stat-value")
    ).toHaveText(String(userData.openTasks));
    await expect(
      page
        .getByTestId("user-stat-total-deals")
        .locator(".user-detail-stat-value")
    ).toHaveText(String(userData.totalDeals));
  });
});

// ─── OwnedDealsList ───

test.describe("UserDetailPage - OwnedDealsList", () => {
  test('Section displays "Owned Deals" heading', async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const section = page.getByTestId("owned-deals-list");
    await expect(section).toBeVisible();
    await expect(section.locator("h2")).toHaveText("Owned Deals");
  });

  test("Each deal entry displays the deal name", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const dealItem = page
      .getByTestId("owned-deal-item")
      .filter({ hasText: "Acme Enterprise License" });
    await expect(dealItem).toBeVisible();
    await expect(dealItem.getByTestId("deal-name")).toHaveText(
      "Acme Enterprise License"
    );
  });

  test("Each deal entry displays the deal stage", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const dealItem = page
      .getByTestId("owned-deal-item")
      .filter({ hasText: "Acme Enterprise License" });
    await expect(dealItem).toBeVisible();
    await expect(dealItem.getByTestId("deal-stage")).toHaveText(
      "Negotiation"
    );
  });

  test("Each deal entry displays the deal value", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const dealItem = page
      .getByTestId("owned-deal-item")
      .filter({ hasText: "Acme Enterprise License" });
    await expect(dealItem).toBeVisible();
    await expect(dealItem.getByTestId("deal-value")).toContainText(
      "$150,000"
    );
  });

  test("Each deal entry displays the associated client name", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    const dealItem = page
      .getByTestId("owned-deal-item")
      .filter({ hasText: "Acme Enterprise License" });
    await expect(dealItem).toBeVisible();
    await expect(dealItem.getByTestId("deal-client")).toHaveText(
      "Acme Corp"
    );
  });

  test("Multiple owned deals are listed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    // Alice owns 3 deals
    await expect(page.getByTestId("owned-deal-item")).toHaveCount(3);
    await expect(
      page
        .getByTestId("owned-deal-item")
        .filter({ hasText: "Acme Enterprise License" })
    ).toBeVisible();
    await expect(
      page
        .getByTestId("owned-deal-item")
        .filter({ hasText: "Acme Training Package" })
    ).toBeVisible();
    await expect(
      page
        .getByTestId("owned-deal-item")
        .filter({ hasText: "Global Solutions Consulting" })
    ).toBeVisible();
  });

  test("Clicking a deal navigates to deal detail page", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    const dealItem = page
      .getByTestId("owned-deal-item")
      .filter({ hasText: "Acme Enterprise License" });
    await expect(dealItem).toBeVisible();
    await dealItem.click();
    await expect(page).toHaveURL(/\/deals\/[a-f0-9-]+$/, {
      timeout: 30000,
    });
  });

  test("Empty state when user owns no deals", async ({ page }) => {
    await navigateToUser(page, "Grace Patel");
    await expect(page.getByTestId("owned-deals-empty")).toBeVisible();
    await expect(page.getByTestId("owned-deals-empty")).toContainText(
      "No owned deals"
    );
  });
});

// ─── AssignedTasksList ───

test.describe("UserDetailPage - AssignedTasksList", () => {
  test('Section displays "Assigned Tasks" heading', async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const section = page.getByTestId("assigned-tasks-list");
    await expect(section).toBeVisible();
    await expect(section.locator("h2")).toHaveText("Assigned Tasks");
  });

  test("Each task entry displays the task title", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const taskItem = page
      .getByTestId("assigned-task-item")
      .filter({ hasText: "Follow-up call with Sarah" });
    await expect(taskItem).toBeVisible();
    await expect(taskItem.getByTestId("task-title")).toHaveText(
      "Follow-up call with Sarah"
    );
  });

  test("Each task entry displays the task due date", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const taskItem = page
      .getByTestId("assigned-task-item")
      .filter({ hasText: "Follow-up call with Sarah" });
    await expect(taskItem).toBeVisible();
    // Due date "2025-03-01" formatted as "Due Mar 1, 2025"
    await expect(taskItem.getByTestId("task-due-date")).toContainText(
      "Mar 1, 2025"
    );
  });

  test("Each task entry displays the task priority", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const taskItem = page
      .getByTestId("assigned-task-item")
      .filter({ hasText: "Follow-up call with Sarah" });
    await expect(taskItem).toBeVisible();
    await expect(taskItem.getByTestId("task-priority")).toHaveText(
      "High"
    );
  });

  test("Each task entry displays the task status", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const taskItem = page
      .getByTestId("assigned-task-item")
      .filter({ hasText: "Follow-up call with Sarah" });
    await expect(taskItem).toBeVisible();
    await expect(taskItem.getByTestId("task-status")).toHaveText("Open");
  });

  test("Each task entry displays the associated client name", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    const taskItem = page
      .getByTestId("assigned-task-item")
      .filter({ hasText: "Follow-up call with Sarah" });
    await expect(taskItem).toBeVisible();
    await expect(taskItem.getByTestId("task-client")).toHaveText(
      "Acme Corp"
    );
  });

  test("Multiple assigned tasks are listed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    // Alice has 2 assigned tasks
    await expect(page.getByTestId("assigned-task-item")).toHaveCount(2);
    await expect(
      page
        .getByTestId("assigned-task-item")
        .filter({ hasText: "Follow-up call with Sarah" })
    ).toBeVisible();
    await expect(
      page
        .getByTestId("assigned-task-item")
        .filter({ hasText: "Quarterly review with Global Solutions" })
    ).toBeVisible();
  });

  test("Clicking a task navigates to task detail page", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    const taskItem = page
      .getByTestId("assigned-task-item")
      .filter({ hasText: "Follow-up call with Sarah" });
    await expect(taskItem).toBeVisible();
    await taskItem.click();
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+$/, {
      timeout: 30000,
    });
  });

  test("Empty state when user has no assigned tasks", async ({
    page,
  }) => {
    await navigateToUser(page, "Irene Davis");
    await expect(
      page.getByTestId("assigned-tasks-empty")
    ).toBeVisible();
    await expect(
      page.getByTestId("assigned-tasks-empty")
    ).toContainText("No assigned tasks");
  });
});

// ─── RecentActivityFeed ───

test.describe("UserDetailPage - RecentActivityFeed", () => {
  test('Section displays "Recent Activity" heading', async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    const section = page.getByTestId("recent-activity-feed");
    await expect(section).toBeVisible();
    await expect(section.locator("h2")).toHaveText("Recent Activity");
  });

  test("Activity entries are displayed in reverse chronological order", async ({
    page,
  }) => {
    const user = await getUserByName(page, "Alice Johnson");
    // Fetch activity from API — already sorted by created_at DESC
    const userData = await getUserDetail(page, user.id);
    const apiActivity = userData.activity;
    expect(apiActivity.length).toBeGreaterThanOrEqual(2);

    await page.goto(`/users/${user.id}`);
    await expect(page.getByTestId("user-header")).toBeVisible({
      timeout: 30000,
    });

    // Verify displayed order matches API order (most recent first)
    const firstDesc = page
      .getByTestId("activity-item")
      .first()
      .getByTestId("activity-description");
    const lastDesc = page
      .getByTestId("activity-item")
      .last()
      .getByTestId("activity-description");
    await expect(firstDesc).toHaveText(apiActivity[0].description);
    await expect(lastDesc).toHaveText(
      apiActivity[apiActivity.length - 1].description
    );
  });

  test("Each activity entry displays a timestamp", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    const firstItem = page.getByTestId("activity-item").first();
    await expect(firstItem).toBeVisible();
    const timestamp = firstItem.getByTestId("activity-timestamp");
    await expect(timestamp).toBeVisible();
    await expect(timestamp).not.toHaveText("");
  });

  test("Each activity entry displays a description of the action", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    const firstItem = page.getByTestId("activity-item").first();
    await expect(firstItem).toBeVisible();
    const description = firstItem.getByTestId("activity-description");
    await expect(description).toBeVisible();
    await expect(description).not.toHaveText("");
  });

  test("Activity entries include deal-related actions", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    // Alice has deal_created and deal_stage_changed events
    await expect(
      page
        .getByTestId("activity-description")
        .filter({ hasText: /[Dd]eal/ })
        .first()
    ).toBeVisible();
  });

  test("Activity entries include task-related actions", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    // Alice has task_created event
    await expect(
      page
        .getByTestId("activity-description")
        .filter({ hasText: /[Tt]ask/ })
        .first()
    ).toBeVisible();
  });

  test("Activity entries include client-related actions", async ({
    page,
  }) => {
    await navigateToUser(page, "Alice Johnson");
    // Alice has a client_note_added event
    await expect(
      page
        .getByTestId("activity-description")
        .filter({ hasText: /client/ })
        .first()
    ).toBeVisible();
  });

  test("Multiple activity entries are displayed", async ({ page }) => {
    await navigateToUser(page, "Alice Johnson");
    // Alice has many activity entries (timeline events + deal history)
    // Verify at least 5 entries exist by checking the 5th item is visible
    await expect(
      page.getByTestId("activity-item").nth(4)
    ).toBeVisible();
  });

  test("Empty state when user has no recent activity", async ({
    page,
  }) => {
    await navigateToUser(page, "Irene Davis");
    await expect(page.getByTestId("activity-empty")).toBeVisible();
    await expect(page.getByTestId("activity-empty")).toContainText(
      "No recent activity"
    );
  });
});
