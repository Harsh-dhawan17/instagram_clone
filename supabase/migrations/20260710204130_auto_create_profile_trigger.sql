/*
# Auto-create profile on signup

1. Purpose
- When a new user registers via Supabase auth, automatically create a profiles row with a default username derived from email.
- Prevents the app from showing a broken state where auth.users has a row but profiles does not.

2. Changes
- New function handle_new_user() that inserts into profiles using the new auth.users id and a sanitized username from the email local part + random suffix.
- Trigger on auth.users AFTER INSERT to call the function.
- SECURITY DEFINER so the trigger can write to profiles even though the inserting role is anon/authenticated.

3. Notes
- Username collisions are avoided by appending a short random suffix.
- Idempotent: uses ON CONFLICT DO NOTHING on the profiles PK.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base text;
  suffix text;
  uname text;
BEGIN
  base := split_part(NEW.email, '@', 1);
  suffix := substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  uname := lower(base || '_' || suffix);
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (NEW.id, uname, base)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();