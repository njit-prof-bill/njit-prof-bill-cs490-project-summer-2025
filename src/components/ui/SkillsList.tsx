import React from "react";

type Skill = {
  skill: string;
  level: string;
};

type SkillsListProps = {
  skills: Skill[];
};

export default function SkillsList({ skills }: SkillsListProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Skills</h3>
      {skills.map((s, idx) => (
        <div key={idx} className="border rounded-md p-2">
          <strong>{s.skill}</strong> — {s.level}
        </div>
      ))}
    </div>
  );
}
