-- Al-Alamiah Barbershop schema for Supabase.
-- This script is additive for existing installations; it does not drop booking data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'barber', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read their own role" ON public.user_roles;
CREATE POLICY "Users read their own role"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE OR REPLACE FUNCTION public.has_app_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role = required_role
    );
$$;

REVOKE ALL ON FUNCTION public.has_app_role(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_app_role(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.assign_customer_app_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_customer_app_role ON auth.users;
CREATE TRIGGER assign_customer_app_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_customer_app_role();

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_name_unique
    ON public.services (name);

CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    phone VARCHAR(35),
    address TEXT,
    map_url TEXT,
    working_hours JSONB NOT NULL DEFAULT '{
        "start": "09:30",
        "end": "22:00",
        "lunch_start": "13:30",
        "lunch_end": "14:30",
        "days_off": [0]
    }'::jsonb,
    buffer_minutes INT NOT NULL DEFAULT 10 CHECK (buffer_minutes BETWEEN 0 AND 180),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.barbers
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(35),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS map_url TEXT,
    ADD COLUMN IF NOT EXISTS buffer_minutes INT NOT NULL DEFAULT 10;

CREATE UNIQUE INDEX IF NOT EXISTS idx_barbers_auth_user_id
    ON public.barbers (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT auth_user_id, 'barber'
FROM public.barbers
WHERE auth_user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'customer'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.barbers
    DROP CONSTRAINT IF EXISTS barbers_buffer_minutes_check;
ALTER TABLE public.barbers
    ADD CONSTRAINT barbers_buffer_minutes_check
    CHECK (buffer_minutes BETWEEN 0 AND 180);

CREATE TABLE IF NOT EXISTS public.barber_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    price_override NUMERIC(10, 2) CHECK (price_override >= 0),
    duration_override_minutes INT CHECK (duration_override_minutes > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE (barber_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(35) NOT NULL DEFAULT '+905550102030',
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    appointment_datetime TIMESTAMPTZ NOT NULL,
    appointment_end TIMESTAMPTZ,
    duration_minutes INT,
    price_at_booking NUMERIC(10, 2),
    buffer_minutes INT NOT NULL DEFAULT 10 CHECK (buffer_minutes BETWEEN 0 AND 180),
    status VARCHAR(25) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.appointments
    ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS appointment_end TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS duration_minutes INT,
    ADD COLUMN IF NOT EXISTS price_at_booking NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS buffer_minutes INT NOT NULL DEFAULT 10;

ALTER TABLE public.appointments
    DROP CONSTRAINT IF EXISTS appointments_buffer_minutes_check;
ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_buffer_minutes_check
    CHECK (buffer_minutes BETWEEN 0 AND 180);

ALTER TABLE public.appointments
    DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_status_check
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show'));

UPDATE public.appointments AS appointment
SET
    duration_minutes = COALESCE(appointment.duration_minutes, service.duration_minutes),
    price_at_booking = COALESCE(appointment.price_at_booking, service.price),
    appointment_end = COALESCE(
        appointment.appointment_end,
        appointment.appointment_datetime
            + make_interval(mins => COALESCE(appointment.duration_minutes, service.duration_minutes))
    )
FROM public.services AS service
WHERE service.id = appointment.service_id
  AND (appointment.appointment_end IS NULL OR appointment.duration_minutes IS NULL OR appointment.price_at_booking IS NULL);

CREATE INDEX IF NOT EXISTS idx_appointments_search
    ON public.appointments (barber_id, appointment_datetime, status);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_visits
    ON public.appointments (customer_id, status, appointment_datetime);
CREATE INDEX IF NOT EXISTS idx_barber_services_catalog
    ON public.barber_services (barber_id, is_active, service_id);

-- Populate the catalog association for existing barbers without overwriting custom settings.
INSERT INTO public.barber_services (barber_id, service_id)
SELECT barber.id, service.id
FROM public.barbers AS barber
CROSS JOIN public.services AS service
ON CONFLICT (barber_id, service_id) DO NOTHING;

-- Store price, duration, and buffer at booking time so later price edits do not rewrite history.
CREATE OR REPLACE FUNCTION public.set_appointment_booking_values()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
    selected_duration INT;
    selected_price NUMERIC(10, 2);
    selected_buffer INT;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.barber_services AS barber_service
        WHERE barber_service.barber_id = NEW.barber_id
          AND barber_service.service_id = NEW.service_id
          AND barber_service.is_active = FALSE
    ) THEN
        RAISE EXCEPTION 'The selected service is unavailable for this barber';
    END IF;

    SELECT
        COALESCE(barber_service.duration_override_minutes, service.duration_minutes),
        COALESCE(barber_service.price_override, service.price)
    INTO selected_duration, selected_price
    FROM public.services AS service
    LEFT JOIN public.barber_services AS barber_service
        ON barber_service.service_id = service.id
       AND barber_service.barber_id = NEW.barber_id
       AND barber_service.is_active = TRUE
    WHERE service.id = NEW.service_id;

    IF selected_duration IS NULL OR selected_price IS NULL THEN
        RAISE EXCEPTION 'The selected service is unavailable for this barber';
    END IF;

    SELECT buffer_minutes
    INTO selected_buffer
    FROM public.barbers
    WHERE id = NEW.barber_id;

    IF selected_buffer IS NULL THEN
        RAISE EXCEPTION 'The selected barber does not exist';
    END IF;

    NEW.duration_minutes := selected_duration;
    NEW.price_at_booking := selected_price;
    NEW.buffer_minutes := selected_buffer;
    NEW.appointment_end := NEW.appointment_datetime + make_interval(mins => selected_duration);
    NEW.customer_id := COALESCE(NEW.customer_id, auth.uid());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointments_set_booking_values ON public.appointments;
CREATE TRIGGER appointments_set_booking_values
BEFORE INSERT OR UPDATE OF barber_id, service_id, appointment_datetime
ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.set_appointment_booking_values();

-- The range includes the barber's buffer after the service and prevents overlapping inserts atomically.
ALTER TABLE public.appointments
    DROP CONSTRAINT IF EXISTS appointments_no_overlapping_bookings;
ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_no_overlapping_bookings
    EXCLUDE USING gist (
        barber_id WITH =,
        tstzrange(
            appointment_datetime,
            appointment_end + make_interval(mins => buffer_minutes),
            '[)'
        ) WITH &&
    )
    WHERE (status <> 'cancelled' AND appointment_end IS NOT NULL);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to services" ON public.services;
CREATE POLICY "Services are publicly readable"
ON public.services FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public read access to barbers" ON public.barbers;
CREATE POLICY "Barbers are publicly readable"
ON public.barbers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Barbers can create their own profile" ON public.barbers;
DROP POLICY IF EXISTS "Admins manage barber profiles" ON public.barbers;
CREATE POLICY "Admins manage barber profiles"
ON public.barbers FOR ALL TO authenticated
USING (public.has_app_role('admin'))
WITH CHECK (public.has_app_role('admin'));

DROP POLICY IF EXISTS "Barbers can update their own profile" ON public.barbers;
CREATE POLICY "Barbers can update their own profile"
ON public.barbers FOR UPDATE TO authenticated
USING (auth.uid() = auth_user_id AND public.has_app_role('barber'))
WITH CHECK (auth.uid() = auth_user_id AND public.has_app_role('barber'));

DROP POLICY IF EXISTS "Barber service catalog is publicly readable" ON public.barber_services;
CREATE POLICY "Barber service catalog is publicly readable"
ON public.barber_services FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Barbers manage their own service catalog" ON public.barber_services;
CREATE POLICY "Barbers manage their own service catalog"
ON public.barber_services FOR ALL TO authenticated
USING (
    public.has_app_role('admin')
    OR EXISTS (
        SELECT 1 FROM public.barbers AS barber
        WHERE barber.id = barber_services.barber_id
          AND barber.auth_user_id = auth.uid()
          AND public.has_app_role('barber')
    )
)
WITH CHECK (
    public.has_app_role('admin')
    OR EXISTS (
        SELECT 1 FROM public.barbers AS barber
        WHERE barber.id = barber_services.barber_id
          AND barber.auth_user_id = auth.uid()
          AND public.has_app_role('barber')
    )
);

DROP POLICY IF EXISTS "Allow public read access to active appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public insert of appointments" ON public.appointments;
DROP POLICY IF EXISTS "Customers read their appointments" ON public.appointments;
CREATE POLICY "Customers read their appointments"
ON public.appointments FOR SELECT TO authenticated
USING (
    customer_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.barbers AS barber
        WHERE barber.id = appointments.barber_id
          AND barber.auth_user_id = auth.uid()
          AND public.has_app_role('barber')
    )
);

DROP POLICY IF EXISTS "Authenticated customers create their own appointments" ON public.appointments;
CREATE POLICY "Authenticated customers create their own appointments"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() AND public.has_app_role('customer'));

DROP POLICY IF EXISTS "Barbers update their own appointments" ON public.appointments;
CREATE POLICY "Barbers update their own appointments"
ON public.appointments FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.barbers AS barber
        WHERE barber.id = appointments.barber_id
          AND barber.auth_user_id = auth.uid()
          AND public.has_app_role('barber')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.barbers AS barber
        WHERE barber.id = appointments.barber_id
          AND barber.auth_user_id = auth.uid()
          AND public.has_app_role('barber')
    )
);

-- Return slot occupancy only; anonymous clients cannot read customer names, email, or phone.
CREATE OR REPLACE FUNCTION public.get_barber_busy_windows(
    p_barber_id UUID,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ
)
RETURNS TABLE (starts_at TIMESTAMPTZ, busy_until TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT
        appointment.appointment_datetime,
        appointment.appointment_end + make_interval(mins => appointment.buffer_minutes)
    FROM public.appointments AS appointment
    WHERE appointment.barber_id = p_barber_id
      AND appointment.status <> 'cancelled'
      AND appointment.appointment_datetime < p_end
      AND appointment.appointment_end + make_interval(mins => appointment.buffer_minutes) > p_start;
$$;

GRANT EXECUTE ON FUNCTION public.get_barber_busy_windows(UUID, TIMESTAMPTZ, TIMESTAMPTZ)
TO anon, authenticated;

-- Waitlist is ready for future availability matching and customer notifications.
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    requested_from TIMESTAMPTZ NOT NULL,
    requested_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting'
        CHECK (status IN ('waiting', 'notified', 'booked', 'expired', 'cancelled')),
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CHECK (requested_until > requested_from)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_matching
    ON public.waitlist_entries (barber_id, service_id, status, requested_from, requested_until);
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers read their waitlist entries" ON public.waitlist_entries;
CREATE POLICY "Customers read their waitlist entries"
ON public.waitlist_entries FOR SELECT TO authenticated
USING (
    customer_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.barbers AS barber
        WHERE barber.id = waitlist_entries.barber_id
          AND barber.auth_user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Customers manage their waitlist entries" ON public.waitlist_entries;
CREATE POLICY "Customers manage their waitlist entries"
ON public.waitlist_entries FOR ALL TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

-- Count completed appointments by customer_id to award loyalty points when enabled.

INSERT INTO public.services (name, duration_minutes, price) VALUES
    ('Classic Gentleman Cut', 45, 50.00),
    ('Signature Beard Sculpt & Hot Towel', 30, 35.00),
    ('The Executive: Haircut & Royal Shave', 75, 85.00),
    ('Head Shave & Scalp Treatment', 45, 45.00)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.barbers (name, working_hours)
SELECT seed.name, seed.working_hours
FROM (VALUES
    ('Marcus "Blade" Vance', '{
        "start": "09:30",
        "end": "22:00",
        "lunch_start": "13:00",
        "lunch_end": "14:00",
        "days_off": [0]
    }'::jsonb),
    ('Julian Sterling', '{
        "start": "09:30",
        "end": "22:00",
        "lunch_start": "15:00",
        "lunch_end": "16:00",
        "days_off": [1]
    }'::jsonb)
) AS seed(name, working_hours)
WHERE NOT EXISTS (
    SELECT 1 FROM public.barbers AS existing WHERE existing.name = seed.name
);

INSERT INTO public.barber_services (barber_id, service_id)
SELECT barber.id, service.id
FROM public.barbers AS barber
CROSS JOIN public.services AS service
ON CONFLICT (barber_id, service_id) DO NOTHING;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'appointments'
    ) = FALSE THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments';
    END IF;
END
$$;
