import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/data/mockData";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

interface Payment {
  month_number: number;
  year: number;
  amount: number;
  status: string;
}

export default function ReportRevenueChart({ payments, year }: { payments: Payment[]; year: number }) {
  const data = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const mp = payments.filter((p) => p.month_number === month && p.year === year);
      return {
        name: MONTH_SHORT[i],
        paid: mp.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0),
        pending: mp.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0),
        overdue: mp.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0),
      };
    }),
  [payments, year]);

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Tren Pendapatan {year}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === "paid" ? "Lunas" : name === "pending" ? "Belum Bayar" : "Menunggak",
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend
            formatter={(value) =>
              value === "paid" ? "Lunas" : value === "pending" ? "Belum Bayar" : "Menunggak"
            }
          />
          <Bar dataKey="paid" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending" stackId="a" fill="hsl(var(--warning))" radius={[0, 0, 0, 0]} />
          <Bar dataKey="overdue" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
