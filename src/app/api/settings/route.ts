import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await prisma.shopSettings.findFirst();
    if (!settings) {
      settings = await prisma.shopSettings.create({
        data: {
          id: "default-shop",
          shopName: "BarberFlow Artisan Studio",
          phone: "+1 (555) 321-7890",
          email: "hello@barberflow.com",
          address: "456 Artisan Boulevard, Downtown",
          openingHour: "09:00",
          closingHour: "19:00",
          slotIntervalMinutes: 30,
          openDays: "1,2,3,4,5,6",
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { shopName, phone, email, address, openingHour, closingHour, slotIntervalMinutes, openDays } = body;

    const current = await prisma.shopSettings.findFirst();
    const id = current?.id || "default-shop";

    const updated = await prisma.shopSettings.upsert({
      where: { id },
      create: {
        id,
        shopName: shopName ?? "BarberFlow Artisan Studio",
        phone: phone ?? "",
        email: email ?? "",
        address: address ?? "",
        openingHour: openingHour ?? "09:00",
        closingHour: closingHour ?? "19:00",
        slotIntervalMinutes: Number(slotIntervalMinutes) || 30,
        openDays: openDays ?? "1,2,3,4,5,6",
      },
      update: {
        ...(shopName !== undefined && { shopName }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(openingHour !== undefined && { openingHour }),
        ...(closingHour !== undefined && { closingHour }),
        ...(slotIntervalMinutes !== undefined && { slotIntervalMinutes: Number(slotIntervalMinutes) }),
        ...(openDays !== undefined && { openDays }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
