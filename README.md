# Job Tracker

A private, client-side workspace for a developer's job search. React + TypeScript + Vite, Tailwind CSS v4, editable shadcn/ui-style Radix primitives, Lucide, Zustand, React Hook Form, Zod, and Sonner. No backend, authentication, API, external database, or runtime network dependencies.

## Run

Use Node.js 22.12+ (or a supported newer LTS) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Data is scoped to the browser and origin: localhost and 127.0.0.1 have separate storage.

```sh
npm run build       # strict TypeScript and production bundle
npm run preview     # serve the production bundle
npm run test        # Vitest + React Testing Library
npm run test:watch  # watch mode
npm run lint
npm run format
```

## V0.2 functionality

- Responsive dashboard with basic application, active, interview, and conversion statistics.
- Create and edit opportunities in a keyboard-accessible right-hand sheet. Only company and position are required.
- Complete role details, annual salary and currency, remote/location, URLs, date, source, notes, technology tags, and missing skills.
- Quick status changes, search across company/role/location/technologies, status filtering, sorting, grid/list views.
- Confirmation before deletion, importing a replacement workspace, and discarding an edited form. Operation toasts and meaningful empty states.
- Light, dark, and system appearance, persisted with the workspace.
- Simple technology inventory and skills-to-learn counts. Advanced analytics are intentionally deferred.
- Case-insensitive technology aggregation and combined filters for status, work mode, technology, missing skill, and application date.
- An explicit status timeline for every opportunity. Changing status appends an event; choosing the current status again does not create a duplicate event.
- Interview events with type, scheduled date/time, optional completion date/time, notes, and edit/delete actions.
- English and Spanish UI copy through `i18next` and `react-i18next`. The selected language is persisted in the workspace; a new workspace follows the browser language when it starts with `es`, otherwise English is used.
- Validated JSON import/export, duplicate record rejection, unsupported version rejection, and a size limit before parsing. V1 backups are migrated to V2 by adding the initial status event and empty interview history.
- Optional, explicitly labeled demo records. New workspaces start empty.

## Structure

```text
src/
  app/                        application shell and page selection
  components/
    common/                   tag input and confirmation dialog
    layout/                   sidebar and theme controls
    ui/                       editable Button and Sheet primitives
  features/
    applications/             form, cards, dashboard, schemas, selectors, demo
    technologies/             basic technology and missing-skill inventory
    analytics/                next-iteration boundary
    settings/                 appearance, backup, restore and recovery
  hooks/                      system-aware theme effect
  i18n/                       English/Spanish resources and language setup
  store/                      Zustand domain actions
  storage/                    replaceable storage service and versioned backups
  lib/                        class names and date/salary utilities
  types/                      domain contracts
  styles/                     shared tokens, light/dark and responsive styles
  test/                       testing environment setup
```

UI components use store actions rather than localStorage. The store validates input, assigns UUIDs and timestamps, saves through a `StorageService`, and updates memory only after persistence succeeds. An eventual asynchronous remote adapter will require async store actions; the UI does not directly depend on browser storage (except the Settings recovery download).

`components.json` configures shadcn/ui with the `@/` alias and shared CSS variables. The project owns its Button and Sheet source, using Radix for slots, dialogs, focus handling, and escape behavior. Strict TypeScript is enabled. UI state such as search, page, and open sheets is transient; applications and appearance are durable.

The storage key remains `job-tracker:v1` so existing V0.1 installations are discovered in place. The stored/exported envelope is now V2:

```json
{
  "version": 2,
  "exportedAt": "2026-09-29T12:00:00.000Z",
  "applications": [],
  "settings": { "theme": "system", "language": "en" }
}
```

The `parseBackup` boundary handles V1-to-V2 migration. Imported data must pass the same domain validation as forms before replacing existing records. Import requires confirmation. Export before replacing anything you need to keep.

If storage is corrupt or inaccessible, existing bytes are preserved and normal writes are blocked. Settings offers a download of the original bytes and restoration of a validated backup. Storage quota failures leave in-memory state unchanged and display an actionable error.

## Statistic definitions

- Applications: all opportunities, including saved roles.
- Active: applied, contacted, interview, or technical test.
- Interviews: currently interview or technical test.
- Interview rate: currently interview, technical test, or offer divided by all non-saved opportunities.

The rate is still a current-state proxy, not a historical funnel. The stored status timeline now provides the event data needed for a future historical funnel without changing this statistic's meaning.

## Validation

Automated coverage includes create/edit/status/delete persistence across store recreation, status-history and interview CRUD, failed writes, corrupt-data preservation, V1 migration and V2 JSON round trips, invalid dates/salaries/URLs/versions/duplicate IDs, combined filtering/statistics, language resources, and the form-to-delete UI lifecycle with tags and optional salaries.

Manual browser checks cover creation, editing, search, confirmation, refresh persistence, light/dark themes, and mobile layout at 390px. Demo opportunities are illustrative and are not live listings.

## Next iteration

1. Add historical funnel and trend views based on the stored status timeline.
2. Add Recharts for market demand, funnel conversion, and application trends.
3. Add browser end-to-end tests for file download/upload and keyboard focus restoration.
4. Add cross-tab conflict handling if simultaneous editing becomes a use case. Currently the most recent save wins.
5. Consider an installable/offline app and accessible mobile navigation focus trapping.

This iteration keeps records local. Clearing site storage deletes them; there is no cloud backup or synchronization. Export regularly. The app is not yet a PWA and needs its static host to load.
