import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes

export type DbStatus = "connected" | "disconnected" | "checking";

const KeepAliveContext = createContext<DbStatus>("checking");

export function KeepAliveProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<DbStatus>("checking");

  useEffect(() => {
    const ping = async () => {
      try {
        setStatus("checking");
        const { error } = await supabase.from("rooms").select("id", { count: "exact", head: true });
        setStatus(error ? "disconnected" : "connected");
      } catch {
        setStatus("disconnected");
      }
    };

    ping();
    const interval = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <KeepAliveContext.Provider value={status}>
      {children}
    </KeepAliveContext.Provider>
  );
}

export function useDbStatus() {
  return useContext(KeepAliveContext);
}
