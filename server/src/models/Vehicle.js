import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    type: { type: String, enum: ["truck", "car"], default: "car" },
    batteryLevel: Number,
    speed: Number,
    status: {
      type: String,
      enum: ["idle", "moving", "charging"],
      default: "idle",
    },
    ownerId: String,
    location: {
      lat: Number,
      lng: Number,
    },
    route: [
      {
        lat: Number,
        lng: Number,
      },
    ],
    routeIndex: { type: Number, default: 0 },
    tradeId: String,
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
