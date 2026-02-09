import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tenant } from "@/data/mockData";
import { Room } from "@/data/mockData";

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
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState<"active" | "overdue">("active");

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setPhone(tenant.phone);
      setRoomId(tenant.roomId);
      setCheckIn(tenant.checkIn);
      setCheckOut(tenant.checkOut);
      setStatus(tenant.status);
    } else {
      setName("");
      setPhone("");
      setRoomId("");
      setCheckIn("");
      setCheckOut("");
      setStatus("active");
    }
  }, [tenant, open]);

  const allRooms = tenant
    ? [...availableRooms, { id: tenant.roomId, number: tenant.roomNumber } as Room]
    : availableRooms;

  const selectedRoom = allRooms.find((r) => r.id === roomId);

  const handleSubmit = () => {
    if (!name || !phone || !roomId || !checkIn || !checkOut || !selectedRoom) return;
    onSave({
      name,
      phone,
      roomId,
      roomNumber: selectedRoom.number,
      checkIn,
      checkOut,
      monthlyRent: selectedRoom.price ?? 0,
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
            <Label>No. Telepon</Label>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in</Label>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Check-out</Label>
              <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "active" | "overdue")}>
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
