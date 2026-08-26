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

- **Server-side rendering.** A survey is rendered into the HTML the server sends, so the form is in the document before any JavaScript runs. `survey-core` needs a DOM stub for that — see [src/lib/survey-ssr-environment.ts](src/lib/survey-ssr-environment.ts).
- **JSON-driven forms.** Every form is a plain JSON definition; the app never hardcodes fields. Definitions live in [src/schemas/](src/schemas/).
- **A renderer-agnostic model factory.** [createSurveyModel](src/schemas/createSurveyModel.ts) builds a configured `survey-core` model from a definition, and knows nothing about React — the same call works with any SurveyJS UI package.
- **Theming with shadcn/ui.** The SurveyJS shadcn adapter (`survey-core/themes/adapters/shadcn-base-nova.css`) maps the form onto the same design tokens the rest of the app uses, so light/dark mode and radius/color changes apply to both at once. App-local tweaks go into [src/styles/](src/styles/).
- **Edit and read-only modes.** [src/components/RecordsView.tsx](src/components/RecordsView.tsx) lists stored records and reuses the same definition to either display or edit one in a dialog.
- **Live schema editing.** Each form has a `/configure` page with a Monaco JSON editor and a live preview ([src/components/SchemaEditor.tsx](src/components/SchemaEditor.tsx)). Edits are saved to `localStorage`, so the server keeps rendering the canonical definition and the prerendered HTML stays intact.

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
  lib/
    survey-ssr-environment.ts   DOM stub that lets survey-core render on the server
    schema-overrides.ts         localStorage persistence for edited definitions
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
