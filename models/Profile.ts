// models/User.ts (or models/Profile.ts)
import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  email: string;
  fullName?: string;
  phone?: string;
  city?: string;
  branch?: string;
  graduationYear?: string;
  portfolio?: string;
  bio?: string;
  gender?: string;
  skills?: string[];
  avatarDataUrl?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    fullName: String,
    phone: String,
    city: String,
    branch: String,
    graduationYear: String,
    portfolio: String,
    bio: String,
    gender: String,
    skills: [String],
    avatarDataUrl: String,
    role: { type: String, default: "student" },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

const User = (models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);

export default User;
