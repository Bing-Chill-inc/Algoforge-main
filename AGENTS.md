# AGENTS.md — AlgoForge Repository Guide

This document is an exhaustive, practical map of how this repository is structured, how it runs, and how the main subsystems interact.

**Project Purpose**
- AlgoForge is a web-first algorithm design tool with a rich graphical editor and a cloud workspace.
- The repository includes a backend API, a cloud UI, a standalone editor UI, and an Electron desktop wrapper.

**Top-Level Layout**
- `src/back` Backend API and static asset server (Bun + Express + TypeORM).
- `src/front-cloud` Cloud UI (Svelte + Vite).
- `src/front-editeur` Editor UI (custom web components, static HTML + JS).
- `src/electron` Desktop wrapper (Electron Forge).
- `data/algos` Filesystem storage for algorithm JSON files by ID.
- `logs` Backend log files.
- `docker-compose.yml` Docker compose stack (backend + Postgres + pgAdmin).
- `template-*.env` Environment templates for local, docker, and test.
- `run-local.*` and `run-docker.*` Convenience scripts for setup and launch.

---

**Runtime Surfaces**
- Web editor at `/edit` served by backend from `src/front-editeur/out`.
- Cloud UI at `/cloud` served by backend from `src/front-cloud/dist`.
- API at `/api/*` served by backend.
- Electron app serves the editor UI via a custom `app://` protocol.

---

**Backend (`src/back`)**

**Entry Point**
- `src/back/index.ts` bootstraps the Express server, static assets, dynamic asset routes, API routes, DB, and mail.

**Key Behaviors**
- Serves static editor bundle at `/edit`.
- Serves static cloud bundle at `/cloud`.
- Redirects `/` to `/edit`.
- Starts dynamic asset routes used by the editor.
- Builds the editor bundle via `SmeltJS.ts` on startup and rebuilds on file changes.
- Initializes database and mail with retry logic, then mounts API and error handling.

**Key Files**
- `src/back/index.ts` Main server.
- `src/back/package.json` Scripts and dependencies.
- `src/back/Dockerfile` Bun image and entrypoint.
- `src/back/assetsDynamiques.ts` Dynamic SVG assets for editor.
- `src/back/getBibliotheques.ts` Library tree endpoint and icon handler.
- `src/back/middlewares/*` Auth, rate-limit, logging, and error handling.
- `src/back/utils/*` Logger, algo validation, hashing, etc.

**API Controllers**
- `src/back/api/algos/algos.controller.ts`
- `src/back/api/users/users.controller.ts`

**Service Layer**
- `src/back/api/algos/algos.service.ts` Algorithm CRUD, validation, permissions, disk I/O.
- `src/back/api/users/users.service.ts` User CRUD, login, confirmation, quota, email logic.
- `src/back/api/auth/auth.service.ts` Token extraction and verification.

**Auth**
- `Authorization: Bearer <token>` header.
- `authMiddleware` sets `res.locals.user` and returns updated token in headers.

---

**Database (`src/back/db`)**

**Data Source**
- `src/back/db/data-source.ts`
- Supports `postgres`, `mysql`, `sqlite` via `DATABASE_TYPE`.
- Uses TypeORM with entity classes in `src/back/db/schemas`.
- `BUILD=dev|test` enables `synchronize` and `dropSchema` for tests.

**Entities**
- `Utilisateur` User.
- `Token` Session token.
- `Algorithme` Algorithm metadata.
- `Dossier` Folder structure.
- `PermAlgorithme` Algorithm permissions.
- `PermDossier` Folder permissions.

**Schema Diagram**
- `src/back/db/DB.drawio`

**Postgres Init**
- `src/back/db/scripts/init.sql`

---

**Algorithm Storage (DB + Filesystem)**
- Metadata is stored in the database.
- Source code is stored in JSON files in `data/algos/<id>.json`.
- Read/write/delete happens in `src/back/api/algos/algos.service.ts`.

---

**Dynamic Asset Routes**
- `/edit/assetsDynamiques/*` served from `src/back/assetsDynamiques.ts`.
- `/edit/Bibliotheque/getStructure` returns JSON library tree built from `src/front-editeur/src/Bibliotheque`.
- `/edit/Bibliotheque/:category/:subCategory/icone.svg` reads SVGs and replaces PHP-style placeholders with query params.

---

**Mail**
- `MAIL_ACTIVE=true` enables mail sending in non-test mode.
- Test mode uses nodemailer mock.
- Templates in `src/back/mail/templates`.
- Confirmation URL is `EDITOR_URL + /api/users/confirm/:token`.

---

**Cloud UI (`src/front-cloud`)**

**Stack**
- Svelte 5 + Vite.
- Custom hash-based routing (no external router).

**Entry and Routing**
- `src/front-cloud/src/main.ts` mounts `App.svelte`.
- `src/front-cloud/src/App.svelte` implements `#/` routing to Login/Register/Cloud/ForgotPassword/Test.

**Key Components**
- `src/front-cloud/src/routes/Cloud.svelte` renders the cloud UI layout.
- `src/front-cloud/src/CloudContent/*` main content area and pages.
- `src/front-cloud/src/components/*` shared UI components.

**Stores**
- `src/front-cloud/src/stores/userStores.ts` auth state, cookies/session, loadUser, logout.
- `src/front-cloud/src/stores/algoStore.ts` API calls for algorithms.
- `src/front-cloud/src/stores/themeStore.ts` CSS variables-based theme.

**Editor Integration**
- Cloud UI opens editor via `window.open("/edit/#/<algoId>")`.
- Editor is served from backend static route.

---

**Editor (`src/front-editeur`)**

**Stack**
- Custom web components and vanilla JS.
- Static HTML in `src/front-editeur/src/index.html`.

**Build Process**
- `src/front-editeur/SmeltJS.ts` inlines JS into a single script and inlines CSS into `out/index.html`.
- Outputs to `src/front-editeur/out`.
- Copies `Audio/` and `modales/` into output.

**Key Files**
- `src/front-editeur/src/index.html` main editor page.
- `src/front-editeur/src/PartieEditeur/*` core editor classes.
- `src/front-editeur/src/PartieErreur/*` anomaly detection and warnings.
- `src/front-editeur/src/Bibliotheque/*` library assets, templates, and descriptions.

**Core Classes**
- `Editeur.js` main editor component and UI wiring.
- `PlanTravail.js` workspace, JSON export, anomaly scanning.
- `ElementGraphique.js` base class for graphical nodes.
- `EvenementEdition/*` undo/redo and editor actions.

**Flags**
- `isExam` and `isElectron` are defined in `index.html`.
- Electron mode replaces these flags at runtime.

**Analytics**
- `index.html` includes a Plausible script.

---

**Electron (`src/electron`)**

**Entry**
- `src/electron/electron-main.js`

**Behavior**
- Registers custom `app://` protocol.
- Serves editor assets directly from `front-editeur/src` in dev.
- Serves bundled resources in production.
- Implements dynamic library and asset routes inside protocol handler.
- Exam mode toggles via `exam-mode.js`.

**Packaging**
- Configured in `src/electron/package.json` with Electron Forge.
- Includes `../front-editeur/src` as `extraResource`.

---

**Scripts and Running**

**Local (Bun)**
- `run-local.sh`, `run-local.ps1`, `run-local.bat`
- Copies `template-local.env` to `.env`.
- Forces `DATABASE_TYPE=sqlite` and `DATABASE_NAME=db_algoforge.sqlite`.
- Runs `bun run prod` from `src/back`.

**Docker**
- `run-docker.sh`, `run-docker.ps1`, `run-docker.bat`
- Copies `template-docker.env` to `.env`.
- Forces Postgres settings.
- Runs `docker compose up`.

**Manual**
- `cd src/back`
- `bun run prod`
- Backend serves `/edit` and `/cloud`.

---

**Environment Variables**

These are defined in `template-*.env` and used in backend.
- `PORT` Server port.
- `IS_IP_LOGGED` IP logging.
- `EDITOR_URL` Base URL for confirmation emails.
- `MAIL_ACTIVE` Enable/disable mail in non-test mode.
- `DATABASE_TYPE` `postgres|mysql|sqlite`.
- `DATABASE_NAME` DB name or file path for sqlite.
- `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_PORT`.
- `PGADMIN_*` pgAdmin config (docker).
- `RETRY_MANY_TIMES` for DB/mail retries.
- `QUOTA_ALGO` max algorithms per user.
- `BUILD` `prod|dev|test`.
- `DEBUG`, `DEBUG_LEVEL`.

---

**Testing**
- Tests live in `src/back/tests`.
- `src/back/tests/setup.test.ts` waits for app initialization, cleans DB, and runs tests.
- Requires `BUILD=test` and a configured DB.
- Uses Bun test runner.

---

**Notable Observations**
- `template-test.env` uses `MAIL_ENABLED` but backend checks `MAIL_ACTIVE`.
- `src/back/Dockerfile` exposes port 3000 but app default is 5205.
- `src/back/getBibliotheques.ts` reads `noCourt.txt` which looks like a typo for `nomCourt.txt`.
- `src/back/utils/queries.ts` uses `findOne` but then indexes like `permsDir[0]` in some paths.

---

**Key File References**
- `src/back/index.ts`
- `src/back/api/algos/algos.controller.ts`
- `src/back/api/algos/algos.service.ts`
- `src/back/api/users/users.controller.ts`
- `src/back/api/users/users.service.ts`
- `src/back/db/data-source.ts`
- `src/back/db/schemas/*`
- `src/front-cloud/src/App.svelte`
- `src/front-cloud/src/stores/*`
- `src/front-editeur/src/index.html`
- `src/front-editeur/SmeltJS.ts`
- `src/front-editeur/src/PartieEditeur/Editeur.js`
- `src/electron/electron-main.js`

