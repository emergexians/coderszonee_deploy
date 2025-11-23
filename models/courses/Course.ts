// models/Course.ts
import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function slugify(input: string) {
  return input
    .toString()
    .normalize("NFKD")               // split accents
    .replace(/[\u0300-\u036f]/g, "") // drop accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")     // non-alnum -> -
    .replace(/^-+|-+$/g, "")         // trim -
    .replace(/-{2,}/g, "-");         // collapse --
}

const SyllabusSectionSchema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    items: [{ type: String, trim: true }],
  },
  { _id: false }
);

const CourseSchema = new Schema(
  {
    title: { type: String, trim: true, required: true, index: true },
    slug:  { type: String, trim: true, lowercase: true, unique: true, index: true },
    cover: { type: String, trim: true, required: true },
    duration: { type: String, trim: true, required: true },
    level: { type: String, enum: LEVELS, required: true, index: true },
    category: { type: String, trim: true, required: true, index: true },
    subCategory: { type: String, trim: true, required: true, index: true },
    desc: { type: String, trim: true, required: true },
    perks: [{ type: String, trim: true }],
    syllabus: [SyllabusSectionSchema],
    // Optional fields (NOT required)
    rating: { type: Number, min: 0, max: 5 },
    students: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    collection: "courses",
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

// SEO href virtual
CourseSchema.virtual("href").get(function (this: any) {
  return `/course/courses/${this.slug}`;
});

// Ensure slug exists & is unique (based on title)
CourseSchema.pre("validate", async function (next) {
  try {
    if (!this.isModified("title") && this.slug) return next();

    const base = slugify(this.title || "");
    if (!base) {
      return next(new Error("Valid title is required to generate slug."));
    }

    // Try unique slug; add -2, -3 ... if needed
    let trySlug = base;
    let i = 2;
    const Course = this.constructor as Model<any>;
    // Loop while a different document already has this slug
    // Note: Use exists to keep it lightweight
    while (
      await Course.exists({ slug: trySlug, _id: { $ne: this._id } })
    ) {
      trySlug = `${base}-${i++}`;
    }
    this.slug = trySlug;
    next();
  } catch (err) {
    next(err as any);
  }
});

// Helpful indexes
CourseSchema.index({ title: "text", desc: "text", category: 1, subCategory: 1 });

export type CourseDoc = InferSchemaType<typeof CourseSchema>;
export const Course =
  mongoose.models.Course || mongoose.model<CourseDoc>("Course", CourseSchema);
export default Course;