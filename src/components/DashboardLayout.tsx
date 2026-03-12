import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import RealtimeNotifier from "./RealtimeNotifier";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <RealtimeNotifier />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
