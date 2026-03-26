import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes

export type DbStatus = "connected" | "disconnected" | "checking";

export function useKeepAlive() {
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

  return status;
}
