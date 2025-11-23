"use client";
import { useEffect, useState } from "react";

export default function SkillList() {
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/skillpaths")
      .then((res) => res.json())
      .then((data) => setSkills(data));
  }, []);

  return (
    <div>
      <h2>Skill Paths</h2>
      <ul>
        {skills.map((s) => (
          <li key={s._id}>{s.name} – {s.duration}</li>
        ))}
      </ul>
    </div>
  );
}
