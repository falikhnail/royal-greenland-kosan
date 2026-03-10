import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tenant } from "./useTenants";

export interface ReminderLog {
  id: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  month_number: number;
  year: number;
  sent_at: string;
  method: string;
}

export function useReminderLogs(month: number, year: number) {
  return useQuery({
    queryKey: ["reminder_logs", month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_logs")
        .select("*")
        .eq("month_number", month)
        .eq("year", year)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return data as ReminderLog[];
    },
  });
}

export function useLogReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: Omit<ReminderLog, "id" | "sent_at">) => {
      const { error } = await supabase.from("reminder_logs").insert(log);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminder_logs"] });
    },
  });
}

export function getTenantsNearDueDate(tenants: Tenant[], daysBefore: number = 3): Tenant[] {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  return tenants.filter((t) => {
    if (t.status !== "active") return false;
    const dueDay = t.due_day;
    // Calculate days until due date in current month
    const dueDate = new Date(currentYear, currentMonth - 1, dueDay);
    // If due date already passed this month, check next month
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= daysBefore;
  });
}

export function getReminderWhatsAppUrl(
  phone: string,
  tenantName: string,
  roomNumber: string,
  amount: number,
  dueDay: number
) {
  const cleanPhone = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

  const now = new Date();
  const monthNames = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const currentMonth = monthNames[now.getMonth() + 1];
  const currentYear = now.getFullYear();

  const message = `Assalamualaikum Wr. Wb.

Yth. Bapak/Ibu ${tenantName},

Dengan hormat, kami dari pengelola Royal Greenland ingin mengingatkan bahwa tanggal jatuh tempo pembayaran sewa kosan Anda sudah dekat:

🏠 Kamar: ${roomNumber}
📅 Jatuh Tempo: Tanggal ${dueDay} ${currentMonth} ${currentYear}
💰 Jumlah: ${formattedAmount}

Mohon untuk dapat melakukan pembayaran tepat waktu. Jika sudah melakukan pembayaran, mohon abaikan pesan ini.

Terima kasih atas perhatian dan kerjasamanya.

Hormat kami,
Pengelola Royal Greenland`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
