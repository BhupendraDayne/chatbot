import mongoose from "mongoose";

const healthLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
  },
  doctorsFound: [
    {
      name: String,
      address: String,
      rating: Number,
      location: {
        lat: Number,
        lng: Number,
      },
    },
  ],
  hospitalsFound: [
    {
      name: String,
      address: String,
      rating: Number,
      location: {
        lat: Number,
        lng: Number,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HealthLocation = mongoose.model("HealthLocation", healthLocationSchema);

export default HealthLocation;
