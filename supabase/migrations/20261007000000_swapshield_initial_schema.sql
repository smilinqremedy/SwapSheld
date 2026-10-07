-- =====================================================================
-- SwapShield Production PostgreSQL DDL Migration
-- Version: 20261007_000000_swapshield_initial_schema.sql
-- Description: Core tables, enums, constraints, RLS policies, and triggers
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up existing types if re-running
DO $$ BEGIN
    CREATE TYPE gadget_category AS ENUM ('SMARTPHONE', 'LAPTOP', 'TABLET', 'ACCESSORY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE screen_status_type AS ENUM ('ORIGINAL', 'REPLACED_OEM', 'REPLACED_AFTERMARKET', 'CRACKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE biometric_status_type AS ENUM ('WORKING', 'FAULTY', 'NOT_APPLICABLE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE icloud_mdm_status_type AS ENUM ('CLEAN_UNLOCKED', 'BYPASSED_FLAGGED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE physical_grade_type AS ENUM ('MINT_GRADE_A', 'GOOD_GRADE_B', 'FAIR_GRADE_C');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE listing_status_type AS ENUM ('DRAFT', 'ACTIVE', 'IN_ESCROW', 'SOLD', 'DELISTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE proposal_status_type AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE escrow_order_type AS ENUM ('OUTRIGHT_PURCHASE', 'DEVICE_SWAP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status_type AS ENUM (
        'AWAITING_PAYMENT', 
        'FUNDS_LOCKED', 
        'IN_TRANSIT_TO_BUYER', 
        'DELIVERED_TESTING_PERIOD', 
        'DISPUTED', 
        'PAYOUT_APPROVED', 
        'REFUNDED', 
        'COMPLETED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE dispute_reason_type AS ENUM (
        'BATTERY_MISMATCH', 
        'ICLOUD_LOCKED', 
        'AFTERMARKET_SCREEN_UNDISCLOSED', 
        'PHYSICAL_DAMAGE', 
        'NON_DELIVERY'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE dispute_resolution_type AS ENUM (
        'OPEN', 
        'UNDER_REVIEW', 
        'REFUND_BUYER', 
        'RELEASE_TO_SELLER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE delivery_mode_type AS ENUM ('DIRECT_COURIER', 'HUB_VERIFICATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------------------------------------------------------------------
-- 1. USERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    bvn_verified BOOLEAN NOT NULL DEFAULT FALSE,
    nin_verified BOOLEAN NOT NULL DEFAULT FALSE,
    trust_score NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (trust_score >= 0.00 AND trust_score <= 5.00),
    bank_account_number VARCHAR(20),
    bank_code VARCHAR(10),
    bank_name VARCHAR(100),
    recipient_code VARCHAR(100), -- Paystack transfer recipient code
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. INSPECTION HUBS (Partner drop-off / verification centers)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    agent_name VARCHAR(150) NOT NULL,
    agent_phone VARCHAR(30) NOT NULL,
    operating_hours VARCHAR(100) NOT NULL DEFAULT 'Mon-Sat: 9:00 AM - 6:00 PM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. GADGET LISTINGS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gadget_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category gadget_category NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    storage_capacity VARCHAR(50) NOT NULL, -- e.g. '128GB', '256GB', '512GB', '1TB'
    ram VARCHAR(50),                      -- e.g. '8GB', '16GB', '32GB'
    color VARCHAR(50) NOT NULL,
    imei_or_serial_hash TEXT NOT NULL,    -- SHA-256 hashed until deal is in escrow
    battery_health_percentage INTEGER NOT NULL CHECK (battery_health_percentage BETWEEN 0 AND 100),
    battery_cycle_count INTEGER CHECK (battery_cycle_count >= 0),
    screen_status screen_status_type NOT NULL DEFAULT 'ORIGINAL',
    face_id_or_biometrics biometric_status_type NOT NULL DEFAULT 'WORKING',
    icloud_or_mdm_status icloud_mdm_status_type NOT NULL DEFAULT 'CLEAN_UNLOCKED',
    physical_condition physical_grade_type NOT NULL DEFAULT 'MINT_GRADE_A',
    cash_price NUMERIC(12, 2) NOT NULL CHECK (cash_price >= 0),
    is_swap_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    accepted_swap_models TEXT[] DEFAULT '{}',
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    diagnostic_report_notes TEXT,
    diagnostic_score INTEGER DEFAULT 95 CHECK (diagnostic_score BETWEEN 0 AND 100),
    status listing_status_type NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. SWAP PROPOSALS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS swap_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES gadget_listings(id) ON DELETE CASCADE,
    proposer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offered_device_id UUID NOT NULL REFERENCES gadget_listings(id) ON DELETE CASCADE,
    proposed_cash_topup NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- positive = proposer adds cash; negative = target seller adds cash
    status proposal_status_type NOT NULL DEFAULT 'PENDING',
    proposer_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. ESCROW ORDERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escrow_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_type escrow_order_type NOT NULL DEFAULT 'OUTRIGHT_PURCHASE',
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    listing_id UUID NOT NULL REFERENCES gadget_listings(id),
    swap_proposal_id UUID REFERENCES swap_proposals(id) ON DELETE SET NULL,
    delivery_mode delivery_mode_type NOT NULL DEFAULT 'DIRECT_COURIER',
    hub_id UUID REFERENCES inspection_hubs(id) ON DELETE SET NULL,
    total_escrow_amount NUMERIC(12, 2) NOT NULL CHECK (total_escrow_amount >= 0),
    platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- 5% fee
    inspection_fee NUMERIC(12, 2) NOT NULL DEFAULT 3500.00,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 4000.00,
    payment_reference VARCHAR(150) NOT NULL UNIQUE,
    paystack_access_code VARCHAR(150),
    escrow_status escrow_status_type NOT NULL DEFAULT 'AWAITING_PAYMENT',
    delivery_tracking_number VARCHAR(100),
    courier_partner VARCHAR(100) DEFAULT 'GIG Logistics',
    inspection_window_expires_at TIMESTAMPTZ, -- Set to NOW() + 48 HOURS upon delivery confirmation
    dispute_frozen_at TIMESTAMPTZ,
    payout_transferred_at TIMESTAMPTZ,
    payout_reference VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6. ESCROW DISPUTES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escrow_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES escrow_orders(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL REFERENCES users(id),
    dispute_reason dispute_reason_type NOT NULL,
    detailed_description TEXT NOT NULL,
    proof_media_urls TEXT[] NOT NULL DEFAULT '{}',
    resolution_status dispute_resolution_type NOT NULL DEFAULT 'OPEN',
    return_waybill_tracking VARCHAR(100),
    return_hub_id UUID REFERENCES inspection_hubs(id) ON DELETE SET NULL,
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. AUDIT LOGS / ESCROW TIMELINE EVENTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escrow_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES escrow_orders(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_gadget_listings_seller ON gadget_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_gadget_listings_status ON gadget_listings(status);
CREATE INDEX IF NOT EXISTS idx_gadget_listings_category ON gadget_listings(category);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_listing ON swap_proposals(listing_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_proposer ON swap_proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_buyer ON escrow_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_seller ON escrow_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_ref ON escrow_orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_status ON escrow_orders(escrow_status);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_inspection_expires ON escrow_orders(inspection_window_expires_at)
    WHERE escrow_status = 'DELIVERED_TESTING_PERIOD';
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_order ON escrow_disputes(order_id);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gadget_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_hubs ENABLE ROW LEVEL SECURITY;

-- Inspection hubs are publicly readable
CREATE POLICY "Public read inspection hubs"
    ON inspection_hubs FOR SELECT
    USING (is_active = true);

-- Users can read public profile data
CREATE POLICY "Public can view user profiles"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Listings: Everyone can view ACTIVE or IN_ESCROW listings
CREATE POLICY "Public can view active listings"
    ON gadget_listings FOR SELECT
    USING (status IN ('ACTIVE', 'IN_ESCROW', 'SOLD'));

CREATE POLICY "Sellers manage own listings"
    ON gadget_listings FOR ALL
    USING (auth.uid() = seller_id);

-- Proposals: Proposers and listing sellers can view
CREATE POLICY "Parties view swap proposals"
    ON swap_proposals FOR SELECT
    USING (
        auth.uid() = proposer_id OR 
        auth.uid() IN (SELECT seller_id FROM gadget_listings WHERE id = swap_proposals.listing_id)
    );

CREATE POLICY "Proposers create swap proposals"
    ON swap_proposals FOR INSERT
    WITH CHECK (auth.uid() = proposer_id);

-- Escrow Orders: Only buyer, seller, and admin can view
CREATE POLICY "Buyer and seller view escrow orders"
    ON escrow_orders FOR SELECT
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Disputes: Buyer or seller of order can view
CREATE POLICY "Parties view dispute details"
    ON escrow_disputes FOR SELECT
    USING (
        auth.uid() = raised_by OR 
        auth.uid() IN (SELECT seller_id FROM escrow_orders WHERE id = escrow_disputes.order_id) OR
        auth.uid() IN (SELECT buyer_id FROM escrow_orders WHERE id = escrow_disputes.order_id)
    );

-- ---------------------------------------------------------------------
-- AUTOMATIC TIMESTAMPS TRIGGER
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_gadget_listings_updated_at BEFORE UPDATE ON gadget_listings FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_swap_proposals_updated_at BEFORE UPDATE ON swap_proposals FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_escrow_orders_updated_at BEFORE UPDATE ON escrow_orders FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_escrow_disputes_updated_at BEFORE UPDATE ON escrow_disputes FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
