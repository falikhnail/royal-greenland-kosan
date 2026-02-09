import { DoorOpen, Users, CreditCard, AlertTriangle, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import RoomStatusBadge from "@/components/RoomStatusBadge";
import { rooms, tenants, payments, formatCurrency } from "@/data/mockData";

const Index = () => {
  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const available = rooms.filter((r) => r.status === "available").length;
  const overdue = payments.filter((p) => p.status === "overdue");
  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Selamat datang di Royal Greenland Management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={DoorOpen} title="Total Kamar" value={rooms.length} subtitle={`${occupied} terisi`} />
        <StatCard icon={DoorOpen} title="Kamar Tersedia" value={available} variant="success" />
        <StatCard icon={Users} title="Total Penghuni" value={tenants.length} subtitle={`${overdue.length} menunggak`} variant="warning" />
        <StatCard icon={TrendingUp} title="Pendapatan Bulan Ini" value={formatCurrency(totalRevenue)} variant="default" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Room Overview */}
        <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Status Kamar</h2>
          <div className="space-y-3">
            {rooms.slice(0, 6).map((room) => (
              <div key={room.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div>
                  <span className="font-medium text-card-foreground">Kamar {room.number}</span>
                  <span className="ml-2 text-xs text-muted-foreground">Lantai {room.floor} · {room.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">{formatCurrency(room.price)}/bln</span>
                  <RoomStatusBadge status={room.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Alerts */}
        <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Pembayaran Terbaru</h2>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  {payment.status === "overdue" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  {payment.status === "pending" && <CreditCard className="h-4 w-4 text-warning" />}
                  {payment.status === "paid" && <CreditCard className="h-4 w-4 text-success" />}
                  <div>
                    <span className="font-medium text-card-foreground">{payment.tenantName}</span>
                    <span className="ml-2 text-xs text-muted-foreground">Kamar {payment.roomNumber}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-card-foreground">{formatCurrency(payment.amount)}</p>
                  <p className={`text-xs font-medium ${
                    payment.status === "paid" ? "text-success" : payment.status === "overdue" ? "text-destructive" : "text-warning"
                  }`}>
                    {payment.status === "paid" ? "Lunas" : payment.status === "overdue" ? "Menunggak" : "Menunggu"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
