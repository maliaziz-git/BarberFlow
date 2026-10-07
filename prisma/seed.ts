import { PrismaClient, Role, AppointmentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addMinutes, setHours, setMinutes, startOfDay, addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BarberFlow database seed...");

  // 1. Clean existing records in reverse dependency order
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shopSettings.deleteMany();

  // 2. Shop Settings
  const settings = await prisma.shopSettings.create({
    data: {
      id: "default-shop",
      shopName: "BarberFlow Artisan Studio",
      phone: "+1 (555) 321-7890",
      email: "hello@barberflow.com",
      address: "456 Artisan Boulevard, Downtown",
      openingHour: "09:00",
      closingHour: "19:00",
      slotIntervalMinutes: 30,
      openDays: "1,2,3,4,5,6", // Mon-Sat
    },
  });
  console.log("✓ Created shop settings:", settings.shopName);

  // 3. Users & Auth
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const barberPasswordHash = await bcrypt.hash("barber123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@barberflow.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: "Marcus Administrator",
    },
  });

  const barberUser = await prisma.user.create({
    data: {
      email: "barber@barberflow.com",
      passwordHash: barberPasswordHash,
      role: Role.BARBER,
      name: "Alex Barber",
    },
  });
  console.log("✓ Created demo users (admin@barberflow.com, barber@barberflow.com)");

  // 4. Barbers
  const alexBarber = await prisma.barber.create({
    data: {
      userId: barberUser.id,
      name: "Alex Barber",
      email: "barber@barberflow.com",
      phone: "+1 (555) 789-0001",
      bio: "Master barber specializing in classic taper fades, hot-towel straight razor shaves, and modern texturing.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isActive: true,
    },
  });

  const elenaBarber = await prisma.barber.create({
    data: {
      name: "Elena Sharp",
      email: "elena@barberflow.com",
      phone: "+1 (555) 789-0002",
      bio: "Creative hairstylist with 8+ years crafting sharp line-ups, skin fades, and precision beard grooming.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      isActive: true,
    },
  });

  const marcusBarber = await prisma.barber.create({
    data: {
      name: "Marcus Cole",
      email: "marcus@barberflow.com",
      phone: "+1 (555) 789-0003",
      bio: "Traditional craftsmanship meets contemporary edge. Certified beard artisan and scissor master.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      isActive: true,
    },
  });
  console.log("✓ Created 3 barbers (Alex, Elena, Marcus)");

  // 5. Services
  const servicesData = [
    {
      name: "Signature Haircut",
      description: "Precision scissor cutting, fade blend, neck shave, wash, and styling with premium pomade.",
      price: 35.0,
      durationMinutes: 30,
      isActive: true,
    },
    {
      name: "Beard Trim & Sculpt",
      description: "Detailed beard shaping, edge line-up, hot towel conditioning, and organic beard oil finish.",
      price: 25.0,
      durationMinutes: 20,
      isActive: true,
    },
    {
      name: "The Executive (Cut & Shave Combo)",
      description: "Complete signature haircut coupled with an invigorating hot lather straight razor shave.",
      price: 55.0,
      durationMinutes: 50,
      isActive: true,
    },
    {
      name: "Hot Towel Traditional Shave",
      description: "Classic straight-razor shave with pre-shave essential oils, warm lather, and cooling aftershave balm.",
      price: 30.0,
      durationMinutes: 30,
      isActive: true,
    },
    {
      name: "Junior Cut (Ages 12 & Under)",
      description: "Patient, modern and clean haircut designed specifically for youngsters.",
      price: 22.0,
      durationMinutes: 25,
      isActive: true,
    },
    {
      name: "Scalp Detox & Head Massage",
      description: "Exfoliating organic scalp treatment followed by a relaxing 15-minute pressure point head massage.",
      price: 40.0,
      durationMinutes: 30,
      isActive: true,
    },
  ];

  const createdServices = [];
  for (const s of servicesData) {
    const service = await prisma.service.create({ data: s });
    createdServices.push(service);
  }
  console.log(`✓ Created ${createdServices.length} services`);

  // 6. Customers
  const customersData = [
    {
      name: "David Smith",
      email: "david.smith@example.com",
      phone: "+1 (555) 901-1122",
      notes: "Prefers low drop fade with natural part. Sensitive skin around throat area.",
    },
    {
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "+1 (555) 902-3344",
      notes: "Bi-weekly regular for executive combo. Likes strong hold matte clay.",
    },
    {
      name: "James Wilson",
      email: "jwilson@example.com",
      phone: "+1 (555) 903-5566",
      notes: "Beard sculpting enthusiast; keep mustache long and trimmed over lip.",
    },
    {
      name: "Robert Taylor",
      email: "robert.t@example.com",
      phone: "+1 (555) 904-7788",
      notes: "Allergic to tea tree oil products.",
    },
    {
      name: "Lucas Garcia",
      email: "lucas.g@example.com",
      phone: "+1 (555) 905-9900",
      notes: "First time customer referred by David.",
    },
    {
      name: "Daniel Martinez",
      email: "daniel.m@example.com",
      phone: "+1 (555) 906-2211",
      notes: "Always requests hot towel before any shave.",
    },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }
  console.log(`✓ Created ${createdCustomers.length} customers`);

  // 7. Appointments (Today, Tomorrow, and Historical)
  const today = startOfDay(new Date());

  // Today's appointments for Alex Barber
  const alexTodayAppts = [
    {
      customerId: createdCustomers[0].id,
      barberId: alexBarber.id,
      serviceId: createdServices[0].id, // Signature Haircut (30m)
      startHour: 9,
      startMin: 30,
      duration: 30,
      status: AppointmentStatus.COMPLETED,
      notes: "Client loved the fade. Paid with cash.",
      price: createdServices[0].price,
    },
    {
      customerId: createdCustomers[1].id,
      barberId: alexBarber.id,
      serviceId: createdServices[2].id, // The Executive (50m)
      startHour: 10,
      startMin: 30,
      duration: 50,
      status: AppointmentStatus.IN_PROGRESS,
      notes: "Requested extra hot towel on neck.",
      price: createdServices[2].price,
    },
    {
      customerId: createdCustomers[2].id,
      barberId: alexBarber.id,
      serviceId: createdServices[1].id, // Beard Trim (20m)
      startHour: 13,
      startMin: 0,
      duration: 20,
      status: AppointmentStatus.CONFIRMED,
      notes: "Confirmed via SMS reminder.",
      price: createdServices[1].price,
    },
    {
      customerId: createdCustomers[3].id,
      barberId: alexBarber.id,
      serviceId: createdServices[3].id, // Hot Towel Shave (30m)
      startHour: 14,
      startMin: 30,
      duration: 30,
      status: AppointmentStatus.BOOKED,
      notes: "Booked online via public portal.",
      price: createdServices[3].price,
    },
    {
      customerId: createdCustomers[4].id,
      barberId: alexBarber.id,
      serviceId: createdServices[0].id, // Signature Haircut (30m)
      startHour: 16,
      startMin: 0,
      duration: 30,
      status: AppointmentStatus.BOOKED,
      notes: "First time haircut.",
      price: createdServices[0].price,
    },
  ];

  // Today's appointments for Elena Sharp
  const elenaTodayAppts = [
    {
      customerId: createdCustomers[5].id,
      barberId: elenaBarber.id,
      serviceId: createdServices[0].id,
      startHour: 10,
      startMin: 0,
      duration: 30,
      status: AppointmentStatus.COMPLETED,
      notes: "Mid fade styling.",
      price: createdServices[0].price,
    },
    {
      customerId: createdCustomers[1].id,
      barberId: elenaBarber.id,
      serviceId: createdServices[1].id,
      startHour: 11,
      startMin: 30,
      duration: 20,
      status: AppointmentStatus.CONFIRMED,
      notes: "Quick touch up.",
      price: createdServices[1].price,
    },
    {
      customerId: createdCustomers[2].id,
      barberId: elenaBarber.id,
      serviceId: createdServices[4].id,
      startHour: 15,
      startMin: 0,
      duration: 25,
      status: AppointmentStatus.CANCELLED,
      notes: "Customer called to reschedule for next week.",
      price: createdServices[4].price,
    },
  ];

  // Tomorrow's appointments
  const tomorrow = addDays(today, 1);
  const tomorrowAppts = [
    {
      customerId: createdCustomers[0].id,
      barberId: alexBarber.id,
      serviceId: createdServices[0].id,
      day: tomorrow,
      startHour: 10,
      startMin: 0,
      duration: 30,
      status: AppointmentStatus.CONFIRMED,
      notes: "Follow up appointment.",
      price: createdServices[0].price,
    },
    {
      customerId: createdCustomers[3].id,
      barberId: marcusBarber.id,
      serviceId: createdServices[2].id,
      day: tomorrow,
      startHour: 14,
      startMin: 0,
      duration: 50,
      status: AppointmentStatus.BOOKED,
      notes: "Online booking.",
      price: createdServices[2].price,
    },
  ];

  for (const item of [...alexTodayAppts, ...elenaTodayAppts]) {
    const start = setMinutes(setHours(today, item.startHour), item.startMin);
    const end = addMinutes(start, item.duration);
    await prisma.appointment.create({
      data: {
        customerId: item.customerId,
        barberId: item.barberId,
        serviceId: item.serviceId,
        startTime: start,
        endTime: end,
        status: item.status,
        notes: item.notes,
        priceAtBooking: item.price,
      },
    });
  }

  for (const item of tomorrowAppts) {
    const start = setMinutes(setHours(item.day, item.startHour), item.startMin);
    const end = addMinutes(start, item.duration);
    await prisma.appointment.create({
      data: {
        customerId: item.customerId,
        barberId: item.barberId,
        serviceId: item.serviceId,
        startTime: start,
        endTime: end,
        status: item.status,
        notes: item.notes,
        priceAtBooking: item.price,
      },
    });
  }

  console.log("✓ Created initial appointments with diverse statuses");
  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
