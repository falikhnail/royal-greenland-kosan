import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const TABLE_LABELS: Record<string, string> = {
  rooms: "Kamar",
  tenants: "Penghuni",
  payments: "Pembayaran",
};

const ACTION_LABELS: Record<string, { label: string; icon: typeof Plus }> = {
  INSERT: { label: "ditambahkan", icon: Plus },
  UPDATE: { label: "diperbarui", icon: Pencil },
  DELETE: { label: "dihapus", icon: Trash2 },
};

function getRecordName(tableName: string, data: Record<string, any> | null): string {
  if (!data) return "";
  switch (tableName) {
    case "rooms": return `Kamar ${data.number || ""}`;
    case "tenants": return data.name || "";
    case "payments": return `${data.tenant_name || ""} - ${data.month || ""}`;
    default: return "";
  }
}

export default function RealtimeNotifier() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("activity-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        (payload) => {
          const log = payload.new as Record<string, any>;
          const table = TABLE_LABELS[log.table_name] || log.table_name;
          const action = ACTION_LABELS[log.action] || ACTION_LABELS.UPDATE;
          const name = getRecordName(log.table_name, (log.new_data || log.old_data) as Record<string, any> | null);

          toast.info(`${table} ${action.label}`, {
            description: name || undefined,
            duration: 4000,
          });

          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: [log.table_name] });
          queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
