import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room } from "@/hooks/useRooms";

interface RoomDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Room, "id">) => void;
  room?: Room | null;
}

const RoomDialog = ({ open, onClose, onSave, room }: RoomDialogProps) => {
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("1");
  const [type, setType] = useState("Standard");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("available");

  useEffect(() => {
    if (room) {
      setNumber(room.number);
      setFloor(String(room.floor));
      setType(room.type);
      setPrice(String(room.price));
      setStatus(room.status);
    } else {
      setNumber(""); setFloor("1"); setType("Standard"); setPrice(""); setStatus("available");
    }
  }, [room, open]);

  const handleSubmit = () => {
    if (!number || !price) return;
    onSave({
      number, floor: parseInt(floor), type, price: parseInt(price), status,
      tenant_id: room?.tenant_id ?? null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{room ? "Edit Kamar" : "Tambah Kamar"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nomor Kamar</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="101" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lantai</Label>
              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Lantai 1</SelectItem>
                  <SelectItem value="2">Lantai 2</SelectItem>
                  <SelectItem value="3">Lantai 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Deluxe">Deluxe</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Harga/Bulan (Rp)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1500000" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Tersedia</SelectItem>
                <SelectItem value="occupied">Terisi</SelectItem>
                <SelectItem value="maintenance">Perbaikan</SelectItem>
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

export default RoomDialog;
