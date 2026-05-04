-- 1. Create user_credits table (Safe if exists)
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  balance INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- 3. Policy: User can view own credits
-- First drop to avoid "policy already exists" error
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Function to insert credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (new.id, 100);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_credits();

-- 6. Backfill existing users (This gives YOU credits)
INSERT INTO public.user_credits (user_id, balance)
SELECT id, 1000 FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET balance = user_credits.balance + 1000;
