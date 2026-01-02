import { Schema, model, models, Types } from "mongoose";

/* =========================
   Sub Schemas
========================= */

// 🚀 Offerings
const OfferingSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// 🧩 Technology Stack
const TechStackSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Frontend / Backend / AI
    },
    description: {
      type: String,
      required: true, // HTML, CSS, React...
    },
    projects: [
      {
        type: String,
        trim: true, // Landing pages, Dashboards...
      },
    ],
  },
  { _id: false }
);

// 👥 Audience
const AudienceSchema = new Schema(
  {
    title: {
      type: String,
      required: true, // Students / Professionals
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// 🛠 Tools / Platforms
const ToolSchema = new Schema(
  {
    image: {
      type: String,
      required: true, // URL (fixed dimension)
    },
    alt: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/* =========================
   Main Landing Page Schema
========================= */

const CourseLandingPageSchema = new Schema(
  {
    // 🔗 One landing page per course
    courseId: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
      index: true,
    },

    /* ========= HERO ========= */
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },

    offerings: [OfferingSchema],

    /* ========= STACK ========= */
    techStacks: [TechStackSchema],

    /* ========= AUDIENCE ========= */
    audience: [AudienceSchema],

    /* ========= TOOLS ========= */
    tools: [ToolSchema],

    /* ========= FLAGS ========= */
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   Export Model
========================= */

export const CourseLandingPage =
  models.CourseLandingPage ||
  model("CourseLandingPage", CourseLandingPageSchema);
