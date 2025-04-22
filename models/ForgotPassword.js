import mongoose, { Schema, models, model } from "mongoose";
import connectMongoDB from "../libs/dbConnect";

const ForgotPasswords = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["people", "business"],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default models?.ForgotPasswords ||
  model("ForgotPasswords", ForgotPasswords, "ForgotPasswords");
