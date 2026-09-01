import { test, expect } from "@playwright/test";

const surveyRoutes = [
  "/claims",
  "/checkout",
  "/embedded/feedback",
  "/embedded/cloud",
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

/** Opens the toolbar's user popup and waits for the editor survey inside it. */
async function openUserDialog(page: import("@playwright/test").Page) {
  await page
    .getByRole("toolbar", { name: "Embedded demo tools" })
    .getByRole("button", { name: "Edit the user" })
    .click();
  const dialog = page.getByRole("dialog");
  // The editor is a SurveyJS survey — same markup as the demo it drives.
  await expect(dialog.locator(".sd-root-modern")).toBeVisible();
  return dialog;
}

/** One field of the editor survey, by question name. */
function editorField(dialog: import("@playwright/test").Locator, name: string) {
  return dialog.locator(`[data-name="${name}"] input`).first();
}

async function typeInEditor(
  dialog: import("@playwright/test").Locator,
  name: string,
  value: string,
) {
  const field = editorField(dialog, name);
  await field.fill(value);
  // survey-core commits a text answer on blur by default.
  await field.press("Tab");
}

test("/embedded/feedback renders the same definition differently per user", async ({
  page,
}) => {
  test.slow();
  await page.goto("/embedded/feedback");
  const card = page.locator("#feedback");

  // The host page and the survey are reading the same account object.
  await expect(page.locator("header").first()).toContainText("Alex Rivera");
  await expect(card).toContainText("Hi Alex, how are we doing?");
  await expect(card).toContainText("Business plan");

  // `usagePeriod` was never asked: it is derived from the account's monthsActive
  // by a defaultValueExpression, and 14 months is more than a year.
  await expect(card).toContainText("More than a year");

  // Alex has an open ticket, so the Support step exists; Alex is not new, so the
  // onboarding step does not. Both are whole pages, so this reads the progress
  // bar — matched with its step number, because "Support" is also a row in the
  // ratings matrix on the page below.
  await expect(card).toContainText(/What matters\s*2\s*Support\s*3/);
  await expect(card).not.toContainText("Getting started");

  const dialog = await openUserDialog(page);
  await typeInEditor(dialog, "firstName", "John");
  await typeInEditor(dialog, "monthsActive", "1");

  // The popup shows the object the survey is actually handed.
  await expect(dialog.locator("pre")).toContainText('"firstName": "John"');

  // Same JSON definition, a different user: a new greeting, a re-derived tenure,
  // and a step that did not exist before.
  await expect(card).toContainText("Hi John, how are we doing?");
  // One month re-derives usagePeriod through the second branch of the iif chain.
  await expect(card).toContainText("One to six months");
  await expect(card).toContainText(/Getting started\s*2/);
  await expect(page.locator("header").first()).toContainText("John Rivera");
});

test("the toolbar opens the definition and the user separately", async ({ page }) => {
  await page.goto("/embedded/feedback");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });

  await dock.getByRole("button", { name: "Configure JSON live" }).click();
  const panel = page.getByRole("complementary", { name: "Live JSON" });
  // Monaco is a heavy dynamic import; under parallel workers it needs longer
  // than the default expect timeout.
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  // The wired-keys line is computed from the definition on screen, not a list.
  await expect(panel).toContainText("firstName");
  await expect(panel).toContainText("monthsActive");

  // The user lives in its own popup, and the two are usable at the same time.
  const dialog = await openUserDialog(page);
  await expect(dialog).toContainText("The signed-in user");
  await expect(panel).toBeVisible();
});

test("the demo toolbar links home and can outline the survey", async ({ page }) => {
  await page.goto("/embedded/cloud");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });
  const html = page.locator("html");

  await expect(dock.getByRole("link", { name: "SurveyJS demos" })).toHaveAttribute(
    "href",
    "/claims",
  );

  const card = page.locator("[data-survey-root]");
  await expect(html).not.toHaveAttribute("data-demo-highlight", /.*/);
  await expect(card).toHaveCSS("outline-style", "none");

  await dock.getByRole("button", { name: "Highlight SurveyJS Render" }).click();

  // The attribute goes on <html>; what matters is that the rule it keys reaches
  // the one element marking where SurveyJS draws.
  await expect(html).toHaveAttribute("data-demo-highlight", "");
  await expect(card).toHaveCSS("outline-style", "dashed");

  await dock.getByRole("button", { name: "Highlight SurveyJS Render" }).click();
  await expect(card).toHaveCSS("outline-style", "none");
});

test("/embedded/clinic fills the request from the patient's chart", async ({ page }) => {
  test.slow();
  await page.goto("/embedded/clinic");
  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });
  const panel = page.getByRole("complementary", { name: "Your visit" });
  const card = page.locator("#request");

  // Nothing has been answered, and the summary is already populated: the office,
  // the clinician and the coverage came from the portal record.
  await expect(panel).not.toContainText("Answer the first question");
  await expect(panel).toContainText("Westbridge");
  await expect(panel).toContainText("Alicia Navarro, MD");
  await expect(card).toContainText("Welcome back, Maria");

  // Her chart has asthma and hypertension on it, so a question exists that a new
  // patient never sees.
  await expect(card).toContainText("Is this about something we already treat you for?");

  await dock.getByRole("button", { name: "Prefill" }).click();

  // Behavioral health bills at the specialist copay, and the plan on file is the
  // HMO — so the panel shows $35 and the referral warning rather than the happy
  // path. The plan was never typed in.
  await expect(panel).toContainText("Behavioral health");
  await expect(panel).toContainText("$35");
  await expect(panel).toContainText("referral");

  // The directory and the office list mark what the request names.
  await expect(page.locator("#provider-navarro")).toContainText("Requested");
  await expect(page.locator("#location-westbridge")).toContainText("Chosen");

  const dialog = await openUserDialog(page);

  // One switch in the editor, and the chart goes with it: the editor's own panel
  // is `visibleIf`-gated and clears its answers, so the account really does empty.
  await expect(dialog).toContainText("What we have on file");
  await dialog.locator('[data-name="isNewPatient"]').getByText("Yes, nobody on file").click();
  await expect(dialog).not.toContainText("What we have on file");
  await expect(dialog.locator("pre")).toContainText('"isNewPatient": true');

  // The answers are still there, and the form around them is the long one.
  await expect(card).toContainText("You are new to Ridgeline");
  await expect(card).toContainText("New here");
  await expect(card).not.toContainText("Is this about something we already treat you for?");
  await expect(panel).toContainText("Behavioral health");
  await expect(panel).toContainText("New to Ridgeline");
  // No plan on file any more, so there is nothing to estimate.
  await expect(panel).not.toContainText("$35");
});
