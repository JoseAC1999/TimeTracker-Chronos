begin;

-- This project uses Prisma from the backend with the `postgres` role and
-- does not rely on the Supabase client API. Lock down `public` so `anon`
-- and `authenticated` cannot access app tables directly through PostgREST.

alter table "public"."Workspace" enable row level security;
alter table "public"."User" enable row level security;
alter table "public"."UserSetting" enable row level security;
alter table "public"."Project" enable row level security;
alter table "public"."Task" enable row level security;
alter table "public"."Tag" enable row level security;
alter table "public"."TaskTag" enable row level security;
alter table "public"."TimeEntry" enable row level security;
alter table "public"."TimeEntryTag" enable row level security;
alter table "public"."Account" enable row level security;
alter table "public"."Session" enable row level security;
alter table "public"."AuditLog" enable row level security;
alter table "public"."RateLimitBucket" enable row level security;
alter table "public"."VerificationToken" enable row level security;

drop policy if exists "deny_all_api_access" on "public"."Workspace";
drop policy if exists "deny_all_api_access" on "public"."User";
drop policy if exists "deny_all_api_access" on "public"."UserSetting";
drop policy if exists "deny_all_api_access" on "public"."Project";
drop policy if exists "deny_all_api_access" on "public"."Task";
drop policy if exists "deny_all_api_access" on "public"."Tag";
drop policy if exists "deny_all_api_access" on "public"."TaskTag";
drop policy if exists "deny_all_api_access" on "public"."TimeEntry";
drop policy if exists "deny_all_api_access" on "public"."TimeEntryTag";
drop policy if exists "deny_all_api_access" on "public"."Account";
drop policy if exists "deny_all_api_access" on "public"."Session";
drop policy if exists "deny_all_api_access" on "public"."AuditLog";
drop policy if exists "deny_all_api_access" on "public"."RateLimitBucket";
drop policy if exists "deny_all_api_access" on "public"."VerificationToken";

create policy "deny_all_api_access" on "public"."Workspace" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."User" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."UserSetting" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."Project" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."Task" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."Tag" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."TaskTag" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."TimeEntry" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."TimeEntryTag" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."Account" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."Session" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."AuditLog" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."RateLimitBucket" as restrictive for all to anon, authenticated using (false) with check (false);
create policy "deny_all_api_access" on "public"."VerificationToken" as restrictive for all to anon, authenticated using (false) with check (false);

revoke usage on schema public from public, anon, authenticated;

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke all privileges on all routines in schema public from anon, authenticated;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on routines from anon, authenticated;

commit;
