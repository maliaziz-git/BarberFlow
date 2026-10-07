import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";
import { AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const isBarberOnly = authUser.role === "BARBER" && authUser.barberId;
    const baseWhere = isBarberOnly ? { barberId: authUser.barberId } : {};

    const [
      totalAppointments,
      todayAppointmentsCount,
      totalCustomers,
      totalBarbers,
      completedAppts,
      todayCompletedAppts,
      allStatuses,
      todayList,
    ] = await Promise.all([
      prisma.appointment.count({ where: baseWhere }),
      prisma.appointment.count({
        where: {
          ...baseWhere,
          startTime: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.customer.count(),
      prisma.barber.count({ where: { isActive: true } }),
      prisma.appointment.findMany({
        where: {
          ...baseWhere,
          status: AppointmentStatus.COMPLETED,
        },
        select: { priceAtBooking: true },
      }),
      prisma.appointment.findMany({
        where: {
          ...baseWhere,
          status: AppointmentStatus.COMPLETED,
          startTime: { gte: todayStart, lte: todayEnd },
        },
        select: { priceAtBooking: true },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: baseWhere,
        _count: { status: true },
      }),
      prisma.appointment.findMany({
        where: {
          ...baseWhere,
          startTime: { gte: todayStart, lte: todayEnd },
        },
        orderBy: { startTime: "asc" },
        include: {
          customer: true,
          barber: { select: { id: true, name: true, phone: true } },
          service: true,
        },
      }),
    ]);

    const totalRevenue = completedAppts.reduce((sum, a) => sum + (a.priceAtBooking || 0), 0);
    const todayRevenue = todayCompletedAppts.reduce((sum, a) => sum + (a.priceAtBooking || 0), 0);

    const statusCounts: Record<string, number> = {
      BOOKED: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    };
    for (const s of allStatuses) {
      statusCounts[s.status] = s._count.status;
    }

    return NextResponse.json({
      role: authUser.role,
      barberName: isBarberOnly ? authUser.name : null,
      totalAppointments,
      todayAppointmentsCount,
      totalCustomers,
      totalBarbers,
      totalRevenue,
      todayRevenue,
      statusCounts,
      todayAppointments: todayList,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
