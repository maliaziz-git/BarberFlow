import { describe, it, expect } from "vitest";
import {
  calculateEndTime,
  doIntervalsOverlap,
  hasBarberConflict,
  isWithinOperatingHours,
  generateAvailableSlots,
  OperatingHours,
  ExistingAppointment,
} from "../src/lib/appointment-rules";
import { parseISO } from "date-fns";

describe("Appointment Rules & Validation", () => {
  const shopHours: OperatingHours = {
    openingHour: "09:00",
    closingHour: "18:00",
    openDays: "1,2,3,4,5,6", // Mon-Sat
    slotIntervalMinutes: 30,
  };

  describe("calculateEndTime", () => {
    it("correctly calculates end time for 45 minute service", () => {
      const start = new Date("2026-10-12T10:00:00Z");
      const end = calculateEndTime(start, 45);
      expect(end.toISOString()).toBe("2026-10-12T10:45:00.000Z");
    });

    it("throws error for non-positive duration", () => {
      const start = new Date("2026-10-12T10:00:00Z");
      expect(() => calculateEndTime(start, 0)).toThrow();
      expect(() => calculateEndTime(start, -15)).toThrow();
    });
  });

  describe("doIntervalsOverlap", () => {
    const aStart = new Date("2026-10-12T10:00:00Z");
    const aEnd = new Date("2026-10-12T10:45:00Z");

    it("detects exact identical overlap", () => {
      expect(doIntervalsOverlap(aStart, aEnd, aStart, aEnd)).toBe(true);
    });

    it("detects interval inside another", () => {
      const bStart = new Date("2026-10-12T10:15:00Z");
      const bEnd = new Date("2026-10-12T10:30:00Z");
      expect(doIntervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
    });

    it("detects partial overlap at start", () => {
      const bStart = new Date("2026-10-12T09:30:00Z");
      const bEnd = new Date("2026-10-12T10:15:00Z");
      expect(doIntervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
    });

    it("detects partial overlap at end", () => {
      const bStart = new Date("2026-10-12T10:30:00Z");
      const bEnd = new Date("2026-10-12T11:15:00Z");
      expect(doIntervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
    });

    it("does NOT overlap when touching edges (consecutive back-to-back)", () => {
      const bStart = new Date("2026-10-12T10:45:00Z");
      const bEnd = new Date("2026-10-12T11:30:00Z");
      expect(doIntervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);

      const cStart = new Date("2026-10-12T09:15:00Z");
      const cEnd = new Date("2026-10-12T10:00:00Z");
      expect(doIntervalsOverlap(aStart, aEnd, cStart, cEnd)).toBe(false);
    });
  });

  describe("hasBarberConflict", () => {
    const existing: ExistingAppointment[] = [
      {
        id: "appt-1",
        startTime: new Date("2026-10-12T10:00:00Z"),
        endTime: new Date("2026-10-12T10:45:00Z"),
        status: "CONFIRMED",
      },
      {
        id: "appt-2",
        startTime: new Date("2026-10-12T14:00:00Z"),
        endTime: new Date("2026-10-12T14:30:00Z"),
        status: "CANCELLED", // Cancelled should not block!
      },
    ];

    it("detects conflict with active booking", () => {
      const proposedStart = new Date("2026-10-12T10:30:00Z");
      const proposedEnd = new Date("2026-10-12T11:00:00Z");
      expect(hasBarberConflict(proposedStart, proposedEnd, existing)).toBe(true);
    });

    it("allows booking over a CANCELLED appointment", () => {
      const proposedStart = new Date("2026-10-12T14:00:00Z");
      const proposedEnd = new Date("2026-10-12T14:30:00Z");
      expect(hasBarberConflict(proposedStart, proposedEnd, existing)).toBe(false);
    });

    it("allows rescheduling same appointment without conflicting with itself", () => {
      const proposedStart = new Date("2026-10-12T10:00:00Z");
      const proposedEnd = new Date("2026-10-12T10:45:00Z");
      expect(
        hasBarberConflict(proposedStart, proposedEnd, existing, "appt-1")
      ).toBe(false);
    });
  });

  describe("isWithinOperatingHours", () => {
    it("approves appointment inside normal business hours on a Monday", () => {
      // 2026-10-12 is Monday
      const start = new Date("2026-10-12T10:00:00");
      const end = new Date("2026-10-12T10:45:00");
      const result = isWithinOperatingHours(start, end, shopHours);
      expect(result.isValid).toBe(true);
    });

    it("rejects appointment starting before shop opens", () => {
      const start = new Date("2026-10-12T08:30:00");
      const end = new Date("2026-10-12T09:15:00");
      const result = isWithinOperatingHours(start, end, shopHours);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("before shop opening");
    });

    it("rejects appointment ending after shop closes", () => {
      const start = new Date("2026-10-12T17:45:00");
      const end = new Date("2026-10-12T18:15:00");
      const result = isWithinOperatingHours(start, end, shopHours);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("after shop closing");
    });

    it("rejects appointment on closed day (Sunday 2026-10-11)", () => {
      const start = new Date("2026-10-11T11:00:00");
      const end = new Date("2026-10-11T11:30:00");
      const result = isWithinOperatingHours(start, end, shopHours);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("shop is closed on this day");
    });
  });

  describe("generateAvailableSlots", () => {
    it("generates slots and marks conflict slot as unavailable", () => {
      const monday = new Date("2026-10-12T00:00:00");
      const existing: ExistingAppointment[] = [
        {
          id: "appt-1",
          startTime: new Date("2026-10-12T10:00:00"),
          endTime: new Date("2026-10-12T10:45:00"),
          status: "BOOKED",
        },
      ];

      const slots = generateAvailableSlots(monday, 30, shopHours, existing);
      expect(slots.length).toBeGreaterThan(0);

      // Check slot at 09:30 is available
      const slot0930 = slots.find((s) => s.time === "09:30");
      expect(slot0930?.available).toBe(true);

      // Slot at 10:00 conflicts with 10:00-10:45
      const slot1000 = slots.find((s) => s.time === "10:00");
      expect(slot1000?.available).toBe(false);

      // Slot at 10:30 conflicts with 10:00-10:45
      const slot1030 = slots.find((s) => s.time === "10:30");
      expect(slot1030?.available).toBe(false);

      // Slot at 11:00 is available
      const slot1100 = slots.find((s) => s.time === "11:00");
      expect(slot1100?.available).toBe(true);
    });
  });
});
