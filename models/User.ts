// models/User.ts
import mongoose, { Schema, InferSchemaType } from "mongoose";

export const USER_ROLES = ["student", "instructor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const urnRegex = /^(STD|INS)\/\d{4}\/[A-Z0-9]{5}$/;

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },

    // Email should be required for auth systems; keep lowercase normalization
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      unique: true,
      required: true,
    },

    // Phone number (optional but stored for contact)
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    role: { type: String, enum: USER_ROLES, default: "student", index: true },

    // Hide password by default when querying
    password: { type: String, select: false },

    meta: { type: Schema.Types.Mixed },

    // URN must be unique and follow the format STD/YYYY/5ALNUM or INS/YYYY/5ALNUM
    urn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [urnRegex, "URN must match STD/YYYY/5ALNUM or INS/YYYY/5ALNUM"],
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        // Add `id` field as string
        const _id = ret._id;
        if (
          typeof _id === "string" ||
          _id instanceof mongoose.Types.ObjectId
        ) {
          (ret as { id?: string }).id = String(_id);
        }

        // Remove internal fields
        delete (ret as { _id?: unknown })._id;
        delete (ret as { password?: unknown }).password;
      },
    },
    toObject: { virtuals: true },
  }
);

// Full-text search for name and email
UserSchema.index({ name: "text", email: "text" });

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

const User =
  mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);

export default User;
