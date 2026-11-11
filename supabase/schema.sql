-- =========================================================================
-- AL-ALAMIAH BARBERSHOP (العالمية للحلاقة / Uluslararası Berber)
-- Database Schema for Supabase PostgreSQL
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SERVICES TABLE
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.barbers CASCADE;

CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. BARBERS TABLE
CREATE TABLE public.barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    working_hours JSONB NOT NULL DEFAULT '{
        "start": "09:00",
        "end": "20:00",
        "lunch_start": "13:30",
        "lunch_end": "14:30",
        "days_off": [0]
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(35) NOT NULL DEFAULT '+905550102030',
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    appointment_datetime TIMESTAMPTZ NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. ATOMIC DOUBLE-BOOKING PREVENTION
-- Partial Unique Index: Ensures no overlapping start time for the same barber unless cancelled
CREATE UNIQUE INDEX idx_barber_slot_unique 
ON public.appointments (barber_id, appointment_datetime)
WHERE status != 'cancelled';

CREATE INDEX idx_appointments_search 
ON public.appointments (barber_id, appointment_datetime, status);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to services" 
ON public.services FOR SELECT USING (true);

CREATE POLICY "Allow public read access to barbers" 
ON public.barbers FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active appointments" 
ON public.appointments FOR SELECT USING (true);

CREATE POLICY "Allow public insert of appointments" 
ON public.appointments FOR INSERT WITH CHECK (true);

-- 6. SEED DATA FOR AL-ALAMIAH BARBERSHOP
INSERT INTO public.services (name, duration_minutes, price) VALUES
('Classic Gentleman Cut', 45, 50.00),
('Signature Beard Sculpt & Hot Towel', 30, 35.00),
('The Executive: Haircut & Royal Shave', 75, 85.00),
('Head Shave & Scalp Treatment', 45, 45.00);

INSERT INTO public.barbers (name, working_hours) VALUES
('Marcus "Blade" Vance', '{
    "start": "09:00",
    "end": "19:00",
    "lunch_start": "13:00",
    "lunch_end": "14:00",
    "days_off": [0]
}'::jsonb),
('Julian Sterling', '{
    "start": "11:00",
    "end": "21:00",
    "lunch_start": "15:00",
    "lunch_end": "16:00",
    "days_off": [1]
}'::jsonb);
