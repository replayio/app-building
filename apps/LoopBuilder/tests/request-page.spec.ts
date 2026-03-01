import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** Mock the request endpoint to return an accepted result after an optional delay. */
function setupMockAccepted(appId = 'inventory-tracker-pro', delay = 0) {
  return async (page: import('@playwright/test').Page) => {
    await page.route('**/.netlify/functions/request', async (route) => {
      if (delay > 0) await new Promise((r) => setTimeout(r, delay))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: 'accepted', appId }),
      })
    })
  }
}

/** Mock the request endpoint to return a rejected result after an optional delay. */
function setupMockRejected(
  reason = 'The request contains specifications for handling personal information, which violates our policy. Please revise your request to comply with data privacy guidelines.',
  delay = 0,
) {
  return async (page: import('@playwright/test').Page) => {
    await page.route('**/.netlify/functions/request', async (route) => {
      if (delay > 0) await new Promise((r) => setTimeout(r, delay))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: 'rejected', rejectionReason: reason }),
      })
    })
  }
}

/** Mock the request endpoint to hang (never respond) so the UI stays on step 2. */
function setupMockHanging() {
  return async (page: import('@playwright/test').Page) => {
    await page.route('**/.netlify/functions/request', () => {
      // intentionally never fulfill — keeps UI on assessment screen
    })
  }
}

/** Mock apps endpoint for MainPage checks. */
function setupMockApps(apps: Array<Record<string, unknown>>) {
  return async (page: import('@playwright/test').Page) => {
    await page.route('**/.netlify/functions/apps', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apps),
      })
    })
  }
}

/** Fill and submit the describe-app form. */
async function fillAndSubmitForm(
  page: import('@playwright/test').Page,
  opts: { name?: string; description?: string; requirements?: string } = {},
) {
  const name = opts.name ?? 'Inventory Tracker Pro'
  const description =
    opts.description ??
    'A mobile-friendly app to manage warehouse stock, track shipments, and generate reports. Must integrate with existing ERP.'
  const requirements = opts.requirements ?? 'User authentication, barcode scanning, real-time data sync.'

  await page.getByTestId('app-name-input').fill(name)
  await page.getByTestId('app-description-input').fill(description)
  await page.getByTestId('app-requirements-input').fill(requirements)
  await page.getByTestId('describe-app-form-submit').click()
}

// ──────────────────────────────────────────────────────────────────────────────
// WizardStepper
// ──────────────────────────────────────────────────────────────────────────────

test.describe('WizardStepper', () => {
  test('WizardStepper: Displays three labeled steps', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('wizard-stepper')).toBeVisible({ timeout: 10000 })

    // Three steps are present with correct labels
    await expect(page.getByTestId('wizard-step-describe')).toBeVisible()
    await expect(page.getByTestId('wizard-step-describe')).toContainText('1. Describe App')

    await expect(page.getByTestId('wizard-step-assessment')).toBeVisible()
    await expect(page.getByTestId('wizard-step-assessment')).toContainText('2. Assessment')

    await expect(page.getByTestId('wizard-step-confirmation')).toBeVisible()
    await expect(page.getByTestId('wizard-step-confirmation')).toContainText('3. Confirmation')

    // Connectors between steps are visible
    await expect(page.getByTestId('wizard-connector-1')).toBeVisible()
    await expect(page.getByTestId('wizard-connector-2')).toBeVisible()
  })

  test('WizardStepper: Step 1 active on initial load', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('wizard-stepper')).toBeVisible({ timeout: 10000 })

    // Step 1 should be active (has active circle with number 1, not a checkmark)
    const step1Circle = page.getByTestId('wizard-step-describe').locator('.wizard-stepper__circle')
    await expect(step1Circle).toContainText('1')
    await expect(step1Circle).toHaveClass(/wizard-stepper__circle--active/)

    // Steps 2 and 3 should be upcoming (no active or completed class)
    const step2Circle = page.getByTestId('wizard-step-assessment').locator('.wizard-stepper__circle')
    await expect(step2Circle).toContainText('2')
    await expect(step2Circle).not.toHaveClass(/wizard-stepper__circle--active/)
    await expect(step2Circle).not.toHaveClass(/wizard-stepper__circle--completed/)

    const step3Circle = page.getByTestId('wizard-step-confirmation').locator('.wizard-stepper__circle')
    await expect(step3Circle).toContainText('3')
    await expect(step3Circle).not.toHaveClass(/wizard-stepper__circle--active/)
    await expect(step3Circle).not.toHaveClass(/wizard-stepper__circle--completed/)
  })

  test('WizardStepper: Step 1 completed and Step 2 active during assessment', async ({
    page,
  }) => {
    await setupMockHanging()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)

    // Wait for assessment screen
    await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })

    // Step 1 should show a checkmark (completed)
    const step1Circle = page.getByTestId('wizard-step-describe').locator('.wizard-stepper__circle')
    await expect(step1Circle).toContainText('✓')
    await expect(step1Circle).toHaveClass(/wizard-stepper__circle--completed/)

    // Step 2 should be active
    const step2Circle = page.getByTestId('wizard-step-assessment').locator('.wizard-stepper__circle')
    await expect(step2Circle).toContainText('2')
    await expect(step2Circle).toHaveClass(/wizard-stepper__circle--active/)

    // Step 3 should be upcoming
    const step3Circle = page.getByTestId('wizard-step-confirmation').locator('.wizard-stepper__circle')
    await expect(step3Circle).toContainText('3')
    await expect(step3Circle).not.toHaveClass(/wizard-stepper__circle--active/)
    await expect(step3Circle).not.toHaveClass(/wizard-stepper__circle--completed/)

    // Connector between 1 and 2 should be completed
    await expect(page.getByTestId('wizard-connector-1')).toHaveClass(
      /wizard-stepper__connector--completed/,
    )
  })

  test('WizardStepper: Steps 1 and 2 completed and Step 3 active on confirmation', async ({
    page,
  }) => {
    await setupMockAccepted()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)

    // Wait for confirmation screen
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    // Steps 1 and 2 should show checkmarks (completed)
    const step1Circle = page.getByTestId('wizard-step-describe').locator('.wizard-stepper__circle')
    await expect(step1Circle).toContainText('✓')
    await expect(step1Circle).toHaveClass(/wizard-stepper__circle--completed/)

    const step2Circle = page.getByTestId('wizard-step-assessment').locator('.wizard-stepper__circle')
    await expect(step2Circle).toContainText('✓')
    await expect(step2Circle).toHaveClass(/wizard-stepper__circle--completed/)

    // Step 3 should be active
    const step3Circle = page.getByTestId('wizard-step-confirmation').locator('.wizard-stepper__circle')
    await expect(step3Circle).toContainText('3')
    await expect(step3Circle).toHaveClass(/wizard-stepper__circle--active/)

    // Both connectors should be completed
    await expect(page.getByTestId('wizard-connector-1')).toHaveClass(
      /wizard-stepper__connector--completed/,
    )
    await expect(page.getByTestId('wizard-connector-2')).toHaveClass(
      /wizard-stepper__connector--completed/,
    )
  })

  test('WizardStepper: Steps are not clickable for navigation', async ({ page }) => {
    await setupMockHanging()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    // Submit the form to go to step 2
    await fillAndSubmitForm(page)
    await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })

    // Click on step 1 — should NOT navigate back
    await page.getByTestId('wizard-step-describe').click()

    // The form should NOT reappear; assessment screen should still be visible
    await expect(page.getByTestId('assessment-screen')).toBeVisible()
    await expect(page.getByTestId('describe-app-form')).not.toBeVisible()
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// DescribeAppForm
// ──────────────────────────────────────────────────────────────────────────────

test.describe('DescribeAppForm', () => {
  test('DescribeAppForm: Displays form fields on step 1', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    // Three input fields are visible
    await expect(page.getByTestId('app-name-input')).toBeVisible()
    await expect(page.getByTestId('app-description-input')).toBeVisible()
    await expect(page.getByTestId('app-requirements-input')).toBeVisible()

    // Labels are present
    await expect(page.locator('label[for="app-name"]')).toContainText('App Name')
    await expect(page.locator('label[for="app-description"]')).toContainText('Description')
    await expect(page.locator('label[for="app-requirements"]')).toContainText('Requirements')
  })

  test('DescribeAppForm: User can type into App Name field', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('app-name-input').fill('Inventory Tracker Pro')
    await expect(page.getByTestId('app-name-input')).toHaveValue('Inventory Tracker Pro')
  })

  test('DescribeAppForm: User can type into Description field', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    const description =
      'A mobile-friendly app to manage warehouse stock, track shipments, and generate reports. Must integrate with existing ERP.'
    await page.getByTestId('app-description-input').fill(description)
    await expect(page.getByTestId('app-description-input')).toHaveValue(description)
  })

  test('DescribeAppForm: User can type into Requirements field', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    const requirements = 'User authentication, barcode scanning, real-time data sync.'
    await page.getByTestId('app-requirements-input').fill(requirements)
    await expect(page.getByTestId('app-requirements-input')).toHaveValue(requirements)
  })

  test('DescribeAppForm: Submit button visible and labeled', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    const submitBtn = page.getByTestId('describe-app-form-submit')
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toContainText('Submit Request')
  })

  test('DescribeAppForm: Validation requires App Name', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    // Fill description but leave App Name empty
    await page.getByTestId('app-description-input').fill('A useful app for tracking.')

    // Click the submit button
    const submitBtn = page.getByTestId('describe-app-form-submit')
    await submitBtn.click()

    // Should NOT advance to step 2
    await expect(page.getByTestId('describe-app-form')).toBeVisible()
    await expect(page.getByTestId('assessment-screen')).not.toBeVisible()

    // A validation error message is displayed near the App Name field
    await expect(page.getByTestId('app-name-error')).toBeVisible()
    await expect(page.getByTestId('app-name-error')).toContainText('required')
  })

  test('DescribeAppForm: Validation requires Description', async ({ page }) => {
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    // Fill App Name but leave Description empty
    await page.getByTestId('app-name-input').fill('Inventory Tracker Pro')

    // Click the submit button
    const submitBtn = page.getByTestId('describe-app-form-submit')
    await submitBtn.click()

    // Should NOT advance to step 2
    await expect(page.getByTestId('describe-app-form')).toBeVisible()
    await expect(page.getByTestId('assessment-screen')).not.toBeVisible()

    // A validation error message is displayed near the Description field
    await expect(page.getByTestId('app-description-error')).toBeVisible()
    await expect(page.getByTestId('app-description-error')).toContainText('required')
  })

  test('DescribeAppForm: Successful submission advances to Assessment step', async ({ page }) => {
    await setupMockHanging()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)

    // The wizard should advance to step 2 (Assessment)
    await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })

    // The form should no longer be visible
    await expect(page.getByTestId('describe-app-form')).not.toBeVisible()

    // WizardStepper should show step 1 completed, step 2 active
    const step1Circle = page.getByTestId('wizard-step-describe').locator('.wizard-stepper__circle')
    await expect(step1Circle).toContainText('✓')

    const step2Circle = page.getByTestId('wizard-step-assessment').locator('.wizard-stepper__circle')
    await expect(step2Circle).toHaveClass(/wizard-stepper__circle--active/)
  })

  test('DescribeAppForm: Submitted data persists in request summary during assessment', async ({
    page,
  }) => {
    await setupMockHanging()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page, {
      name: 'Inventory Tracker Pro',
      description:
        'A mobile-friendly app to manage warehouse stock, track shipments, and generate reports. Must integrate with existing ERP.',
      requirements: 'User authentication, barcode scanning, real-time data sync.',
    })

    // Wait for assessment screen
    await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })

    // Request summary should show submitted values
    await expect(page.getByTestId('assessment-summary')).toBeVisible()
    await expect(page.getByTestId('assessment-summary')).toContainText('Request Summary')

    await expect(page.getByTestId('assessment-summary-name')).toContainText(
      'Inventory Tracker Pro',
    )
    await expect(page.getByTestId('assessment-summary-description')).toContainText(
      'A mobile-friendly app to manage warehouse stock',
    )
    await expect(page.getByTestId('assessment-summary-requirements')).toContainText(
      'User authentication, barcode scanning, real-time data sync.',
    )
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// AssessmentScreen
// ──────────────────────────────────────────────────────────────────────────────

test.describe('AssessmentScreen', () => {
  test('AssessmentScreen: Displays loading state during assessment', async ({ page }) => {
    await setupMockHanging()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })

    // Progress section with heading text
    const progress = page.getByTestId('assessment-progress')
    await expect(progress).toBeVisible()
    await expect(progress).toContainText('Assessing Request against Policy & Technical Criteria')

    // Spinner visible
    await expect(page.getByTestId('assessment-spinner')).toBeVisible()

    // Waiting message
    await expect(progress).toContainText(
      'Please wait while we review your request. This typically takes a few moments.',
    )
  })

  test('AssessmentScreen: Request summary visible alongside assessment', async ({ page }) => {
    await setupMockHanging()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page, {
      name: 'Inventory Tracker Pro',
      description: 'A mobile-friendly app to manage warehouse stock.',
      requirements: 'User authentication, barcode scanning.',
    })

    await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })

    // Summary panel is visible on the screen
    await expect(page.getByTestId('assessment-summary')).toBeVisible()
    await expect(page.getByTestId('assessment-summary-name')).toContainText(
      'Inventory Tracker Pro',
    )
    await expect(page.getByTestId('assessment-summary-description')).toContainText(
      'A mobile-friendly app to manage warehouse stock.',
    )
    await expect(page.getByTestId('assessment-summary-requirements')).toContainText(
      'User authentication, barcode scanning.',
    )

    // Progress section is also visible at the same time
    await expect(page.getByTestId('assessment-progress')).toBeVisible()
  })

  test('AssessmentScreen: Progress bar animates during assessment', async ({ page }) => {
    await setupMockHanging()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('assessment-screen')).toBeVisible({ timeout: 15000 })

    // Progress bar track and fill are present
    const progressBar = page.getByTestId('assessment-progress')
    await expect(progressBar).toBeVisible()
    await expect(progressBar.locator('.assessment-screen__progress-bar-fill')).toBeVisible()
  })

  test('AssessmentScreen: Transitions to rejection on policy failure', async ({ page }) => {
    const rejectionReason =
      'The request contains specifications for handling personal information, which violates our policy. Please revise your request to comply with data privacy guidelines.'
    await setupMockRejected(rejectionReason)(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)

    // Should transition to rejection result
    await expect(page.getByTestId('rejection-result')).toBeVisible({ timeout: 15000 })

    // Assessment screen should no longer be visible
    await expect(page.getByTestId('assessment-screen')).not.toBeVisible()

    // Stepper should show steps 1 and 2 completed, step 3 active
    const step3Circle = page
      .getByTestId('wizard-step-confirmation')
      .locator('.wizard-stepper__circle')
    await expect(step3Circle).toHaveClass(/wizard-stepper__circle--active/)
  })

  test('AssessmentScreen: Transitions to acceptance on policy pass', async ({ page }) => {
    await setupMockAccepted()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)

    // Should transition to acceptance result
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    // Assessment screen should no longer be visible
    await expect(page.getByTestId('assessment-screen')).not.toBeVisible()

    // Stepper should show steps 1 and 2 completed, step 3 active
    const step3Circle = page
      .getByTestId('wizard-step-confirmation')
      .locator('.wizard-stepper__circle')
    await expect(step3Circle).toHaveClass(/wizard-stepper__circle--active/)
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// RejectionResult
// ──────────────────────────────────────────────────────────────────────────────

test.describe('RejectionResult', () => {
  const rejectionReason =
    'The request contains specifications for handling personal information, which violates our policy. Please revise your request to comply with data privacy guidelines.'

  test('RejectionResult: Displays rejection heading with warning icon', async ({ page }) => {
    await setupMockRejected(rejectionReason)(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('rejection-result')).toBeVisible({ timeout: 15000 })

    // Warning icon is visible
    await expect(page.getByTestId('rejection-result')).toContainText('⚠️')

    // "Request Rejected" heading
    await expect(page.getByTestId('rejection-result')).toContainText('Request Rejected')
  })

  test('RejectionResult: Displays rejection context message', async ({ page }) => {
    await setupMockRejected(rejectionReason)(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page, { name: 'Inventory Tracker Pro' })
    await expect(page.getByTestId('rejection-result')).toBeVisible({ timeout: 15000 })

    // Message contains the app name
    await expect(page.getByTestId('rejection-result')).toContainText(
      "Your request for 'Inventory Tracker Pro' cannot be processed at this time.",
    )
  })

  test('RejectionResult: Displays reason for rejection box', async ({ page }) => {
    await setupMockRejected(rejectionReason)(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('rejection-result')).toBeVisible({ timeout: 15000 })

    // Reason box is visible
    const reasonBox = page.getByTestId('rejection-reason-box')
    await expect(reasonBox).toBeVisible()

    // Heading in the reason box
    await expect(reasonBox).toContainText('Reason for Rejection')

    // "Policy Violation:" label and the specific reason
    await expect(reasonBox).toContainText('Policy Violation:')
    await expect(reasonBox).toContainText(rejectionReason)
  })

  test('RejectionResult: Edit Request button visible and styled', async ({ page }) => {
    await setupMockRejected(rejectionReason)(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('rejection-result')).toBeVisible({ timeout: 15000 })

    const editBtn = page.getByTestId('edit-request-btn')
    await expect(editBtn).toBeVisible()
    await expect(editBtn).toContainText('Edit Request')
  })

  test('RejectionResult: Edit Request button navigates back to step 1', async ({ page }) => {
    await setupMockRejected(rejectionReason)(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page, {
      name: 'Inventory Tracker Pro',
      description:
        'A mobile-friendly app to manage warehouse stock, track shipments, and generate reports.',
      requirements: 'User authentication, barcode scanning.',
    })
    await expect(page.getByTestId('rejection-result')).toBeVisible({ timeout: 15000 })

    // Click "Edit Request"
    await page.getByTestId('edit-request-btn').click()

    // Should go back to step 1 with the form visible
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('rejection-result')).not.toBeVisible()

    // WizardStepper should show step 1 as active
    const step1Circle = page.getByTestId('wizard-step-describe').locator('.wizard-stepper__circle')
    await expect(step1Circle).toHaveClass(/wizard-stepper__circle--active/)

    // Previously submitted values should be pre-filled
    await expect(page.getByTestId('app-name-input')).toHaveValue('Inventory Tracker Pro')
    await expect(page.getByTestId('app-description-input')).toHaveValue(
      'A mobile-friendly app to manage warehouse stock, track shipments, and generate reports.',
    )
    await expect(page.getByTestId('app-requirements-input')).toHaveValue(
      'User authentication, barcode scanning.',
    )
  })
})

// ──────────────────────────────────────────────────────────────────────────────
// AcceptanceResult
// ──────────────────────────────────────────────────────────────────────────────

test.describe('AcceptanceResult', () => {
  test('AcceptanceResult: Displays success heading with checkmark icon', async ({ page }) => {
    await setupMockAccepted()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    // Green checkmark icon
    await expect(page.getByTestId('acceptance-result')).toContainText('✅')

    // "App Queued for Building!" heading
    await expect(page.getByTestId('acceptance-result')).toContainText('App Queued for Building!')
  })

  test('AcceptanceResult: Displays success context message', async ({ page }) => {
    await setupMockAccepted()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page, { name: 'Inventory Tracker Pro' })
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    // Success message contains the app name
    await expect(page.getByTestId('acceptance-result')).toContainText(
      "Your request for 'Inventory Tracker Pro' has been accepted and is now queued for autonomous building.",
    )
  })

  test('AcceptanceResult: Displays Next Steps section', async ({ page }) => {
    await setupMockAccepted()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    const nextSteps = page.getByTestId('acceptance-next-steps')
    await expect(nextSteps).toBeVisible()
    await expect(nextSteps).toContainText('Next Steps')
    await expect(nextSteps).toContainText(
      'Your app is being generated. You can monitor its progress on the AppPage.',
    )
  })

  test('AcceptanceResult: Go to AppPage button visible and styled', async ({ page }) => {
    await setupMockAccepted('inventory-tracker-pro')(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    const goBtn = page.getByTestId('go-to-app-btn')
    await expect(goBtn).toBeVisible()
    await expect(goBtn).toContainText('Go to AppPage to Monitor Progress')
  })

  test('AcceptanceResult: Go to AppPage button navigates to new app AppPage', async ({ page }) => {
    await setupMockAccepted('inventory-tracker-pro')(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('go-to-app-btn').click()
    await expect(page).toHaveURL(/\/apps\/inventory-tracker-pro/, { timeout: 10000 })
  })

  test('AcceptanceResult: View all My Apps link visible', async ({ page }) => {
    await setupMockAccepted()(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    const viewAllLink = page.getByTestId('view-all-apps-link')
    await expect(viewAllLink).toBeVisible()
    await expect(viewAllLink).toContainText('View all My Apps')
  })

  test('AcceptanceResult: View all My Apps link navigates to MainPage', async ({ page }) => {
    await setupMockAccepted()(page)
    await setupMockApps([])(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page)
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('view-all-apps-link').click()
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('AcceptanceResult: Accepted app appears in MainPage Queued tab', async ({ page }) => {
    await setupMockAccepted('inventory-tracker-pro')(page)
    // Mock apps endpoint to include the newly queued app
    await setupMockApps([
      {
        id: 'inventory-tracker-pro',
        name: 'Inventory Tracker Pro',
        description:
          'A mobile-friendly app to manage warehouse stock, track shipments, and generate reports. Must integrate with existing ERP.',
        status: 'queued',
        progress: 0,
        created_at: '2026-03-01T00:00:00Z',
        model: null,
        deployment_url: null,
        source_url: null,
      },
    ])(page)
    await page.goto('/request')
    await expect(page.getByTestId('describe-app-form')).toBeVisible({ timeout: 10000 })

    await fillAndSubmitForm(page, { name: 'Inventory Tracker Pro' })
    await expect(page.getByTestId('acceptance-result')).toBeVisible({ timeout: 15000 })

    // Navigate to MainPage
    await page.getByTestId('view-all-apps-link').click()
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Click Queued tab
    await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('status-filter-tab-queued').click()

    // The app should appear in the Queued tab
    const appCard = page.getByTestId('app-card').filter({ hasText: 'Inventory Tracker Pro' })
    await expect(appCard).toBeVisible({ timeout: 10000 })
  })
})
