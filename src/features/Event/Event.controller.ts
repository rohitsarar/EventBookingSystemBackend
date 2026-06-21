import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HTTP_STATUS, MESSAGES } from "../../utils/constants";
import { sendSuccess } from "../../helper/response.helper";
import { ApiError } from "../../services/ApiError";
import { getAllEvents, getEventWithSeats } from "./Event.utils";

/**
 * GET /api/events
 * List all upcoming events.
 */
export const listEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const events = await getAllEvents();

    sendSuccess({
      res,
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.EVENTS_FETCHED,
      data: events,
      meta: { total: events.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:id
 * Get a single event with its seat grid.
 */
export const getEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate param
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.badRequest(
        MESSAGES.VALIDATION_ERROR,
        errors.array().map((e) => ({ field: (e as any).path, message: e.msg })),
      );
    }

    const id = req.params.id;
    if (Array.isArray(id)) {
      throw new Error("Invalid event id");
    }
    const { event, seats } = await getEventWithSeats(id);

    sendSuccess({
      res,
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.EVENT_FETCHED,
      data: { event, seats },
    });
  } catch (error) {
    next(error);
  }
};
