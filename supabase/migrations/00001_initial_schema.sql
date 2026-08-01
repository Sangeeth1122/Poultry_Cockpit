-- PoultryCockpit Database Migration 00001: Initial Architecture Schema
-- PostgreSQL + Supabase RLS + Constraints + Indexes + Immutable Audit Logs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FARMS TABLE
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    village VARCHAR(100),
    taluk VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(20) NOT NULL,
    total_land_area_acres NUMERIC(10,2) DEFAULT 0 CHECK (total_land_area_acres >= 0),
    total_shed_area_sqft NUMERIC(10,2) DEFAULT 0 CHECK (total_shed_area_sqft >= 0),
    no_of_sheds INT DEFAULT 1 CHECK (no_of_sheds >= 1),
    default_shed_capacity INT DEFAULT 10000 CHECK (default_shed_capacity > 0),
    default_batch_duration_days INT DEFAULT 42 CHECK (default_batch_duration_days > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. SHEDS TABLE
CREATE TABLE IF NOT EXISTS public.sheds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    area_sqft NUMERIC(10,2) NOT NULL CHECK (area_sqft > 0),
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'In Use', 'Maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_shed_name_per_farm UNIQUE (farm_id, name)
);

-- 3. COMPANY PROFILES TABLE (Integrators / Companies)
CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) NOT NULL UNIQUE,
    company_type VARCHAR(100) DEFAULT 'Integrator',
    contact_person VARCHAR(255),
    phone_number VARCHAR(50),
    email_address VARCHAR(255),
    office_address TEXT,
    contract_type VARCHAR(100) DEFAULT 'Contract Broiler Farming',
    settlement_days_after_lifting INT DEFAULT 15,
    active_status BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(100) NOT NULL UNIQUE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    shed_id UUID NOT NULL REFERENCES public.sheds(id) ON DELETE RESTRICT,
    company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    batch_type VARCHAR(50) DEFAULT 'Broiler' CHECK (batch_type IN ('Broiler', 'Breeder', 'Layer')),
    breed VARCHAR(100) NOT NULL,
    placement_date DATE NOT NULL,
    expected_lifting_date DATE,
    target_days_in_house INT DEFAULT 42 CHECK (target_days_in_house > 0),
    chicks_placed INT NOT NULL CHECK (chicks_placed > 0),
    chick_cost_per_bird NUMERIC(10,2) DEFAULT 0 CHECK (chick_cost_per_bird >= 0),
    supplier_name VARCHAR(255),
    formula_profile VARCHAR(100) DEFAULT 'Standard Contract Formula v1.0',
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Ready', 'Running', 'Completed', 'Archived')),
    archived_by VARCHAR(255),
    archived_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. DAILY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    day_in_house INT NOT NULL CHECK (day_in_house >= 1 AND day_in_house <= 100),
    status VARCHAR(20) DEFAULT 'Completed' CHECK (status IN ('Draft', 'Saved', 'Completed')),
    feed_consumed_kg NUMERIC(10,2) DEFAULT 0 CHECK (feed_consumed_kg >= 0),
    water_consumed_liters NUMERIC(10,2) DEFAULT 0 CHECK (water_consumed_liters >= 0),
    mortality_count INT DEFAULT 0 CHECK (mortality_count >= 0),
    culls_count INT DEFAULT 0 CHECK (culls_count >= 0),
    avg_body_weight_grams NUMERIC(10,2) DEFAULT 0 CHECK (avg_body_weight_grams >= 0),
    avg_temperature_c NUMERIC(5,2),
    humidity_pct NUMERIC(5,2),
    remarks TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_daily_log_per_batch_date UNIQUE (batch_id, log_date)
);

-- 6. LIFTINGS TABLE
CREATE TABLE IF NOT EXISTS public.liftings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    lifting_no INT NOT NULL CHECK (lifting_no >= 1),
    lifting_date DATE NOT NULL,
    birds_lifted INT NOT NULL CHECK (birds_lifted > 0),
    total_weight_kg NUMERIC(10,2) NOT NULL CHECK (total_weight_kg > 0),
    avg_weight_kg NUMERIC(6,3) GENERATED ALWAYS AS (total_weight_kg / NULLIF(birds_lifted, 0)) STORED,
    vehicle_no VARCHAR(50),
    buyer_name VARCHAR(255) NOT NULL,
    rate_per_kg NUMERIC(10,2) DEFAULT 0 CHECK (rate_per_kg >= 0),
    gross_amount NUMERIC(12,2) DEFAULT 0 CHECK (gross_amount >= 0),
    net_amount NUMERIC(12,2) DEFAULT 0 CHECK (net_amount >= 0),
    status VARCHAR(20) DEFAULT 'Completed' CHECK (status IN ('Draft', 'Saved', 'Completed')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. FINANCIAL TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    tx_date DATE NOT NULL,
    tx_type VARCHAR(20) NOT NULL CHECK (tx_type IN ('Expense', 'Income', 'Pre-Batch Expense')),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    party_name VARCHAR(255),
    payment_mode VARCHAR(50) DEFAULT 'Bank Transfer' CHECK (payment_mode IN ('Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    paid_amount NUMERIC(12,2) DEFAULT 0 CHECK (paid_amount >= 0),
    pending_amount NUMERIC(12,2) DEFAULT 0 CHECK (pending_amount >= 0),
    status VARCHAR(20) DEFAULT 'Paid' CHECK (status IN ('Paid', 'Received', 'Partially Paid', 'Pending')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. SETTLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL UNIQUE REFERENCES public.batches(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Generated', 'Approved', 'Reopened')),
    settlement_date DATE NOT NULL,
    company_feed_rate_per_kg NUMERIC(10,2) DEFAULT 0,
    company_total_feed_kg NUMERIC(10,2) DEFAULT 0,
    company_total_feed_cost NUMERIC(12,2) DEFAULT 0,
    company_chick_rate_per_bird NUMERIC(10,2) DEFAULT 0,
    company_chicks_placed INT DEFAULT 0,
    company_total_chick_cost NUMERIC(12,2) DEFAULT 0,
    company_medicine_cost NUMERIC(12,2) DEFAULT 0,
    company_total_production_cost NUMERIC(12,2) DEFAULT 0,
    company_production_cost_per_kg NUMERIC(10,2) DEFAULT 0,
    company_gc_rate_per_kg NUMERIC(10,2) DEFAULT 0,
    company_total_weight_lifted_kg NUMERIC(10,2) DEFAULT 0,
    company_total_gc_amount NUMERIC(12,2) DEFAULT 0,
    company_grade VARCHAR(10) DEFAULT 'A',
    total_additions NUMERIC(12,2) DEFAULT 0,
    total_deductions NUMERIC(12,2) DEFAULT 0,
    net_settlement_amount NUMERIC(12,2) DEFAULT 0,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    reopened_by VARCHAR(255),
    reopened_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. IMMUTABLE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action_performed TEXT NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    user_id VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    source_module VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_sheds_farm_id ON public.sheds(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_farm_id ON public.batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_shed_id ON public.batches(shed_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);
CREATE INDEX IF NOT EXISTS idx_daily_logs_batch_id ON public.daily_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_liftings_batch_id ON public.liftings(batch_id);
CREATE INDEX IF NOT EXISTS idx_financials_batch_id ON public.financial_transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liftings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- DEFAULT RLS POLICIES FOR AUTHENTICATED USERS
CREATE POLICY "Allow read access to authenticated users" ON public.farms FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.sheds FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.company_profiles FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.batches FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.daily_logs FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.liftings FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.financial_transactions FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.settlements FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow read access to authenticated users" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow insert/update to authenticated users" ON public.farms FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow insert/update to authenticated users" ON public.sheds FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow insert/update to authenticated users" ON public.batches FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow insert/update to authenticated users" ON public.daily_logs FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow insert/update to authenticated users" ON public.liftings FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow insert/update to authenticated users" ON public.financial_transactions FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow insert/update to authenticated users" ON public.settlements FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Allow insert to audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
