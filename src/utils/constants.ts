export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const MESSAGES = {
  // Auth
  USER_REGISTERED: "User registered successfully",
  USER_LOGIN: "Login successful",
  USER_LOGOUT: "Logout successful",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_EXISTS: "Email already registered",
  UNAUTHORIZED: "Unauthorized. Please login.",
  TOKEN_EXPIRED: "Session expired. Please login again.",
  TOKEN_INVALID: "Invalid token.",

  // Event
  EVENTS_FETCHED: "Events fetched successfully",
  EVENT_FETCHED: "Event fetched successfully",
  EVENT_NOT_FOUND: "Event not found",
  EVENT_CREATED: "Event created successfully",

  // Reservation
  RESERVATION_CREATED: "Seats reserved successfully",
  RESERVATION_NOT_FOUND: "Reservation not found or expired",
  SEATS_UNAVAILABLE: "One or more seats are not available",
  RESERVATION_EXPIRED: "Reservation has expired",

  // Booking
  BOOKING_CONFIRMED: "Booking confirmed successfully",
  BOOKING_FAILED: "Booking failed",
  BOOKING_NOT_FOUND: "Booking not found",

  // Generic
  INTERNAL_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation error",
  NOT_FOUND: "Resource not found",
} as const;

export const RESERVATION_EXPIRY_MINUTES = 10;
export const JWT_EXPIRES_IN = "7d";
export const BCRYPT_SALT_ROUNDS = 12;

export const SEAT_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  BOOKED: "booked",
} as const;
