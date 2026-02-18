import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Payment {
  id: string;
  tenant_id: string | null;
  tenant_name: string;
  room_number: string;
  amount: number;
  date: string | null;
  status: string;
  month: string;
  month_number: number;
  year: number;
}

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("year", { ascending: false })
        .order("month_number", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useGenerateMonthlyPayments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      // Get all active tenants with occupied rooms
      const { data: tenants, error: tErr } = await supabase
        .from("tenants")
        .select("id, name, room_number, monthly_rent")
        .eq("status", "active");
      if (tErr) throw tErr;

      // Check existing payments for this month
      const { data: existing, error: eErr } = await supabase
        .from("payments")
        .select("tenant_id")
        .eq("month_number", month)
        .eq("year", year);
      if (eErr) throw eErr;

      const existingIds = new Set(existing?.map((p) => p.tenant_id));
      const monthName = `${MONTH_NAMES[month]} ${year}`;

      const newPayments = (tenants ?? [])
        .filter((t) => !existingIds.has(t.id))
        .map((t) => ({
          tenant_id: t.id,
          tenant_name: t.name,
          room_number: t.room_number,
          amount: t.monthly_rent,
          status: "pending",
          month: monthName,
          month_number: month,
          year,
        }));

      if (newPayments.length > 0) {
        const { error } = await supabase.from("payments").insert(newPayments);
        if (error) throw error;
      }

      return newPayments.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      if (count > 0) toast.success(`${count} tagihan baru berhasil dibuat`);
      else toast.info("Semua tagihan bulan ini sudah ada");
    },
    onError: () => toast.error("Gagal membuat tagihan"),
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, date }: { id: string; status: string; date?: string }) => {
      const { error } = await supabase.from("payments").update({ status, date: date ?? null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Status pembayaran diperbarui");
    },
    onError: () => toast.error("Gagal memperbarui pembayaran"),
  });
}

export function getWhatsAppBillingUrl(phone: string, tenantName: string, roomNumber: string, amount: number, month: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  const formattedAmount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const message = `Assalamualaikum Wr. Wb.

Yth. Bapak/Ibu ${tenantName},

Dengan hormat, kami dari pengelola Royal Greenland ingin mengingatkan bahwa tagihan sewa kosan untuk:

🏠 Kamar: ${roomNumber}
📅 Periode: ${month}
💰 Jumlah: ${formattedAmount}

Mohon untuk dapat melakukan pembayaran sebelum jatuh tempo. Jika sudah melakukan pembayaran, mohon abaikan pesan ini.

Terima kasih atas perhatian dan kerjasamanya.

Hormat kami,
Pengelola Royal Greenland`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
