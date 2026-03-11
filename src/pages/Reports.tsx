import { useState, useMemo, useRef } from "react";
import { FileText, Download, TrendingUp, Home, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { useRooms } from "@/hooks/useRooms";
import { useTenants } from "@/hooks/useTenants";
import { usePayments } from "@/hooks/usePayments";
import { formatCurrency } from "@/data/mockData";
import ReportRevenueChart from "@/components/ReportRevenueChart";
import ReportOccupancyChart from "@/components/ReportOccupancyChart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const Reports = () => {
  const { data: rooms = [] } = useRooms();
  const { data: tenants = [] } = useTenants();
  const { data: allPayments = [] } = usePayments();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [reportType, setReportType] = useState<"monthly" | "yearly">("monthly");

  // Filtered payments
  const payments = useMemo(() => {
    if (reportType === "monthly") {
      return allPayments.filter((p) => p.month_number === selectedMonth && p.year === selectedYear);
    }
    return allPayments.filter((p) => p.year === selectedYear);
  }, [allPayments, selectedMonth, selectedYear, reportType]);

  // Revenue stats
  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === "paid");
    const pending = payments.filter((p) => p.status === "pending");
    const overdue = payments.filter((p) => p.status === "overdue");
    return {
      totalBilling: payments.reduce((s, p) => s + p.amount, 0),
      totalPaid: paid.reduce((s, p) => s + p.amount, 0),
      totalPending: pending.reduce((s, p) => s + p.amount, 0),
      totalOverdue: overdue.reduce((s, p) => s + p.amount, 0),
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      totalCount: payments.length,
    };
  }, [payments]);

  // Occupancy stats
  const occupancy = useMemo(() => {
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const available = rooms.filter((r) => r.status === "available").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;
    const total = rooms.length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { occupied, available, maintenance, total, rate };
  }, [rooms]);

  // Monthly breakdown for yearly report
  const monthlyBreakdown = useMemo(() => {
    if (reportType !== "yearly") return [];
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const mp = allPayments.filter((p) => p.month_number === month && p.year === selectedYear);
      const paid = mp.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
      const pending = mp.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
      const overdue = mp.filter((p) => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
      return { month, name: MONTH_NAMES[month], paid, pending, overdue, total: paid + pending + overdue };
    });
  }, [allPayments, selectedYear, reportType]);

  const periodLabel = reportType === "monthly"
    ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
    : `Tahun ${selectedYear}`;

  const revenueChartRef = useRef<HTMLDivElement>(null);
  const occupancyChartRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // PDF Export
  const exportPDF = async () => {
    setExporting(true);
    try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Royal Greenland", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Laporan Keuangan & Okupansi", pageWidth / 2, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Periode: ${periodLabel}`, pageWidth / 2, 35, { align: "center" });
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth / 2, 41, { align: "center" });

    doc.setDrawColor(200);
    doc.line(14, 45, pageWidth - 14, 45);

    // Revenue Summary
    let y = 52;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Pendapatan", 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [["Keterangan", "Jumlah", "Nominal"]],
      body: [
        ["Total Tagihan", String(stats.totalCount), formatCurrency(stats.totalBilling)],
        ["Lunas", String(stats.paidCount), formatCurrency(stats.totalPaid)],
        ["Belum Bayar", String(stats.pendingCount), formatCurrency(stats.totalPending)],
        ["Menunggak", String(stats.overdueCount), formatCurrency(stats.totalOverdue)],
      ],
      theme: "grid",
      headStyles: { fillColor: [34, 34, 34], fontSize: 10 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Occupancy Summary
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Okupansi Kamar", 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [["Status", "Jumlah Kamar", "Persentase"]],
      body: [
        ["Terisi", String(occupancy.occupied), `${occupancy.total > 0 ? Math.round((occupancy.occupied / occupancy.total) * 100) : 0}%`],
        ["Tersedia", String(occupancy.available), `${occupancy.total > 0 ? Math.round((occupancy.available / occupancy.total) * 100) : 0}%`],
        ["Maintenance", String(occupancy.maintenance), `${occupancy.total > 0 ? Math.round((occupancy.maintenance / occupancy.total) * 100) : 0}%`],
        ["Total", String(occupancy.total), "100%"],
      ],
      theme: "grid",
      headStyles: { fillColor: [34, 34, 34], fontSize: 10 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Charts
    const chartWidth = pageWidth - 28;
    const chartHeight = 70;

    const captureChart = async (ref: React.RefObject<HTMLDivElement | null>) => {
      if (!ref.current) return null;
      const canvas = await html2canvas(ref.current, { backgroundColor: "#ffffff", scale: 2 });
      return canvas.toDataURL("image/png");
    };

    const [revenueImg, occupancyImg] = await Promise.all([
      captureChart(revenueChartRef),
      captureChart(occupancyChartRef),
    ]);

    if (revenueImg || occupancyImg) {
      if (y + chartHeight + 15 > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Grafik", 14, y);
      y += 5;

      if (revenueImg) {
        if (y + chartHeight > 270) { doc.addPage(); y = 20; }
        doc.addImage(revenueImg, "PNG", 14, y, chartWidth, chartHeight);
        y += chartHeight + 8;
      }
      if (occupancyImg) {
        if (y + chartHeight > 270) { doc.addPage(); y = 20; }
        doc.addImage(occupancyImg, "PNG", 14, y, chartWidth / 2, chartHeight);
        y += chartHeight + 8;
      }
    }

    // Monthly breakdown (yearly only)
    if (reportType === "yearly" && monthlyBreakdown.length > 0) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Rincian Bulanan", 14, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        head: [["Bulan", "Lunas", "Belum Bayar", "Menunggak", "Total"]],
        body: monthlyBreakdown.map((m) => [
          m.name,
          formatCurrency(m.paid),
          formatCurrency(m.pending),
          formatCurrency(m.overdue),
          formatCurrency(m.total),
        ]),
        theme: "grid",
        headStyles: { fillColor: [34, 34, 34], fontSize: 10 },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 12;
    }

    // Detail payments
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Detail Pembayaran", 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [["Penghuni", "Kamar", "Jumlah", "Status", "Tanggal Bayar"]],
      body: payments.map((p) => [
        p.tenant_name,
        p.room_number,
        formatCurrency(p.amount),
        p.status === "paid" ? "Lunas" : p.status === "pending" ? "Belum Bayar" : "Menunggak",
        p.date ? new Date(p.date).toLocaleDateString("id-ID") : "-",
      ]),
      theme: "grid",
      headStyles: { fillColor: [34, 34, 34], fontSize: 10 },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Halaman ${i} dari ${pageCount} — Royal Greenland`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    const filename = reportType === "monthly"
      ? `Laporan_${MONTH_NAMES[selectedMonth]}_${selectedYear}.pdf`
      : `Laporan_Tahunan_${selectedYear}.pdf`;

    doc.save(filename);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Laporan
          </h1>
          <p className="text-sm text-muted-foreground">
            Laporan pendapatan dan okupansi {periodLabel}
          </p>
        </div>
        <Button onClick={exportPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Ekspor PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Tabs value={reportType} onValueChange={(v) => setReportType(v as "monthly" | "yearly")}>
          <TabsList>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
            <TabsTrigger value="yearly">Tahunan</TabsTrigger>
          </TabsList>
        </Tabs>

        {reportType === "monthly" && (
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.slice(1).map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={BarChart3} label="Total Tagihan" value={formatCurrency(stats.totalBilling)} sub={`${stats.totalCount} tagihan`} variant="default" />
        <SummaryCard icon={CheckCircle} label="Lunas" value={formatCurrency(stats.totalPaid)} sub={`${stats.paidCount} tagihan`} variant="success" />
        <SummaryCard icon={Clock} label="Belum Bayar" value={formatCurrency(stats.totalPending)} sub={`${stats.pendingCount} tagihan`} variant="warning" />
        <SummaryCard icon={AlertTriangle} label="Menunggak" value={formatCurrency(stats.totalOverdue)} sub={`${stats.overdueCount} tagihan`} variant="destructive" />
      </div>

      {/* Occupancy Cards */}
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Home className="h-5 w-5 text-primary" />
        Okupansi Kamar
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Tingkat Hunian</p>
          <p className="text-3xl font-bold text-primary mt-1">{occupancy.rate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{occupancy.occupied} dari {occupancy.total} kamar</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Terisi</p>
          <p className="text-2xl font-bold text-success mt-1">{occupancy.occupied}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Tersedia</p>
          <p className="text-2xl font-bold text-warning mt-1">{occupancy.available}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Maintenance</p>
          <p className="text-2xl font-bold text-destructive mt-1">{occupancy.maintenance}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ReportRevenueChart payments={allPayments} year={selectedYear} />
        <ReportOccupancyChart
          occupied={occupancy.occupied}
          available={occupancy.available}
          maintenance={occupancy.maintenance}
        />
      </div>

      {/* Monthly Breakdown (yearly) */}
      {reportType === "yearly" && monthlyBreakdown.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Rincian Bulanan
          </h2>
          <div className="glass-card rounded-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bulan</th>
                    <th className="text-right px-4 py-3 font-medium text-success">Lunas</th>
                    <th className="text-right px-4 py-3 font-medium text-warning">Belum Bayar</th>
                    <th className="text-right px-4 py-3 font-medium text-destructive">Menunggak</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.map((m) => (
                    <tr key={m.month} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-card-foreground font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-right text-success">{formatCurrency(m.paid)}</td>
                      <td className="px-4 py-3 text-right text-warning">{formatCurrency(m.pending)}</td>
                      <td className="px-4 py-3 text-right text-destructive">{formatCurrency(m.overdue)}</td>
                      <td className="px-4 py-3 text-right text-card-foreground font-medium">{formatCurrency(m.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payment Details */}
      <h2 className="text-lg font-semibold text-foreground mb-3">Detail Pembayaran</h2>
      {payments.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Tidak ada data pembayaran untuk periode ini</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Penghuni</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kamar</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Jumlah</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-card-foreground">{p.tenant_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.room_number}</td>
                    <td className="px-4 py-3 text-right text-card-foreground font-medium">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "paid"
                          ? "bg-success/15 text-success border-success/20"
                          : p.status === "pending"
                          ? "bg-warning/15 text-warning border-warning/20"
                          : "bg-destructive/15 text-destructive border-destructive/20"
                      }`}>
                        {p.status === "paid" ? "Lunas" : p.status === "pending" ? "Belum Bayar" : "Menunggak"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.date ? new Date(p.date).toLocaleDateString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

function SummaryCard({ icon: Icon, label, value, sub, variant }: {
  icon: typeof CheckCircle;
  label: string;
  value: string;
  sub: string;
  variant: "default" | "success" | "warning" | "destructive";
}) {
  const colorMap = {
    default: "text-primary bg-primary/15",
    success: "text-success bg-success/15",
    warning: "text-warning bg-warning/15",
    destructive: "text-destructive bg-destructive/15",
  };
  const [textColor, bgColor] = colorMap[variant].split(" ");

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`rounded-lg p-2 ${bgColor}`}>
          <Icon className={`h-4 w-4 ${textColor}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export default Reports;
