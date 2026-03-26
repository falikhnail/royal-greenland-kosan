import { Home, DoorOpen, Users, CreditCard, LogOut, ShieldCheck, Bell, FileText, History, Wifi, WifiOff, Loader2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDbStatus, DbStatus } from "@/hooks/useKeepAlive";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/rooms", icon: DoorOpen, label: "Kamar" },
  { to: "/tenants", icon: Users, label: "Penghuni" },
  { to: "/payments", icon: CreditCard, label: "Pembayaran" },
  { to: "/reminders", icon: Bell, label: "Pengingat" },
  { to: "/reports", icon: FileText, label: "Laporan" },
  { to: "/users", icon: ShieldCheck, label: "Kelola Admin" },
  { to: "/activity-log", icon: History, label: "Log Aktivitas" },
];

const statusConfig: Record<DbStatus, { label: string; dotClass: string; icon: typeof Wifi }> = {
  connected: { label: "Terhubung", dotClass: "bg-emerald-500", icon: Wifi },
  disconnected: { label: "Terputus", dotClass: "bg-destructive", icon: WifiOff },
  checking: { label: "Memeriksa...", dotClass: "bg-yellow-500 animate-pulse", icon: Loader2 },
};

const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const dbStatus = useDbStatus();
  const config = statusConfig[dbStatus];
  const StatusIcon = config.icon;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <img src={logo} alt="Royal Greenland" className="h-10 w-10 rounded-lg" />
        <div>
          <h1 className="text-sm font-bold tracking-wide">Royal Greenland</h1>
          <p className="text-xs text-sidebar-foreground/60">Sistem Kosan</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        {/* Database connection status */}
        <div className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg bg-sidebar-accent/30">
          <span className={`h-2 w-2 rounded-full shrink-0 ${config.dotClass}`} />
          <StatusIcon className={`h-3.5 w-3.5 text-sidebar-foreground/60 ${dbStatus === "checking" ? "animate-spin" : ""}`} />
          <span className="text-xs text-sidebar-foreground/70">{config.label}</span>
        </div>

        {user && (
          <div className="px-4 mb-3">
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
