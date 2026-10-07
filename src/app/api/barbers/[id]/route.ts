import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const barber = await prisma.barber.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          take: 10,
          orderBy: { startTime: "desc" },
          include: {
            customer: true,
            service: true,
          },
        },
      },
    });

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    return NextResponse.json(barber);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch barber" }, { status: 500 });
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

    // Barbers can edit their own profile; Admins can edit any barber
    const isSelf = authUser.barberId === params.id;
    if (authUser.role !== "ADMIN" && !isSelf) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, bio, avatarUrl, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim();
    // Only admin can change active state
    if (authUser.role === "ADMIN" && isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updated = await prisma.barber.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update barber" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Soft delete to preserve historical records
    const barber = await prisma.barber.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, barber });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete barber" }, { status: 500 });
  }
}
