// models/Enrollment.ts
import mongoose, { Schema, models, model } from "mongoose";

export interface IEnrollment {
  userEmail: string;
  courseType: "skillpath" | "careerpath" | "courses" ;
  courseSlug: string;
  status?: "pending" | "paid" | "cancelled";
  amount?: number;
  currency?: string;
  meta?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userEmail: { type: String, required: true, trim: true, lowercase: true },
    courseType: { type: String, enum: ["skillpath", "careerpath", "courses"], required: true },
    courseSlug: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
);

EnrollmentSchema.index(
  { userEmail: 1, courseType: 1, courseSlug: 1 },
  { unique: true, name: "uniq_user_course" }
);

const EnrollmentModel =
  (models.Enrollment as mongoose.Model<IEnrollment>) ||
  model<IEnrollment>("Enrollment", EnrollmentSchema);

export default EnrollmentModel;
export { EnrollmentModel as Enrollment };
