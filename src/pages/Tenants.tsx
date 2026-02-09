import { useState } from "react";
import { Phone, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import TenantDialog from "@/components/TenantDialog";
import DeleteConfirm from "@/components/DeleteConfirm";
import { useStore } from "@/hooks/useStore";
import { Tenant } from "@/data/mockData";
import { formatCurrency } from "@/data/mockData";

const Tenants = () => {
  const { tenants, rooms, addTenant, updateTenant, deleteTenant } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const availableRooms = rooms.filter((r) => r.status === "available");

  const handleSave = (data: Omit<Tenant, "id">) => {
    if (editTenant) {
      updateTenant(editTenant.id, data);
    } else {
      addTenant(data);
    }
    setEditTenant(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Penghuni</h1>
          <p className="text-sm text-muted-foreground">Informasi seluruh penghuni kosan</p>
        </div>
        <Button onClick={() => { setEditTenant(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Penghuni
        </Button>
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
              <div className="flex items-center gap-1">
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

            <div className="mt-4 flex gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditTenant(tenant); setDialogOpen(true); }}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(tenant.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <TenantDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditTenant(null); }}
        onSave={handleSave}
        tenant={editTenant}
        availableRooms={availableRooms}
      />

      <DeleteConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteTenant(deleteId); setDeleteId(null); } }}
        title="Hapus Penghuni"
        description="Apakah Anda yakin ingin menghapus penghuni ini? Kamar akan kembali ke status tersedia."
      />
    </DashboardLayout>
  );
};

export default Tenants;
