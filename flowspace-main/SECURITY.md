# LumenOS Security Checklist

This project is currently a static front-end app backed by Supabase. The front-end
can improve input hygiene and browser hardening, but the real security boundary
must be Supabase policies or a server/API layer.

## Applied in the app

- Auth form input validation and local brute-force cooldown.
- Generic auth errors for failed login/signup, so the UI does not enumerate users.
- Client payload sanitization before writing profile, dashboard, friends, images,
  tasks, notes, theme, and gamification data to Supabase.
- No `innerHTML`, `dangerouslySetInnerHTML`, `eval`, or `new Function` usage found.
- The Supabase key in the browser is the public anon key only. Never expose a
  `service_role` key in this repo.
- Security headers for Vercel are configured in `vercel.json`.

## Required Supabase RLS

Run this in the Supabase SQL editor and keep RLS enabled:

```sql
create table if not exists public.profiles_public (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  photo text,
  updated_at timestamptz default now()
);

alter table public.profiles_public enable row level security;

drop policy if exists "profiles_public_read_authenticated" on public.profiles_public;
drop policy if exists "profiles_public_insert_own" on public.profiles_public;
drop policy if exists "profiles_public_update_own" on public.profiles_public;

create policy "profiles_public_read_authenticated"
on public.profiles_public
for select
to authenticated
using (true);

create policy "profiles_public_insert_own"
on public.profiles_public
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "profiles_public_update_own"
on public.profiles_public
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table public.user_data enable row level security;

drop policy if exists "user_data_select_own_or_friend" on public.user_data;
drop policy if exists "user_data_insert_own" on public.user_data;
drop policy if exists "user_data_update_own" on public.user_data;
drop policy if exists "user_data_delete_own" on public.user_data;

create policy "user_data_select_own_or_friend"
on public.user_data
for select
to authenticated
using (
  auth.uid() = user_id
  or friends @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
);

create policy "user_data_insert_own"
on public.user_data
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_data_update_own"
on public.user_data
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_data_delete_own"
on public.user_data
for delete
to authenticated
using (auth.uid() = user_id);

alter table public.sessions enable row level security;

drop policy if exists "sessions_select_participants" on public.sessions;
drop policy if exists "sessions_insert_host" on public.sessions;
drop policy if exists "sessions_update_participants" on public.sessions;

create policy "sessions_select_participants"
on public.sessions
for select
to authenticated
using (auth.uid() = host_id or auth.uid() = friend_id);

create policy "sessions_insert_host"
on public.sessions
for insert
to authenticated
with check (auth.uid() = host_id);

create policy "sessions_update_participants"
on public.sessions
for update
to authenticated
using (auth.uid() = host_id or auth.uid() = friend_id)
with check (auth.uid() = host_id or auth.uid() = friend_id);
```

This keeps private dashboard data readable only by the owner or by accepted
friends. Public discovery moves to `profiles_public`, so email search does not
require broad reads on `user_data`.

If your `friends` column is `json` and not `jsonb`, convert it first:

```sql
alter table public.user_data
alter column friends type jsonb
using friends::jsonb;
```

## Server/API items not present in this static app

These cannot be correctly implemented in `index.html`:

- bcrypt password hashing: Supabase Auth handles password storage.
- custom JWT 15 min and httpOnly cookies: requires a server/BFF.
- Helmet.js and Zod middleware: requires a Node/Express/Next API.
- Stripe webhook HMAC: requires a server endpoint; never verify webhooks in the browser.
- AI system/user prompt isolation and token quotas: requires a server endpoint.
- `service_role`: must exist only in server environment variables, never in browser code.

Recommended next architecture when adding a backend:

1. Put all privileged Supabase operations behind server routes.
2. Store `SUPABASE_SERVICE_ROLE_KEY`, Stripe secrets, and AI keys only server-side.
3. Validate every request with Zod.
4. Use httpOnly, SameSite=Lax/Secure cookies for server sessions.
5. Apply rate limits per IP and per user on auth-sensitive routes.
6. Return generic public errors and log detailed errors server-side only.
