ALTER TABLE public.payments DROP CONSTRAINT payments_tenant_id_fkey;
ALTER TABLE public.payments ADD CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;

ALTER TABLE public.reminder_logs DROP CONSTRAINT reminder_logs_tenant_id_fkey;
ALTER TABLE public.reminder_logs ADD CONSTRAINT reminder_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;