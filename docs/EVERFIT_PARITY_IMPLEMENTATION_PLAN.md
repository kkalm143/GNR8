# GNR8 → Everfit Parity: Implementation Plan

**Purpose:** Bring GNR8’s program builder and client manager to feature parity with [Everfit’s Workout Builder](https://help.everfit.io/en/collections/1789451-everfit-s-workout-builder) and [Manage Clients](https://help.everfit.io/en/collections/1649397-manage-clients) capabilities, based on their public help documentation.

**Last updated:** 2025-02 (from Everfit help center as of this date)

---

## 1. Everfit feature inventory (from help docs)

### 1.1 Workout Builder ([source](https://help.everfit.io/en/collections/1789451-everfit-s-workout-builder))

| Category | Feature | Description |
|----------|---------|-------------|
| **AI** | AI Workout Builder | Generate workouts from PDF / AI-assisted creation |
| **Basics** | Workout Builder Overview | Core builder UI and concepts |
| **Basics** | Add/delete sets | Sets per exercise |
| **Basics** | Create a Superset | Group exercises as supersets |
| **Basics** | Add a Workout Section | Sections within a workout |
| **Basics** | Drag and drop workouts | Reorder workouts/sections |
| **Basics** | Copy and paste workouts | Duplicate workouts/sections |
| **Basics** | Demo video | Attach demo video per exercise |
| **Basics** | Live Sync | Real-time sync of workout data |
| **Basics** | Save to library | Workout/program library with reuse |
| **Sections** | Freestyle section | Flexible section type for fast building |
| **Sections** | Tags | Categorize workouts in library (tags) |
| **Sections** | Interval/HIIT section | Timed intervals |
| **Sections** | Section Library | Reusable section templates |
| **Sections** | AMRAP section | As many rounds as possible |
| **Sections** | Timed section | Time-based blocks |
| **Sections** | Save section as template | Reuse sections in library |
| **Sections** | Delete section | Remove workout sections |
| **Client tracking** | Assign workout/program to calendar | Assign to client’s training calendar |
| **Client tracking** | Assign multiple workouts | Bulk assign |
| **Client tracking** | Log client workouts | Client logs completion |
| **Client tracking** | Export/print PDF | Export workouts as PDF |
| **Client tracking** | Comments on completed workouts | Coach/client comments |
| **Client tracking** | Workout analytics | Analytics on completion/performance |
| **Client tracking** | Edit completed workout | Edit after client logs |
| **Client tracking** | View client logged activities | View client’s activity log |
| **Client tracking** | Add exercises to tracking | Add exercises to workout tracking |
| **Client tracking** | Master Planner | Calendar-level planning view |
| **Client tracking** | Exercise comment history | History of exercise-level comments |
| **Advanced** | Alternate exercise | Swap/substitute exercises |
| **Advanced** | Tracking fields | RPE, RIR, %HR, cadence, calories, etc. |
| **Advanced** | Warm-up / drop / failure sets | Set types |
| **Advanced** | Rep range | Rep ranges for sets |
| **Advanced** | 1RM% tracking (auto progression) | Program by % of 1RM |
| **Advanced** | Manually set 1RM | Set client 1RM per exercise |
| **Advanced** | Edit exercise from calendar | Edit exercise details from calendar |
| **Advanced** | Edit exercise from library | Exercise library with editable details |
| **Advanced** | Vimeo videos | Embed/play Vimeo for exercises |

### 1.2 Manage Clients ([source](https://help.everfit.io/en/collections/1649397-manage-clients))

| Category | Feature | Description |
|----------|---------|-------------|
| **List** | View all clients (workspace admin) | Admin sees all clients |
| **List** | Auto-archive on subscription cancel | Archive when subscription ends |
| **List** | Adding multiple clients | Add 2–8 at once via UI |
| **List** | Bulk upload CSV | Import clients from CSV |
| **List** | Delete/remove client | Remove client from system |
| **List** | Archive client | Archive (soft delete) |
| **List** | Reactivate archived client | Restore from archive |
| **List** | Duplicate clients | Merge or handle duplicates |
| **List** | Global search (e.g. “J”) | Quick jump to client by name/search |
| **Settings** | Turn off workout comments | Per-client comment toggle |
| **Settings** | Attach consultation file | File attached to client profile |
| **Settings** | View exercise history | Per-client exercise history |
| **Settings** | Pin metrics on client dashboard | Pin key metrics on dashboard |
| **Settings** | Workout visibility | Control what client sees |
| **Settings** | Workout rearrange | Allow client to reorder |
| **Settings** | Hide workouts from clients | Hide specific workouts |
| **Settings** | Replace exercise setting | Allow client to substitute exercise |
| **Settings** | Allow clients to create workouts | Let client create own workouts |
| **Programs** | Assign program from calendar | Assign from training calendar |
| **Programs** | Assign program to multiple clients | Bulk program assign |
| **Programs** | Remove client from program | Unassign program |
| **Groups** | Filter/segment clients | By category, status, owner, group |
| **Groups** | Segments | Saved filters/segments |
| **Groups** | Manage groups | Custom labels, team-wide |

### 1.3 Manage Programs ([source](https://help.everfit.io/en/collections/1959830-manage-programs))

- Assign program from Training Calendar  
- Assign program to multiple clients  
- Remove client from assigned program  

---

## 2. GNR8 current state

### 2.1 Data model (from `prisma/schema.prisma`)

- **User / ClientProfile:** email, name, phone, timezone, dateOfBirth; role (admin/client).  
- **Program:** name, description, content (text), isActive, displayOrder. No workout structure (no sections, sets, exercises).  
- **ProgramAssignment:** user, program, status (assigned | in_progress | completed), startDate, endDate, notes.  
- **ProgressEntry:** user, optional programAssignment, type (note | workout_completed | body_metric | measurement | progress_photo), content, value, loggedAt.  
- **DNA:** DNAResult, DNAInterpretationField (GNR8-specific; no Everfit direct equivalent).

### 2.2 Client manager (admin)

- List clients (name, email, phone); Add client (single); Edit client; View client detail.  
- Assign/unassign programs per client.  
- DNA results per client (upload, edit, delete).  
- **Missing vs Everfit:** No archive/reactivate, no CSV import, no bulk add, no global search, no segments/filters, no groups, no per-client settings (visibility, comments, etc.), no consultation file, no pinned metrics.

### 2.3 Program builder (admin)

- Programs: name, description, content (single rich text), isActive, displayOrder.  
- **Missing vs Everfit:** No workout structure (sections, sets, exercises), no library/templates, no tags, no drag-and-drop, no copy/paste, no demo video, no exercise library, no 1RM/tracking fields, no alternate exercises, no PDF export.

### 2.4 Client experience (programs & progress)

- **Programs:** List of assigned programs; program detail (name, description, content, status).  
- **Progress:** Add progress entry (type, content, value, optional program link); list recent entries.  
- **Missing vs Everfit:** No training calendar, no “workouts” to log (only freeform progress), no workout completion logging, no comments, no analytics, no PDF export, no exercise-level tracking.

---

## 3. Gap summary

| Area | GNR8 has | Missing for parity (high level) |
|------|-----------|----------------------------------|
| **Client list** | List, add one, edit, view | Archive/reactivate, CSV import, bulk add, global search, segments, groups |
| **Client settings** | — | Per-client toggles (comments, visibility, rearrange, replace exercise, create workouts), consultation file, pinned metrics, exercise history view |
| **Program structure** | Name, description, content (text) | Workout structure: sections → sets → exercises; types (AMRAP, timed, interval); supersets; exercise library; tags; templates |
| **Program builder UI** | Create/edit program (text) | Drag-and-drop, copy/paste, section library, demo video, alternate exercises |
| **Assignments** | Assign/unassign program to one client | Assign to multiple clients; assign from calendar; start/end dates (we have fields but limited UI); remove from program (we have unassign) |
| **Client calendar** | — | Training calendar view; assign workout/program to dates; Master Planner |
| **Logging** | Progress entries (note, workout_completed, body_metric, etc.) | Log specific workouts (sets/reps/weight); comments on completed workouts; edit completed; analytics |
| **Advanced training** | — | RPE, RIR, %HR, rep range, 1RM%, alternate exercise, warm-up/drop/failure sets |
| **Content** | — | PDF export, Vimeo/demo video |

---

## 4. Implementation plan (phased)

### Phase 1 – Client manager parity (foundation)

**Goal:** Client list and lifecycle comparable to Everfit’s Manage Clients (no workout structure yet).

1. **Client list**
   - Add **archive** (soft delete): `archivedAt: DateTime?` on User or ClientProfile; filter archived by default; “Archived” tab or filter.
   - **Reactivate** archived client (clear archive flag).
   - **Global search:** Client list search by name/email (and optional “J” shortcut); consider admin-only command palette.
   - **Filters/segments:** Status (active/archived), optional “category” (e.g. online/in-person) and “owner” if multi-trainer later; save segment (name + filters) for reuse.
   - **Groups:** New model `ClientGroup` (name, optional description); M:M with User; admin UI to create groups, add/remove clients; filter client list by group.

2. **Bulk and import**
   - **Bulk add:** Form to add 2–8 clients in one go (same fields as single add).
   - **CSV import:** Upload CSV (email required; name, phone, etc. optional); validation and error report; create clients with default password; optional “invite” email later.

3. **Client settings (minimal)**
   - New `ClientSettings` (or JSON on ClientProfile): toggles for “workout comments”, “workout visibility”, “allow rearrange”, “replace exercise”, “allow create workouts”. Use defaults for now; wire to future workout features.
   - **Consultation file:** Store one file per client (e.g. Vercel Blob); “Attach consultation file” on client profile; link to view/download.

4. **Program assignment**
   - **Assign to multiple clients:** Admin selects one program + many clients; create ProgramAssignment for each; confirm step.
   - **Remove from program:** Already have unassign; ensure UI is clear (“Remove from program” with confirmation).

**Deliverables:** Archive/reactivate, search, filters/segments, groups, bulk add, CSV import, ClientSettings toggles, consultation file, multi-client program assign.  
**DB:** Migrations for archive, ClientGroup, ClientSettings (or JSON), and any new fields.

---

### Phase 2 – Workout/program structure (program builder v2)

**Goal:** Programs that are structured as “workouts” (sections, sets, exercises), without full Everfit advanced training yet.

1. **Data model**
   - **Exercise:** id, name, description (optional), demoVideoUrl (optional), source (e.g. “library” | “custom”), createdAt. Optional: link to “ExerciseLibrary” if you want library vs inline.
   - **WorkoutSection:** id, programId (or workoutId), type (e.g. “freestyle” | “amrap” | “timed” | “interval”), name (optional), displayOrder, durationSeconds (for timed/interval), metadata (JSON for round count, etc.).
   - **WorkoutSet:** id, sectionId, exerciseId (optional for custom text), displayOrder, reps (string or number), repRange (e.g. “8–12”), weight, durationSeconds, notes, setType (e.g. “normal” | “warmup” | “drop” | “failure”).
   - **Program** stays; add **Workout** (optional): id, programId, name, displayOrder. So: Program → Workouts → Sections → Sets (each set = one exercise + reps/weight/etc.). Or: Program → Sections → Sets if you don’t need “workout” as a separate level.
   - **Section template library:** SectionTemplate (name, type, default duration/reps, etc.); “Save section as template”, “Add from template” in builder.

2. **Exercise library**
   - CRUD for exercises (name, description, demo video URL); tags optional; used when building sets.
   - In builder, “Add set” = pick exercise (from library or custom text) + reps/weight/duration + set type.

3. **Program builder UI**
   - Replace or augment “content” with structured builder: list of sections; add section (freestyle, AMRAP, timed, interval); within section, list of sets; add set (choose exercise, reps, weight, etc.); drag-and-drop to reorder sections and sets.
   - Copy/paste: duplicate section or whole program (clone program = copy structure).
   - Tags on programs (and optionally workouts): tag list; filter program library by tag.
   - Save to library: program (and section templates) saved; “New from template” when creating program.

4. **Client-facing program view**
   - Program detail shows structured workout (sections + sets) instead of/in addition to raw content; readable layout (e.g. section headers, exercise name, reps/weight).

**Deliverables:** Exercise model + library UI; WorkoutSection, WorkoutSet (and optional Workout); section templates; builder UI with drag-and-drop and copy/paste; tags; client view of structured program.  
**DB:** Migrations for Exercise, WorkoutSection, WorkoutSet, SectionTemplate, ProgramTag (or tag JSON).

---

### Phase 3 – Calendar and assignment to dates

**Goal:** Assign workouts/programs to a client’s calendar and show a calendar view (Everfit “assign to calendar”, “Master Planner”).

1. **Assignment to dates**
   - ProgramAssignment: already have startDate/endDate; add **scheduled date** (or “assignment schedule”). Option A: ProgramAssignment has startDate/endDate; “assign to calendar” = create one or more **WorkoutAssignment** (userId, workoutId or programId, scheduledDate, optional notes). Option B: Keep program-level assignment and add “program calendar” that maps date → workout (e.g. “Week 1 Day 1 = Workout A”).
   - Prefer: **ScheduledWorkout** (or WorkoutAssignment): userId, workoutId (or programId + day index), scheduledDate, status (scheduled | completed | skipped), completedAt, notes. So “assign workout/program to calendar” creates these records.

2. **Training calendar**
   - Client: Calendar view (month/week); list of scheduled workouts by date; click date to see workout and “Log” or “Mark complete”.
   - Admin: “Master Planner” or calendar view per client (or multi-client): see scheduled workouts; drag to reschedule; assign from calendar (pick date, pick workout/program, assign).

3. **Logging workouts**
   - When client marks a scheduled workout “complete”, create ProgressEntry (type workout_completed) and optionally store structured data (sets × reps/weight) in JSON or a **WorkoutLog** model (scheduledWorkoutId, loggedAt, setsCompleted: JSON).
   - “Edit completed workout”: edit that log (sets/reps/weight) and optionally comments.

**Deliverables:** ScheduledWorkout (or equivalent); assign workout/program to specific dates; client calendar view; client log completion (and edit); admin calendar/Master Planner view.  
**DB:** ScheduledWorkout, optional WorkoutLog for set-level data.

---

### Phase 4 – Comments, visibility, and client settings

**Goal:** Comments on completed workouts; control what clients see and can do (Everfit client settings).

1. **Comments**
   - **WorkoutComment** (or Comment on ProgressEntry/WorkoutLog): authorId, workoutLogId or progressEntryId, content, createdAt. Coach and client can comment; “Comments for completed workouts” and “Exercise comment history” (if you add exercise-level comments later).
   - UI: On completed workout detail, comment thread; optionally on specific exercise/set (exercise comment history).

2. **Visibility and client settings**
   - **Workout visibility:** Per-client or per-assignment: “visible from date” / “visible until date” or “hidden” flag so client can’t see certain workouts until coach flips visibility.
   - **Rearrange:** If client can reorder: store “custom order” for that client (e.g. JSON array of workout IDs); otherwise order by scheduled date or program order.
   - **Replace exercise:** When client views a workout, “Replace exercise” shows alternate (from exercise library or coach-defined alternates); log uses the replacement.
   - **Allow clients to create workouts:** Optional; “Create workout” for client (simplified builder or freestyle); stored as client-owned workout. Lower priority.

3. **Consultation file and pinned metrics**
   - Consultation file: done in Phase 1.
   - **Pin metrics:** Client dashboard shows “pinned” metrics (e.g. body weight, custom metrics from progress entries); admin chooses which metrics to pin for that client; store pin list on ClientSettings.

**Deliverables:** Comments on completed workouts (and optionally per exercise); visibility and rearrange; replace exercise; pinned metrics on client dashboard.  
**DB:** WorkoutComment (or similar), visibility/reorder/replace in ClientSettings or assignment.

---

### Phase 5 – Analytics, PDF, and advanced training

**Goal:** Analytics, export, and advanced training fields (Everfit “Workout Analytics”, “Edit tracking fields”, “1RM%”, etc.).

1. **Analytics**
   - **Workout analytics:** Completion rate (scheduled vs completed); volume (sets/reps/weight) over time; per client and optionally per program. Simple aggregates + charts (e.g. last 4 weeks).
   - **Client dashboard (admin):** Summary of that client’s completion and volume; link to “View client’s logged activities” (already have progress list; add filter by type and date).

2. **PDF export**
   - “Export workout/program as PDF”: Server or client-side PDF (e.g. react-pdf or Puppeteer); include program name, sections, sets, exercises, reps/weight; optional branding.

3. **Advanced tracking fields**
   - **Tracking fields:** Add to WorkoutSet or WorkoutLog: RPE, RIR, %HR, cadence, calories (optional). Store in JSON or columns; show in builder and in log UI.
   - **Rep range:** Already in model (repRange); ensure UI supports “8–12” style.
   - **1RM and auto progression:** **ClientExercise1RM** (userId, exerciseId, oneRepMax, measuredAt). “Manually set 1RM” UI for coach. “Program using 1RM%”: in builder, set target % of 1RM per set; when client logs, show suggested weight from 1RM%; optional auto-update 1RM from log. (Larger feature; can be “Phase 5b”.)

4. **Alternate exercise and set types**
   - **Alternate exercise:** On WorkoutSet, optional alternateExerciseId; client or coach can “swap” to alternate when logging.
   - **Set types:** warmup, drop, failure already in model (setType); ensure UI supports them.

5. **Video**
   - **Vimeo/demo video:** Exercise.demoVideoUrl; embed player on client workout view and in library.

**Deliverables:** Workout analytics (completion + volume); PDF export for program/workout; RPE/RIR/etc. and rep range in UI; 1RM model + manual set; optional 1RM% programming; alternate exercise; set types in UI; demo video embed.  
**DB:** ClientExercise1RM, any new tracking fields (or JSON).

---

### Phase 6 – AI and polish

**Goal:** Optional AI assist and remaining polish (Everfit “AI Workout Builder”, “Generating Workouts from PDF”).

1. **AI workout builder (optional)**
   - “Generate from PDF”: Upload PDF; extract text; call LLM to suggest structured workout (sections/sets/exercises); map to exercise library; coach reviews and saves.
   - “AI suggest workout”: Prompt (e.g. “upper body, 45 min”); LLM returns structure; coach edits and saves. Requires API key and prompt design.

2. **Live sync (optional)**
   - If you add real-time collaboration: WebSockets or similar so multiple admins see builder updates live. Lower priority unless needed.

3. **Chromecast / stream**
   - Everfit lists “Stream Workouts with Chromecast (coming soon)”; defer unless product requirement.

**Deliverables:** Optional AI-from-PDF and AI-suggest workout; documentation; any remaining UX polish (empty states, keyboard shortcuts, etc.).

---

## 5. Priority order and dependencies

| Phase | Focus | Depends on |
|------|--------|------------|
| **1** | Client manager (archive, search, segments, groups, bulk/CSV, settings, multi-assign) | — |
| **2** | Workout structure (sections, sets, exercises, library, builder UI) | — |
| **3** | Calendar + assign to dates + log completion | Phase 2 |
| **4** | Comments, visibility, replace exercise, pinned metrics | Phase 2, 3 |
| **5** | Analytics, PDF, 1RM, tracking fields, video | Phase 2, 3 |
| **6** | AI, live sync (optional) | Phase 2 |

Recommendation: **Do Phase 1 first** (client manager parity and multi-assign). Then **Phase 2** (workout structure and builder). Then **Phase 3** (calendar and logging). Phases 4–6 can be parallelized in parts once 2 and 3 are in place.

---

## 6. Implementation status (TDD)

**Phase 1 – Client manager parity (implemented)**  
- **Schema:** `User.archivedAt`, `ClientProfile.consultationFileUrl`, `ClientSettings`, `ClientGroup`, `UserClientGroup`.  
- **APIs (with tests):**  
  - `GET/POST /api/admin/clients` — list with `?archived=`, `?search=`, `?groupId=`; create with `ClientSettings` and optional `clientProfile.clientSettings`.  
  - `PATCH /api/admin/clients/[id]` — archive/reactivate (`archived: true|false`).  
  - `GET/POST /api/admin/client-groups`, `GET/PATCH/DELETE /api/admin/client-groups/[id]`, `POST/DELETE .../members`.  
  - `POST /api/admin/clients/bulk` (2–8 clients), `POST /api/admin/clients/import-csv`.  
  - `GET/PATCH /api/admin/clients/[id]/settings`, `GET/POST /api/admin/clients/[id]/consultation`.  
  - `POST /api/admin/programs/[id]/assign` (body: `userIds[]`) for multi-client assign.  
- **UI:** Clients list (search, Active/Archived, group filter, Bulk add, Import CSV); client detail (Archive/Reactivate, Settings, Consultation file); Groups (list, create, edit, manage members); program detail (Assign to multiple clients).  

**Phase 2 – Workout structure (implemented)**  
- **Schema:** `Exercise`, `WorkoutSection`, `WorkoutSet`, `SectionTemplate`, `Program.tags`.  
- **APIs:**  
  - `GET/POST /api/admin/exercises`, `GET/PATCH/DELETE /api/admin/exercises/[id]`.  
  - `GET/POST /api/admin/programs/[id]/sections`, `PATCH/DELETE .../sections/[sectionId]`, `POST .../sections/from-template`, `POST .../sections/[sectionId]/clone`.  
  - `POST /api/admin/programs/[id]/sections/[sectionId]/sets`, `PATCH/DELETE .../sets/[setId]`.  
  - `GET/POST/PATCH/DELETE /api/admin/section-templates`, `GET /api/admin/section-templates/[id]`.  
  - `POST /api/admin/programs/[id]/clone`.  
  - `PATCH /api/admin/programs/[id]` accepts `tags: string[]`.  
- **UI – Everfit parity gaps (implemented):**  
  - **Edit section/set:** Inline edit in workout builder (section: name, type, duration; set: exercise, reps, weight, set type).  
  - **Reorder sections/sets:** Move up/down in builder (drag-and-drop deferred as enhancement).  
  - **Section templates:** Save as template per section; “From template” when adding section; section-templates CRUD API.  
  - **Program tags:** Tags on program (edit form); program list filter by tag.  
  - **Copy/paste:** Duplicate section in builder; Duplicate program on list/detail.  
  - **Exercise delete:** Delete button with confirm on exercise library (and optional on edit page).  
  - **Admin → client messages:** Send message form on client detail.  
  - **Admin → client tasks:** Add task form on client detail.  
  - **Pinned metrics:** Multi-select in client settings; keys: weight, body fat %, measurement, etc.  
  - **Multi-assign dates:** Optional start/end date in assign-to-many form.  
  - **Client structured program view:** Client program detail shows Workout block (sections/sets) when program has workout data.  
  - **Demo video:** “Watch demo” link on client program view per set when exercise has `demoVideoUrl`; demo link on exercise library list.  
  - **Remove from program:** Unassign button labeled “Remove from program” with confirmation.  

**Phases 3–6** — Not yet implemented (calendar/ScheduledWorkout, comments/visibility, analytics/PDF/1RM, AI builder).

---

## 7. References

- [Everfit’s Workout Builder](https://help.everfit.io/en/collections/1789451-everfit-s-workout-builder) – Workout Builder collection (AI, Basics, Sections, Client Workout Tracking, Advanced Training).
- [Manage Clients](https://help.everfit.io/en/collections/1649397-manage-clients) – Client list, settings, programs, groups.
- [Manage Programs](https://help.everfit.io/en/collections/1959830-manage-programs) – Assign program from calendar, to multiple clients, remove from program.

---

*This plan is a living document. Adjust scope and phasing to match GNR8’s roadmap and capacity (e.g. genetics-first features vs general fitness tooling).*
