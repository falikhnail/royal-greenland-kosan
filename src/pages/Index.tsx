import { useState } from "react";
import { DoorOpen, Users, TrendingUp, AlertTriangle, CreditCard, CheckCircle, Clock, CircleDollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import RoomStatusBadge from "@/components/RoomStatusBadge";
import RevenueChart from "@/components/RevenueChart";
import OccupancyChart from "@/components/OccupancyChart";
import { useRooms } from "@/hooks/useRooms";
import { useTenants } from "@/hooks/useTenants";
import { usePayments } from "@/hooks/usePayments";
import { formatCurrency } from "@/data/mockData";

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const Index = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const { data: rooms = [] } = useRooms();
  const { data: tenants = [] } = useTenants();
  const { data: payments = [] } = usePayments();

  const month = parseInt(selectedMonth);
  const year = parseInt(selectedYear);

  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const available = rooms.filter((r) => r.status === "available").length;
  const maintenance = rooms.filter((r) => r.status === "maintenance").length;

  // Monthly payment stats
  const monthPayments = payments.filter((p) => p.month_number === month && p.year === year);
  const paidCount = monthPayments.filter((p) => p.status === "paid").length;
  const pendingCount = monthPayments.filter((p) => p.status === "pending").length;
  const overdueCount = monthPayments.filter((p) => p.status === "overdue").length;
  const totalAmount = monthPayments.reduce((s, p) => s + p.amount, 0);
  const paidAmount = monthPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Selamat datang di Royal Greenland Management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={DoorOpen} title="Total Kamar" value={rooms.length} subtitle={`${occupied} terisi`} />
        <StatCard icon={DoorOpen} title="Kamar Tersedia" value={available} variant="success" />
        <StatCard icon={Users} title="Total Penghuni" value={tenants.length} variant="warning" />
        <StatCard icon={TrendingUp} title="Total Pendapatan" value={formatCurrency(paidAmount)} variant="default" />
      </div>

      {/* Monthly Invoice Summary */}
      <div className="glass-card rounded-xl p-6 mb-6 animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <h2 className="text-lg font-semibold text-card-foreground">Ringkasan Tagihan Bulanan</h2>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[80px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {monthPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada tagihan untuk {MONTH_NAMES[month]} {year}</p>
        ) : (
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <MiniStat icon={CircleDollarSign} label="Total Tagihan" value={formatCurrency(totalAmount)} sub={`${monthPayments.length} kamar`} variant="default" />
            <MiniStat icon={CheckCircle} label="Lunas" value={String(paidCount)} sub={formatCurrency(paidAmount)} variant="success" />
            <MiniStat icon={Clock} label="Menunggu" value={String(pendingCount)} sub="kamar" variant="warning" />
            <MiniStat icon={AlertTriangle} label="Menunggak" value={String(overdueCount)} sub="kamar" variant="destructive" />
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <RevenueChart payments={payments} year={year} />
        <OccupancyChart occupied={occupied} available={available} maintenance={maintenance} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">

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

        <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Pembayaran {MONTH_NAMES[month]}</h2>
          <div className="space-y-3">
            {monthPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data</p>
            ) : monthPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  {payment.status === "overdue" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  {payment.status === "pending" && <Clock className="h-4 w-4 text-warning" />}
                  {payment.status === "paid" && <CheckCircle className="h-4 w-4 text-success" />}
                  <div>
                    <span className="font-medium text-card-foreground">{payment.tenant_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">Kamar {payment.room_number}</span>
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

function MiniStat({ icon: Icon, label, value, sub, variant }: {
  icon: typeof CheckCircle; label: string; value: string; sub: string;
  variant: "default" | "success" | "warning" | "destructive";
}) {
  const colors = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`rounded-md p-1 ${colors[variant]}`}><Icon className="h-3 w-3" /></div>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-lg font-bold text-card-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

export default Index;
