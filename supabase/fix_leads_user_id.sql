-- Migration to allow anonymous (guest) lead submissions
ALTER TABLE public.leads ALTER COLUMN user_id DROP NOT NULL;
