// models/Timeline.ts
import mongoose, { Schema, models, model } from "mongoose";
import { ISkillPath } from "@/models/courses/SkillPath";

/* ========================
   Interfaces / Types
======================== */
export interface ITimelineItem {
  title: string;
  description?: string;
  // human-friendly estimate (e.g., "1 week", "3 days") and machine value in days
  estimate?: string;
  estimateDays?: number;
  // array of syllabus bullet ids / text / references
  syllabusItems?: string[]; 
  resources?: { title?: string; url: string; type?: string }[];
  assignments?: { title: string; description?: string; dueInDays?: number }[];
  milestones?: string[]; // e.g., "Build X", "Pass quiz"
  order?: number; // explicit ordering
  startDayOffset?: number; // days offset from timeline start (optional)
}

export interface ICourseTimeline {
  skillPathId: mongoose.Types.ObjectId | string; // ref to SkillPath
  slug?: string; // copied from SkillPath for quick lookup
  title?: string; // optional: "Full timeline for XYZ"
  description?: string;
  startDate?: Date | null;
  items: ITimelineItem[];
  meta?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ========================
   Sub-schema
======================== */
const TimelineItemSchema = new Schema<ITimelineItem>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    estimate: { type: String },
    estimateDays: { type: Number, default: 0 },
    syllabusItems: { type: [String], default: [] },
    resources: {
      type: [
        {
          title: { type: String, trim: true },
          url: { type: String, required: true },
          type: { type: String, trim: true }, // e.g., "video", "article", "repo"
        },
      ],
      default: [],
    },
    assignments: {
      type: [
        {
          title: { type: String, required: true },
          description: { type: String, default: "" },
          dueInDays: { type: Number },
        },
      ],
      default: [],
    },
    milestones: { type: [String], default: [] },
    order: { type: Number, default: 0, index: true },
    startDayOffset: { type: Number, default: null },
  },
  { _id: false }
);

/* ========================
   Main Schema
======================== */
const CourseTimelineSchema = new Schema<ICourseTimeline>(
  {
    skillPathId: { type: Schema.Types.ObjectId, ref: "SkillPath", required: true, index: true },
    slug: { type: String, trim: true, index: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, default: null },
    items: { type: [TimelineItemSchema], default: [] },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
);

/* ========================
   Indexes
======================== */
CourseTimelineSchema.index({ skillPathId: 1, slug: 1 });

/* ========================
   Model
======================== */
const CourseTimelineModel =
  (models.CourseTimeline as mongoose.Model<ICourseTimeline>) ||
  model<ICourseTimeline>("CourseTimeline", CourseTimelineSchema);

export default CourseTimelineModel;
export { CourseTimelineModel as CourseTimeline };
