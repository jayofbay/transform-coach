# Progress Photo Upload — Troubleshooting

If the client app shows **"Progress photo upload failed"**, it is almost always a Supabase configuration issue (not the photo itself).

## Fix (most common) — run this SQL

1. Open **Supabase Dashboard → SQL Editor → New query**
2. Paste and run the full script: [`supabase/storage_setup.sql`](./storage_setup.sql)

That script creates/fixes:

- `progress_photos` table + insert/read RLS policies
- `food_photo_logs` table + policies (if missing)
- `progress-photos` and `food-photos` storage buckets
- Storage RLS policies so **anon** users can upload from the client app

## Also verify deployment env vars (client app on Vercel)

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Redeploy after changing env vars.

## How to read the error toast

After the client-app code fix lands, the toast will say specifically:

| Message contains | Meaning |
|------------------|---------|
| `storage bucket missing` | Run `storage_setup.sql` |
| `blocked by Supabase permissions` / `RLS` | Run `storage_setup.sql` |
| `Database table missing` | Run `storage_setup.sql` |
| `Invalid Supabase API key` | Fix `VITE_SUPABASE_ANON_KEY` on Vercel |
| `Photo file is empty` | Retake the photo (mobile camera glitch) |

## Client app code improvements (pending merge to client-plan)

A fix branch was prepared with:

- Upload preflight check (table + bucket)
- Clearer error messages
- File validation + storage path sanitization
- `upsert: true` on storage uploads

Branch: `cursor/fix-progress-photo-upload-2e5c` on `jayofbay/client-plan` (needs push access to merge).
