
CREATE TABLE public.reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  tenant_name text NOT NULL DEFAULT '',
  room_number text NOT NULL DEFAULT '',
  month_number integer NOT NULL DEFAULT 1,
  year integer NOT NULL DEFAULT 2025,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  method text NOT NULL DEFAULT 'whatsapp'
);

ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage reminder_logs"
  ON public.reminder_logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
