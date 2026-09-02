import { test, expect } from "@playwright/test";

/**
 * The admin is the template's one editor, and the page worth sharing: the
 * definition, the user it is rendered for, and the form that comes out, on one
 * screen — then out to the site the form actually lives in.
 */

const CLINIC = "/admin?form=clinic-visit";

async function waitForEditor(page: import("@playwright/test").Page) {
  // Monaco is a heavy dynamic import; under parallel workers it needs longer
  // than the default expect timeout.
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
}

async function setDefinition(page: import("@playwright/test").Page, json: unknown) {
  await page.evaluate((source) => {
    const monaco = (window as unknown as { monaco: typeof import("monaco-editor") })
      .monaco;
    monaco.editor.getModels()[0].setValue(source);
  }, JSON.stringify(json, null, 2));
}

/** A field of the users pane's editor — which is itself a SurveyJS survey. */
function userField(page: import("@playwright/test").Page, name: string) {
  return page
    .getByRole("region", { name: "Users" })
    .locator(`[data-name="${name}"] input`)
    .first();
}

async function typeUserField(
  page: import("@playwright/test").Page,
  name: string,
  value: string,
) {
  const field = userField(page, name);
  await field.fill(value);
  // survey-core commits a text answer on blur by default.
  await field.press("Tab");
}

test("one editor covers every form, and the preview follows the JSON", async ({
  page,
}) => {
  test.slow();
  await page.goto("/admin");
  await waitForEditor(page);

  // The plain forms have no user to be rendered for, so no users pane.
  await expect(page.getByRole("region", { name: "Users" })).toHaveCount(0);

  await setDefinition(page, {
    title: "Edited in the admin",
    elements: [{ type: "text", name: "q1", title: "A brand new question" }],
  });
  await expect(page.getByText("A brand new question").first()).toBeVisible({
    timeout: 15_000,
  });

  // Same editor, a different form — and this one is rendered for somebody.
  await page.getByRole("button", { name: "Appointment request" }).click();
  await expect(page).toHaveURL(/form=clinic-visit/);
  const users = page.getByRole("region", { name: "Users" });
  await expect(users).toContainText("Maria Delgado");
  // The account is what the definition reads, so the preview greets her.
  await expect(page.getByText("Welcome back, Maria").first()).toBeVisible({
    timeout: 15_000,
  });

  // Switching forms leaves the first form's edit alone rather than carrying it.
  await page.getByRole("button", { name: "Claims intake" }).click();
  await expect(page.getByText("A brand new question").first()).toBeVisible({
    timeout: 15_000,
  });
});

test("a user added in the admin reaches the embedded site", async ({ page }) => {
  test.slow();
  await page.goto(CLINIC);
  await waitForEditor(page);

  const users = page.getByRole("region", { name: "Users" });
  await expect(users).toContainText("Maria Delgado");

  // A new user starts as a copy of the selected one, so one field is enough to
  // tell them apart — and the preview re-renders for whoever is selected.
  await users.getByRole("button", { name: "Add" }).click();
  await typeUserField(page, "preferredName", "Nina");
  await typeUserField(page, "firstName", "Nina");

  await expect(users.locator("pre")).toContainText('"preferredName": "Nina"');
  await expect(page.getByText("Welcome back, Nina").first()).toBeVisible({
    timeout: 15_000,
  });

  // Out to the site the form actually lives in, carrying both.
  await page.getByRole("button", { name: "Preview result" }).click();
  await expect(page).toHaveURL(/\/embedded\/clinic$/);

  const dock = page.getByRole("toolbar", { name: "Embedded demo tools" });
  const card = page.locator("#request");

  // The demo opens as the first user the admin holds, and the dropdown — which
  // only appears once there is more than one — switches the whole form over.
  await expect(card).toContainText("Welcome back, Maria", { timeout: 15_000 });
  const picker = dock.getByRole("button", { name: /Maria Delgado/ });
  await expect(picker).toBeVisible();

  await picker.click();
  await page.getByRole("menuitemradio", { name: /Nina/ }).click();
  await expect(card).toContainText("Welcome back, Nina");
  await expect(page.locator("header").first()).toContainText("Nina");
});

test("a definition saved in the admin is what the embedded site renders", async ({
  page,
}) => {
  test.slow();
  await page.goto(CLINIC);
  await waitForEditor(page);

  await setDefinition(page, {
    title: "Saved from the admin",
    elements: [
      { type: "text", name: "q1", title: "Renamed for {user.preferredName}" },
    ],
  });
  await expect(page.getByText("Renamed for Maria").first()).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("button", { name: "Preview result" }).click();
  await expect(page).toHaveURL(/\/embedded\/clinic$/);

  // The host site is untouched — it is the survey inside it that came from the
  // admin, piping the same account the admin was showing.
  await expect(page.locator("#request")).toContainText("Renamed for Maria", {
    timeout: 15_000,
  });
  await expect(page.getByText("Ridgeline Family Health").first()).toBeVisible();

  // The server keeps serving the definition that ships with the template.
  const response = await page.reload();
  expect(await response!.text()).not.toContain("Renamed for");
  await expect(page.locator("#request")).toContainText("Renamed for Maria");

  // Reset in the admin drops both the definition and the users.
  await page.goto(CLINIC);
  await waitForEditor(page);
  await page.getByRole("button", { name: "Reset" }).click();
  await page.goto("/embedded/clinic");
  await expect(page.locator("#request")).toContainText("Welcome back, Maria");
});

/**
 * Every definition that ships is clean, and the linter is told about the one
 * variable the host sets at runtime — otherwise the personalized forms would
 * report dozens of unknown references and look broken to a reviewer.
 */
for (const id of [
  "medical-form",
  "checkout",
  "insurance-claim",
  "customer-satisfaction",
  "cloud-platform",
  "clinic-visit",
]) {
  test(`the ${id} definition passes static analysis`, async ({ page }) => {
    test.slow();
    await page.goto(`/admin?form=${id}`);
    await waitForEditor(page);
    await expect(
      page.getByText("Static analysis: all checks passed", { exact: true }),
    ).toBeVisible({ timeout: 20_000 });
  });
}
