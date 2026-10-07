import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { startOfDay, subDays, format } from "date-fns";
import { AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isBarberOnly = authUser.role === "BARBER" && authUser.barberId;
    const baseWhere = isBarberOnly ? { barberId: authUser.barberId } : {};

    // 1. Fetch all appointments to compute detailed analytics
    const allAppointments = await prisma.appointment.findMany({
      where: baseWhere,
      include: {
        service: true,
        barber: true,
      },
      orderBy: { startTime: "asc" },
    });

    const totalRevenue = allAppointments
      .filter((a) => a.status === AppointmentStatus.COMPLETED)
      .reduce((sum, a) => sum + a.priceAtBooking, 0);

    const completedCount = allAppointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED
    ).length;

    const cancelledCount = allAppointments.filter(
      (a) => a.status === AppointmentStatus.CANCELLED
    ).length;

    const noShowCount = allAppointments.filter(
      (a) => a.status === AppointmentStatus.NO_SHOW
    ).length;

    // 2. Service popularity metrics
    const serviceMap: Record<
      string,
      { id: string; name: string; count: number; revenue: number }
    > = {};

    for (const appt of allAppointments) {
      const sId = appt.serviceId;
      if (!serviceMap[sId]) {
        serviceMap[sId] = {
          id: sId,
          name: appt.service.name,
          count: 0,
          revenue: 0,
        };
      }
      serviceMap[sId].count += 1;
      if (appt.status === AppointmentStatus.COMPLETED) {
        serviceMap[sId].revenue += appt.priceAtBooking;
      }
    }

    const popularServices = Object.values(serviceMap).sort(
      (a, b) => b.count - a.count
    );

    // 3. Barber performance breakdown (if Admin)
    const barberMap: Record<
      string,
      { id: string; name: string; appointments: number; revenue: number }
    > = {};

    for (const appt of allAppointments) {
      const bId = appt.barberId;
      if (!barberMap[bId]) {
        barberMap[bId] = {
          id: bId,
          name: appt.barber.name,
          appointments: 0,
          revenue: 0,
        };
      }
      barberMap[bId].appointments += 1;
      if (appt.status === AppointmentStatus.COMPLETED) {
        barberMap[bId].revenue += appt.priceAtBooking;
      }
    }

    const barberPerformance = Object.values(barberMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    // 4. Daily revenue and appointment breakdown for the past 14 days
    const dailyStats: Record<string, { date: string; revenue: number; count: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const key = format(day, "yyyy-MM-dd");
      dailyStats[key] = { date: key, revenue: 0, count: 0 };
    }

    for (const appt of allAppointments) {
      const key = format(startOfDay(new Date(appt.startTime)), "yyyy-MM-dd");
      if (dailyStats[key]) {
        dailyStats[key].count += 1;
        if (appt.status === AppointmentStatus.COMPLETED) {
          dailyStats[key].revenue += appt.priceAtBooking;
        }
      }
    }

    return NextResponse.json({
      summary: {
        totalAppointments: allAppointments.length,
        completedCount,
        cancelledCount,
        noShowCount,
        totalRevenue,
        completionRate:
          allAppointments.length > 0
            ? Math.round((completedCount / allAppointments.length) * 100)
            : 0,
      },
      popularServices,
      barberPerformance,
      dailyTrend: Object.values(dailyStats),
    });
  } catch (error: any) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}
