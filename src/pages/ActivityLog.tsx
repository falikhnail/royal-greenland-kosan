import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Plus, Pencil, Trash2 } from "lucide-react";

const TABLE_LABELS: Record<string, string> = {
  rooms: "Kamar",
  tenants: "Penghuni",
  payments: "Pembayaran",
};

const ACTION_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof Plus }> = {
  INSERT: { label: "Tambah", variant: "default", icon: Plus },
  UPDATE: { label: "Ubah", variant: "secondary", icon: Pencil },
  DELETE: { label: "Hapus", variant: "destructive", icon: Trash2 },
};

function getRecordLabel(tableName: string, data: Record<string, any> | null): string {
  if (!data) return "-";
  switch (tableName) {
    case "rooms": return `Kamar ${data.number || "-"}`;
    case "tenants": return data.name || "-";
    case "payments": return `${data.tenant_name || "-"} - ${data.month || ""} ${data.year || ""}`;
    default: return data.id?.slice(0, 8) || "-";
  }
}

function getChangeSummary(action: string, oldData: Record<string, any> | null, newData: Record<string, any> | null): string {
  if (action === "INSERT") return "Data baru ditambahkan";
  if (action === "DELETE") return "Data dihapus";
  if (!oldData || !newData) return "-";

  const ignoredKeys = ["created_at", "id"];
  const changes = Object.keys(newData)
    .filter((k) => !ignoredKeys.includes(k) && JSON.stringify(oldData[k]) !== JSON.stringify(newData[k]))
    .map((k) => k.replace(/_/g, " "));

  return changes.length > 0 ? `Perubahan: ${changes.join(", ")}` : "Tidak ada perubahan";
}

const ActivityLog = () => {
  const [tableFilter, setTableFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity-logs", tableFilter],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (tableFilter !== "all") {
        query = query.eq("table_name", tableFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Log Aktivitas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Riwayat semua perubahan data dalam sistem
            </p>
          </div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter tabel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="rooms">Kamar</SelectItem>
              <SelectItem value="tenants">Penghuni</SelectItem>
              <SelectItem value="payments">Pembayaran</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Waktu</TableHead>
                  <TableHead className="w-28">Tabel</TableHead>
                  <TableHead className="w-28">Aksi</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Detail Perubahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Memuat...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada log aktivitas
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.INSERT;
                    const Icon = config.icon;
                    const oldData = log.old_data as Record<string, any> | null;
                    const newData = log.new_data as Record<string, any> | null;

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TABLE_LABELS[log.table_name] || log.table_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getRecordLabel(log.table_name, newData || oldData)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {getChangeSummary(log.action, oldData, newData)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLog;
