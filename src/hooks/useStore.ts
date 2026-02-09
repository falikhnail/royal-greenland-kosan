import { create } from "zustand";
import { Room, Tenant, Payment, rooms as initialRooms, tenants as initialTenants, payments as initialPayments } from "@/data/mockData";

interface StoreState {
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];

  addRoom: (room: Omit<Room, "id">) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  addTenant: (tenant: Omit<Tenant, "id">) => void;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  updatePaymentStatus: (id: string, status: Payment["status"], date?: string) => void;
}

let roomCounter = initialRooms.length + 1;
let tenantCounter = initialTenants.length + 1;

export const useStore = create<StoreState>((set) => ({
  rooms: initialRooms,
  tenants: initialTenants,
  payments: initialPayments,

  addRoom: (room) =>
    set((s) => ({
      rooms: [...s.rooms, { ...room, id: `r${roomCounter++}` }],
    })),

  updateRoom: (id, data) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  deleteRoom: (id) =>
    set((s) => ({
      rooms: s.rooms.filter((r) => r.id !== id),
    })),

  addTenant: (tenant) =>
    set((s) => {
      const id = `t${tenantCounter++}`;
      return {
        tenants: [...s.tenants, { ...tenant, id }],
        rooms: s.rooms.map((r) =>
          r.id === tenant.roomId ? { ...r, status: "occupied" as const, tenantId: id } : r
        ),
      };
    }),

  updateTenant: (id, data) =>
    set((s) => ({
      tenants: s.tenants.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),

  deleteTenant: (id) =>
    set((s) => {
      const tenant = s.tenants.find((t) => t.id === id);
      return {
        tenants: s.tenants.filter((t) => t.id !== id),
        rooms: tenant
          ? s.rooms.map((r) =>
              r.id === tenant.roomId ? { ...r, status: "available" as const, tenantId: undefined } : r
            )
          : s.rooms,
      };
    }),

  updatePaymentStatus: (id, status, date) =>
    set((s) => ({
      payments: s.payments.map((p) =>
        p.id === id ? { ...p, status, date: date ?? p.date } : p
      ),
    })),
}));
