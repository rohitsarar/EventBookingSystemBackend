import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { SEAT_STATUS } from "../../utils/constants";

export type SeatStatus = "available" | "reserved" | "booked";

export interface ISeat extends Document {
  eventId: Types.ObjectId;
  seatNumber: string;
  row: string;
  status: SeatStatus;
  reservedBy?: Types.ObjectId;
  bookedBy?: Types.ObjectId;
  reservedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const seatSchema = new Schema<ISeat>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    seatNumber: {
      type: String,
      required: [true, "Seat number is required"],
      trim: true,
    },
    row: {
      type: String,
      required: [true, "Row is required"],
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.AVAILABLE,
      required: true,
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reservedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound unique index — one seat number per event
seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ eventId: 1, status: 1 });
seatSchema.index({ reservedUntil: 1 }); // For cron-based expiry cleanup

const Seat: Model<ISeat> = mongoose.model<ISeat>("Seat", seatSchema);

export default Seat;
