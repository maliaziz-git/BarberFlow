import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots, OperatingHours } from "@/lib/appointment-rules";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get("barberId");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const serviceId = searchParams.get("serviceId");

    if (!barberId || !dateStr || !serviceId) {
      return NextResponse.json(
        { error: "barberId, date (YYYY-MM-DD), and serviceId are required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const settings = await prisma.shopSettings.findFirst();
    const operatingHours: OperatingHours = {
      openingHour: settings?.openingHour || "09:00",
      closingHour: settings?.closingHour || "19:00",
      openDays: settings?.openDays || "1,2,3,4,5,6",
      slotIntervalMinutes: settings?.slotIntervalMinutes || 30,
    };

    const targetDate = parseISO(dateStr);
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // Fetch existing appointments on that day for the barber
    const existing = await prisma.appointment.findMany({
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

    const slots = generateAvailableSlots(
      targetDate,
      service.durationMinutes,
      operatingHours,
      existing
    );

    return NextResponse.json({
      date: dateStr,
      barberId,
      service: {
        id: service.id,
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
      },
      slots,
    });
  } catch (error: any) {
    console.error("Availability GET error:", error);
    return NextResponse.json(
      { error: "Failed to generate availability slots" },
      { status: 500 }
    );
  }
}
