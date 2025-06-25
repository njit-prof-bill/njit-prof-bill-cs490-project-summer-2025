import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EducationEditor from './EducationEditor';

interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export default function ReorderEducation() {
  const [education, setEducation] = useState<Education[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, 'users', user.uid, 'userDocuments', 'categoryData');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const parsed = JSON.parse(data.groqResponse);
          setEducation(parsed.education || []);
        }
      }
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = education.findIndex((item) => item.degree === active.id);
      const newIndex = education.findIndex((item) => item.degree === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setEducation((items) => arrayMove(items, oldIndex, newIndex));
        setUnsavedChanges(true);
      }
    }
  };

  const saveOrder = async () => {
    if (!userId) return;
    setSaving(true);
    const docRef = doc(db, 'users', userId, 'userDocuments', 'categoryData');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const groq = JSON.parse(data.groqResponse);
      groq.education = education;
      await setDoc(docRef, {
        ...data,
        groqResponse: JSON.stringify(groq, null, 2)
      });
    }
    setSaving(false);
    setUnsavedChanges(false);
  };

  return (
    <div className="p-4 w-full max-w-[58rem] mx-auto">
      <div className="w-full max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Education</h2>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={education.map((e) => e.degree)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {education.map((item) => (
              <SortableItem key={item.degree} id={item.degree} edu={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {unsavedChanges && (
        <div className="text-yellow-400 mt-4 font-medium">You have unsaved changes.</div>
      )}

      <div className="mt-4 flex gap-4">
        <button
          onClick={saveOrder}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"


        >
          {saving ? 'Saving...' : 'Save Order'}
        </button>

        <EducationEditor/>
      </div>

    </div>
  );
}

function SortableItem({ id, edu }: { id: string; edu: Education }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 bg-[#1B1917] cursor-grab"

    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{edu.degree}</h3>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">{edu.institution}</p>
        </div>
        <div className="text-sm text-gray-500 sm:text-right">
          <span className="font-medium">
            {edu.startDate && edu.endDate
              ? `${edu.startDate} - ${edu.endDate}`
              : edu.endDate
              ? edu.endDate
              : edu.startDate || 'Date not specified'}
          </span>
          {edu.gpa && (
            <div className="mt-1">
              <span className="text-xs">GPA: {edu.gpa}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}