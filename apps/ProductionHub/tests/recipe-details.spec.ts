import { test, expect } from "@playwright/test";

// --- Shared state populated in beforeAll ---
let fullRecipe: {
  id: string;
  name: string;
  description: string;
  product: string;
  version: string;
  status: string;
  materials: Array<{
    id: string;
    material_name: string;
    quantity: number;
    unit: string;
  }>;
  products: Array<{
    id: string;
    product_name: string;
    amount: string;
  }>;
  equipment: Array<{
    id: string;
    equipment_id: string;
    equipment_name: string;
  }>;
};
let editRecipeId: string;
let emptyRecipeId: string;

test.beforeAll(async ({ request }) => {
  // Fetch all recipes
  const recipesRes = await request.get("/.netlify/functions/recipes");
  const recipes = await recipesRes.json();

  // Find a recipe with materials, products, equipment, and a description
  for (const r of recipes) {
    const detailRes = await request.get(`/.netlify/functions/recipes/${r.id}`);
    const detail = await detailRes.json();
    if (
      detail.materials?.length > 0 &&
      detail.products?.length > 0 &&
      detail.equipment?.length > 0 &&
      detail.description
    ) {
      fullRecipe = detail;
      break;
    }
  }

  if (!fullRecipe)
    throw new Error("No recipe with full data found in database");

  // Create a recipe specifically for the edit test
  const editRes = await request.post("/.netlify/functions/recipes", {
    data: {
      name: "Edit Test Recipe",
      product: "Test Product",
      version: "1.0",
      status: "Draft",
      description: "Test description for edit",
    },
  });
  const editRecipe = await editRes.json();
  editRecipeId = editRecipe.id;

  // Create a recipe with no description for empty state tests
  const emptyRes = await request.post("/.netlify/functions/recipes", {
    data: {
      name: "Empty State Test Recipe",
      product: "",
      version: "1.0",
      status: "Draft",
      description: "",
    },
  });
  const emptyRecipe = await emptyRes.json();
  emptyRecipeId = emptyRecipe.id;
});

test.afterAll(async ({ request }) => {
  if (editRecipeId) {
    await request.delete(`/.netlify/functions/recipes/${editRecipeId}`);
  }
  if (emptyRecipeId) {
    await request.delete(`/.netlify/functions/recipes/${emptyRecipeId}`);
  }
});

test.describe("RecipeDetailHeader", () => {
  test("RD-HDR-1: Breadcrumb displays Recipes > recipe name with ID", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("recipe-detail-header")).toBeVisible({
      timeout: 30000,
    });

    const breadcrumb = page.getByTestId("breadcrumb");
    await expect(breadcrumb).toBeVisible();

    // "Recipes" link is displayed
    await expect(breadcrumb.locator("a")).toContainText("Recipes");

    // ">" separator is displayed
    await expect(breadcrumb.locator(".breadcrumb-separator")).toHaveText(">");

    // Current breadcrumb item shows recipe name with ID
    const expectedTitle = `${fullRecipe.name} (${fullRecipe.id})`;
    await expect(breadcrumb.locator(".breadcrumb-current")).toHaveText(
      expectedTitle
    );
  });

  test("RD-HDR-2: Breadcrumb Recipes link navigates to RecipesPage", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("recipe-detail-header")).toBeVisible({
      timeout: 30000,
    });

    // Click "Recipes" link in breadcrumb
    await page.getByTestId("breadcrumb").locator("a").click();

    // Verify navigation to /recipes
    await expect(page).toHaveURL(/\/recipes/, { timeout: 30000 });
  });

  test("RD-HDR-3: Page title displays recipe name with ID", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("recipe-detail-header")).toBeVisible({
      timeout: 30000,
    });

    const expectedTitle = `${fullRecipe.name} (${fullRecipe.id})`;
    await expect(page.getByTestId("recipe-detail-title")).toHaveText(
      expectedTitle
    );
  });

  test("RD-HDR-4: Edit Recipe button is displayed", async ({ page }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("recipe-detail-header")).toBeVisible({
      timeout: 30000,
    });

    const editBtn = page.getByTestId("edit-recipe-btn");
    await expect(editBtn).toBeVisible();
    await expect(editBtn).toHaveText("Edit Recipe");
  });

  test("RD-HDR-5: Edit Recipe button opens an edit form for the recipe", async ({
    page,
  }) => {
    test.slow();
    await page.goto(`/recipe/${editRecipeId}`);
    await expect(page.getByTestId("recipe-detail-header")).toBeVisible({
      timeout: 30000,
    });

    // Click Edit Recipe button
    await page.getByTestId("edit-recipe-btn").click();

    // Modal appears with pre-filled fields
    await expect(page.getByTestId("edit-recipe-modal")).toBeVisible();
    await expect(page.getByTestId("edit-recipe-name")).toHaveValue(
      "Edit Test Recipe"
    );
    await expect(page.getByTestId("edit-recipe-description")).toHaveValue(
      "Test description for edit"
    );

    // Change recipe name
    await page.getByTestId("edit-recipe-name").clear();
    await page.getByTestId("edit-recipe-name").fill("Edit Test Recipe v2");

    // Save changes
    await page.getByTestId("edit-recipe-save").click();
    await expect(page.getByTestId("edit-recipe-modal")).toBeHidden({
      timeout: 30000,
    });

    // Verify page title updates
    const newTitle = `Edit Test Recipe v2 (${editRecipeId})`;
    await expect(page.getByTestId("recipe-detail-title")).toHaveText(newTitle, {
      timeout: 15000,
    });

    // Verify breadcrumb updates
    await expect(
      page.getByTestId("breadcrumb").locator(".breadcrumb-current")
    ).toHaveText(newTitle);

    // Verify persistence: navigate away and return
    await page.goto("/recipes");
    await expect(page).toHaveURL(/\/recipes/);
    await page.goto(`/recipe/${editRecipeId}`);
    await expect(page.getByTestId("recipe-detail-title")).toHaveText(newTitle, {
      timeout: 30000,
    });
  });
  test("RD-HDR-6: Cancelling Edit Recipe modal does not save changes", async ({
    page,
  }) => {
    await page.goto(`/recipe/${editRecipeId}`);
    await expect(page.getByTestId("recipe-detail-header")).toBeVisible({
      timeout: 30000,
    });

    // Store the original title
    const originalTitle = await page.getByTestId("recipe-detail-title").textContent();

    // Click Edit Recipe button
    await page.getByTestId("edit-recipe-btn").click();

    // Modal appears
    await expect(page.getByTestId("edit-recipe-modal")).toBeVisible();

    // Change the recipe name
    await page.getByTestId("edit-recipe-name").clear();
    await page.getByTestId("edit-recipe-name").fill("Changed Name");

    // Click Cancel button
    await page.getByTestId("edit-recipe-detail-cancel-btn").click();

    // Modal closes
    await expect(page.getByTestId("edit-recipe-modal")).toBeHidden();

    // Page title still displays the original recipe name
    await expect(page.getByTestId("recipe-detail-title")).toHaveText(originalTitle!);
  });
});

test.describe("DescriptionCard", () => {
  test("RD-DESC-1: Description card heading is displayed", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("description-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(
      page.getByTestId("description-card").locator(".section-card-title")
    ).toHaveText("Description");
  });

  test("RD-DESC-2: Recipe description text is displayed", async ({ page }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("description-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("description-text")).toBeVisible();
    await expect(page.getByTestId("description-text")).toHaveText(
      fullRecipe.description
    );
  });

  test("RD-DESC-3: Empty description shows placeholder", async ({ page }) => {
    await page.goto(`/recipe/${emptyRecipeId}`);
    await expect(page.getByTestId("description-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("description-empty")).toBeVisible();
    await expect(page.getByTestId("description-empty")).toContainText(
      "No description available"
    );
  });
});

test.describe("ProductsOutputTable", () => {
  test("RD-PROD-1: Products (Output) card heading is displayed", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("products-output-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(
      page.getByTestId("products-output-card").locator(".section-card-title")
    ).toHaveText("Products (Output)");
  });

  test("RD-PROD-2: Table displays Product Name and Amount column headers", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("products-table")).toBeVisible({
      timeout: 30000,
    });

    const headers = page.getByTestId("products-table").locator("thead th");
    await expect(headers.nth(0)).toHaveText("Product Name");
    await expect(headers.nth(1)).toHaveText("Amount");
  });

  test("RD-PROD-3: Table rows display product output data", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("products-table")).toBeVisible({
      timeout: 30000,
    });

    // Verify each product from the recipe is displayed
    for (const product of fullRecipe.products) {
      const row = page
        .getByTestId("products-table")
        .locator("tr")
        .filter({ hasText: product.product_name });
      await expect(row).toBeVisible();
      await expect(row.getByTestId("product-name")).toHaveText(
        product.product_name
      );
      await expect(row.getByTestId("product-amount")).toHaveText(
        product.amount
      );
    }
  });

  test("RD-PROD-4: Empty products table shows placeholder", async ({
    page,
  }) => {
    await page.goto(`/recipe/${emptyRecipeId}`);
    await expect(page.getByTestId("products-output-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("products-empty")).toBeVisible();
    await expect(page.getByTestId("products-empty")).toContainText(
      "No products defined"
    );
  });
});

test.describe("RawMaterialsCard", () => {
  test("RD-MAT-1: Raw Materials (per batch) card heading is displayed", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("raw-materials-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(
      page.getByTestId("raw-materials-card").locator(".section-card-title")
    ).toHaveText("Raw Materials (per batch)");
  });

  test("RD-MAT-2: Table displays Material Name and Amount column headers", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("materials-table")).toBeVisible({
      timeout: 30000,
    });

    const headers = page.getByTestId("materials-table").locator("thead th");
    await expect(headers.nth(0)).toHaveText("Material Name");
    await expect(headers.nth(1)).toHaveText("Amount");
  });

  test("RD-MAT-3: Table rows display raw material data", async ({ page }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("materials-table")).toBeVisible({
      timeout: 30000,
    });

    // Verify each material from the recipe is displayed
    for (const material of fullRecipe.materials) {
      const row = page
        .getByTestId("materials-table")
        .locator("tr")
        .filter({ hasText: material.material_name });
      await expect(row).toBeVisible();
      await expect(row.getByTestId("material-name")).toHaveText(
        material.material_name
      );
      await expect(row.getByTestId("material-amount")).toHaveText(
        `${material.quantity} ${material.unit}`
      );
    }
  });

  test("RD-MAT-4: Empty materials table shows placeholder", async ({
    page,
  }) => {
    await page.goto(`/recipe/${emptyRecipeId}`);
    await expect(page.getByTestId("raw-materials-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("materials-empty")).toBeVisible();
    await expect(page.getByTestId("materials-empty")).toContainText(
      "No raw materials defined"
    );
  });
});

test.describe("EquipmentRequiredList", () => {
  test("RD-EQUIP-1: Equipment Required card heading is displayed", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("equipment-required-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(
      page
        .getByTestId("equipment-required-card")
        .locator(".section-card-title")
    ).toHaveText("Equipment Required");
  });

  test("RD-EQUIP-2: Equipment items are displayed with link icons, names, and IDs", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("equipment-required-card")).toBeVisible({
      timeout: 30000,
    });

    const list = page.getByTestId("equipment-required-list");
    await expect(list).toBeVisible();

    // Verify the correct number of equipment items
    await expect(list.getByTestId("equipment-required-item")).toHaveCount(
      fullRecipe.equipment.length
    );

    // Verify each equipment item shows a link icon, name as clickable link, and ID in parentheses
    for (const equip of fullRecipe.equipment) {
      const item = list
        .getByTestId("equipment-required-item")
        .filter({ hasText: equip.equipment_name });
      await expect(item).toBeVisible();

      // Link icon (svg) is present
      await expect(item.locator("svg")).toBeVisible();

      // Name is a clickable link
      await expect(item.getByTestId("equipment-link")).toHaveText(
        equip.equipment_name
      );

      // ID is displayed in parentheses
      await expect(item).toContainText(`(${equip.equipment_id})`);
    }
  });

  test("RD-EQUIP-3: Clicking an equipment link navigates to the EquipmentDetailsPage", async ({
    page,
  }) => {
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("equipment-required-card")).toBeVisible({
      timeout: 30000,
    });

    const firstEquip = fullRecipe.equipment[0];

    // Click the first equipment link
    await page
      .getByTestId("equipment-required-list")
      .getByTestId("equipment-required-item")
      .filter({ hasText: firstEquip.equipment_name })
      .getByTestId("equipment-link")
      .click();

    // Verify navigation to equipment details page
    await expect(page).toHaveURL(
      new RegExp(`/equipment/${firstEquip.equipment_id}`),
      { timeout: 30000 }
    );
  });

  test("RD-EQUIP-4: Each equipment link navigates to its respective details page", async ({
    page,
  }) => {
    test.slow();
    await page.goto(`/recipe/${fullRecipe.id}`);
    await expect(page.getByTestId("equipment-required-card")).toBeVisible({
      timeout: 30000,
    });

    // Click the first equipment link
    const firstEquip = fullRecipe.equipment[0];
    await page
      .getByTestId("equipment-required-list")
      .getByTestId("equipment-required-item")
      .filter({ hasText: firstEquip.equipment_name })
      .getByTestId("equipment-link")
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/equipment/${firstEquip.equipment_id}`),
      { timeout: 30000 }
    );

    // Navigate back to recipe details page
    await page.goBack();
    await expect(page.getByTestId("equipment-required-card")).toBeVisible({
      timeout: 30000,
    });

    // Click a different equipment link
    if (fullRecipe.equipment.length > 1) {
      const secondEquip = fullRecipe.equipment[1];
      await page
        .getByTestId("equipment-required-list")
        .getByTestId("equipment-required-item")
        .filter({ hasText: secondEquip.equipment_name })
        .getByTestId("equipment-link")
        .click();
      await expect(page).toHaveURL(
        new RegExp(`/equipment/${secondEquip.equipment_id}`),
        { timeout: 30000 }
      );
    }
  });

  test("RD-EQUIP-5: Empty equipment list shows placeholder", async ({
    page,
  }) => {
    await page.goto(`/recipe/${emptyRecipeId}`);
    await expect(page.getByTestId("equipment-required-card")).toBeVisible({
      timeout: 30000,
    });

    await expect(page.getByTestId("equipment-required-empty")).toBeVisible();
    await expect(page.getByTestId("equipment-required-empty")).toContainText(
      "No equipment required"
    );
  });
});
