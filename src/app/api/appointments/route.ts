import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  calculateEndTime,
  hasBarberConflict,
  isWithinOperatingHours,
  OperatingHours,
} from "@/lib/appointment-rules";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import { AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const { searchParams } = new URL(req.url);

    const dateStr = searchParams.get("date"); // specific day YYYY-MM-DD
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    let barberId = searchParams.get("barberId");
    const status = searchParams.get("status") as AppointmentStatus | null;
    const customerId = searchParams.get("customerId");

    // Role-based rule: if user is logged in as a BARBER, they can only view their own appointments unless they are ADMIN
    if (authUser && authUser.role === "BARBER") {
      if (authUser.barberId) {
        barberId = authUser.barberId;
      }
    }

    const where: any = {};

    if (barberId) {
      where.barberId = barberId;
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (dateStr) {
      const targetDate = parseISO(dateStr);
      where.startTime = {
        gte: startOfDay(targetDate),
        lte: endOfDay(targetDate),
      };
    } else if (startDateStr || endDateStr) {
      where.startTime = {};
      if (startDateStr) {
        where.startTime.gte = startOfDay(parseISO(startDateStr));
      }
      if (endDateStr) {
        where.startTime.lte = endOfDay(parseISO(endDateStr));
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        customer: true,
        barber: {
          select: { id: true, name: true, phone: true, avatarUrl: true },
        },
        service: true,
      },
    });

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error("Appointments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      barberId,
      serviceId,
      startTime: startTimeRaw,
      customerId: existingCustomerId,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      status: requestedStatus,
    } = body;

    if (!barberId || !serviceId || !startTimeRaw) {
      return NextResponse.json(
        { error: "barberId, serviceId, and startTime are required" },
        { status: 400 }
      );
    }

    // 1. Fetch Service to get duration and current price
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Selected service is invalid or inactive" },
        { status: 400 }
      );
    }

    // 2. Fetch Barber
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
    });
    if (!barber || !barber.isActive) {
      return NextResponse.json(
        { error: "Selected barber is invalid or inactive" },
        { status: 400 }
      );
    }

    // 3. Automatically calculate end time from service duration
    const startTime = new Date(startTimeRaw);
    const endTime = calculateEndTime(startTime, service.durationMinutes);

    // 4. Validate Operating Hours
    const settings = await prisma.shopSettings.findFirst();
    const operatingHours: OperatingHours = {
      openingHour: settings?.openingHour || "09:00",
      closingHour: settings?.closingHour || "19:00",
      openDays: settings?.openDays || "1,2,3,4,5,6",
      slotIntervalMinutes: settings?.slotIntervalMinutes || 30,
    };

    const operatingCheck = isWithinOperatingHours(
      startTime,
      endTime,
      operatingHours
    );
    if (!operatingCheck.isValid) {
      return NextResponse.json(
        { error: operatingCheck.reason || "Appointment is outside shop operating hours." },
        { status: 400 }
      );
    }

    // 5. Prevent Double Booking (fetch existing appointments on that date for this barber)
    const dayStart = startOfDay(startTime);
    const dayEnd = endOfDay(startTime);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    const isConflict = hasBarberConflict(
      startTime,
      endTime,
      existingAppointments
    );
    if (isConflict) {
      return NextResponse.json(
        {
          error:
            "This barber is already booked for the selected time slot. Please choose another time or barber.",
        },
        { status: 409 }
      );
    }

    // 6. Resolve Customer (create or find)
    let customerId = existingCustomerId;
    if (!customerId) {
      if (!customerName || !customerPhone) {
        return NextResponse.json(
          { error: "Customer name and phone number are required" },
          { status: 400 }
        );
      }

      // Check if customer already exists by phone
      let customer = await prisma.customer.findFirst({
        where: { phone: customerPhone.trim() },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail?.trim().toLowerCase() || null,
          },
        });
      }
      customerId = customer.id;
    }

    // 7. Create Appointment
    const appointmentStatus =
      requestedStatus && Object.values(AppointmentStatus).includes(requestedStatus)
        ? (requestedStatus as AppointmentStatus)
        : AppointmentStatus.BOOKED;

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        barberId,
        serviceId,
        startTime,
        endTime,
        status: appointmentStatus,
        notes: notes?.trim() || null,
        priceAtBooking: service.price,
      },
      include: {
        customer: true,
        barber: { select: { id: true, name: true, phone: true } },
        service: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Appointment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
