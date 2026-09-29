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

## First iteration

- Responsive dashboard with basic application, active, interview, and conversion statistics.
- Create and edit opportunities in a keyboard-accessible right-hand sheet. Only company and position are required.
- Complete role details, annual salary and currency, remote/location, URLs, date, source, notes, technology tags, and missing skills.
- Quick status changes, search across company/role/location/technologies, status filtering, sorting, grid/list views.
- Confirmation before deletion, importing a replacement workspace, and discarding an edited form. Operation toasts and meaningful empty states.
- Light, dark, and system appearance, persisted with the workspace.
- Simple technology inventory and skills-to-learn counts. Advanced analytics are intentionally deferred.
- Validated JSON import/export, duplicate record rejection, unsupported version rejection, and a size limit before parsing.
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
  store/                      Zustand domain actions
  storage/                    replaceable storage service and versioned backups
  lib/                        class names and date/salary utilities
  types/                      domain contracts
  styles/                     shared tokens, light/dark and responsive styles
  test/                       testing environment setup
```

UI components use store actions rather than localStorage. The store validates input, assigns UUIDs and timestamps, saves through a `StorageService`, and updates memory only after persistence succeeds. An eventual asynchronous remote adapter will require async store actions; the UI does not directly depend on browser storage (except the Settings recovery download).

`components.json` configures shadcn/ui with the `@/` alias and shared CSS variables. The project owns its Button and Sheet source, using Radix for slots, dialogs, focus handling, and escape behavior. Strict TypeScript is enabled. UI state such as search, page, and open sheets is transient; applications and appearance are durable.

The storage key is `job-tracker:v1`. The stored/exported envelope is:

```json
{
  "version": 1,
  "exportedAt": "2026-09-29T12:00:00.000Z",
  "applications": [],
  "settings": { "theme": "system" }
}
```

The `parseBackup` boundary is where future v1-to-v2 migrations should be dispatched. Imported data must pass the same domain validation as forms before replacing existing records. Import requires confirmation. Export before replacing anything you need to keep.

If storage is corrupt or inaccessible, existing bytes are preserved and normal writes are blocked. Settings offers a download of the original bytes and restoration of a validated backup. Storage quota failures leave in-memory state unchanged and display an actionable error.

## Statistic definitions

- Applications: all opportunities, including saved roles.
- Active: applied, contacted, interview, or technical test.
- Interviews: currently interview or technical test.
- Interview rate: currently interview, technical test, or offer divided by all non-saved opportunities.

The rate is a current-state proxy, not a historical funnel: a rejected application may previously have reached an interview. Status history is deliberately left for the next iteration.

## Validation

Automated coverage includes create/edit/status/delete persistence across store recreation, failed writes, corrupt-data preservation, JSON round trips, invalid dates/salaries/URLs/versions/duplicate IDs, searching/filtering/statistics, and the form-to-delete UI lifecycle with tags and optional salaries.

Manual browser checks cover creation, editing, search, confirmation, refresh persistence, light/dark themes, and mobile layout at 390px. Demo opportunities are illustrative and are not live listings.

## Next iteration

1. Add versioned status history and dated interview events before historical analytics.
2. Add Recharts for market demand, funnel conversion, and application trends.
3. Add browser end-to-end tests for file download/upload and keyboard focus restoration.
4. Add cross-tab conflict handling if simultaneous editing becomes a use case. Currently the most recent save wins.
5. Consider an installable/offline app and accessible mobile navigation focus trapping.

This iteration keeps records local. Clearing site storage deletes them; there is no cloud backup or synchronization. Export regularly. The app is not yet a PWA and needs its static host to load.
