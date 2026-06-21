import { body, ValidationChain } from "express-validator";

export const confirmBookingValidator: ValidationChain[] = [
  body("reservationId")
    .notEmpty()
    .withMessage("Reservation ID is required")
    .isMongoId()
    .withMessage("Invalid reservation ID format"),
];
