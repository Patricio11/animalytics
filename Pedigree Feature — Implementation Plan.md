# Pedigree Feature — Implementation Plan for Animalytics

> Full implementation plan, schema, API routes, frontend components, migration SQL, UX notes, testing, and an optional D3 SVG tree phase. Ready to paste into your repo and implement.

---

## Table of contents

1. Overview
2. Goals & design principles
3. Data model (Drizzle + SQL migration)
4. API endpoints (Next.js App Router)
5. Frontend: Pedigree tab & components
6. Pedigree visualization (CSS Grid first, D3 as optional phase)
7. Edit parents flow & validations
8. Documents & Uploads (UploadThing integration)
9. Import / Export (CSV & PDF)
10. Testing strategy
11. Performance & indexes
12. Security & permissions
13. Project file structure
14. Step-by-step implementation checklist
15. Example git commit messages
16. Pitfalls & mitigations
17. Appendix: code snippets (full files you can paste)
18. Phase: D3 SVG tree component (optional, last phase)

---

## 1. Overview

Add a fully-featured Pedigree section to the Animal (Dog) profile in Animalytics. The pedigree will:

* Display ancestry up to N generations (default 4).
* Allow editing of parents (mother/father), creating new parent records inline, and linking existing animals.
* Store and show pedigree documents/certificates (PDF, images).
* Support CSV import/export and PDF export of the pedigree tree.
* Include snapshotting for historical pedigrees (optional but recommended).

This plan covers backend (DB schema + migrations + API), frontend (UI + interactions), uploads, import/export, tests, performance notes, and a final optional D3-based visualization for a polished tree with connectors.

> Assumptions:
>
> * Your project uses Next.js 15 App Router, Drizzle ORM, TanStack Query, UploadThing, Tailwind CSS, Radix UI.
> * `animals` table already exists with core fields (id, name, breed, sex, etc.).

---

## 2. Goals & design principles

* **Relational and simple**: store parent references on `animals` (mother_id, father_id) to keep queries efficient.
* **Editable & safe**: server-side validation to prevent circular ancestry and invalid data.
* **User-friendly**: clear import preview, snapshotting, smooth UI interactions, accessible components.
* **Scalable**: support `gens` parameter, pedigree snapshots for expensive computations, DB indexes.
* **Modular**: API endpoints localized to `/api/animals/:id/pedigree` and UI components inside the animal profile path.

---

## 3. Data model (Drizzle + SQL migration)

### Drizzle schema (TypeScript)

Create `lib/db/schema/pedigree.ts` or integrate into your existing schema files.

```ts
import { pgTable, serial, varchar, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const animals = pgTable("animals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  breed: varchar("breed", { length: 100 }).notNull(),
  sex: varchar("sex", { length: 10 }).notNull(),
  // existing fields...
  mother_id: uuid("mother_id"),
  father_id: uuid("father_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const pedigree_snapshots = pgTable("pedigree_snapshots", {
  id: serial("id").primaryKey(),
  animal_id: uuid("animal_id").notNull(),
  snapshot_json: text("snapshot_json").notNull(),
  created_by: uuid("created_by"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const animal_pedigree_documents = pgTable("animal_pedigree_documents", {
  id: serial("id").primaryKey(),
  animal_id: uuid("animal_id").notNull(),
  title: varchar("title", { length: 255 }),
  url: varchar("url", { length: 2048 }).notNull(),
  uploaded_by: uuid("uploaded_by"),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
  notes: text("notes"),
});
```

### Migration SQL

Create `migrations/2025xxxx_add_pedigree.sql` and run your migration script.

```sql
ALTER TABLE animals
  ADD COLUMN mother_id uuid REFERENCES animals(id) ON DELETE SET NULL,
  ADD COLUMN father_id uuid REFERENCES animals(id) ON DELETE SET NULL;

CREATE TABLE pedigree_snapshots (
  id serial PRIMARY KEY,
  animal_id uuid NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  snapshot_json text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE animal_pedigree_documents (
  id serial PRIMARY KEY,
  animal_id uuid NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  title varchar(255),
  url varchar(2048) NOT NULL,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Indexes (recommended)
CREATE INDEX idx_animals_mother ON animals(mother_id);
CREATE INDEX idx_animals_father ON animals(father_id);
```

**Notes**: `ON DELETE SET NULL` for parent links avoids cascading deletes that could wipe deep subtrees accidentally.

---

## 4. API endpoints (Next.js App Router)

Create `app/api/animals/[id]/pedigree/route.ts` and supporting routes for documents & import.

### Primary endpoints

* `GET /api/animals/:id/pedigree?gens=4` — fetch nested pedigree up to `gens` generations.
* `PUT /api/animals/:id/pedigree` — update `mother_id`/`father_id` or create a snapshot.
* `POST /api/animals/:id/pedigree/import` — import CSV (preview + apply).
* `GET /api/animals/:id/pedigree/export?format=csv|pdf` — export.

### Example `GET` handler (server)

```ts
// app/api/animals/[id]/pedigree/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const gens = Number(new URL(request.url).searchParams.get('gens') || '4');

  async function fetchPedigree(nodeId: string | null, depth = 0) {
    if (!nodeId || depth >= gens) return null;
    const animal = await db.select().from('animals').where(eq('id', nodeId)).limit(1).then(r => r[0]);
    if (!animal) return null;
    return {
      id: animal.id,
      name: animal.name,
      breed: animal.breed,
      sex: animal.sex,
      registration_number: (animal as any).registration_number ?? null,
      mother: await fetchPedigree(animal.mother_id, depth + 1),
      father: await fetchPedigree(animal.father_id, depth + 1),
    };
  }

  const pedigree = await fetchPedigree(id, 0);
  return NextResponse.json({ pedigree, gens });
}
```

### Example `PUT` handler (server)

```ts
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  // body example: { mother_id, father_id, snapshot: boolean }
  if (body.snapshot) {
    await db.insert('pedigree_snapshots').values({
      animal_id: id,
      snapshot_json: JSON.stringify(body.snapshot_data || {}),
      created_by: body.user_id,
    });
    return NextResponse.json({ ok: true });
  }

  // TODO: validate circular ancestry server-side before updating
  await db.update('animals').set({
    mother_id: body.mother_id || null,
    father_id: body.father_id || null,
  }).where(eq('id', id));

  return NextResponse.json({ ok: true });
}
```

**Important**: wrap these routes with your auth/permission middleware (e.g. `requirePermission('animals:update')`). Validate input and run circular ancestry checks.

---

## 5. Frontend: Pedigree tab & components

Add a new tab in the animal profile: `Pedigree`. Place files under `app/(breeder)/animals/[id]/components/`.

### UI layout (desktop)

* Header with title + action buttons: `Edit Parents`, `Snapshot`, `Import`, `Export PDF/CSV`.
* Main grid: left/main area contains the pedigree tree; right sidebar contains Documents + Upload component.
* Edit Parents modal (Radix Dialog) with typeahead search to link existing animals or create new parent inline.

### PedigreeTab (React - client component)

```tsx
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@radix-ui/react-dialog";
import { FileUpload } from "@/components/shared/FileUpload";

export default function PedigreeTab({ animalId }: { animalId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery(['pedigree', animalId], () =>
    fetch(`/api/animals/${animalId}/pedigree?gens=4`).then(r=>r.json())
  );

  const [editing, setEditing] = useState(false);

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pedigree</h2>
        <div className="flex items-center gap-2">
          <button className="btn-sm hover-elevate shadow-card" onClick={()=>setEditing(true)}>Edit Parents</button>
          <a href={`/api/animals/${animalId}/pedigree/export?format=pdf`} className="btn-sm">Export PDF</a>
          <a href={`/api/animals/${animalId}/pedigree/export?format=csv`} className="btn-sm">Export CSV</a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {data?.pedigree ? (
            <div className="p-4 bg-surface rounded-xl shadow-elevated">
              <PedigreeTree node={data.pedigree} gens={4} />
            </div>
          ) : (
            <div className="p-6 text-muted">No pedigree data available yet.</div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="p-4 bg-surface rounded-xl shadow-card">
            <h3 className="font-medium mb-2">Documents</h3>
            <FileUpload endpoint="animalDocument" onUploadComplete={() => qc.invalidateQueries(['pedigree', animalId])} accept="application/pdf,image/*" />
            <DocumentList animalId={animalId} />
          </div>
        </aside>
      </div>

      <EditParentsDialog open={editing} onOpenChange={setEditing} animalId={animalId} />
    </div>
  );
}
```

### PedigreeTree (CSS Grid) — lightweight & responsive

```tsx
"use client";
import React from "react";

type Node = {
  id: string;
  name: string;
  breed?: string;
  sex?: string;
  mother?: Node | null;
  father?: Node | null;
};

export function PedigreeTree({ node, gens = 4 }: { node: Node; gens?: number }) {
  const renderNode = (n: Node | null) => {
    if (!n) return <div className="ped-node empty">—</div>;
    return (
      <div className="ped-node min-w-[180px] p-3 rounded-lg bg-white shadow-card hover:scale-[1.01] transition">
        <div className="font-semibold">{n.name}</div>
        <div className="text-xs text-muted">{n.breed}</div>
      </div>
    );
  };

  const buildRows = (root: Node, currentGen=0): (Node | null)[] => {
    if (currentGen === 0) return [root];
    const queue: (Node | null)[] = [root];
    for (let i = 0; i < currentGen; i++) {
      const n = queue.shift()!;
      queue.push(n?.mother ?? null, n?.father ?? null);
    }
    return queue;
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: gens }).map((_, gen) => {
        const nodes = buildRows(node, gen);
        return (
          <div key={gen} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {nodes.map((n, i) => <div key={i}>{renderNode(n as Node | null)}</div>)}
          </div>
        );
      })}
    </div>
  );
}
```

> Note: this grid approach is intentionally simple and fast to implement. It produces clear rows per generation. The D3 phase (see Appendix) provides connectors and interactive collapse/expand.

---

## 6. Pedigree visualization options

Choose one of the following depending on available time and polish need:

1. **CSS Grid (fast)** — rows per generation; easy to implement; responsive. (Provided above.)
2. **SVG + D3 tree layout (polished)** — renders connectors, curved lines, collapse/expand, zoom, pan. More work but visually superior. (Detailed plan provided in Phase: D3 SVG tree component.)
3. **Canvas / WebGL** — overkill for this use-case.

Recommendation: ship with the CSS Grid version first, then add D3 as a later phase for visual polish.

---

## 7. Edit parents flow & validations

### Edit flow

* `Edit Parents` opens a modal.
* Typeahead search to find existing animals (filters: name, registration number, sex).
* Option to `Create new parent` inline (minimal required fields: name, sex, breed, optionally registration number).
* `Save` triggers `PUT /api/animals/:id/pedigree` with `{ mother_id, father_id }`.
* On save, run server-side validations and return success or a human-friendly error message.

### Validations (server-side)

* **Circular ancestry**: ensure the new parent is not an ancestor/descendant of the subject. (BFS up the chain.)
* **Sex mismatch**: warn if sex doesn't match parent role (e.g. father_id linked to a female), but allow override for special cases.
* **Duplicate links**: ensure parents are not the same animal (unless intended for clones, warn by default).
* **Permission**: only users with `animals:update` or similar role may edit.

### Circular ancestry check (example)

```ts
async function isAncestor(candidateId: string, targetId: string) {
  const seen = new Set<string>();
  const q = [candidateId];
  while(q.length) {
    const id = q.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const a = await db.select().from('animals').where(eq('id', id)).limit(1).then(r=>r[0]);
    if (!a) continue;
    if (a.mother_id === targetId || a.father_id === targetId) return true;
    if (a.mother_id) q.push(a.mother_id);
    if (a.father_id) q.push(a.father_id);
  }
  return false;
}
```

Invoke this before updating parent links and return a 400 error with a descriptive message if circularity would occur.

---

## 8. Documents & Uploads (UploadThing)

* Use your existing `animalDocument` UploadThing endpoint.
* After successful upload, POST metadata to `POST /api/animals/:id/documents` with `{ title, url, notes }` and store in `animal_pedigree_documents`.
* In UI, display thumbnails (images) and PDF view links; allow download and removal (permissioned).

### Example upload callback

```ts
await fetch(`/api/animals/${animalId}/documents`, {
  method: 'POST',
  body: JSON.stringify({ title, url: uploadedUrl, notes }),
  headers: { 'Content-Type': 'application/json' }
});
```

### Document list UI

* Small card per doc with title, upload date, uploader.
* Actions: View (open in new tab or modal), Download, Attach to snapshot, Delete (if permitted).

---

## 9. Import / Export (CSV & PDF)

### CSV Import format (recommended columns)

```
animal_name,registration_number,sex,breed,mother_registration,father_registration
Bella,REG-123,female,Labrador,REG-056,REG-034
```

**Import logic**:

1. Parse CSV into rows.
2. For each row, try matching parents by `registration_number` (best), then by `name+breed` fuzzy match.
3. If parent not found, create a placeholder animal with `unknown: true` and minimal data.
4. Present a preview UI showing what animals will be created and what parent links will be set (diff-style).
5. User confirms; perform batch DB upserts and link parents.
6. Return summary of created/updated items and any warnings.

**Important**: Always offer a preview step before applying changes.

### Export

* **CSV**: flatten the multi-generation pedigree into rows with generation column, e.g. `{subject, ancestor_name, relation, generation}`.
* **PDF**: two options:

  * Client-side: render the pedigree tree to a hidden DOM node, use `html2canvas` + `jsPDF` to create a PDF. Good for quick client-only export.
  * Server-side: render an HTML template server-side with headless Chromium (Puppeteer) to capture a higher-fidelity PDF. This is more robust for consistent print styling.

**Example CSV export**: `GET /api/animals/:id/pedigree/export?format=csv&gens=4` returns `text/csv` with attachment header.

---

## 10. Testing strategy

### Backend tests

* Unit tests for circular ancestry detection.
* Unit tests for import mapping (CSV -> DB). Mock DB or run against test DB.
* Integration tests for API endpoints: GET pedigree, PUT update parents, import endpoint.

### Frontend tests

* Unit tests for `PedigreeTree` rendering logic (sample nodes) with react-testing-library.
* Component tests for `EditParentsDialog` flows.

### E2E tests

* Cypress flows: open animal profile -> Edit Parents -> link existing parent -> save -> verify tree updates.
* Upload document -> verify document appears and download link works.
* Import CSV -> preview -> apply -> verify updates.

### Visual regression

* Percy or Chromatic snapshots of the pedigree tree (especially if you later implement D3 SVG styling).

---

## 11. Performance & indexes

* Add DB indexes on `mother_id` and `father_id` (migration included).
* Limit pedigree depth by default (4 gens). Allow user to request more via `gens` param.
* Cache computed pedigree snapshots in `pedigree_snapshots` for expensive or frequently requested deep trees.
* For bulk imports, batch DB operations and use transactions.

---

## 12. Security & permissions

* Only users with appropriate roles (e.g., `breeder`, `company.staff`, or `admin`) can edit pedigrees.
* Document visibility should be role-based (`public` vs `private` flag).
* Validate uploads by file type and optionally scan for malware.
* Sanitize and validate all input (no injection risk in CSV fields). Use prepared statements via Drizzle.

---

## 13. Project file structure

```
app/(breeder)/animals/[id]/components/PedigreeTab.tsx
app/(breeder)/animals/[id]/components/PedigreeTree.tsx
app/(breeder)/animals/[id]/components/EditParentsDialog.tsx
app/api/animals/[id]/pedigree/route.ts
app/api/animals/[id]/documents/route.ts
lib/db/schema/pedigree.ts
migrations/2025xxxx_add_pedigree.sql
components/shared/DocumentList.tsx
components/shared/FileUpload.tsx
utils/pedigree.ts  # helper functions like isAncestor, fetchPedigree
tests/  # unit/integration tests
```

---

## 14. Step-by-step implementation checklist

1. Add Drizzle schema file + migration SQL; run `npm run db:migrate`.
2. Add indexes for `mother_id` and `father_id`.
3. Implement server API route `app/api/animals/:id/pedigree` (GET & PUT) with auth and circular checks.
4. Create `PedigreeTab` UI and import into animal profile tabs list.
5. Add `PedigreeTree` CSS Grid component (ship first).
6. Create `EditParentsDialog` with typeahead and create-parent inline.
7. Hook UploadThing for documents and implement `POST /api/animals/:id/documents`.
8. Implement CSV import with preview + apply endpoint.
9. Implement CSV and PDF export endpoints.
10. Add tests (backend, frontend, E2E) and run CI.
11. UX polish: skeleton loaders, micro-interactions, accessibility labels.
12. Optional: implement D3 SVG tree (Phase 18).

---

## 15. Example git commit messages

```
feat(pedigree): add mother_id/father_id to animals and pedigree_documents table
feat(api): add /api/animals/:id/pedigree endpoints for fetch/update/export
feat(ui): add Pedigree tab + tree visualization + Edit Parents dialog
feat(upload): integrate pedigree documents with UploadThing
test(pedigree): add unit tests for circular relationship detection
chore(migrations): add migration for pedigree feature
```

---

## 16. Pitfalls & mitigations

* **Circular ancestry**: implement server-side check and provide informative error messages. Also block in UI with pre-save checks.
* **Parent sex mismatch**: warn in UI, allow admin override, and log changes.
* **Accidental bulk changes via import**: always provide a preview step and require explicit confirmation.
* **Performance on deep trees**: limit default gens, cache snapshots, and provide a "Load more generations" control.
* **Data quality**: encourage registration numbers or unique identifiers in imports and match on those first.

---

## 17. Appendix: code snippets & full files (ready to paste)

> NOTE: these are condensed for inclusion in the README — adapt imports, utilities (db, auth, types), and styles to your repo.

### `app/api/animals/[id]/pedigree/route.ts` (complete-ish)

```ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const gens = Number(new URL(request.url).searchParams.get('gens') || '4');

  async function fetchPedigree(nodeId: string | null, depth = 0) {
    if (!nodeId || depth >= gens) return null;
    const animal = await db.select().from('animals').where(eq('id', nodeId)).limit(1).then(r => r[0]);
    if (!animal) return null;
    return {
      id: animal.id,
      name: animal.name,
      breed: animal.breed,
      sex: animal.sex,
      registration_number: (animal as any).registration_number ?? null,
      mother: await fetchPedigree(animal.mother_id, depth + 1),
      father: await fetchPedigree(animal.father_id, depth + 1),
    };
  }

  const pedigree = await fetchPedigree(id, 0);
  return NextResponse.json({ pedigree, gens });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();

  // run circular checks and other validations here
  // example: if (await isAncestor(body.mother_id, id)) return NextResponse.json({ error: 'Circular parent detected' }, { status: 400 });

  if (body.snapshot) {
    await db.insert('pedigree_snapshots').values({
      animal_id: id,
      snapshot_json: JSON.stringify(body.snapshot_data || {}),
      created_by: body.user_id,
    });
    return NextResponse.json({ ok: true });
  }

  await db.update('animals').set({
    mother_id: body.mother_id || null,
    father_id: body.father_id || null,
  }).where(eq('id', id));

  return NextResponse.json({ ok: true });
}
```

### `utils/pedigree.ts` helpers

```ts
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function isAncestor(candidateId: string, targetId: string) {
  if (!candidateId) return false;
  const seen = new Set<string>();
  const q = [candidateId];
  while(q.length) {
    const id = q.shift()!;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const a = await db.select().from('animals').where(eq('id', id)).limit(1).then(r=>r[0]);
    if (!a) continue;
    if (a.mother_id === targetId || a.father_id === targetId) return true;
    if (a.mother_id) q.push(a.mother_id);
    if (a.father_id) q.push(a.father_id);
  }
  return false;
}
```

---

## 18. Phase: D3 SVG tree component (optional, final phase)

If you want a production-grade, visually pleasing pedigree with connectors and interactions, implement a D3-based tree layout rendered into an SVG. This phase is **optional** and should come after the CSS Grid implementation.

### Why D3?

* `d3-hierarchy` provides an opinionated tree layout for hierarchical data (perfect for pedigrees).
* SVG allows crisp connectors and accessible node shapes.
* Easy to add interactive features: collapse/expand branches, zoom & pan, tooltips, context menus (edit), and export to SVG/PDF.

### High-level approach

1. Convert pedigree data into a `d3.hierarchy` structure.
2. Use `d3.tree().size([width, height])` to calculate node positions.
3. Render nodes and links as SVG elements (rect/circle + path for links).
4. Add behaviors:

   * click node to open `EditParentsDialog`.
   * double-click to collapse/expand subtree.
   * wheel + drag to zoom & pan.
5. Provide an `Export as PDF` button that serializes the SVG or re-renders a larger SVG for printing.

### Implementation notes

* Use `useEffect` + `ref` for D3 to manipulate the SVG DOM or use `@visx` (React-friendly D3 primitives) to keep a declarative React approach.
* Keep the component wrapped in a fixed-height container with responsive scaling.
* For accessibility, provide a textual fallback (the CSS Grid rows) and keyboard navigation for nodes.

### Sample pseudo-code (React)

```tsx
import { hierarchy, tree } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';

function D3Pedigree({ data }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = hierarchy(data, d => [d.mother, d.father].filter(Boolean));
    const layout = tree().nodeSize([180, 100]);
    layout(root as any);

    const svg = select(svgRef.current);
    // render links + nodes
    // add zoom behavior
  }, [data]);

  return <svg ref={svgRef} width="100%" height={600} />;
}
```

### Deliverables for this phase

* `app/(breeder)/animals/[id]/components/D3Pedigree.tsx` (or `components/D3Pedigree.tsx`)
* Keyboard & screenreader fallbacks
* Export to SVG/PDF helper

---

## Final notes

* Start with the CSS Grid tree and all API primitives to get a working feature quickly.
* Add D3 after the basic flows are stable and tested.
* I can generate the full file templates for each route and component (complete files ready to paste) if you want — say the word and I will produce them.

---

*Prepared by a Fullstack Developer — ready to implement. If you want, I can now:*

* Generate all files (API + components + utils + tests) for direct paste into your project, OR
* Provide the D3 implementation files as the last phase.

Tell me which you want next and I'll produce the files ready to paste.
