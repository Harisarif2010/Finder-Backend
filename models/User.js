import { required } from "joi";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    token: { type: String },
    isProfileCompleted: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    matchingMedia: {
      image: {
        type: [String], // Array of image URLs
        default: [],
      },
      video: {
        type: String, // Single video URL
        default: "",
      },
    },
    gender: { type: String, required: true },
    interest: { type: [String] },
    role: {
      type: String,
      enum: ["business", "people"],
      default: "people",
    },
    profilePrivacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    whiteList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    blackList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    // Business-specific fields
    businessName: { type: String },
    vatId: { type: String },
    businessAddress: { type: String },
    businessDescription: { type: String },
    // 👇 Location field
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
      address: { type: String }, // optional readable address
    },
    // 🧠 Update here — store references to users
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  },
  { timestamps: true }
);

// Check if the model is already compiled, if not, compile it.
const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

export default Users;
