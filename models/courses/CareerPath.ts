// models/CareerPath.ts
import mongoose, { Schema, models, model, InferSchemaType, Model } from "mongoose";

/** Keep in sync with your UI filter chips */
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type Level = (typeof LEVELS)[number];

function slugify(input: string) {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const SyllabusSectionSchema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    items: [{ type: String, trim: true }],
  },
  { _id: false }
);

const CareerPathSchema = new Schema(
  {
    // Core
    name: { type: String, trim: true, required: true, index: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, index: true },

    // Media & meta
    img: { type: String, trim: true, required: true },
    duration: { type: String, trim: true, required: true },
    level: { type: String, enum: LEVELS, required: true, index: true, default: "Beginner" },
    desc: { type: String, trim: true, required: true },

    // Optional arrays
    skills: [{ type: String, trim: true }],
    perks: [{ type: String, trim: true }],
    syllabus: [SyllabusSectionSchema],

    // Optionals (numeric)
    rating: { type: Number, min: 0, max: 5, default: 0 },
    students: { type: Number, min: 0, default: 0 },
  },
  {
    timestamps: true,
    collection: "careerpaths",
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: any) => {
        ret.id = String(ret._id);
        delete ret._id;
      },
    },
    toObject: { virtuals: true },
  }
);

/** Virtual href (keep route style consistent with your Course model) */
CareerPathSchema.virtual("href").get(function (this: any) {
  return `/course/careerpaths/${this.slug}`;
});

/** Generate a unique slug from `name` (similar to Course pre-hook) */
CareerPathSchema.pre("validate", async function (next) {
  try {
    if (!this.isModified("name") && this.slug) return next();

    const base = slugify(this.name || "");
    if (!base) return next(new Error("A valid name is required to generate slug."));

    let candidate = base;
    let i = 2;
    const CareerPath = this.constructor as Model<any>;

    // Ensure uniqueness; append -2, -3, ... if needed
    while (await CareerPath.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${i++}`;
    }
    this.slug = candidate;
    next();
  } catch (err) {
    next(err as any);
  }
});

/** Text index for quick search (name/desc) */
CareerPathSchema.index({ name: "text", desc: "text" });

export type CareerPathDoc = InferSchemaType<typeof CareerPathSchema>;
export const CareerPath =
  (models.CareerPath as mongoose.Model<CareerPathDoc>) ||
  model<CareerPathDoc>("CareerPath", CareerPathSchema);

export default CareerPath;
