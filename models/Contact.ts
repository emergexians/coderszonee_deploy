// models/Contact.ts
import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },

    reason: {
      type: String,
      enum: ["support", "partnership", "hiring", "feedback", "other"],
      default: "other",
      index: true,
    },

    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    newsletter: { type: Boolean, default: false },
    consent: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
      index: true,
    },

    meta: {
      ip: { type: String, trim: true },
      userAgent: { type: String, trim: true },
      referer: { type: String, trim: true },
    },
  },
  { timestamps: true, collection: "contacts" }
);

// Text index for searching name/email/subject/message
ContactSchema.index({ name: "text", email: "text", subject: "text", message: "text" });

// Types inferred from schema
export type ContactDoc = InferSchemaType<typeof ContactSchema>;
export type ContactModel = Model<ContactDoc>;

// HMR-safe model creation (avoids OverwriteModelError in Next dev)
export const Contact: ContactModel =
  (mongoose.models.Contact as ContactModel) ||
  mongoose.model<ContactDoc>("Contact", ContactSchema);

// (Optional) default export if you prefer default imports
export default Contact;
