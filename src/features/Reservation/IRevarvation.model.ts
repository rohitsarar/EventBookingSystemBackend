import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type ReservationStatus = "active" | "expired" | "converted";

export interface IReservation extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  seatIds: Types.ObjectId[];
  seatNumbers: string[];
  expiresAt: Date;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    seatIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],
    seatNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "converted"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// TTL index — MongoDB auto-deletes expired reservations after 1 day
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
reservationSchema.index({ userId: 1, status: 1 });
reservationSchema.index({ eventId: 1 });

const Reservation: Model<IReservation> = mongoose.model<IReservation>(
  "Reservation",
  reservationSchema,
);

export default Reservation;
