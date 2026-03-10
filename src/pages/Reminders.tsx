import { useState } from "react";
import { Bell, MessageCircle, CheckCircle, Clock, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useTenants } from "@/hooks/useTenants";
import {
  useReminderLogs,
  useLogReminder,
  getTenantsNearDueDate,
  getReminderWhatsAppUrl,
} from "@/hooks/useReminders";
import { formatCurrency } from "@/data/mockData";
import { toast } from "sonner";

const DAYS_OPTIONS = [1, 2, 3, 5, 7];

const Reminders = () => {
  const { data: tenants = [] } = useTenants();
  const [daysBefore, setDaysBefore] = useState(3);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: logs = [] } = useReminderLogs(currentMonth, currentYear);
  const logReminder = useLogReminder();

  const nearDueTenants = getTenantsNearDueDate(tenants, daysBefore);

  const isAlreadySent = (tenantId: string) =>
    logs.some((l) => l.tenant_id === tenantId);

  const handleSendReminder = (tenant: (typeof tenants)[0]) => {
    const url = getReminderWhatsAppUrl(
      tenant.phone,
      tenant.name,
      tenant.room_number,
      tenant.monthly_rent,
      tenant.due_day
    );
    window.open(url, "_blank");

    logReminder.mutate(
      {
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        room_number: tenant.room_number,
        month_number: currentMonth,
        year: currentYear,
        method: "whatsapp",
      },
      {
        onSuccess: () => toast.success(`Pengingat terkirim ke ${tenant.name}`),
      }
    );
  };

  const handleSendAll = () => {
    const unsent = nearDueTenants.filter((t) => !isAlreadySent(t.id));
    if (unsent.length === 0) {
      toast.info("Semua pengingat sudah terkirim bulan ini");
      return;
    }
    unsent.forEach((t, i) => {
      setTimeout(() => handleSendReminder(t), i * 1500);
    });
  };

  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const dueDate = new Date(currentYear, currentMonth - 1, dueDay);
    if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-warning" />
            Pengingat Jatuh Tempo
          </h1>
          <p className="text-sm text-muted-foreground">
            Kirim notifikasi WhatsApp kepada penghuni yang mendekati tanggal jatuh tempo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(daysBefore)} onValueChange={(v) => setDaysBefore(Number(v))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OPTIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  H-{d} jatuh tempo
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {nearDueTenants.length > 0 && (
            <Button onClick={handleSendAll} className="gap-2">
              <Send className="h-4 w-4" />
              Kirim Semua
            </Button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-warning/15 p-2.5">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">{nearDueTenants.length}</p>
            <p className="text-xs text-muted-foreground">Mendekati Jatuh Tempo</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-success/15 p-2.5">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">
              {nearDueTenants.filter((t) => isAlreadySent(t.id)).length}
            </p>
            <p className="text-xs text-muted-foreground">Sudah Diingatkan</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2.5">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-card-foreground">
              {nearDueTenants.filter((t) => !isAlreadySent(t.id)).length}
            </p>
            <p className="text-xs text-muted-foreground">Belum Diingatkan</p>
          </div>
        </div>
      </div>

      {/* Tenant list */}
      {nearDueTenants.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success/50 mb-3" />
          <h3 className="text-lg font-semibold text-card-foreground">Tidak ada penghuni mendekati jatuh tempo</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Semua penghuni masih jauh dari tanggal jatuh tempo (H-{daysBefore})
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nearDueTenants.map((tenant, i) => {
            const daysLeft = getDaysUntilDue(tenant.due_day);
            const sent = isAlreadySent(tenant.id);

            return (
              <div
                key={tenant.id}
                className="glass-card rounded-xl p-5 animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-card-foreground">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">Kamar {tenant.room_number}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      daysLeft <= 1
                        ? "bg-destructive/15 text-destructive border-destructive/20"
                        : daysLeft <= 3
                        ? "bg-warning/15 text-warning border-warning/20"
                        : "bg-primary/15 text-primary border-primary/20"
                    }`}
                  >
                    {daysLeft === 0 ? "Hari ini" : `H-${daysLeft}`}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Jatuh Tempo</span>
                    <span className="font-medium text-card-foreground">Tanggal {tenant.due_day}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sewa/bulan</span>
                    <span className="font-medium text-card-foreground">
                      {formatCurrency(tenant.monthly_rent)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{tenant.phone}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  {sent ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span>Pengingat sudah terkirim</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSendReminder(tenant)}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <MessageCircle className="h-4 w-4 text-success" />
                      Kirim Pengingat WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder history */}
      {logs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Riwayat Pengingat Bulan Ini</h2>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Penghuni</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kamar</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Metode</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Waktu Kirim</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-card-foreground">{log.tenant_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.room_number}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-success">
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(log.sent_at).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reminders;
