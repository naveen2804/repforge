-- One-off export for the Supabase -> Firebase migration.
-- Paste into the Supabase SQL editor and run. It returns a single cell holding every
-- account (with its bcrypt password hash, so passwords carry over) and every row.
-- Treat the output like a password file: it never goes into the repo.
select json_build_object(
  'users', (select coalesce(json_agg(json_build_object(
      'id', u.id, 'email', u.email, 'password_hash', u.encrypted_password,
      'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at)), '[]')
    from auth.users u),
  'profiles',          (select coalesce(json_agg(p), '[]') from profiles p),
  'workout_sessions',  (select coalesce(json_agg(w), '[]') from workout_sessions w),
  'session_exercises', (select coalesce(json_agg(e), '[]') from session_exercises e),
  'sets',              (select coalesce(json_agg(s), '[]') from sets s),
  'favorites',         (select coalesce(json_agg(f), '[]') from favorites f),
  'custom_templates',  (select coalesce(json_agg(c), '[]') from custom_templates c)
) as export;
