import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/data/mockData";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

interface Payment {
  month_number: number;
  year: number;
  amount: number;
  status: string;
}

const YEAR_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

export default function YearComparisonChart({
  payments,
  years,
}: {
  payments: Payment[];
  years: number[];
}) {
  const data = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const entry: Record<string, string | number> = { name: MONTH_SHORT[i] };
      years.forEach((yr) => {
        entry[String(yr)] = payments
          .filter((p) => p.month_number === month && p.year === yr && p.status === "paid")
          .reduce((s, p) => s + p.amount, 0);
      });
      return entry;
    }),
  [payments, years]);

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        Perbandingan Pendapatan {years.join(" vs ")}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), `Tahun ${name}`]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend formatter={(value) => `Tahun ${value}`} />
          {years.map((yr, i) => (
            <Line
              key={yr}
              type="monotone"
              dataKey={String(yr)}
              stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
