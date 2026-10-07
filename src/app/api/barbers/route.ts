import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const barbers = await prisma.barber.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(barbers);
  } catch (error: any) {
    console.error("Barbers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch barbers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, bio, avatarUrl, isActive, userId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const barber = await prisma.barber.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        userId: userId || null,
      },
    });

    return NextResponse.json(barber, { status: 201 });
  } catch (error: any) {
    console.error("Barbers POST error:", error);
    return NextResponse.json({ error: "Failed to create barber" }, { status: 500 });
  }
}
