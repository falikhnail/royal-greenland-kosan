import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Payment {
  id: string;
  tenant_id: string | null;
  tenant_name: string;
  room_number: string;
  amount: number;
  date: string | null;
  status: string;
  month: string;
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, date }: { id: string; status: string; date?: string }) => {
      const { error } = await supabase.from("payments").update({ status, date: date ?? null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Status pembayaran diperbarui");
    },
    onError: () => toast.error("Gagal memperbarui pembayaran"),
  });
}
