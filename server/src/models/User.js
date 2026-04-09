import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["ev_owner", "solar_home", "institution", "admin"],
      required: true,
    },
    walletBalance: { type: Number, default: 10000 },
    batteryLevel: { type: Number, default: 50 },
    location: {
      lat: Number,
      lng: Number,
    },
    availableEnergyKwh: { type: Number, default: 0 },
    askingPricePerKwh: { type: Number, default: 18 },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
