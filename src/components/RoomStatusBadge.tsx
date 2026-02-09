import { RoomStatus } from "@/data/mockData";

const statusConfig: Record<RoomStatus, { label: string; className: string }> = {
  occupied: { label: "Terisi", className: "bg-primary/15 text-primary border-primary/20" },
  available: { label: "Tersedia", className: "bg-success/15 text-success border-success/20" },
  maintenance: { label: "Perbaikan", className: "bg-warning/15 text-warning border-warning/20" },
};

const RoomStatusBadge = ({ status }: { status: RoomStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default RoomStatusBadge;
