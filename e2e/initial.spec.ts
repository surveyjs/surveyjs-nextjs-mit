import { test, expect } from "@playwright/test";

const surveyRoutes = ["/claims", "/checkout", "/embedded"];
const allRoutes = [
  "/",
  ...surveyRoutes,
  "/records",
  "/claims/configure",
  "/checkout/configure",
  "/records/configure",
];

test("root redirects to the first survey", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/claims$/);
  await expect(page).toHaveTitle(/SurveyJS/i);
});

for (const route of surveyRoutes) {
  test(`${route} is rendered on the server`, async ({ page }) => {
    // Read the raw document — the survey markup must be in the HTML the
    // server sent, before any JavaScript runs.
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    expect(await response!.text()).toContain("sd-root-modern");
    await expect(page.locator(".sd-root-modern").first()).toBeVisible();
  });
}

test("/embedded moves the same survey between placements", async ({ page }) => {
  await page.goto("/embedded");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });

  // Inline: the survey is a section of the host page.
  await expect(page.locator("#feedback .sd-root-modern")).toBeVisible();

  await dock.getByRole("button", { name: "Floating widget" }).click();
  await expect(page.locator("#feedback .sd-root-modern")).toHaveCount(0);
  await expect(page.locator(".sd-root-modern").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close the feedback widget" }).first(),
  ).toBeVisible();

  // The toolbar has to stay usable over an open overlay — that is what
  // `modal={false}` plus the outside-interaction guard buy.
  await dock.getByRole("button", { name: "Modal dialog" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await dock.getByRole("button", { name: "Inline section" }).click();
  await expect(page.locator("#feedback .sd-root-modern")).toBeVisible();
});

test("/embedded derives a plan, a price and a module list from the answers", async ({
  page,
}) => {
  await page.goto("/embedded");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });

  await dock.getByRole("button", { name: "Prefill" }).click();

  // Prefill remounts the model and every Next re-renders the card, so each step
  // waits for the page it landed on instead of clicking blind, and the button is
  // re-resolved inside the card each time rather than held across a re-render.
  // Assertions read the card's text: these are sentences with inline markup.
  const card = page.locator("#feedback");
  const clickNext = () => card.getByRole("button", { name: "Next" }).click();

  await expect(card).toContainText("How do you plan today?");
  await clickNext();
  await expect(card).toContainText("What should it talk to on day one?");
  await clickNext();

  // 15 seats with two must-have modules lands on Business at $19 a seat, so the
  // whole calculatedValues chain is under test, not just one expression.
  await expect(card).toContainText("Your estimate so far");
  await expect(card).toContainText("$285.00");

  await clickNext();
  await expect(card).toContainText("start you on the Business plan");
  await expect(card).toContainText("Capacity — workload warnings");
  await expect(card).toContainText("Portfolio — rollups across every project");
  // Insights was only "nice to have", so its line stays hidden.
  await expect(card).not.toContainText("Insights — cycle time");

  // The embedding does not care which definition it holds.
  await dock.getByRole("button", { name: "Survey definition" }).click();
  await page.getByRole("menuitem", { name: /Satisfaction survey/ }).click();
  await expect(card).toContainText("How are we doing?");
});

test("/records renders the table and the SurveyJS editor", async ({ page }) => {
  await page.goto("/records");
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).first().click();
  await expect(page.locator(".sd-root-modern").first()).toBeVisible();
});

test("an edited JSON is kept in the browser and survives a reload", async ({
  page,
}) => {
  // Three full page loads plus a heavy dynamic import; against `next dev`, where
  // each route compiles on first request, the default budget is too tight.
  test.slow();

  // The saved definition is applied after hydration, so this is exactly where a
  // mismatch would show up.
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      errors.push(message.text());
    }
  });

  await page.goto("/claims/configure");
  // Monaco is a heavy dynamic import; under parallel workers it needs longer
  // than the default expect timeout.
  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 30_000,
  });

  // Replace the whole document with a minimal survey, then save.
  await page.evaluate((source) => {
    const monaco = (window as unknown as { monaco: typeof import("monaco-editor") })
      .monaco;
    monaco.editor.getModels()[0].setValue(source);
  }, JSON.stringify({
    title: "Edited by the e2e test",
    elements: [{ type: "text", name: "q1", title: "A brand new question" }],
  }, null, 2));

  // The live preview picking up the edit proves the page is hydrated and the
  // editor state has propagated — without this the Save click can land on a
  // button that has no handler attached yet.
  await expect(page.getByText("A brand new question").first()).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("button", { name: /Save and quit/ }).click();
  await expect(page).toHaveURL(/\/claims$/);
  await expect(page.getByText("A brand new question")).toBeVisible();

  // The definition lives in localStorage, so a full reload keeps it — while the
  // HTML the server sent stays canonical (see the SEO assertion below).
  const response = await page.reload();
  const serverHtml = await response!.text();
  expect(serverHtml).not.toContain("A brand new question");
  expect(serverHtml).toContain("Patient Intake");
  await expect(page.getByText("A brand new question")).toBeVisible();

  await page.goto("/claims/configure");
  // Reset is disabled in the server markup and only enables once the saved
  // definition has been read, which happens after hydration.
  await expect(page.locator(".monaco-editor").first()).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "Reset" }).click();
  await page.goto("/claims");
  await expect(page.getByText("A brand new question")).toHaveCount(0);
  await expect(page.getByText("Patient Intake").first()).toBeVisible();

  expect(errors).toHaveLength(0);
});

test("the spinner shows only for a visitor with a saved definition", async ({
  page,
}) => {
  await page.goto("/claims");
  // Nothing saved: the server markup stays put, no loading state at all.
  await expect(page.locator('[role="status"]')).toHaveCount(0);

  await page.evaluate(() => {
    localStorage.setItem(
      "sjs-demo-schema:medical-form",
      JSON.stringify({
        title: "Saved by the e2e test",
        elements: [{ type: "text", name: "q1", title: "A saved question" }],
      }),
    );
  });

  // Swapping in the saved definition is deferred past a paint on purpose, so
  // the spinner is genuinely drawn rather than collapsed into one frame.
  await page.reload();
  await expect(page.locator('[role="status"]')).toBeVisible();
  await expect(page.getByText("A saved question")).toBeVisible();
  await expect(page.locator('[role="status"]')).toHaveCount(0);
});

for (const route of allRoutes) {
  test(`no SSR failure or hydration mismatch on ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });
    // Hydration mismatches are reported through console.error, not as an
    // uncaught exception, so pageerror alone never sees them. Warnings count
    // too: React reports plenty of real problems at that level.
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        errors.push(message.text());
      }
    });

    // A full document load: this is the request that runs the server render.
    // Without the status check a failed SSR still looks fine, because React
    // recovers on the client and paints the page anyway.
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);

    await page.waitForLoadState("networkidle");

    expect(errors).toHaveLength(0);
  });
}
