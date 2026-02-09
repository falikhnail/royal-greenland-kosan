import { Phone } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { tenants, formatCurrency } from "@/data/mockData";

const Tenants = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Daftar Penghuni</h1>
        <p className="text-sm text-muted-foreground">Informasi seluruh penghuni kosan</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant, i) => (
          <div
            key={tenant.id}
            className="glass-card rounded-xl p-5 animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-card-foreground">{tenant.name}</h3>
                <p className="text-sm text-muted-foreground">Kamar {tenant.roomNumber}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  tenant.status === "active"
                    ? "bg-success/15 text-success border-success/20"
                    : "bg-destructive/15 text-destructive border-destructive/20"
                }`}
              >
                {tenant.status === "active" ? "Aktif" : "Menunggak"}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {tenant.phone}
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Sewa/bulan</span>
                <span className="font-medium text-card-foreground">{formatCurrency(tenant.monthlyRent)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Check-in</span>
                <span>{new Date(tenant.checkIn).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Check-out</span>
                <span>{new Date(tenant.checkOut).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Tenants;
