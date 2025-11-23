// lib/timelineUtils.ts
import { CourseTimeline } from "@/models/Timeline";
import SkillPathModel, { ISyllabusSection, ISkillPath } from "@/models/courses/SkillPath";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";

/**
 * Heuristic: estimate days by number of items:
 * 0 items -> 1 day, 1-3 -> 3 days, 4-6 -> 7 days, 7+ -> 14 days
 */
function estimateDaysFromCount(count: number) {
  if (count <= 0) return 1;
  if (count <= 3) return 3;
  if (count <= 6) return 7;
  return 14;
}

/**
 * Build a timeline items array from syllabus sections.
 * Each section -> a timeline module.
 */
export async function generateTimelineFromSyllabus(skillPathIdOrSlug: string | mongoose.Types.ObjectId) {
  await dbConnect();

  // fetch by id or slug
  let skill: ISkillPath | null = null;
  if (mongoose.Types.ObjectId.isValid(String(skillPathIdOrSlug))) {
    skill = await SkillPathModel.findById(skillPathIdOrSlug).lean<ISkillPath>().exec();
  }
  if (!skill) {
    // try by slug
    skill = await SkillPathModel.findOne({ slug: String(skillPathIdOrSlug) }).lean<ISkillPath>().exec();
  }
  if (!skill) throw new Error("SkillPath not found");

  const syllabus = (skill.syllabus || []) as ISyllabusSection[];

  const items = syllabus.map((sec, idx) => {
    const count = (sec.items || []).length;
    const estDays = estimateDaysFromCount(count);
    return {
      title: sec.title,
      description: sec.items && sec.items.length ? sec.items.slice(0, 3).join(" • ") : "",
      estimate: `${estDays} day${estDays > 1 ? "s" : ""}`,
      estimateDays: estDays,
      syllabusItems: sec.items || [],
      resources: [],
      assignments: [],
      milestones: [],
      order: idx + 1,
    };
  });

  // create timeline doc
  const timelineDoc = await CourseTimeline.create({
    skillPathId: skill._id,
    slug: skill.slug,
    title: `${skill.name} — Course Timeline`,
    description: `Suggested timeline generated from the syllabus for ${skill.name}`,
    items,
    startDate: null,
  });

  return timelineDoc;
}
