import { param, ValidationChain } from "express-validator";

export const getEventByIdValidator: ValidationChain[] = [
  param("id")
    .notEmpty()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Invalid event ID format"),
];
