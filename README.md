# SurveyJS + Next.js example

This example shows how to use Next.js along with the [SurveyJS Form Library](https://surveyjs.io/form-library/documentation/overview): complex forms are defined as JSON, rendered on the server by the App Router, and styled with [shadcn/ui](https://ui.shadcn.com) through the SurveyJS theme adapter.

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsurveyjs%2Fsurveyjs-nextjs-mit)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example "https://github.com/surveyjs/surveyjs-nextjs-mit" surveyjs-nextjs-app
```

```bash
yarn create next-app --example "https://github.com/surveyjs/surveyjs-nextjs-mit" surveyjs-nextjs-app
```

```bash
pnpm create next-app --example "https://github.com/surveyjs/surveyjs-nextjs-mit" surveyjs-nextjs-app
```

Or clone the repository directly:

```bash
git clone https://github.com/surveyjs/surveyjs-nextjs-mit.git
cd surveyjs-nextjs-mit
npm i
npm run dev
```

Open http://localhost:3000/ in your browser.

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

## What this example covers

- **Server-side rendering.** A survey is rendered into the HTML the server sends, so the form is in the document before any JavaScript runs — no DOM stub or other workaround required.
- **JSON-driven forms.** Every form is a plain JSON definition; the app never hardcodes fields. Definitions live in [src/schemas/](src/schemas/).
- **A renderer-agnostic model factory.** [createSurveyModel](src/schemas/createSurveyModel.ts) builds a configured `survey-core` model from a definition, and knows nothing about React — the same call works with any SurveyJS UI package.
- **Theming with shadcn/ui.** The SurveyJS shadcn adapter (`survey-core/themes/adapters/shadcn-base-nova.css`) maps the form onto the same design tokens the rest of the app uses, so light/dark mode and radius/color changes apply to both at once. App-local tweaks go into [src/styles/](src/styles/).
- **Edit and read-only modes.** [src/components/RecordsView.tsx](src/components/RecordsView.tsx) lists stored records and reuses the same definition to either display or edit one in a dialog.
- **One admin for every form.** [`/admin`](src/components/admin/AdminWorkbench.tsx) is the whole template on one screen: a Monaco JSON editor with survey-core’s own linter under it, the list of users the form is rendered for — edited through a SurveyJS form, with the resulting context object shown as JSON — and the form itself, following both as you type. The primary button saves and opens the page the form actually lives in, which for the embedded demos is somebody else’s website. `?form=` makes each one a shareable link, and edits are kept in `localStorage`, so the server keeps rendering the canonical definition and the prerendered HTML stays intact.
  - The linter is told the one variable the host sets at runtime (`knownVariables: ["user"]`), which is why a personalized definition reads as clean rather than as forty unknown references. Every definition that ships passes it, and an e2e test keeps it that way.
- **Surveys embedded in somebody else’s site.** Three demos under [`/embedded`](src/app/embedded/), each rendered without the admin chrome (see the `(shell)` route group), each in its own brand colour, and each opened in a new tab from the sidebar. One host site, one form, sitting inline in the page the way a real embed does.

  They share one toolbar, and it is deliberately down to two claims. **The form is JSON:** *Configure in admin* opens this form’s definition in `/admin`, and what is saved there is what these pages render — the round trip a buyer is asking about, rather than a second editor bolted onto the host site. **The form is rendered for a person:** a dropdown switches between the users the admin holds, and *Edit the user* opens the signed-in account in a popup — and that editor is itself a SurveyJS survey, with the object it produces shown as JSON underneath it, so the library is editing its own input and there is no bespoke form code anywhere. Every demo passes that object to survey-core as one variable, so the definition reads `{user.firstName}` — in titles, in `defaultValueExpression` to arrive pre-answered, and in `visibleIf` to add or drop whole pages. Change Alex to John and the greeting, the values *and* the number of steps change. A third button, *Highlight SurveyJS Render*, scrolls to the form and outlines the one element it is drawn into, so there is no argument about which part of the page is the host site. See [demo-accounts.ts](src/components/embedded/demo-accounts.ts); the shared machinery is [useDemoChrome](src/components/embedded/useDemoChrome.ts), so the next demo is a page component and a route.
  - `/embedded/feedback` — a mock product marketing site whose hero holds a satisfaction survey, addressed to the workspace member who is signed in. It greets them by name, works out how long they have been a customer from `monthsActive` rather than asking, gives a paying customer a question about plan fit and a three-week-old account a whole onboarding page instead, quotes their open support ticket by subject, names their CSM if they have one, and never asks for an email address it already has.
  - `/embedded/cloud` — a pricing page the survey **drives**. Answers leave the model through `onDataChange`, [quoteFor](src/schemas/cloud-platform-pricing.ts) turns them into an itemised quote, and the page re-prices itself: the quote panel, the recommended tier card, the module grid and the highlighted column of the comparison table. "See my plan" scrolls to the tier rather than showing a thank-you screen, and the built-in preview step (`showPreviewBeforeComplete`) plus a remount-with-the-same-answers "Change my answers" mean nothing is lost when a visitor reconsiders. On top of that it opens on the CRM record: the project count is sized from the company’s headcount, the compliance boxes come from the account, an existing customer is asked what they are changing while a prospect is asked how far along they are, HIPAA on file adds a BAA question, and an EU account gets an entire data-residency page a US one never sees. Worth trying: prefill it, then switch account — the price moves and so does the length of the progress bar.
  - `/embedded/clinic` — a mock US primary-care site, built to the conventions a patient reads without noticing: the utility bar, a provider directory with credentials, in-network plans, posted self-pay prices, the statutory notices. Its appointment request answers the question patients actually ask — [visitSummaryFor](src/schemas/clinic-info.ts) derives the copay from the plan and the visit type, flags an HMO referral, and builds the what-to-bring list; submitting scrolls to the clinician who will see them. And because a patient portal knows more about you than any other login you have, it is the sharpest of the three on personalisation: the office, the clinician, the plan, the name and the date of birth all arrive filled in, the identity fields stay locked until the patient says something has changed, the insurance-card fields are not there at all while a card is on file, “is this about something we already treat you for?” offers *that patient’s* conditions and the refill question *that patient’s* medications — both assembled choice by choice from the chart — and a first-time visitor gets an extra page nobody else sees.
- **One place to swap in your own storage.** Every read and write goes through two files in [src/storage/](src/storage/), and nothing else in the app knows where the data lives — see [Storage](#storage-localstorage-here-your-database-in-production).

## Storage: `localStorage` here, your database in production

Everything this template stores goes through **[src/storage/](src/storage/)**. Nothing else in `src/` reads or writes stored data.

| File | What it stores | How the demo does it |
| --- | --- | --- |
| [survey-json.ts](src/storage/survey-json.ts) | Survey definitions edited in `/admin` | `localStorage`, so each visitor's experiments stay in their own browser and the server keeps rendering the definition that ships with the template |
| [survey-results.ts](src/storage/survey-results.ts) | Submitted answers and the claim records | An in-memory array — an edit is gone as soon as you reload. Nothing is persisted, on purpose: a template should not look like it stores someone's data when it does not |
| [demo-users.ts](src/storage/demo-users.ts) | The users the admin keeps for the personalized demos | `localStorage`. **Delete this file in a real application:** the "user" there is whatever `getSession()` and your CRM already return, and there is exactly one of them — the person looking at the page. It exists because a demo has no session |

Every function in both files is `async`, so replacing the bodies with calls to your API changes no call site anywhere else.

### Moving to your own server and database

1. **Two tables:** `survey_schemas (id, json, updated_at)` and `claims (id, data, updated_at)`. Seed them from `src/schemas/` (see below).
2. **Route handlers** under `src/app/api/` — `GET`/`PUT`/`DELETE /api/schemas/[id]`, and `GET`/`POST /api/claims` plus `PUT`/`DELETE /api/claims/[id]`. Validate the incoming JSON and authorize the caller here: the schema editor is effectively an admin surface, and it is only safe unauthenticated today because nothing leaves the browser.
3. **Replace the three bodies in [survey-json.ts](src/storage/survey-json.ts)** — `loadSurveyJson`, `saveSurveyJson`, `resetSurveyJson` — with `fetch` calls. The file's header comment shows the shape.
4. **Replace the four bodies in [survey-results.ts](src/storage/survey-results.ts)** — `listResults`, `saveResult`, `deleteResult`, `submitResult`.
5. **Mind the one server-side reader.** `listResults()` is called from the `/records` server component, so the table and the form are in the server HTML; a relative `fetch("/api/claims")` does not resolve there. Query the database directly in that branch, or use an absolute URL. The three mutations run on the client and can use relative URLs.

### What happens to `src/schemas/`

The folder holds four different kinds of thing, and only the first moves into the database:

| | |
| --- | --- |
| `medical-form.ts`, `checkout.ts`, `insurance-claim.ts`, `plan-finder.ts`, `customer-satisfaction.ts`, `cloud-platform.ts`, `clinic-visit.ts` | **Move to the database** — one row each in `survey_schemas`. Keep the files as the seed, and as the fallback `loadSurveyJson` returns to when a row is missing. |
| `data/insurance-claim-seed.ts` | **Moves to the database** — rows in `claims`. |
| `data/medical-form-seed.ts`, `data/checkout-seed.ts`, `data/plan-finder-seed.ts`, `data/customer-satisfaction-seed.ts`, `data/cloud-platform-seed.ts`, `data/clinic-visit-seed.ts` | Demo data behind the "Prefill demo data" button. Delete them. |
| `cloud-platform-pricing.ts`, `clinic-info.ts` | The demo host sites’ own catalogues and pricing rules, not survey definitions. Delete them with the demos, or replace them with whatever your real product catalogue is. |
| `types.ts`, `createSurveyModel.ts` | **Stay as they are.** Types and the model factory have nothing to do with storage. |
| `index.ts` | Stays, smaller. `getSchemaDefinition` becomes the fallback path rather than the source of truth, since definitions now come from `loadSurveyJson`. |
| `navigation.ts` | **Stays** if your set of forms is fixed. If users create forms at runtime, this moves to the database too and the routes become a single dynamic `/[formId]`. |

One matching change in the pages: the admin currently takes `getSchemaDefinition(id).json` from [admin-forms.ts](src/components/admin/admin-forms.ts), and the form pages pass it as `schema`. Both become `(await loadSurveyJson(id)) ?? getSchemaDefinition(id).json`.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Redirects to `/claims`. |
| `/claims` | Patient intake / medical-insurance form — a paged wizard with a progress stepper, nested panels, matrix and dynamic-matrix questions, expressions and conditional visibility. |
| `/checkout` | Multi-step checkout wizard — table of contents, required-field validation, input masks, panels gated by `visibleIf`, and a review page built from earlier answers via `{question}` piping. |
| `/records` | Table of insurance-claim records; view one read-only or edit it in a dialog. The claim form mixes text, masked input, dropdown, radiogroup, checkbox, date, number, file upload and conditional panels. |
| `/embedded/feedback` | Embedded demo — a mock product site whose hero hosts a satisfaction survey, rendered for the signed-in account. |
| `/embedded/cloud` | Embedded demo — a pricing page that re-prices itself from a platform configurator, opened on what the CRM already knows. |
| `/embedded/clinic` | Embedded demo — a US clinic site whose appointment request arrives filled in from the patient’s chart, estimates the copay and flags a needed referral. |
| `/admin` | The one editor: JSON plus linter, the users the form is rendered for, and a live form. `?form=` picks which of the six. |
| `/claims/configure`, `/checkout/configure`, `/records/configure` | Redirect to `/admin`, where that form is now edited. |

## Project structure

```
src/
  app/
    (shell)/                    Pages inside the admin chrome, one folder per form
    embedded/                   The embedded demos — no admin chrome at all
      feedback/  cloud/  clinic/
  schemas/
    types.ts                    Shared types (survey-core only, no UI framework)
    createSurveyModel.ts        Model factory
    medical-form.ts             The seven form definitions
    checkout.ts
    insurance-claim.ts
    plan-finder.ts
    customer-satisfaction.ts
    cloud-platform.ts
    cloud-platform-pricing.ts   Its price list, and the quote derived from answers
    clinic-visit.ts
    clinic-info.ts              The clinic’s directory, plans, and the derived visit summary
    data/                       Demo response data / seed records
    navigation.ts               Route ↔ schema mapping used by the sidebar
  components/
    SurveyForm.tsx              Renders a model with survey-react-ui
    JsonEditor.tsx              Monaco wrapper (client-only)
    RecordsView.tsx             Records table + view/edit dialog
    AdminShell.tsx, Sidebar.tsx, ThemeSwitcher.tsx
    admin/                      The one editor: JSON + linter, users, live form
      admin-forms.ts            Every form in the template, in one list
    lint/                       survey-core’s linter as a status bar
    embedded/                   The mock host sites, the shared toolbar, and the demo accounts
    ui/                         shadcn/ui primitives
  storage/                      The only files that touch stored data
    survey-json.ts              Survey definitions
    survey-results.ts           Submitted answers and claim records
    demo-users.ts               The demo accounts the admin keeps (delete in a real app)
  lib/
    utils.ts                    The shadcn `cn()` helper
  styles/                       App-local overrides on top of the SurveyJS adapter
```

To add a form, drop a JSON definition into `src/schemas/`, register it in [src/schemas/index.ts](src/schemas/index.ts), add an entry to [src/schemas/navigation.ts](src/schemas/navigation.ts) and one to [src/components/admin/admin-forms.ts](src/components/admin/admin-forms.ts) so the admin can edit it, and create a page that passes it to `SurveyForm`.

## Tests

Playwright end-to-end tests live in [e2e/](e2e/) and assert, among other things, that the survey markup is present in the server response.

```bash
npm run e2e:ci    # against a production build
npm run e2e:dev   # against `next dev`, where React reports more warnings
npm run e2e:ui    # interactive runner
```

## License

[MIT](LICENSE)
