# Enable pgvector in Supabase

## Step 1: Enable pgvector Extension

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

5. Verify it's enabled:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see a row with `extname = 'vector'`.

## Step 2: Run Drizzle Migration

After enabling the extension, run the migration:

```bash
pnpm drizzle-kit migrate
```

This will add the `question_embedding` and `embedding_model` columns to the `agent_runs` table.

## Step 3: Verify Schema

Check that the columns were added:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'ai_agent'
  AND table_name = 'agent_runs'
  AND column_name IN ('question_embedding', 'embedding_model');
```

You should see:
- `question_embedding` | `USER-DEFINED` (vector type)
- `embedding_model` | `character varying`

## Troubleshooting

### Error: "type 'vector' does not exist"

If you see this error, the pgvector extension isn't enabled. Go back to Step 1.

### Error: "permission denied"

You need to be a database owner to create extensions. In Supabase, use the default connection which has superuser privileges.

### Error: "extension 'vector' already exists"

This is fine - the extension is already enabled. Proceed to Step 2.

## Next Steps

After successful migration, the system will automatically:
- Generate embeddings for new questions
- Store them in the `question_embedding` column
- Use them for semantic search

To backfill existing questions, run:

```bash
tsx scripts/backfill-embeddings.ts
```
