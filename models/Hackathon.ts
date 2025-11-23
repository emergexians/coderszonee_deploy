import mongoose, { Schema, InferSchemaType } from "mongoose";

export const HStatus = ["upcoming", "ongoing", "past"] as const;
export type HackStatus = (typeof HStatus)[number];

const ScheduleItem = new Schema(
  { time: { type: String, trim: true }, title: { type: String, trim: true } },
  { _id: false }
);

const HackathonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    tagline: { type: String, trim: true },
    cover: { type: String, trim: true },
    desc: { type: String, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    locationType: { type: String, enum: ["online", "offline", "hybrid"], default: "online" },
    locationName: { type: String, trim: true },

    prizePool: { type: String, trim: true },
    registrationUrl: { type: String, trim: true },

    organizers: [{ type: String, trim: true }],
    sponsors: [{ type: String, trim: true }],

    rules: [{ type: String, trim: true }],
    eligibility: [{ type: String, trim: true }],
    tracks: [{ type: String, trim: true }],
    judges: [{ type: String, trim: true }],
    mentors: [{ type: String, trim: true }],

    schedule: [ScheduleItem],

    published: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "hackathons",
  }
);

HackathonSchema.index({ title: "text", tagline: "text", desc: "text" });

export type HackathonDoc = InferSchemaType<typeof HackathonSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Hackathon =
  mongoose.models.Hackathon || mongoose.model<HackathonDoc>("Hackathon", HackathonSchema);
