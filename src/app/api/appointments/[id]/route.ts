import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  calculateEndTime,
  hasBarberConflict,
  isWithinOperatingHours,
  OperatingHours,
} from "@/lib/appointment-rules";
import { startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Role authorization: Barber can only update their own appointments
    if (authUser.role === "BARBER" && authUser.barberId !== appointment.barberId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own assigned appointments" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, notes } = body;

    const updateData: any = {};
    if (status !== undefined) {
      if (!Object.values(AppointmentStatus).includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      updateData.status = status as AppointmentStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes ? notes.trim() : null;
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Status PATCH error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Barber check
    if (authUser.role === "BARBER" && authUser.barberId !== existing.barberId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      barberId = existing.barberId,
      serviceId = existing.serviceId,
      startTime: startTimeRaw,
      notes,
      status,
    } = body;

    // Fetch service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 400 });
    }

    const startTime = startTimeRaw ? new Date(startTimeRaw) : existing.startTime;
    const endTime = calculateEndTime(startTime, service.durationMinutes);

    // Validate operating hours
    const settings = await prisma.shopSettings.findFirst();
    const operatingHours: OperatingHours = {
      openingHour: settings?.openingHour || "09:00",
      closingHour: settings?.closingHour || "19:00",
      openDays: settings?.openDays || "1,2,3,4,5,6",
      slotIntervalMinutes: settings?.slotIntervalMinutes || 30,
    };

    const operatingCheck = isWithinOperatingHours(startTime, endTime, operatingHours);
    if (!operatingCheck.isValid) {
      return NextResponse.json(
        { error: operatingCheck.reason || "Appointment outside operating hours" },
        { status: 400 }
      );
    }

    // Check conflict (excluding current appointment)
    const dayStart = startOfDay(startTime);
    const dayEnd = endOfDay(startTime);

    const conflictingBookings = await prisma.appointment.findMany({
      where: {
        barberId,
        id: { not: params.id },
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
      conflictingBookings,
      params.id
    );

    if (isConflict) {
      return NextResponse.json(
        { error: "The new time slot conflicts with an existing booking for this barber." },
        { status: 409 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        barberId,
        serviceId,
        startTime,
        endTime,
        ...(status && { status }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Appointment update error:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (authUser.role === "BARBER" && authUser.barberId !== appointment.barberId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft cancel or hard delete depending on query param
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get("hard") === "true";

    if (hardDelete && authUser.role === "ADMIN") {
      await prisma.appointment.delete({ where: { id: params.id } });
      return NextResponse.json({ success: true, message: "Appointment deleted" });
    } else {
      const updated = await prisma.appointment.update({
        where: { id: params.id },
        data: { status: AppointmentStatus.CANCELLED },
      });
      return NextResponse.json({ success: true, appointment: updated });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
  }
}
