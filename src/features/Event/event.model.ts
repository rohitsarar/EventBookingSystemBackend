import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEvent extends Document {
  name: string;
  description: string;
  date: Date;
  venue: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: [100, "Event name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
      maxlength: [200, "Venue cannot exceed 200 characters"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Total seats must be at least 1"],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, "Available seats cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index for event listing queries
eventSchema.index({ date: 1 });
eventSchema.index({ availableSeats: 1 });

const Event: Model<IEvent> = mongoose.model<IEvent>("Event", eventSchema);

export default Event;
