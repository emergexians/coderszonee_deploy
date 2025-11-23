"use client";
import { useEffect, useState } from "react";

type SkillPath = {
  _id: string;
  name: string;
  duration: string;
  // add more fields if your API returns them
};

export default function SkillList() {
  const [skills, setSkills] = useState<SkillPath[]>([]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const res = await fetch("/api/skillpaths");
        if (!res.ok) throw new Error("Failed to fetch skill paths");
        const data: SkillPath[] = await res.json();
        setSkills(data);
      } catch (err) {
        console.error(err);
        setSkills([]); // optional fallback
      }
    };

    loadSkills();
  }, []);

  return (
    <div>
      <h2>Skill Paths</h2>
      <ul>
        {skills.map((s) => (
          <li key={s._id}>
            {s.name} – {s.duration}
          </li>
        ))}
      </ul>
    </div>
  );
}
