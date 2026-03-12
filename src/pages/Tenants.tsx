import { useState } from "react";
import { Phone, Plus, Pencil, Trash2, MessageCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import TenantDialog from "@/components/TenantDialog";
import DeleteConfirm from "@/components/DeleteConfirm";
import { useRooms } from "@/hooks/useRooms";
import { useTenants, useAddTenant, useUpdateTenant, useDeleteTenant, Tenant } from "@/hooks/useTenants";
import { formatCurrency } from "@/data/mockData";
import { exportToCSV } from "@/lib/exportCSV";

const Tenants = () => {
  const { data: tenants = [] } = useTenants();
  const { data: rooms = [] } = useRooms();
  const addTenant = useAddTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; roomId: string | null } | null>(null);

  const availableRooms = rooms.filter((r) => r.status === "available");

  const handleSave = (data: Omit<Tenant, "id">) => {
    if (editTenant) {
      updateTenant.mutate({ id: editTenant.id, ...data });
    } else {
      addTenant.mutate(data);
    }
    setEditTenant(null);
  };

  const openWhatsApp = (tenant: Tenant) => {
    const cleanPhone = tenant.phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
    const url = `https://wa.me/${cleanPhone}`;
    window.open(url, "_blank");
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
                <p className="text-sm text-muted-foreground">Kamar {tenant.room_number}</p>
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
              <button
                onClick={() => openWhatsApp(tenant)}
                className="flex items-center gap-2 text-muted-foreground hover:text-success transition-colors cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="underline underline-offset-2">{tenant.phone}</span>
              </button>
              <div className="flex justify-between text-muted-foreground">
                <span>Sewa/bulan</span>
                <span className="font-medium text-card-foreground">{formatCurrency(tenant.monthly_rent)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tanggal Masuk</span>
                <span>{new Date(tenant.move_in_date).toLocaleDateString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Jatuh Tempo</span>
                <span>Setiap tanggal {tenant.due_day}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditTenant(tenant); setDialogOpen(true); }}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ id: tenant.id, roomId: tenant.room_id })}>
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
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { deleteTenant.mutate(deleteTarget); setDeleteTarget(null); } }}
        title="Hapus Penghuni"
        description="Apakah Anda yakin ingin menghapus penghuni ini? Kamar akan kembali ke status tersedia."
      />
    </DashboardLayout>
  );
};

export default Tenants;
