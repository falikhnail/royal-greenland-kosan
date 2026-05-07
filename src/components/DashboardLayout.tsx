import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import AppSidebar, { SidebarContent } from "./AppSidebar";
import RealtimeNotifier from "./RealtimeNotifier";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <RealtimeNotifier />

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between gap-3 px-4 h-14 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="Royal Greenland" className="h-8 w-8 rounded-md shrink-0" />
          <span className="text-sm font-bold truncate">Royal Greenland</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Buka menu"
              className="p-2 rounded-md hover:bg-sidebar-accent/50"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-0 bg-sidebar">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8 min-w-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
