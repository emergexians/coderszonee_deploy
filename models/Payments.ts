// models/Payment.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  enrollmentId: mongoose.Types.ObjectId | string;
  amountInPaise: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "created" | "paid" | "failed" | "refunded";
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, index: true },
    amountInPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> = (mongoose.models.Payment as Model<IPayment>) || mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
