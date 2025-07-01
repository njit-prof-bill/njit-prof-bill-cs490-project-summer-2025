"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { useProfile } from "@/context/profileContext";

// dnd‑kit core + sortable helpers
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/******************************
 * A single draggable skill
 ******************************/
interface SkillChipProps {
  skill: string;
  onRemove: (skill: string) => void;
}

function SkillChip({ skill, onRemove }: SkillChipProps) {
  // turn this chip into a sortable item
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // spread the drag listeners on the WHOLE chip so the user can grab anywhere
      {...attributes}
      {...listeners}
      className="flex items-center space-x-3 p-3 bg-neutral-800 rounded-lg hover:ring-2 hover:ring-blue-500"
    >
      <GripVertical className="h-4 w-4 text-gray-400" />
      <span className="flex-1 select-none">{skill}</span>
      <button
        onClick={() => onRemove(skill)}
        className="p-1 text-red-500 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/******************************
 * Skills section with drag‑and‑drop ordering
 ******************************/
const SkillsSection: React.FC = () => {
  const { activeProfile, updateSkills } = useProfile();

  // Local copy of the skills so we can reorder instantly
  const [skills, setSkills] = useState<string[]>(activeProfile.skills);
  const [newSkill, setNewSkill] = useState<string>("");

  // Make sure local state stays in sync when profile changes
  useEffect(() => setSkills(activeProfile.skills), [activeProfile.skills]);

  /***** dnd‑kit sensors *****/
  const sensors = useSensors(
    useSensor(PointerSensor), // mouse / touch
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }) // a11y
  );

  /***** CRUD helpers *****/
  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    const next = [...skills, trimmed];
    setSkills(next);
    updateSkills(next);
    setNewSkill("");
  };

  const removeSkill = useCallback(
    (skill: string) => {
      const next = skills.filter((s) => s !== skill);
      setSkills(next);
      updateSkills(next);
    },
    [skills, updateSkills]
  );

  /***** Handle the actual re‑ordering *****/
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = skills.indexOf(active.id as string);
      const newIndex = skills.indexOf(over.id as string);
      const next = arrayMove(skills, oldIndex, newIndex);
      setSkills(next);
      updateSkills(next);
    },
    [skills, updateSkills]
  );

  return (
    <section className="space-y-6">
      {/** Header **/}
      <header>
        <h2 className="text-2xl font-bold">Skills</h2>
        <p className="text-sm text-muted-foreground">Drag & drop to reorder</p>
      </header>

      {/** Add new skill **/}
      <div className="bg-neutral-800 p-4 rounded-lg">
        <div className="flex space-x-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="e.g. TypeScript"
            className="flex-1 px-3 py-2 rounded-lg bg-black border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={addSkill}
            disabled={!newSkill.trim() || skills.includes(newSkill.trim())}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
        {newSkill.trim() && skills.includes(newSkill.trim()) && (
          <p className="mt-1 text-xs text-red-500">Skill already exists</p>
        )}
      </div>

      {/** List of draggable skills **/}
      {skills.length === 0 ? (
        <p className="text-center text-muted-foreground">No skills yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={skills} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {skills.map((skill) => (
                <SkillChip key={skill} skill={skill} onRemove={removeSkill} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
};

export default SkillsSection;
