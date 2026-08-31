import { test, expect } from "@playwright/test";

const surveyRoutes = [
  "/claims",
  "/checkout",
  "/embedded/feedback",
  "/embedded/cloud",
  "/embedded/shop",
  "/embedded/clinic",
];
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

test("/embedded/feedback moves the same survey between placements", async ({ page }) => {
  await page.goto("/embedded/feedback");
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

test("/embedded/feedback derives a plan, a price and a module list from the answers", async ({
  page,
}) => {
  await page.goto("/embedded/feedback");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });
  const card = page.locator("#feedback");

  // This route opens on the satisfaction survey; the plan finder is the other
  // definition the toolbar offers. Swapping to it also proves the point the
  // switcher is there to make: the embedding does not care which one it holds.
  await expect(card).toContainText("How are we doing?");
  await dock.getByRole("button", { name: "Survey definition" }).click();
  await page.getByRole("menuitem", { name: /Plan finder/ }).click();
  await expect(card).toContainText("Find the right plan");

  await dock.getByRole("button", { name: "Prefill" }).click();

  // Prefill remounts the model and every Next re-renders the card, so each step
  // waits for the page it landed on instead of clicking blind, and the button is
  // re-resolved inside the card each time rather than held across a re-render.
  // Assertions read the card's text: these are sentences with inline markup.
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
});

test("/embedded/cloud re-prices the page as the configurator is answered", async ({
  page,
}) => {
  await page.goto("/embedded/cloud");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });
  const quote = page.getByRole("complementary", { name: "Your quote" });

  // Nothing answered: the page has no quote to show yet.
  await expect(quote).toContainText("Answer the first question");

  await dock.getByRole("button", { name: "Prefill" }).click();

  // 25 projects and SSO put the tier at Business; the modules, the three
  // environments and SOC 2 each add their own line. That the page shows them at
  // all is the point of the demo: the survey model is driving it.
  await expect(quote).toContainText("Business");
  await expect(quote).toContainText("Streams module");
  await expect(quote).toContainText("Warehouse module");
  await expect(quote).toContainText("3 environments");
  await expect(quote).toContainText("SOC 2 Type II report");

  // Business's 2 TB allowance exactly covers the prefilled volume.
  await expect(quote).not.toContainText("Storage over the allowance");

  // 1200 + 180 + 340 + (520 + 180 + 60) + 400 support + 250 SOC 2
  await expect(quote).toContainText("$3,130");

  // The recommended tier is badged in the plan cards, and only that one.
  const recommended = page.locator("#plan-business");
  await expect(recommended).toContainText("Recommended for you");
  await expect(page.locator("#plan-team")).not.toContainText("Recommended for you");

  // The module grid marks what the quote contains.
  await expect(page.getByText("In your quote")).toHaveCount(2);
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

test("/embedded/shop lets the quiz pick the product and the checkout drive the total", async ({
  page,
}) => {
  await page.goto("/embedded/shop");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });
  const product = page.locator("#product");

  // Nothing answered yet: the store is selling its house blend.
  await expect(product).toContainText("Cedar & Cocoa");
  await expect(product).toContainText("Best seller");

  await dock.getByRole("button", { name: "Prefill" }).click();

  // Espresso, milk and a sweet profile rank the dark roast first, and three to
  // four cups a day is a 500 g bag every fortnight. None of that was picked by
  // hand — the five answers re-pointed the page at a different product.
  await expect(product).toContainText("Night Shift");
  await expect(product).toContainText("Matched to your answers");

  const why = page.getByRole("complementary", { name: "Why this coffee" });
  await expect(why).toContainText("500 g");
  await expect(why).toContainText("every 2 weeks");

  await product.getByRole("button", { name: /Add to cart/ }).click();

  // Adding to the cart is also what moves the store to its other page, which is
  // the other definition the toolbar holds.
  const summary = page.getByRole("complementary", { name: "Order summary" });
  await expect(summary).toBeVisible();
  // 17 x 1.85 for the 500 g bag, less the 10% standing-order discount.
  await expect(summary).toContainText("$31.45");
  await expect(summary).toContainText("$3.15");
  await expect(summary).toContainText("Standard");

  // The summary is downstream of the checkout form, not beside it: prefilling
  // the checkout picks Express, and the shipping line follows.
  await dock.getByRole("button", { name: "Prefill" }).click();
  await expect(summary).toContainText("Express (2 days)");
  await expect(summary).toContainText("$12.00");
});

test("/embedded/clinic estimates the visit from the answers", async ({ page }) => {
  await page.goto("/embedded/clinic");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });
  const panel = page.getByRole("complementary", { name: "Your visit" });

  await expect(panel).toContainText("Answer the first question");

  await dock.getByRole("button", { name: "Prefill" }).click();

  // Behavioral health bills at the specialist copay, and the prefilled plan is
  // the HMO — so the panel shows $35 and the referral warning rather than the
  // happy path.
  await expect(panel).toContainText("Behavioral health");
  await expect(panel).toContainText("Samuel Reyes, MD");
  await expect(panel).toContainText("$35");
  await expect(panel).toContainText("referral");

  // A new patient gets a longer what-to-bring list.
  await expect(panel).toContainText("list of your current medications");

  // The directory and the office list mark what the request names.
  await expect(page.locator("#provider-reyes")).toContainText("Requested");
  await expect(page.locator("#location-westbridge")).toContainText("Chosen");
});
