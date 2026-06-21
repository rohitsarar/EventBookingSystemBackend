import { body, ValidationChain } from "express-validator";

export const reserveSeatsValidator: ValidationChain[] = [
  body("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Invalid event ID format"),

  body("seatNumbers")
    .isArray({ min: 1 })
    .withMessage("seatNumbers must be a non-empty array")
    .custom((arr: unknown[]) => arr.length <= 10)
    .withMessage("Cannot reserve more than 10 seats at once"),

  body("seatNumbers.*")
    .isString()
    .withMessage("Each seat number must be a string")
    .trim()
    .notEmpty()
    .withMessage("Seat number cannot be empty"),
];
