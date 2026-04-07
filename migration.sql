-- 1. Create Enums (Rule 1: Enums first)
CREATE TYPE public.property_type AS ENUM ('Appartement', 'Villa', 'Studio', 'Chambre', 'Duplex', 'Maison');
CREATE TYPE public.commune AS ENUM ('Ratoma', 'Matam', 'Kaloum', 'Matoto', 'Dixinn');
CREATE TYPE public.furnished_type AS ENUM ('Meublé', 'Semi-meublé', 'Vide');
CREATE TYPE public.water_supply AS ENUM ('SEEG fiable', 'SEEG intermittente', 'Puits', 'Citerne');
CREATE TYPE public.electricity_type AS ENUM ('EDG fiable', 'EDG intermittente', 'Groupe seul', 'Solaire');
CREATE TYPE public.currency AS ENUM ('GNF', 'USD');
CREATE TYPE public.user_role AS ENUM ('TENANT', 'OWNER', 'AGENCY');
CREATE TYPE public.property_condition AS ENUM ('Neuf', 'Bon état', 'À rénover');

-- 2. Create Tables
-- Table: public.users (Syncing with auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar VARCHAR(500),
  role public.user_role NOT NULL DEFAULT 'TENANT',
  commune public.commune,
  budget DECIMAL(12, 2),
  budget_currency public.currency DEFAULT 'GNF',
  profession VARCHAR(255),
  household_size INTEGER,
  completion_percent INTEGER DEFAULT 0 NOT NULL,
  push_token VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  verification_documents TEXT[],
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table: public.properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type public.property_type NOT NULL,
  commune public.commune NOT NULL,
  quartier VARCHAR(255) NOT NULL,
  repere VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  surface_m2 DECIMAL(8, 2),
  total_rooms INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  floor INTEGER,
  furnished public.furnished_type NOT NULL,
  condition public.property_condition NOT NULL,
  water_supply public.water_supply NOT NULL,
  electricity_type public.electricity_type NOT NULL,
  has_generator BOOLEAN NOT NULL DEFAULT FALSE,
  generator_included BOOLEAN NOT NULL DEFAULT FALSE,
  has_ac BOOLEAN NOT NULL DEFAULT FALSE,
  ac_count INTEGER,
  has_parking BOOLEAN NOT NULL DEFAULT FALSE,
  has_security BOOLEAN NOT NULL DEFAULT FALSE,
  has_internet BOOLEAN NOT NULL DEFAULT FALSE,
  has_hot_water BOOLEAN NOT NULL DEFAULT FALSE,
  accessible_in_rain BOOLEAN NOT NULL DEFAULT FALSE,
  price_gnf DECIMAL(12, 2) NOT NULL,
  price_usd DECIMAL(12, 2),
  preferred_currency public.currency NOT NULL DEFAULT 'GNF',
  charges_included BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_months INTEGER NOT NULL DEFAULT 1,
  advance_months INTEGER NOT NULL DEFAULT 1,
  negotiable BOOLEAN NOT NULL DEFAULT FALSE,
  pets_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  smoking_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  max_occupants INTEGER,
  available_from TIMESTAMPTZ NOT NULL,
  min_duration_months INTEGER NOT NULL DEFAULT 6,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_documents TEXT[],
  description TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  lead_count INTEGER NOT NULL DEFAULT 0,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table: public.property_images
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt VARCHAR(255),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table: public.favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, property_id)
);

-- Table: public.leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'NEW',
  level VARCHAR(20) NOT NULL DEFAULT 'COLD',
  contact_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table: public.visits
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration INTEGER DEFAULT 30,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table: public.reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  response TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Indexes
CREATE INDEX users_phone_idx ON public.users(phone);
CREATE INDEX users_email_idx ON public.users(email);
CREATE INDEX users_commune_idx ON public.users(commune);
CREATE INDEX properties_title_idx ON public.properties(title);
CREATE INDEX properties_commune_idx ON public.properties(commune);
CREATE INDEX properties_type_idx ON public.properties(type);
CREATE INDEX properties_price_idx ON public.properties(price_gnf);
CREATE INDEX properties_owner_idx ON public.properties(owner_id);
CREATE INDEX properties_available_idx ON public.properties(is_available);
CREATE INDEX property_images_property_idx ON public.property_images(property_id);
CREATE INDEX leads_property_idx ON public.leads(property_id);
CREATE INDEX leads_user_idx ON public.leads(user_id);

-- 4. RLS - Row Level Security (Rule 2: RLS mandatory)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
CREATE POLICY "Users can read their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for public.properties
CREATE POLICY "Properties are viewable by everyone" ON public.properties
  FOR SELECT USING (TRUE);
CREATE POLICY "Owners can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('OWNER', 'AGENCY')
    )
  );
CREATE POLICY "Owners can update their own properties" ON public.properties
  FOR UPDATE USING (
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('OWNER', 'AGENCY')
    )
  );
CREATE POLICY "Owners can delete their own properties" ON public.properties
  FOR DELETE USING (
    auth.uid() = owner_id 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('OWNER', 'AGENCY')
    )
  );

-- Policies for public.property_images
CREATE POLICY "Images are viewable by everyone" ON public.property_images
  FOR SELECT USING (TRUE);
CREATE POLICY "Owners can manage images of their properties" ON public.property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_images.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

-- Policies for public.favorites
CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Policies for public.leads
CREATE POLICY "Anyone can insert a lead" ON public.leads
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Property owners can read leads for their properties" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = leads.property_id 
      AND properties.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users can read their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for public.visits
CREATE POLICY "Users involved in a visit can read it" ON public.visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      JOIN public.properties ON properties.id = leads.property_id
      WHERE leads.id = visits.lead_id
      AND (leads.user_id = auth.uid() OR properties.owner_id = auth.uid())
    )
  );

-- Policies for public.reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- 5. Sync Auth/Public (Rule 3: PG Trigger)
-- This trigger automatically inserts a row into public.users when a user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, phone, email, role, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.phone, ''),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'TENANT'::public.user_role),
    new.raw_user_meta_data->>'avatar'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Storage Policies (Bucket: property-images)
-- Note: Buckets are created via dashboard or CLI. Policies are applied here.
-- Assuming bucket 'property-images' exists.
/*
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated Upload Access" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');
*/
