import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useStore } from "@/hooks/useStore";
import { formatCurrency } from "@/data/mockData";

const statusLabel: Record<string, { text: string; className: string }> = {
  paid: { text: "Lunas", className: "bg-success/15 text-success border-success/20" },
  pending: { text: "Menunggu", className: "bg-warning/15 text-warning border-warning/20" },
  overdue: { text: "Menunggak", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

const Payments = () => {
  const { payments, updatePaymentStatus } = useStore();

  const markAsPaid = (id: string) => {
    updatePaymentStatus(id, "paid", new Date().toISOString().split("T")[0]);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Pembayaran</h1>
        <p className="text-sm text-muted-foreground">Riwayat dan status pembayaran penghuni</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Penghuni</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kamar</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Periode</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanggal Bayar</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => {
              const s = statusLabel[p.status];
              return (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-card-foreground">{p.tenantName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.roomNumber}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.month}</td>
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
                    {p.status !== "paid" && (
                      <Button variant="outline" size="sm" onClick={() => markAsPaid(p.id)}>
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Tandai Lunas
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
