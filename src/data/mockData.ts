export type RoomStatus = "occupied" | "available" | "maintenance";

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  price: number;
  status: RoomStatus;
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  roomId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  monthlyRent: number;
  status: "active" | "overdue";
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
  month: string;
}

export const rooms: Room[] = [
  { id: "r1", number: "101", floor: 1, type: "Standard", price: 1500000, status: "occupied", tenantId: "t1" },
  { id: "r2", number: "102", floor: 1, type: "Standard", price: 1500000, status: "occupied", tenantId: "t2" },
  { id: "r3", number: "103", floor: 1, type: "Deluxe", price: 2000000, status: "available" },
  { id: "r4", number: "104", floor: 1, type: "Standard", price: 1500000, status: "maintenance" },
  { id: "r5", number: "201", floor: 2, type: "Deluxe", price: 2000000, status: "occupied", tenantId: "t3" },
  { id: "r6", number: "202", floor: 2, type: "Deluxe", price: 2000000, status: "occupied", tenantId: "t4" },
  { id: "r7", number: "203", floor: 2, type: "Suite", price: 2800000, status: "available" },
  { id: "r8", number: "204", floor: 2, type: "Standard", price: 1500000, status: "occupied", tenantId: "t5" },
  { id: "r9", number: "301", floor: 3, type: "Suite", price: 2800000, status: "occupied", tenantId: "t6" },
  { id: "r10", number: "302", floor: 3, type: "Deluxe", price: 2000000, status: "available" },
  { id: "r11", number: "303", floor: 3, type: "Standard", price: 1500000, status: "occupied", tenantId: "t7" },
  { id: "r12", number: "304", floor: 3, type: "Standard", price: 1500000, status: "available" },
];

export const tenants: Tenant[] = [
  { id: "t1", name: "Andi Prasetyo", phone: "0812-3456-7890", roomId: "r1", roomNumber: "101", checkIn: "2024-01-15", checkOut: "2025-01-15", monthlyRent: 1500000, status: "active" },
  { id: "t2", name: "Siti Nurhaliza", phone: "0813-2345-6789", roomId: "r2", roomNumber: "102", checkIn: "2024-03-01", checkOut: "2025-03-01", monthlyRent: 1500000, status: "active" },
  { id: "t3", name: "Budi Santoso", phone: "0857-1234-5678", roomId: "r5", roomNumber: "201", checkIn: "2024-06-10", checkOut: "2025-06-10", monthlyRent: 2000000, status: "overdue" },
  { id: "t4", name: "Dewi Lestari", phone: "0878-9876-5432", roomId: "r6", roomNumber: "202", checkIn: "2024-02-20", checkOut: "2025-02-20", monthlyRent: 2000000, status: "active" },
  { id: "t5", name: "Rizky Ramadhan", phone: "0856-4321-8765", roomId: "r8", roomNumber: "204", checkIn: "2024-08-01", checkOut: "2025-08-01", monthlyRent: 1500000, status: "active" },
  { id: "t6", name: "Maya Anggraini", phone: "0821-5678-1234", roomId: "r9", roomNumber: "301", checkIn: "2024-04-15", checkOut: "2025-04-15", monthlyRent: 2800000, status: "active" },
  { id: "t7", name: "Fajar Nugroho", phone: "0898-7654-3210", roomId: "r11", roomNumber: "303", checkIn: "2024-07-01", checkOut: "2025-07-01", monthlyRent: 1500000, status: "overdue" },
];

export const payments: Payment[] = [
  { id: "p1", tenantId: "t1", tenantName: "Andi Prasetyo", roomNumber: "101", amount: 1500000, date: "2025-02-01", status: "paid", month: "Februari 2025" },
  { id: "p2", tenantId: "t2", tenantName: "Siti Nurhaliza", roomNumber: "102", amount: 1500000, date: "2025-02-03", status: "paid", month: "Februari 2025" },
  { id: "p3", tenantId: "t3", tenantName: "Budi Santoso", roomNumber: "201", amount: 2000000, date: "", status: "overdue", month: "Februari 2025" },
  { id: "p4", tenantId: "t4", tenantName: "Dewi Lestari", roomNumber: "202", amount: 2000000, date: "2025-02-05", status: "paid", month: "Februari 2025" },
  { id: "p5", tenantId: "t5", tenantName: "Rizky Ramadhan", roomNumber: "204", amount: 1500000, date: "", status: "pending", month: "Februari 2025" },
  { id: "p6", tenantId: "t6", tenantName: "Maya Anggraini", roomNumber: "301", amount: 2800000, date: "2025-02-01", status: "paid", month: "Februari 2025" },
  { id: "p7", tenantId: "t7", tenantName: "Fajar Nugroho", roomNumber: "303", amount: 1500000, date: "", status: "overdue", month: "Februari 2025" },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
