import { Home, DoorOpen, Users, CreditCard, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/rooms", icon: DoorOpen, label: "Kamar" },
  { to: "/tenants", icon: Users, label: "Penghuni" },
  { to: "/payments", icon: CreditCard, label: "Pembayaran" },
];

const AppSidebar = () => {
  const location = useLocation();

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
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Pengaturan
        </NavLink>
      </div>
    </aside>
  );
};

export default AppSidebar;
