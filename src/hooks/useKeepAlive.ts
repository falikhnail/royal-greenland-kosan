import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes

export function useKeepAlive() {
  useEffect(() => {
    const ping = async () => {
      try {
        await supabase.from("rooms").select("id", { count: "exact", head: true });
      } catch {
        // silently ignore
      }
    };

    // Initial ping
    ping();

    const interval = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(interval);
  }, []);
}
