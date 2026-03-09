import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface OccupancyChartProps {
  occupied: number;
  available: number;
  maintenance?: number;
}

export default function OccupancyChart({ occupied, available, maintenance = 0 }: OccupancyChartProps) {
  const data = [
    { name: "Terisi", value: occupied, color: "hsl(var(--primary))" },
    { name: "Tersedia", value: available, color: "hsl(var(--success))" },
    ...(maintenance > 0 ? [{ name: "Maintenance", value: maintenance, color: "hsl(var(--warning))" }] : []),
  ].filter((d) => d.value > 0);

  const total = occupied + available + maintenance;
  const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">Tingkat Okupansi</h2>
      <div className="flex items-center gap-6">
        <div className="h-[180px] w-[180px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} kamar`, name]}
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-card-foreground">{rate}%</span>
            <span className="text-[10px] text-muted-foreground">Okupansi</span>
          </div>
        </div>
        <div className="space-y-3 flex-1">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: d.color }} />
              <span className="text-sm text-muted-foreground flex-1">{d.name}</span>
              <span className="text-sm font-semibold text-card-foreground">{d.value}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-sm font-semibold text-card-foreground">{total} kamar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
