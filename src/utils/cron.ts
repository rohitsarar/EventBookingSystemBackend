import cron from "node-cron";

import Seat from "../features/Booking/seat.model";
import { SEAT_STATUS } from "./constants";
import Reservation from "../features/Reservation/IRevarvation.model";

/**
 * Cron job: runs every minute.
 * Releases seats from expired reservations that were not cleaned up by TTL.
 */
export const startExpiredReservationCleaner = (): void => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find active reservations that have passed expiry
      const expired = await Reservation.find({
        status: "active",
        expiresAt: { $lt: now },
      }).select("_id seatIds");

      if (expired.length === 0) return;

      const seatIds = expired.flatMap((r) => r.seatIds);
      const reservationIds = expired.map((r) => r._id);

      // Release seats
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        {
          $set: {
            status: SEAT_STATUS.AVAILABLE,
            reservedBy: null,
            reservedUntil: null,
          },
        },
      );

      // Mark reservations as expired
      await Reservation.updateMany(
        { _id: { $in: reservationIds } },
        { $set: { status: "expired" } },
      );

      console.log(
        `🧹 Cron: Released ${seatIds.length} seats from ${expired.length} expired reservations`,
      );
    } catch (error) {
      console.error("Cron job error (expired reservations):", error);
    }
  });

  console.log("⏰  Reservation cleaner cron started");
};
