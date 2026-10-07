export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "BARBER";
  barberId?: string;
  barberProfile?: {
    id: string;
    name: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  priceAtBooking: number;
  customer: Customer;
  service: Service;
}
