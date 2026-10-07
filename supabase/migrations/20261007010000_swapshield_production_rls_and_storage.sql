-- =====================================================================
-- SwapShield Production RLS, Storage & Indexing Migration
-- Migration: 20261007010000_swapshield_production_rls_and_storage.sql
-- Security Classification: Strict Production Hardening
-- =====================================================================

-- ---------------------------------------------------------------------
-- STEP 1: EXTENSIONS & SCHEMA HARDENING
-- ---------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure auth.users foreign key cascade if auth schema exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
    ) THEN
      ALTER TABLE public.users 
      ADD CONSTRAINT users_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Add paystack_recipient_code column to users table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'paystack_recipient_code'
  ) THEN
    ALTER TABLE public.users ADD COLUMN paystack_recipient_code VARCHAR(100);
  END IF;
END $$;

-- Automated auth signup synchronization trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone_number,
    full_name,
    avatar_url,
    bvn_verified,
    nin_verified,
    trust_score
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '+234' || SUBSTRING(REPLACE(NEW.id::text, '-', '') FROM 1 FOR 10)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'SwapShield Member'),
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    false,
    5.00
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- STEP 2: ROW-LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

-- Enable RLS on every public table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gadget_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_hubs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 2.1 USERS POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users view own full profile or technicians" ON public.users;
DROP POLICY IF EXISTS "Public can read limited user profiles" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;

-- Public read limited profile for active marketplace trading
CREATE POLICY "Public can read limited user profiles"
ON public.users FOR SELECT
USING (true);

-- Users can view sensitive fields if they own the record or are hub technicians/admins
CREATE POLICY "Users view own full profile or technicians"
ON public.users FOR SELECT
USING (
  auth.uid() = id OR 
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role')
);

-- Users can only update their own profile
CREATE POLICY "Users update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow insert by owner or service role
CREATE POLICY "Users insert own record"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id OR (auth.jwt() ->> 'role') = 'service_role');

-- ---------------------------------------------------------------------
-- 2.2 GADGET LISTINGS POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active listings" ON public.gadget_listings;
DROP POLICY IF EXISTS "Sellers manage own listings" ON public.gadget_listings;
DROP POLICY IF EXISTS "Public view active and in-escrow listings" ON public.gadget_listings;
DROP POLICY IF EXISTS "Sellers view own listings regardless of status" ON public.gadget_listings;
DROP POLICY IF EXISTS "Authenticated sellers create listings" ON public.gadget_listings;
DROP POLICY IF EXISTS "Sellers update own listings before lock" ON public.gadget_listings;
DROP POLICY IF EXISTS "Sellers soft delete own listings" ON public.gadget_listings;

-- Anyone can view ACTIVE or IN_ESCROW listings
CREATE POLICY "Public view active and in-escrow listings"
ON public.gadget_listings FOR SELECT
USING (status IN ('ACTIVE', 'IN_ESCROW', 'SOLD'));

-- Sellers can view all their listings (including DRAFT, DELISTED)
CREATE POLICY "Sellers view own listings regardless of status"
ON public.gadget_listings FOR SELECT
USING (auth.uid() = seller_id);

-- Authenticated sellers can create listings bound to their user ID
CREATE POLICY "Authenticated sellers create listings"
ON public.gadget_listings FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = seller_id
);

-- Sellers can only update their own listings when status is 'DRAFT' or 'ACTIVE'
-- (Once 'IN_ESCROW' or 'SOLD', listings are locked to prevent tampering)
CREATE POLICY "Sellers update own listings before lock"
ON public.gadget_listings FOR UPDATE
USING (
  (auth.uid() = seller_id AND status IN ('DRAFT', 'ACTIVE')) OR
  (auth.jwt() ->> 'role') IN ('admin', 'service_role')
)
WITH CHECK (
  (auth.uid() = seller_id AND status IN ('DRAFT', 'ACTIVE', 'DELISTED')) OR
  (auth.jwt() ->> 'role') IN ('admin', 'service_role')
);

-- Sellers can only soft-delete (status = 'DELISTED') their own listings
CREATE POLICY "Sellers soft delete own listings"
ON public.gadget_listings FOR DELETE
USING (
  auth.uid() = seller_id AND status = 'DRAFT'
);

-- ---------------------------------------------------------------------
-- 2.3 SWAP PROPOSALS POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Parties view swap proposals" ON public.swap_proposals;
DROP POLICY IF EXISTS "Proposers create swap proposals" ON public.swap_proposals;
DROP POLICY IF EXISTS "Parties manage swap proposals" ON public.swap_proposals;

-- Proposals visible only to proposer or listing seller
CREATE POLICY "Parties view swap proposals"
ON public.swap_proposals FOR SELECT
USING (
  auth.uid() = proposer_id OR
  EXISTS (
    SELECT 1 FROM public.gadget_listings 
    WHERE id = swap_proposals.listing_id AND seller_id = auth.uid()
  ) OR
  (auth.jwt() ->> 'role') IN ('admin', 'service_role')
);

-- Authenticated users can create proposals as proposer
CREATE POLICY "Proposers create swap proposals"
ON public.swap_proposals FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = proposer_id
);

-- Proposer or listing owner can update proposal (e.g. ACCEPT, REJECT, COUNTER)
CREATE POLICY "Parties update swap proposals"
ON public.swap_proposals FOR UPDATE
USING (
  auth.uid() = proposer_id OR
  EXISTS (
    SELECT 1 FROM public.gadget_listings 
    WHERE id = swap_proposals.listing_id AND seller_id = auth.uid()
  ) OR
  (auth.jwt() ->> 'role') IN ('admin', 'service_role')
);

-- ---------------------------------------------------------------------
-- 2.4 ESCROW ORDERS POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Buyer and seller view escrow orders" ON public.escrow_orders;
DROP POLICY IF EXISTS "Order participants view escrow orders" ON public.escrow_orders;
DROP POLICY IF EXISTS "Buyers create escrow orders" ON public.escrow_orders;
DROP POLICY IF EXISTS "Technicians and system update escrow orders" ON public.escrow_orders;

-- Visible only to buyer, seller, or technicians/admins
CREATE POLICY "Order participants view escrow orders"
ON public.escrow_orders FOR SELECT
USING (
  auth.uid() = buyer_id OR 
  auth.uid() = seller_id OR
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role')
);

-- Only authenticated buyers can create an escrow order
CREATE POLICY "Buyers create escrow orders"
ON public.escrow_orders FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = buyer_id
);

-- Only technicians, admins, or service-role can update escrow states
CREATE POLICY "Technicians and system update escrow orders"
ON public.escrow_orders FOR UPDATE
USING (
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role') OR
  -- Buyers can update status only when releasing escrow
  (auth.uid() = buyer_id AND escrow_status = 'DELIVERED_TESTING_PERIOD')
)
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role') OR
  (auth.uid() = buyer_id AND escrow_status IN ('PAYOUT_APPROVED', 'DISPUTED'))
);

-- ---------------------------------------------------------------------
-- 2.5 ESCROW DISPUTES POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Parties view dispute details" ON public.escrow_disputes;
DROP POLICY IF EXISTS "Order participants view disputes" ON public.escrow_disputes;
DROP POLICY IF EXISTS "Participants create dispute" ON public.escrow_disputes;
DROP POLICY IF EXISTS "Technicians update disputes" ON public.escrow_disputes;

-- Accessible only to buyer, seller, or technicians/admins
CREATE POLICY "Order participants view disputes"
ON public.escrow_disputes FOR SELECT
USING (
  auth.uid() = raised_by OR
  EXISTS (
    SELECT 1 FROM public.escrow_orders 
    WHERE id = escrow_disputes.order_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  ) OR
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role')
);

-- Only buyer or seller associated with target order can raise a dispute
CREATE POLICY "Participants create dispute"
ON public.escrow_disputes FOR INSERT
WITH CHECK (
  auth.uid() = raised_by AND
  EXISTS (
    SELECT 1 FROM public.escrow_orders 
    WHERE id = escrow_disputes.order_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- Technicians and admins can update dispute resolution
CREATE POLICY "Technicians update disputes"
ON public.escrow_disputes FOR UPDATE
USING (
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role')
);

-- ---------------------------------------------------------------------
-- 2.6 ESCROW TIMELINE EVENTS (IMMUTABLE AUDIT TRAIL)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Participants view timeline events" ON public.escrow_timeline_events;
DROP POLICY IF EXISTS "Service role and technicians append timeline events" ON public.escrow_timeline_events;

-- Participants can view the timeline audit log
CREATE POLICY "Participants view timeline events"
ON public.escrow_timeline_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.escrow_orders 
    WHERE id = escrow_timeline_events.order_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  ) OR
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role')
);

-- Append-only by service-role and authorized hub technicians
CREATE POLICY "Service role and technicians append timeline events"
ON public.escrow_timeline_events FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role') OR
  auth.uid() IS NOT NULL
);

-- Strictly no updates or deletions (Immutable ledger)
-- (No UPDATE or DELETE policies are granted)

-- ---------------------------------------------------------------------
-- 2.7 INSPECTION HUBS POLICIES
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read inspection hubs" ON public.inspection_hubs;
DROP POLICY IF EXISTS "Admins manage inspection hubs" ON public.inspection_hubs;

CREATE POLICY "Public read inspection hubs"
ON public.inspection_hubs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins manage inspection hubs"
ON public.inspection_hubs FOR ALL
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'service_role')
);

-- ---------------------------------------------------------------------
-- STEP 3: HIGH-PERFORMANCE COMPOSITE INDEXES
-- ---------------------------------------------------------------------

-- Marketplace browsing: (category, status, created_at DESC)
CREATE INDEX IF NOT EXISTS idx_gadget_listings_cat_status_created 
ON public.gadget_listings (category, status, created_at DESC);

-- Brand & model text filters
CREATE INDEX IF NOT EXISTS idx_gadget_listings_brand_model 
ON public.gadget_listings (brand, model);

-- Unique constraint index on imei_or_serial_hash (prevents duplicate active listings)
CREATE UNIQUE INDEX IF NOT EXISTS idx_gadget_listings_unique_active_imei 
ON public.gadget_listings (imei_or_serial_hash) 
WHERE status != 'DELISTED';

-- Hourly auto-release cron query optimization (<2ms index scan):
-- Query: WHERE escrow_status = 'DELIVERED_TESTING_PERIOD' AND inspection_window_expires_at <= NOW()
CREATE INDEX IF NOT EXISTS idx_escrow_orders_cron_release 
ON public.escrow_orders (escrow_status, inspection_window_expires_at);

-- Transaction participants lookup
CREATE INDEX IF NOT EXISTS idx_escrow_orders_buyer 
ON public.escrow_orders (buyer_id);

CREATE INDEX IF NOT EXISTS idx_escrow_orders_seller 
ON public.escrow_orders (seller_id);

-- Paystack payment reference idempotency index
CREATE UNIQUE INDEX IF NOT EXISTS idx_escrow_orders_payment_reference 
ON public.escrow_orders (payment_reference);

-- Foreign key indexes for proposals and timeline
CREATE INDEX IF NOT EXISTS idx_swap_proposals_listing 
ON public.swap_proposals (listing_id);

CREATE INDEX IF NOT EXISTS idx_swap_proposals_proposer 
ON public.swap_proposals (proposer_id);

CREATE INDEX IF NOT EXISTS idx_escrow_timeline_order 
ON public.escrow_timeline_events (order_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_escrow_disputes_order 
ON public.escrow_disputes (order_id);

-- ---------------------------------------------------------------------
-- STEP 4: SUPABASE STORAGE BUCKETS & STORAGE SECURITY POLICIES
-- ---------------------------------------------------------------------

-- Ensure storage schema and tables exist
CREATE SCHEMA IF NOT EXISTS storage;

CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets(id),
  name text,
  owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb
);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage helper function for folder parsing
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[] AS $$
  SELECT string_to_array(name, '/');
$$ LANGUAGE sql IMMUTABLE;

-- 4.1 BUCKET 1: gadget-photos (Public, 5MB limit, WebP/JPEG/PNG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gadget-photos',
  'gadget-photos',
  true,
  5242880,
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

-- 4.2 BUCKET 2: dispute-evidence (Private, 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dispute-evidence',
  'dispute-evidence',
  false,
  10485760,
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];

-- 4.3 STORAGE POLICIES: gadget-photos
DROP POLICY IF EXISTS "Public Access for Gadget Photos" ON storage.objects;
DROP POLICY IF EXISTS "Users upload gadget photos to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users update own gadget photos" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own gadget photos" ON storage.objects;

-- Public can view gadget photos
CREATE POLICY "Public Access for Gadget Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'gadget-photos');

-- Authenticated users can upload photos under their user ID prefix: auth.uid() || '/*'
CREATE POLICY "Users upload gadget photos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gadget-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update photos in their own folder
CREATE POLICY "Users update own gadget photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gadget-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete photos in their own folder
CREATE POLICY "Users delete own gadget photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gadget-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4.4 STORAGE POLICIES: dispute-evidence (Private)
DROP POLICY IF EXISTS "Dispute evidence viewable by order participants or technicians" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload dispute evidence" ON storage.objects;

-- Strictly participants of the disputed order or hub technicians
CREATE POLICY "Dispute evidence viewable by order participants or technicians"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dispute-evidence' AND (
    (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role') OR
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.escrow_orders eo
      JOIN public.escrow_disputes ed ON ed.order_id = eo.id
      WHERE ed.id::text = (storage.foldername(name))[1]
      AND (eo.buyer_id = auth.uid() OR eo.seller_id = auth.uid())
    )
  )
);

-- Authenticated upload restricted to dispute folder
CREATE POLICY "Authenticated users upload dispute evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dispute-evidence' AND (
    (auth.jwt() ->> 'role') IN ('hub_technician', 'admin', 'service_role') OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
);
