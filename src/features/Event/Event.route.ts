import { Router } from "express";
import { listEvents, getEvent } from "./Event.controller";
import { getEventByIdValidator } from "./Event.validotor";

const router = Router();

router.get("/", listEvents);
router.get("/:id", getEventByIdValidator, getEvent);

export default router;
