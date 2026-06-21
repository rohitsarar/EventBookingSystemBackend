import { Router } from "express";
import { register, login, getMe } from "./Authentication.controller";
import { registerValidator, loginValidator } from "./Authentication.validator";
import { authenticate } from "../../middleware/error.middleware";

const router = Router();

// Public routes
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

// Protected route
router.get("/me", authenticate, getMe);

export default router;
