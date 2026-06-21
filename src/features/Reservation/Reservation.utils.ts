import mongoose from "mongoose";
import Seat from "../Booking/seat.model";

import Event from "../Event/event.model";
import { ApiError } from "../../services/ApiError";
import {
  MESSAGES,
  SEAT_STATUS,
  RESERVATION_EXPIRY_MINUTES,
} from "../../utils/constants";
import Reservation, { IReservation } from "./IRevarvation.model";

/**
 * Atomically reserve seats for a user.
 * Uses a MongoDB transaction to prevent double booking.
 */
export const reserveSeats = async (
  userId: string,
  eventId: string,
  seatNumbers: string[],
): Promise<IReservation> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check event exists
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw ApiError.notFound(MESSAGES.EVENT_NOT_FOUND);
    }

    // 2. Fetch seats with session lock
    const seats = await Seat.find({
      eventId,
      seatNumber: { $in: seatNumbers },
    }).session(session);

    // 3. Check all requested seats were found
    if (seats.length !== seatNumbers.length) {
      const found = seats.map((s) => s.seatNumber);
      const missing = seatNumbers.filter((s) => !found.includes(s));
      throw ApiError.badRequest(`Seats not found: ${missing.join(", ")}`);
    }

    // 4. Ensure all seats are truly available
    const unavailable = seats.filter(
      (s) =>
        s.status !== SEAT_STATUS.AVAILABLE ||
        (s.reservedUntil && s.reservedUntil > new Date()),
    );

    if (unavailable.length > 0) {
      throw ApiError.conflict(
        `${MESSAGES.SEATS_UNAVAILABLE}: ${unavailable
          .map((s) => s.seatNumber)
          .join(", ")}`,
      );
    }

    // 5. Calculate expiry
    const expiresAt = new Date(
      Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000,
    );

    // 6. Update seats atomically
    const seatIds = seats.map((s) => s._id);

    const updateResult = await Seat.updateMany(
      {
        _id: { $in: seatIds },
        status: SEAT_STATUS.AVAILABLE, // Double-check during update
      },
      {
        $set: {
          status: SEAT_STATUS.RESERVED,
          reservedBy: userId,
          reservedUntil: expiresAt,
        },
      },
      { session },
    );

    // 7. If fewer docs updated than expected — race condition caught
    if (updateResult.modifiedCount !== seatNumbers.length) {
      throw ApiError.conflict(MESSAGES.SEATS_UNAVAILABLE);
    }

    // 8. Create reservation document
    const [reservation] = await Reservation.create(
      [
        {
          userId,
          eventId,
          seatIds,
          seatNumbers,
          expiresAt,
          status: "active",
        },
      ],
      { session },
    );

    // 9. Decrement availableSeats on the event
    await Event.findByIdAndUpdate(
      eventId,
      { $inc: { availableSeats: -seatNumbers.length } },
      { session },
    );

    await session.commitTransaction();
    return reservation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Fetch a single active reservation by ID for a user.
 */
export const getActiveReservation = async (
  reservationId: string,
  userId: string,
): Promise<IReservation> => {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    userId,
    status: "active",
  });

  if (!reservation) {
    throw ApiError.notFound(MESSAGES.RESERVATION_NOT_FOUND);
  }

  if (reservation.expiresAt < new Date()) {
    // Mark as expired
    reservation.status = "expired";
    await reservation.save();
    throw ApiError.badRequest(MESSAGES.RESERVATION_EXPIRED);
  }

  return reservation;
};
