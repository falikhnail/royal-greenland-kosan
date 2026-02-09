import DashboardLayout from "@/components/DashboardLayout";
import RoomStatusBadge from "@/components/RoomStatusBadge";
import { rooms, tenants, formatCurrency } from "@/data/mockData";

const Rooms = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Daftar Kamar</h1>
        <p className="text-sm text-muted-foreground">Kelola semua kamar di Royal Greenland</p>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Rooms;
