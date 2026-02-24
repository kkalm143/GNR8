# GNR8 Test Plan

Test-driven approach: **unit tests everywhere**, **integration tests where necessary**. This document identifies gaps and a phased plan for adding tests and any refactors.

---

## 1. Test stack recommendation

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit + API handlers | [Vitest](https://vitest.dev/) | Fast, ESM-native, Jest-compatible. Run `lib/` and route handlers with mocks. |
| React components | [React Testing Library](https://testing-library.com/react) | Render forms/components, fire events, assert DOM and behavior. |
| API mocking (optional) | [MSW](https://mswjs.io/) | Mock `fetch` in component tests so forms call fake API. |
| Integration / E2E (later) | [Playwright](https://playwright.dev/) or Vitest + test DB | Full flows (e.g. register → login → add DNA result). |

**Suggested scripts (package.json):**

- `test` – run Vitest (unit + API tests)
- `test:watch` – Vitest watch
- `test:coverage` – Vitest with coverage
- `test:e2e` – Playwright (when added)

---

## 2. Test directory layout

- **Co-located or `__tests__/` next to source:**  
  - `lib/parseLabFile.test.ts` (or `lib/__tests__/parseLabFile.test.ts`)
  - `app/api/admin/parse-dna-file/route.test.ts`
- **Or single test directory:**  
  - `tests/unit/parseLabFile.test.ts`  
  - `tests/api/admin/parse-dna-file.post.test.ts`  
  - `tests/components/LoginForm.test.tsx`  
  - `tests/integration/auth-flow.test.ts` (optional)

Recommendation: **co-located** for unit tests (`lib/*.test.ts`), **`tests/`** for API and component tests so route/components stay clean and test file paths are explicit.

---

## 3. Unit tests (add everywhere)

### 3.1 `lib/parseLabFile.ts` — **HIGH PRIORITY**

- **`parseLabFile(buffer)`**
  - Parses valid GSGT file: `[Header]` with tab- and space-separated key/value (e.g. `Gender    Female`), then `[Data]` with header row and at least one data row.
  - Returns `ok: true`, `summary` containing Sample ID, Processing Date, Gender, SNPs when present.
  - Returns `sampleId` from first data row (e.g. `DSC042739`).
  - Handles empty buffer / missing `[Data]` / malformed header (e.g. `ok: false` or safe defaults).
  - Handles only `[Header]` (no data row) — no crash, summary from header only.
- **`isLabFileFormat(buffer)`**
  - Returns `true` when buffer contains both `[Header]` and `[Data]`.
  - Returns `false` for empty, plain text, or only `[Header]`.

**Refactor:** None required; parser is already pure and easy to test.

### 3.2 Auth / validation helpers (if extracted)

- **Current:** Auth logic lives inside `lib/auth.ts` (NextAuth config). No separate validation helpers.
- **Recommendation:** Extract small, pure helpers if they appear (e.g. “validate email format”, “normalize role”) and add unit tests in `lib/*.test.ts`.

### 3.3 Other `lib/` modules

- **`lib/db.ts`** – Prisma proxy. No unit tests; cover via integration or API tests that use a test DB or mocked prisma.
- **`lib/auth.ts`** – NextAuth. Test via integration (login flow) or by testing route handlers that call `auth()` with mocks.

---

## 4. API route tests (integration-style with mocks)

Use Vitest to call the exported handlers (GET/POST/PATCH/DELETE) with:

- **Mock `auth()`** – return `{ user: { id, role } }` or `null`.
- **Mock `prisma`** – replace `@/lib/db` with a mock that returns controlled data and records calls.

**Routes to cover (priority order):**

| Route | Methods | What to test |
|-------|--------|--------------|
| `api/admin/parse-dna-file` | POST | 401 without admin; 400 no file / empty / wrong format; 200 with valid GSGT file, body has `summary`, `sampleId`, etc. |
| `api/auth/register` | POST | 400 validation (missing email, short password); 409 duplicate email; 201 success and returned user. |
| `api/admin/clients` | GET, POST | 401 non-admin; GET returns list; POST validation (name, email), 201 with client. |
| `api/admin/clients/[id]` | GET, PATCH | 401; 404 wrong id; GET returns client; PATCH updates profile. |
| `api/admin/clients/[id]/dna` | POST | 401; 404 invalid client; POST creates DNA result (fieldValues, summary, rawFileUrl). |
| `api/admin/clients/[id]/dna/[resultId]` | GET, PATCH, DELETE | 401; 404; PATCH/DELETE only for that client’s result. |
| `api/admin/dna-fields` | GET, POST | 401; POST requires name, type; 200 list. |
| `api/admin/dna-fields/[id]` | PATCH, DELETE | 401; 404; PATCH/DELETE behavior. |
| `api/admin/programs` | GET, POST | 401; POST validation; 200/201. |
| `api/admin/programs/[id]` | GET, PATCH, DELETE | 401; 404; correct program returned/updated/deleted. |
| `api/admin/clients/[id]/assignments` | POST | 401; 404 client/program; 409 already assigned; 201. |
| `api/admin/clients/[id]/assignments/[assignmentId]` | DELETE | 401; 404; 204. |
| `api/programs`, `api/programs/[id]` | GET | 401 no session; 200 returns only current user’s assignments; 404 for unassigned program. |
| `api/progress` | GET, POST | 401; POST requires content; optional type, value, loggedAt, programAssignmentId. |
| `api/results`, `api/results/[id]` | GET | 401; 200 only own results; 404 for other’s result. |
| `api/me/assignments/[assignmentId]` | PATCH | 401; 404 not own assignment; 400 invalid status; 200 updates status. |
| `api/admin/upload` | POST | 401; 400 no file; 503 when BLOB_READ_WRITE_TOKEN unset; 200 with url when set. |

**Refactor:** Keep handlers thin. Optionally extract “service” functions (e.g. `createClient(prisma, body)`) so route tests can call services with a mock prisma without mocking module resolution.

---

## 5. Component tests (React Testing Library)

**Forms (submit + validation + API call):**

- `LoginForm` – invalid credentials, success (mock signIn / router).
- `RegisterForm` – validation, submit (mock fetch).
- `CreateClientForm` – validation (email required), submit (mock fetch).
- `NewDNAFieldForm` – scale vs category, options, submit.
- `EditDNAFieldForm` – initial values, submit.
- `NewProgramForm` – name required, optional description/content, submit.
- `EditProgramForm` – initial values, submit.
- `NewDNAResultForm` – field values, summary, file input; optional: parse-dna-file and upload mocks.
- `EditDNAResultForm` – initial values, submit.
- `AddProgressForm` – type, content, optional value/loggedAt/program, submit.
- `ProgramStatusForm` – buttons for status change, loading state (mock fetch).
- `AssignProgramForm` – program select, optional start/end dates, submit (mock fetch).
- `EditClientForm` – initial values, submit.

**Buttons / small components:**

- `DeleteDNAResultButton`, `DeleteProgramButton`, `DeleteFieldButton` – confirm flow, delete request (mock fetch).
- `UnassignButton` – confirm, DELETE request.
- `BrandFooter` – link to gnr8.org present.
- `ClientNav` / `AdminNav` – expected links and logout.

**Refactor:** Use `data-testid` or accessible labels where needed for stable selectors. Prefer user-facing queries (getByRole, getByLabelText).

---

## 6. Integration tests (as necessary)

- **Auth flow:** Register → Login → redirect to dashboard (or admin for admin user). Can use Vitest + test DB or Playwright.
- **Admin flow:** Login as admin → create client → add DNA result (with file upload + parse) → see result on client detail. Optional: edit result, delete result.
- **Client flow:** Login as client → view results, view programs, update program status, add progress entry.

**Refactor:** Use a dedicated test database (e.g. `DATABASE_URL` in `.env.test`) and run migrations before integration suite; or use Playwright against a running dev server and real DB.

---

## 7. Refactoring summary

| Area | Refactor | Reason |
|------|----------|--------|
| API routes | Optional: extract service layer (e.g. `services/clientService.create(prisma, body)`) | Easier to unit test and to test routes with injected mock prisma. |
| Auth | Keep `auth()` in route handlers; mock `@/lib/auth` in route tests | Avoids touching NextAuth config; tests assert 401/200 for different auth states. |
| Forms | Ensure labels/roles for inputs; optional `data-testid` for file input or dynamic sections | Stable and accessible selectors for RTL. |
| parseLabFile | None | Already pure; test with Buffer inputs. |
| Upload/parse flow | Parse endpoint already separate from upload; form calls parse then upload | Test parse-dna-file and upload routes independently; component test can mock both. |

---

## 8. Implementation order

1. **Setup** – Add Vitest + React Testing Library, config, and `test` / `test:watch` scripts.
2. **Unit: `lib/parseLabFile.ts`** – Full coverage for `parseLabFile` and `isLabFileFormat` (valid file, empty, no [Data], wrong format, tab vs space header).
3. **API: `api/admin/parse-dna-file`** – Mock auth; test 401, 400 (no file, wrong format), 200 with fixture file.
4. **Unit/API: auth/register** – Mock prisma; test 400, 409, 201.
5. **Component: LoginForm, RegisterForm** – Mock signIn/fetch and router.
6. **API: remaining admin and client routes** – By priority (clients, dna-fields, programs, assignments, upload).
7. **Component: remaining forms and buttons** – By usage (create client, DNA result form, program form, progress form, delete/assign/unassign).
8. **Integration** – One auth flow and one admin flow (e.g. create client + add DNA result with file).

---

## 9. Files to add (checklist)

- [x] `vitest.config.ts` (project root)
- [x] `vitest.setup.ts`
- [x] `lib/parseLabFile.test.ts` (12 unit tests)
- [x] `app/api/admin/parse-dna-file/route.test.ts` (6 API tests, auth mocked)
- [x] Fixture: `tests/fixtures/sample-lab-file.txt` (minimal GSGT file)
- [ ] auth/register route test, LoginForm/RegisterForm tests
- [ ] Remaining API route tests (clients, dna-fields, programs, etc.)
- [ ] Component tests (forms, buttons, nav)
- [ ] Integration tests (optional)

This plan gives you a test-driven baseline and a clear order for refactors and new tests.
