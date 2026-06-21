import { Router } from "express";
import { reserve } from "./Reservation.controller";
import { reserveSeatsValidator } from "./Reservation.validar";
import { authenticate } from "../../middleware/error.middleware";

const router = Router();

// All reservation routes require authentication
router.post("/", authenticate, reserveSeatsValidator, reserve);

export default router;
