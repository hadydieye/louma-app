-- Migration to resolve 'Inconnu' issue when viewing property details.
-- The previous RLS policy prevented unauthenticated or non-owner users from reading the users table.

DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;

CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (TRUE);
