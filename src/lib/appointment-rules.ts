import { addMinutes, parse, format, isBefore, isAfter, isEqual } from "date-fns";

export interface OperatingHours {
  openingHour: string; // "09:00"
  closingHour: string; // "19:00"
  openDays: string; // "1,2,3,4,5,6" (0=Sun, 1=Mon, ..., 6=Sat)
  slotIntervalMinutes: number; // e.g. 30
}

export interface ExistingAppointment {
  id?: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

/**
 * Calculates appointment end time given start time and service duration in minutes.
 */
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  if (durationMinutes <= 0) {
    throw new Error("Service duration must be greater than 0 minutes");
  }
  return addMinutes(new Date(startTime), durationMinutes);
}

/**
 * Checks whether two time intervals overlap.
 * Overlap occurs if interval A starts before interval B ends AND interval A ends after interval B starts.
 * Edge-to-edge contacts (e.g. 10:00-10:30 and 10:30-11:00) do NOT overlap.
 */
export function doIntervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return isBefore(startA, endB) && isAfter(endA, startB);
}

/**
 * Checks if a proposed appointment clashes with any existing active appointments for a barber.
 * Statuses that block the slot: BOOKED, CONFIRMED, IN_PROGRESS.
 * CANCELLED and NO_SHOW do NOT block the slot.
 */
export function hasBarberConflict(
  proposedStart: Date,
  proposedEnd: Date,
  existingAppointments: ExistingAppointment[],
  excludeAppointmentId?: string
): boolean {
  const blockingStatuses = ["BOOKED", "CONFIRMED", "IN_PROGRESS"];

  return existingAppointments.some((appt) => {
    if (excludeAppointmentId && appt.id === excludeAppointmentId) {
      return false;
    }
    if (!blockingStatuses.includes(appt.status)) {
      return false;
    }
    return doIntervalsOverlap(
      new Date(proposedStart),
      new Date(proposedEnd),
      new Date(appt.startTime),
      new Date(appt.endTime)
    );
  });
}

/**
 * Validates that the appointment start and end times fall strictly within shop operating hours and on open days.
 */
export function isWithinOperatingHours(
  startTime: Date,
  endTime: Date,
  operatingHours: OperatingHours
): { isValid: boolean; reason?: string } {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // 1. Check open days
  const dayOfWeek = start.getDay(); // 0 = Sunday
  const allowedDays = operatingHours.openDays
    .split(",")
    .map((d) => parseInt(d.trim(), 10));

  if (!allowedDays.includes(dayOfWeek)) {
    return {
      isValid: false,
      reason: "The shop is closed on this day of the week.",
    };
  }

  // 2. Parse shop opening and closing times for that specific date
  const dateStr = format(start, "yyyy-MM-dd");
  const shopOpen = parse(
    `${dateStr} ${operatingHours.openingHour}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  const shopClose = parse(
    `${dateStr} ${operatingHours.closingHour}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  // Validate start is not before open
  if (isBefore(start, shopOpen)) {
    return {
      isValid: false,
      reason: `Appointment starts before shop opening time (${operatingHours.openingHour}).`,
    };
  }

  // Validate end is not after close
  if (isAfter(end, shopClose)) {
    return {
      isValid: false,
      reason: `Appointment ends after shop closing time (${operatingHours.closingHour}).`,
    };
  }

  // Validate start is before end
  if (!isBefore(start, end)) {
    return {
      isValid: false,
      reason: "Appointment start time must be before end time.",
    };
  }

  return { isValid: true };
}

/**
 * Generates available booking time slots for a given date, service duration, and barber's existing bookings.
 */
export function generateAvailableSlots(
  targetDate: Date,
  serviceDurationMinutes: number,
  operatingHours: OperatingHours,
  existingAppointments: ExistingAppointment[]
): { time: string; start: Date; end: Date; available: boolean }[] {
  const slots: { time: string; start: Date; end: Date; available: boolean }[] = [];
  const dateStr = format(targetDate, "yyyy-MM-dd");

  const dayOfWeek = targetDate.getDay();
  const allowedDays = operatingHours.openDays
    .split(",")
    .map((d) => parseInt(d.trim(), 10));

  if (!allowedDays.includes(dayOfWeek)) {
    return [];
  }

  const shopOpen = parse(
    `${dateStr} ${operatingHours.openingHour}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  const shopClose = parse(
    `${dateStr} ${operatingHours.closingHour}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  let currentSlotStart = shopOpen;
  const interval = operatingHours.slotIntervalMinutes || 30;

  while (true) {
    const slotEnd = addMinutes(currentSlotStart, serviceDurationMinutes);

    // Stop if the service cannot finish before or at closing time
    if (isAfter(slotEnd, shopClose)) {
      break;
    }

    const conflict = hasBarberConflict(
      currentSlotStart,
      slotEnd,
      existingAppointments
    );

    slots.push({
      time: format(currentSlotStart, "HH:mm"),
      start: new Date(currentSlotStart),
      end: new Date(slotEnd),
      available: !conflict,
    });

    currentSlotStart = addMinutes(currentSlotStart, interval);
  }

  return slots;
}
