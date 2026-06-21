import mongoose from "mongoose";
import Seat from "./seat.model";
import Reservation, { IReservation } from "../Reservation/IRevarvation.model";
import { ApiError } from "../../services/ApiError";
import { MESSAGES, SEAT_STATUS } from "../../utils/constants";

export interface BookingResult {
  reservationId: string;
  eventId: string;
  seatNumbers: string[];
  bookedAt: Date;
}

/**
 * Confirm a booking from an active reservation.
 * Uses a MongoDB transaction to atomically:
 *  1. Verify reservation is active and not expired
 *  2. Mark seats as booked
 *  3. Mark reservation as converted
 */
export const confirmBooking = async (
  userId: string,
  reservationId: string,
): Promise<BookingResult> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the reservation (locked in transaction)
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId,
      status: "active",
    }).session(session);

    if (!reservation) {
      throw ApiError.notFound(MESSAGES.RESERVATION_NOT_FOUND);
    }

    // 2. Check expiry
    if (reservation.expiresAt < new Date()) {
      reservation.status = "expired";
      await reservation.save({ session });
      // Release the seats back to available
      await Seat.updateMany(
        { _id: { $in: reservation.seatIds } },
        {
          $set: {
            status: SEAT_STATUS.AVAILABLE,
            reservedBy: null,
            reservedUntil: null,
          },
        },
        { session },
      );
      throw ApiError.badRequest(MESSAGES.RESERVATION_EXPIRED);
    }

    // 3. Double-check seats are still reserved by this user
    const seats = await Seat.find({
      _id: { $in: reservation.seatIds },
      status: SEAT_STATUS.RESERVED,
      reservedBy: userId,
    }).session(session);

    if (seats.length !== reservation.seatIds.length) {
      throw ApiError.conflict(MESSAGES.SEATS_UNAVAILABLE);
    }

    // 4. Mark seats as booked
    await Seat.updateMany(
      { _id: { $in: reservation.seatIds } },
      {
        $set: {
          status: SEAT_STATUS.BOOKED,
          bookedBy: userId,
          reservedBy: null,
          reservedUntil: null,
        },
      },
      { session },
    );

    // 5. Mark reservation as converted
    reservation.status = "converted";
    await reservation.save({ session });

    await session.commitTransaction();

    return {
      reservationId: reservation._id.toString(),
      eventId: reservation.eventId.toString(),
      seatNumbers: reservation.seatNumbers,
      bookedAt: new Date(),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
