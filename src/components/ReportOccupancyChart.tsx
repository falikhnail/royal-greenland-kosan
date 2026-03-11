import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Props {
  occupied: number;
  available: number;
  maintenance: number;
}

const COLORS = [
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

export default function ReportOccupancyChart({ occupied, available, maintenance }: Props) {
  const data = [
    { name: "Terisi", value: occupied },
    { name: "Tersedia", value: available },
    { name: "Maintenance", value: maintenance },
  ].filter((d) => d.value > 0);

  const total = occupied + available + maintenance;
  const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Okupansi Kamar</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} kamar`, name]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2">
          <p className="text-3xl font-bold text-primary">{rate}%</p>
          <p className="text-xs text-muted-foreground">Tingkat Hunian</p>
          <div className="mt-2 space-y-1">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
