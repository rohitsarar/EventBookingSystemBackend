import Event, { IEvent } from "./event.model";
import Seat from "../Booking/seat.model";
import { ApiError } from "../../services/ApiError";
import { MESSAGES, SEAT_STATUS } from "../../utils/constants";

/**
 * Fetch all events (future events first).
 */
export const getAllEvents = async (): Promise<IEvent[]> => {
  return Event.find().sort({ date: 1 }).lean();
};

/**
 * Fetch a single event with its seat grid.
 */
export const getEventWithSeats = async (
  eventId: string,
): Promise<{ event: IEvent; seats: object[] }> => {
  const event = await Event.findById(eventId).lean();
  if (!event) {
    throw ApiError.notFound(MESSAGES.EVENT_NOT_FOUND);
  }

  // Return all seats for this event with status
  const seats = await Seat.find({ eventId })
    .select("seatNumber row status reservedUntil")
    .sort({ row: 1, seatNumber: 1 })
    .lean();

  return { event, seats };
};

/**
 * Seed seats for a newly created event.
 * Rows A-J, 10 seats each.
 */
export const seedSeatsForEvent = async (
  eventId: string,
  totalSeats: number,
): Promise<void> => {
  const SEATS_PER_ROW = 10;
  const rows = "ABCDEFGHIJ".split("");
  const seatsToInsert = [];

  let count = 0;
  for (const row of rows) {
    for (let num = 1; num <= SEATS_PER_ROW; num++) {
      if (count >= totalSeats) break;
      seatsToInsert.push({
        eventId,
        seatNumber: `${row}${num}`,
        row,
        status: SEAT_STATUS.AVAILABLE,
      });
      count++;
    }
    if (count >= totalSeats) break;
  }

  await Seat.insertMany(seatsToInsert);
};
