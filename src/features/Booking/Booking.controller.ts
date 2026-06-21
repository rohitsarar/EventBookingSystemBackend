import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HTTP_STATUS, MESSAGES } from "../../utils/constants";
import { sendSuccess } from "../../helper/response.helper";
import { ApiError } from "../../services/ApiError";
import { confirmBooking } from "./Booking.utils";

/**
 * POST /api/bookings
 * Confirm a booking from an active reservation.
 * Marks seats as booked and closes the reservation.
 * Requires authentication.
 */
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest(
        MESSAGES.VALIDATION_ERROR,
        errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
      );
    }

    const userId = (req as any).user._id.toString();
    const { reservationId } = req.body;

    const result = await confirmBooking(userId, reservationId);

    sendSuccess({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: MESSAGES.BOOKING_CONFIRMED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
