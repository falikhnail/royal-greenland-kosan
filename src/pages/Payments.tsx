import { useState } from "react";
import { CheckCircle, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { usePayments, useUpdatePaymentStatus, useGenerateMonthlyPayments, getWhatsAppBillingUrl } from "@/hooks/usePayments";
import { formatCurrency } from "@/data/mockData";

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const statusLabel: Record<string, { text: string; className: string }> = {
  paid: { text: "Lunas", className: "bg-success/15 text-success border-success/20" },
  pending: { text: "Menunggu", className: "bg-warning/15 text-warning border-warning/20" },
  overdue: { text: "Menunggak", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

const Payments = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const { data: allPayments = [] } = usePayments();
  const updateStatus = useUpdatePaymentStatus();
  const generatePayments = useGenerateMonthlyPayments();

  const month = parseInt(selectedMonth);
  const year = parseInt(selectedYear);

  const payments = allPayments.filter(
    (p) => p.month_number === month && p.year === year
  );

  const markAsPaid = (id: string) => {
    updateStatus.mutate({ id, status: "paid", date: new Date().toISOString().split("T")[0] });
  };

  const handleGenerate = () => {
    generatePayments.mutate({ month, year });
  };

  const sendBilling = (p: typeof payments[0]) => {
    const url = getWhatsAppBillingUrl(p.tenant_name, p.tenant_name, p.room_number, p.amount, p.month);
    // We need the phone from tenant — let's use a workaround with tenant_name in URL
    // Actually we need the real phone. Let's look it up.
    window.open(url, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Tagihan dan status pembayaran per bulan</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.slice(1).map((name, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={generatePayments.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" /> Generate Tagihan
          </Button>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
          <p className="text-muted-foreground mb-4">Belum ada tagihan untuk {MONTH_NAMES[month]} {year}</p>
          <Button onClick={handleGenerate} disabled={generatePayments.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" /> Generate Tagihan Bulan Ini
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Penghuni</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kamar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal Bayar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => {
                const s = statusLabel[p.status] ?? statusLabel.pending;
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-card-foreground">{p.tenant_name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.room_number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-card-foreground">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {p.date ? new Date(p.date).toLocaleDateString("id-ID") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
                        {s.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.status !== "paid" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => markAsPaid(p.id)}>
                              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Lunas
                            </Button>
                            <WhatsAppButton paymentId={p.tenant_id} tenantName={p.tenant_name} roomNumber={p.room_number} amount={p.amount} month={p.month} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

// Separate component to fetch tenant phone for WhatsApp
import { useTenants } from "@/hooks/useTenants";

function WhatsAppButton({ paymentId, tenantName, roomNumber, amount, month }: {
  paymentId: string | null;
  tenantName: string;
  roomNumber: string;
  amount: number;
  month: string;
}) {
  const { data: tenants = [] } = useTenants();
  const tenant = tenants.find((t) => t.id === paymentId);
  if (!tenant) return null;

  const url = getWhatsAppBillingUrl(tenant.phone, tenantName, roomNumber, amount, month);

  return (
    <Button variant="outline" size="sm" className="text-success hover:text-success" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Tagih via WA
      </a>
    </Button>
  );
}

export default Payments;
