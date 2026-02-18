
-- Update tenants: remove check_out, rename check_in to move_in_date
ALTER TABLE public.tenants DROP COLUMN IF EXISTS check_out;
ALTER TABLE public.tenants RENAME COLUMN check_in TO move_in_date;

-- Add due_day column (extracted from move_in_date, day of month payment is due)
ALTER TABLE public.tenants ADD COLUMN due_day INTEGER NOT NULL DEFAULT 1;

-- Set due_day from existing move_in_date data
UPDATE public.tenants SET due_day = EXTRACT(DAY FROM move_in_date);

-- Update payments: add year column for better tracking
ALTER TABLE public.payments ADD COLUMN year INTEGER NOT NULL DEFAULT 2025;
ALTER TABLE public.payments ADD COLUMN month_number INTEGER NOT NULL DEFAULT 1;

-- Update existing payment months
UPDATE public.payments SET month_number = 2, year = 2025 WHERE month = 'Februari 2025';
