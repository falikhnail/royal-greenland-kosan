import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tenant } from "@/hooks/useTenants";
import { Room } from "@/hooks/useRooms";

interface TenantDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Tenant, "id">) => void;
  tenant?: Tenant | null;
  availableRooms: Room[];
}

const TenantDialog = ({ open, onClose, onSave, tenant, availableRooms }: TenantDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [roomId, setRoomId] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setPhone(tenant.phone);
      setRoomId(tenant.room_id ?? "");
      setMoveInDate(tenant.move_in_date);
      setStatus(tenant.status);
    } else {
      setName(""); setPhone(""); setRoomId(""); setMoveInDate(""); setStatus("active");
    }
  }, [tenant, open]);

  const allRooms = tenant?.room_id
    ? [...availableRooms, { id: tenant.room_id, number: tenant.room_number } as Room]
    : availableRooms;

  const selectedRoom = allRooms.find((r) => r.id === roomId);

  const handleSubmit = () => {
    if (!name || !phone || !roomId || !moveInDate || !selectedRoom) return;
    const dueDay = new Date(moveInDate).getDate();
    onSave({
      name, phone,
      room_id: roomId,
      room_number: selectedRoom.number,
      move_in_date: moveInDate,
      due_day: dueDay,
      monthly_rent: selectedRoom.price ?? 0,
      status,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit Penghuni" : "Tambah Penghuni"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
          </div>
          <div className="space-y-2">
            <Label>No. Telepon (WhatsApp)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812-xxxx-xxxx" />
          </div>
          <div className="space-y-2">
            <Label>Kamar</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger><SelectValue placeholder="Pilih kamar" /></SelectTrigger>
              <SelectContent>
                {allRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>Kamar {r.number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tanggal Masuk</Label>
            <Input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Tanggal masuk menentukan jatuh tempo bayar bulanan (contoh: masuk tgl 30 → bayar tiap tgl 30)
            </p>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="overdue">Menunggak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDialog;
