import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HTTP_STATUS, MESSAGES } from "../../utils/constants";
import { sendSuccess } from "../../helper/response.helper";
import { ApiError } from "../../services/ApiError";
import { reserveSeats } from "./Reservation.utils";

/**
 * POST /api/reserve
 * Reserve available seats for an event for 10 minutes.
 * Requires authentication.
 */
export const reserve = async (
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
    const { eventId, seatNumbers } = req.body;

    const reservation = await reserveSeats(userId, eventId, seatNumbers);

    sendSuccess({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: MESSAGES.RESERVATION_CREATED,
      data: {
        reservationId: reservation._id,
        eventId: reservation.eventId,
        seatNumbers: reservation.seatNumbers,
        expiresAt: reservation.expiresAt,
        status: reservation.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
