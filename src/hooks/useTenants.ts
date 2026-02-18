import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  room_id: string | null;
  room_number: string;
  move_in_date: string;
  due_day: number;
  monthly_rent: number;
  status: string;
}

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").order("name");
      if (error) throw error;
      return data as Tenant[];
    },
  });
}

export function useAddTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tenant: Omit<Tenant, "id">) => {
      const { data, error } = await supabase.from("tenants").insert(tenant).select().single();
      if (error) throw error;
      if (tenant.room_id) {
        await supabase.from("rooms").update({ status: "occupied", tenant_id: data.id }).eq("id", tenant.room_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Penghuni berhasil ditambahkan");
    },
    onError: () => toast.error("Gagal menambahkan penghuni"),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tenant> & { id: string }) => {
      const { error } = await supabase.from("tenants").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Penghuni berhasil diperbarui");
    },
    onError: () => toast.error("Gagal memperbarui penghuni"),
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roomId }: { id: string; roomId: string | null }) => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
      if (roomId) {
        await supabase.from("rooms").update({ status: "available", tenant_id: null }).eq("id", roomId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Penghuni berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus penghuni"),
  });
}
