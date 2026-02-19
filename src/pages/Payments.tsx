import { useState } from "react";
import { CheckCircle, MessageCircle, RefreshCw, AlertTriangle, Clock, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { usePayments, useUpdatePaymentStatus, useGenerateMonthlyPayments, getWhatsAppBillingUrl } from "@/hooks/usePayments";
import { useTenants } from "@/hooks/useTenants";
import { formatCurrency } from "@/data/mockData";

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const statusConfig: Record<string, { text: string; className: string; icon: typeof CheckCircle }> = {
  paid: { text: "Lunas", className: "bg-success/15 text-success border-success/20", icon: CheckCircle },
  pending: { text: "Menunggu", className: "bg-warning/15 text-warning border-warning/20", icon: Clock },
  overdue: { text: "Menunggak", className: "bg-destructive/15 text-destructive border-destructive/20", icon: AlertTriangle },
};

const Payments = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: allPayments = [] } = usePayments();
  const { data: tenants = [] } = useTenants();
  const updateStatus = useUpdatePaymentStatus();
  const generatePayments = useGenerateMonthlyPayments();

  const month = parseInt(selectedMonth);
  const year = parseInt(selectedYear);

  const payments = allPayments
    .filter((p) => p.month_number === month && p.year === year)
    .filter((p) => statusFilter === "all" || p.status === statusFilter);

  const allMonthPayments = allPayments.filter((p) => p.month_number === month && p.year === year);
  const paidCount = allMonthPayments.filter((p) => p.status === "paid").length;
  const pendingCount = allMonthPayments.filter((p) => p.status === "pending").length;
  const overdueCount = allMonthPayments.filter((p) => p.status === "overdue").length;
  const totalAmount = allMonthPayments.reduce((s, p) => s + p.amount, 0);
  const paidAmount = allMonthPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  const markAsPaid = (id: string) => {
    updateStatus.mutate({ id, status: "paid", date: new Date().toISOString().split("T")[0] });
  };

  const handleGenerate = () => {
    generatePayments.mutate({ month, year });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Overview tagihan per kamar per bulan</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.slice(1).map((name, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={generatePayments.isPending} size="sm">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Generate
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        <SummaryCard label="Total Tagihan" value={formatCurrency(totalAmount)} sub={`${allMonthPayments.length} kamar`} icon={CircleDollarSign} variant="default" />
        <SummaryCard label="Sudah Lunas" value={formatCurrency(paidAmount)} sub={`${paidCount} kamar`} icon={CheckCircle} variant="success" />
        <SummaryCard label="Menunggu" value={`${pendingCount}`} sub="kamar" icon={Clock} variant="warning" />
        <SummaryCard label="Menunggak" value={`${overdueCount}`} sub="kamar" icon={AlertTriangle} variant="destructive" />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: "all", label: "Semua", count: allMonthPayments.length },
          { key: "paid", label: "Lunas", count: paidCount },
          { key: "pending", label: "Menunggu", count: pendingCount },
          { key: "overdue", label: "Menunggak", count: overdueCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
          <p className="text-muted-foreground mb-4">
            {allMonthPayments.length === 0
              ? `Belum ada tagihan untuk ${MONTH_NAMES[month]} ${year}`
              : "Tidak ada tagihan dengan filter ini"}
          </p>
          {allMonthPayments.length === 0 && (
            <Button onClick={handleGenerate} disabled={generatePayments.isPending} size="sm">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Generate Tagihan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {payments.map((p) => {
            const s = statusConfig[p.status] ?? statusConfig.pending;
            const StatusIcon = s.icon;
            const isOverdue = p.status === "overdue";

            return (
              <div
                key={p.id}
                className={`glass-card rounded-xl p-4 transition-all hover:shadow-md ${
                  isOverdue ? "ring-1 ring-destructive/30" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-card-foreground">Kamar {p.room_number}</p>
                    <p className="text-xs text-muted-foreground">{p.tenant_name}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {s.text}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-lg font-bold text-card-foreground">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.date ? `Bayar: ${new Date(p.date).toLocaleDateString("id-ID")}` : "Belum bayar"}
                  </p>
                </div>

                {p.status !== "paid" && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => markAsPaid(p.id)}>
                      <CheckCircle className="mr-1 h-3 w-3" /> Lunas
                    </Button>
                    <WhatsAppButton tenantId={p.tenant_id} tenantName={p.tenant_name} roomNumber={p.room_number} amount={p.amount} month={p.month} tenants={tenants} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

function SummaryCard({ label, value, sub, icon: Icon, variant }: {
  label: string; value: string; sub: string; icon: typeof CheckCircle;
  variant: "default" | "success" | "warning" | "destructive";
}) {
  const colors = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="glass-card rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <div className={`rounded-md p-1.5 ${colors[variant]}`}><Icon className="h-3.5 w-3.5" /></div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-bold text-card-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function WhatsAppButton({ tenantId, tenantName, roomNumber, amount, month, tenants }: {
  tenantId: string | null; tenantName: string; roomNumber: string; amount: number; month: string;
  tenants: { id: string; phone: string }[];
}) {
  const tenant = tenants.find((t) => t.id === tenantId);
  if (!tenant) return null;
  const url = getWhatsAppBillingUrl(tenant.phone, tenantName, roomNumber, amount, month);
  return (
    <Button variant="outline" size="sm" className="flex-1 text-xs text-success hover:text-success" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-1 h-3 w-3" /> WA
      </a>
    </Button>
  );
}

export default Payments;
