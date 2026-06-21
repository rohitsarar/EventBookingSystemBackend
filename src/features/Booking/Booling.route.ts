import { Router } from "express";
import { createBooking } from "./Booking.controller";
import { confirmBookingValidator } from "./Booking.validator";
import { authenticate } from "../../middleware/error.middleware";

const router = Router();

// All booking routes require authentication
router.post("/", authenticate, confirmBookingValidator, createBooking);

export default router;
