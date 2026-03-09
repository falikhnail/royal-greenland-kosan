import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatCurrency } from "@/data/mockData";

interface Payment {
  month_number: number;
  year: number;
  amount: number;
  status: string;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function RevenueChart({ payments, year }: { payments: Payment[]; year: number }) {
  const data = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return MONTH_SHORT.map((name, i) => {
      const monthNum = i + 1;
      const monthPayments = payments.filter((p) => p.year === year && p.month_number === monthNum);
      const paid = monthPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
      const pending = monthPayments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
      return { name, paid, pending, isCurrent: year === new Date().getFullYear() && monthNum === currentMonth };
    });
  }, [payments, year]);

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">Tren Pendapatan {year}</h2>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`} />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name === "paid" ? "Lunas" : "Belum Lunas"]}
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
            />
            <Bar dataKey="paid" stackId="a" radius={[0, 0, 0, 0]} fill="hsl(var(--success))" />
            <Bar dataKey="pending" stackId="a" radius={[4, 4, 0, 0]} fill="hsl(var(--warning))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
