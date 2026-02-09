import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import RoomStatusBadge from "@/components/RoomStatusBadge";
import RoomDialog from "@/components/RoomDialog";
import DeleteConfirm from "@/components/DeleteConfirm";
import { useStore } from "@/hooks/useStore";
import { Room } from "@/data/mockData";
import { formatCurrency } from "@/data/mockData";

const Rooms = () => {
  const { rooms, tenants, addRoom, updateRoom, deleteRoom } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (data: Omit<Room, "id">) => {
    if (editRoom) {
      updateRoom(editRoom.id, data);
    } else {
      addRoom(data);
    }
    setEditRoom(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Kamar</h1>
          <p className="text-sm text-muted-foreground">Kelola semua kamar di Royal Greenland</p>
        </div>
        <Button onClick={() => { setEditRoom(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kamar
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kamar</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lantai</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Harga/Bulan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Penghuni</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rooms.map((room) => {
              const tenant = tenants.find((t) => t.id === room.tenantId);
              return (
                <tr key={room.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-card-foreground">{room.number}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Lantai {room.floor}</td>
                  <td className="px-6 py-4 text-sm text-card-foreground">{room.type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-card-foreground">{formatCurrency(room.price)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{tenant?.name ?? "—"}</td>
                  <td className="px-6 py-4"><RoomStatusBadge status={room.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditRoom(room); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(room.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <RoomDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditRoom(null); }}
        onSave={handleSave}
        room={editRoom}
      />

      <DeleteConfirm
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteRoom(deleteId); setDeleteId(null); } }}
        title="Hapus Kamar"
        description="Apakah Anda yakin ingin menghapus kamar ini? Tindakan ini tidak dapat dibatalkan."
      />
    </DashboardLayout>
  );
};

export default Rooms;
