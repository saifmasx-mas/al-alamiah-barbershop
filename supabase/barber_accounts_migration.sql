ALTER TABLE public.barbers
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(35),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS map_url TEXT;

ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_barbers_auth_user_id
    ON public.barbers (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

ALTER TABLE public.barbers
    ALTER COLUMN working_hours SET DEFAULT '{
        "start": "09:30",
        "end": "22:00",
        "lunch_start": "13:30",
        "lunch_end": "14:30",
        "days_off": [0]
    }'::jsonb;

UPDATE public.barbers
SET working_hours = jsonb_set(
    jsonb_set(COALESCE(working_hours, '{}'::jsonb), '{start}', '"09:30"'::jsonb),
    '{end}',
    '"22:00"'::jsonb
);

DROP POLICY IF EXISTS "Barbers can create their own profile" ON public.barbers;
CREATE POLICY "Barbers can create their own profile"
ON public.barbers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Barbers can update their own profile" ON public.barbers;
CREATE POLICY "Barbers can update their own profile"
ON public.barbers FOR UPDATE TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);
