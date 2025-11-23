// models/SkillPath.ts
import mongoose, { Schema, models, model } from "mongoose";
import slugify from "slugify";

/* ========================
   Interfaces
======================== */
export interface ISyllabusSection {
  title: string;
  items?: string[];
}

export interface ISkillPath {
  name: string;
  href?: string;                   // ✅ optional for TS, auto-generated in hooks
  img: string;
  desc: string;
  duration: string;
  skills?: string[];
  rating?: number;
  students?: number;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  slug?: string;                   // ✅ optional for TS, auto-generated in hooks
  perks?: string[];                // "What you'll get"
  syllabus?: ISyllabusSection[];   // structured syllabus
}

/* ========================
   Sub-schema
======================== */
const SyllabusSectionSchema = new Schema<ISyllabusSection>(
  {
    title: { type: String, required: true, trim: true },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

/* ========================
   Main Schema
======================== */
const SkillPathSchema = new Schema<ISkillPath>(
  {
    name: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    img: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    students: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    slug: { type: String, required: true, unique: true, trim: true, index: true },

    // ✅ NEW FIELDS
    perks: { type: [String], default: [] },
    syllabus: { type: [SyllabusSectionSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

/* ========================
   Hooks
======================== */
// ✅ Auto-generate slug + href before validation
SkillPathSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (!this.href && this.slug) {
    this.href = `/skillpaths/${this.slug}`;
  }
  next();
});

/* ========================
   Indexes
======================== */
SkillPathSchema.index({ name: "text", desc: "text" });

/* ========================
   Model
======================== */
const SkillPathModel =
  (models.SkillPath as mongoose.Model<ISkillPath>) ||
  model<ISkillPath>("SkillPath", SkillPathSchema);

/* ========================
   Exports
======================== */
export default SkillPathModel;
export { SkillPathModel as SkillPath };
