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
- **Live schema editing.** Each form has a `/configure` page with a Monaco JSON editor and a live preview ([src/components/SchemaEditor.tsx](src/components/SchemaEditor.tsx)). Edits are saved to `localStorage`, so the server keeps rendering the canonical definition and the prerendered HTML stays intact.
- **One place to swap in your own storage.** Every read and write goes through two files in [src/storage/](src/storage/), and nothing else in the app knows where the data lives — see [Storage](#storage-localstorage-here-your-database-in-production).

## Storage: `localStorage` here, your database in production

Everything this template stores goes through **two files in [src/storage/](src/storage/)**. Nothing else in `src/` reads or writes stored data.

| File | What it stores | How the demo does it |
| --- | --- | --- |
| [survey-json.ts](src/storage/survey-json.ts) | Survey definitions edited on the `/configure` pages | `localStorage`, so each visitor's experiments stay in their own browser and the server keeps rendering the definition that ships with the template |
| [survey-results.ts](src/storage/survey-results.ts) | Submitted answers and the claim records | An in-memory array — an edit is gone as soon as you reload. Nothing is persisted, on purpose: a template should not look like it stores someone's data when it does not |

Every function in both files is `async`, so replacing the bodies with calls to your API changes no call site anywhere else.

### Moving to your own server and database

1. **Two tables:** `survey_schemas (id, json, updated_at)` and `claims (id, data, updated_at)`. Seed them from `src/schemas/` (see below).
2. **Route handlers** under `src/app/api/` — `GET`/`PUT`/`DELETE /api/schemas/[id]`, and `GET`/`POST /api/claims` plus `PUT`/`DELETE /api/claims/[id]`. Validate the incoming JSON and authorize the caller here: the schema editor is effectively an admin surface, and it is only safe unauthenticated today because nothing leaves the browser.
3. **Replace the three bodies in [survey-json.ts](src/storage/survey-json.ts)** — `loadSurveyJson`, `saveSurveyJson`, `resetSurveyJson` — with `fetch` calls. The file's header comment shows the shape.
4. **Replace the four bodies in [survey-results.ts](src/storage/survey-results.ts)** — `listResults`, `saveResult`, `deleteResult`, `submitResult`.
5. **Mind the one server-side reader.** `listResults()` is called from the `/records` server component, so the table and the form are in the server HTML; a relative `fetch("/api/claims")` does not resolve there. Query the database directly in that branch, or use an absolute URL. The three mutations run on the client and can use relative URLs.

### What happens to `src/schemas/`

The folder holds three different kinds of thing, and only the first moves into the database:

| | |
| --- | --- |
| `medical-form.ts`, `checkout.ts`, `insurance-claim.ts` | **Move to the database** — one row each in `survey_schemas`. Keep the files as the seed, and as the fallback `loadSurveyJson` returns to when a row is missing. |
| `data/insurance-claim-seed.ts` | **Moves to the database** — rows in `claims`. |
| `data/medical-form-seed.ts`, `data/checkout-seed.ts` | Demo data behind the "Prefill demo data" button. Delete them. |
| `types.ts`, `createSurveyModel.ts` | **Stay as they are.** Types and the model factory have nothing to do with storage. |
| `index.ts` | Stays, smaller. `getSchemaDefinition` becomes the fallback path rather than the source of truth, since definitions now come from `loadSurveyJson`. |
| `navigation.ts` | **Stays** if your set of forms is fixed. If users create forms at runtime, this moves to the database too and the routes become a single dynamic `/[formId]`. |

One matching change in the pages: `/configure` currently passes `getSchemaDefinition(id).json` as `defaultSource`, and the form pages pass it as `schema`. Both become `(await loadSurveyJson(id)) ?? getSchemaDefinition(id).json`.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Redirects to `/claims`. |
| `/claims` | Patient intake / medical-insurance form — a paged wizard with a progress stepper, nested panels, matrix and dynamic-matrix questions, expressions and conditional visibility. |
| `/checkout` | Multi-step checkout wizard — table of contents, required-field validation, input masks, panels gated by `visibleIf`, and a review page built from earlier answers via `{question}` piping. |
| `/records` | Table of insurance-claim records; view one read-only or edit it in a dialog. The claim form mixes text, masked input, dropdown, radiogroup, checkbox, date, number, file upload and conditional panels. |
| `/claims/configure`, `/checkout/configure`, `/records/configure` | JSON editor with a live preview of the form. |

## Project structure

```
src/
  app/                          App Router pages, one folder per form
  schemas/
    types.ts                    Shared types (survey-core only, no UI framework)
    createSurveyModel.ts        Model factory
    medical-form.ts             The three form definitions
    checkout.ts
    insurance-claim.ts
    data/                       Demo response data / seed records
    navigation.ts               Route ↔ schema mapping used by the sidebar
  components/
    SurveyForm.tsx              Renders a model with survey-react-ui
    SchemaEditor.tsx            JSON editor page with a live preview
    JsonEditor.tsx              Monaco wrapper (client-only)
    RecordsView.tsx             Records table + view/edit dialog
    AdminShell.tsx, Sidebar.tsx, ThemeSwitcher.tsx
    ui/                         shadcn/ui primitives
  storage/                      The only two files that touch stored data
    survey-json.ts              Survey definitions
    survey-results.ts           Submitted answers and claim records
  lib/
    utils.ts                    The shadcn `cn()` helper
  styles/                       App-local overrides on top of the SurveyJS adapter
```

To add a form, drop a JSON definition into `src/schemas/`, register it in [src/schemas/index.ts](src/schemas/index.ts), add an entry to [src/schemas/navigation.ts](src/schemas/navigation.ts), and create a page that passes it to `SurveyForm`.

## Tests

Playwright end-to-end tests live in [e2e/](e2e/) and assert, among other things, that the survey markup is present in the server response.

```bash
npm run e2e:ci    # against a production build
npm run e2e:dev   # against `next dev`, where React reports more warnings
npm run e2e:ui    # interactive runner
```

## License

[MIT](LICENSE)
