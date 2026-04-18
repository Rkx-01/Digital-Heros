-- ============================================================
-- CHARITY DRAW GOLF PLATFORM - FULL DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CHARITIES TABLE
-- ============================================================
CREATE TABLE public.charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  total_donated NUMERIC(10,2) DEFAULT 0,
  upcoming_events TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  charity_contribution_pct NUMERIC(5,2) DEFAULT 10.00 CHECK (charity_contribution_pct >= 10 AND charity_contribution_pct <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'gbp',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCORES TABLE
-- ============================================================
CREATE TABLE public.scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Index for performance
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_scores_date ON public.scores(date);

-- ============================================================
-- DRAWS TABLE
-- ============================================================
CREATE TABLE public.draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,
  draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
  prize_pool NUMERIC(10,2) DEFAULT 0,
  jackpot_amount NUMERIC(10,2) DEFAULT 0,
  tier2_amount NUMERIC(10,2) DEFAULT 0,
  tier3_amount NUMERIC(10,2) DEFAULT 0,
  rollover_amount NUMERIC(10,2) DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  simulation_data JSONB DEFAULT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_draws_status ON public.draws(status);
CREATE INDEX idx_draws_draw_date ON public.draws(draw_date);

-- ============================================================
-- DRAW WINNERS TABLE
-- ============================================================
CREATE TABLE public.draw_winners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),  -- 1=jackpot, 2=4match, 3=3match
  matched_numbers INTEGER[],
  prize_amount NUMERIC(10,2) DEFAULT 0,
  proof_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_draw_winners_draw_id ON public.draw_winners(draw_id);
CREATE INDEX idx_draw_winners_user_id ON public.draw_winners(user_id);

-- ============================================================
-- PRIZE POOL TABLE
-- ============================================================
CREATE TABLE public.prize_pool (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount_contributed NUMERIC(10,2) NOT NULL,
  draw_id UUID REFERENCES public.draws(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER CHARITY PREFERENCES TABLE
-- ============================================================
CREATE TABLE public.user_charity_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  charity_contribution_pct NUMERIC(5,2) DEFAULT 10.00 CHECK (charity_contribution_pct >= 10 AND charity_contribution_pct <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHARITY TRANSACTIONS TABLE (Tracking all impact)
-- ============================================================
CREATE TABLE public.charity_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription_split', 'one_off_donation')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_charity_transactions_user_id ON public.charity_transactions(user_id);
CREATE INDEX idx_charity_transactions_charity_id ON public.charity_transactions(charity_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Preferences
CREATE POLICY "Users can view own preferences" ON public.user_charity_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_charity_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Preferences are insertable by owner" ON public.user_charity_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own charity transactions" ON public.charity_transactions FOR SELECT USING (auth.uid() = user_id);

-- Charities (public read)
CREATE POLICY "Charities are viewable by all" ON public.charities FOR SELECT USING (true);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Scores
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Draws (public read when published)
CREATE POLICY "Published draws are viewable by all authenticated" ON public.draws FOR SELECT USING (auth.role() = 'authenticated' AND status = 'published');

-- Draw Winners
CREATE POLICY "Users can view own winnings" ON public.draw_winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own proof" ON public.draw_winners FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Also initialize charity preferences
  INSERT INTO public.user_charity_preferences (user_id, charity_id, charity_contribution_pct)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'charity_id')::UUID,
    COALESCE((NEW.raw_user_meta_data->>'charity_contribution_pct')::NUMERIC, 10.00)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- UPDATE TIMESTAMP FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_scores_updated_at BEFORE UPDATE ON public.scores FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_draws_updated_at BEFORE UPDATE ON public.draws FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_draw_winners_updated_at BEFORE UPDATE ON public.draw_winners FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_charity_preferences_updated_at BEFORE UPDATE ON public.user_charity_preferences FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- ATOMIC INCREMENT FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_charity_total(charity_id_input UUID, amount_input NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.charities
  SET total_donated = total_donated + amount_input,
      updated_at = NOW()
  WHERE id = charity_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
