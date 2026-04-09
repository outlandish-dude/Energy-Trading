import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    buyerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    buyerType: { type: String, required: true },
    sellerId: { type: String, required: true },
    sellerName: { type: String, required: true },
    sellerType: { type: String, required: true },
    kwh: { type: Number, required: true },
    pricePerKwh: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    emergency: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["created", "moving", "charging", "completed"],
      default: "created",
    },
    vehicleId: String,
    progressPct: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Trade = mongoose.model("Trade", tradeSchema);
