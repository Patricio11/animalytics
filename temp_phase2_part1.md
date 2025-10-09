
## PHASE 2: Database Setup & Core Models

### Task 2.1: Setup Drizzle ORM and PostgreSQL

**Installation:**
```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
npm install dotenv
```

**Files to Create:**
```
drizzle.config.ts                       # Drizzle configuration
lib/db/
  ├── index.ts                          # DB client
  ├── migrate.ts                        # Migration runner
  └── schema/
      ├── index.ts                      # Export all schemas
      ├── users.ts                      # (Already created in Phase 1)
      ├── animals.ts                    # Animal tables (EXPANDED)
      ├── matings.ts                    # Mating & calculations
      ├── tasks.ts                      # Task management (EXPANDED)
      ├── reports.ts                    # NEW: Reports system
      ├── marketplace.ts                # Marketplace listings
      ├── documents.ts                  # NEW: Document management
      ├── dashboard.ts                  # NEW: Dashboard stats
      └── breeders.ts                   # NEW: Breeder network
```

**Drizzle Configuration** (`drizzle.config.ts`)
```typescript
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './lib/db/schema/*',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Database Client** (`lib/db/index.ts`)
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "tsx lib/db/migrate.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Acceptance Criteria:**
- [ ] PostgreSQL running locally or on Neon/Supabase
- [ ] Drizzle ORM connected
- [ ] Can run migrations
- [ ] Drizzle Studio works for data viewing

---
