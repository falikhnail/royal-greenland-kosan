import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  price: number;
  status: string;
  tenant_id: string | null;
}

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("number");
      if (error) throw error;
      return data as Room[];
    },
  });
}

export function useAddRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (room: Omit<Room, "id">) => {
      const { error } = await supabase.from("rooms").insert(room);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); toast.success("Kamar berhasil ditambahkan"); },
    onError: () => toast.error("Gagal menambahkan kamar"),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Room> & { id: string }) => {
      const { error } = await supabase.from("rooms").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); toast.success("Kamar berhasil diperbarui"); },
    onError: () => toast.error("Gagal memperbarui kamar"),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); toast.success("Kamar berhasil dihapus"); },
    onError: () => toast.error("Gagal menghapus kamar"),
  });
}
