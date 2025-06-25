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
import WorkExperienceEditor from './WorkExperienceEditor';

interface WorkExperience {
  jobTitle: string;
  jobDesc: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export default function ReorderWorkExperience() {
  const [items, setItems] = useState<WorkExperience[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, 'users', user.uid, 'userDocuments', 'categoryData');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.groqResponse) {
            const parsed = JSON.parse(data.groqResponse);
            setItems(parsed.workExperience || []);
          }
        }
        setLoading(false);
      }
    });
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => JSON.stringify(item) === active.id);
      const newIndex = items.findIndex((item) => JSON.stringify(item) === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setItems((items) => arrayMove(items, oldIndex, newIndex));
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
      let groq = JSON.parse(data.groqResponse);
      groq.workExperience = items;
      await setDoc(docRef, {
        ...data,
        groqResponse: JSON.stringify(groq, null, 2)
      });
    }

    setSaving(false);
    setUnsavedChanges(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  if (loading) return <div className="text-white p-4">Loading work experience...</div>;

  return (
    <div className="w-full max-w-[56rem] mx-auto">
      <div className="w-full max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6">Experience</h2>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(item => JSON.stringify(item))} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {items.map((item, index) => (
              <SortableWorkCard key={JSON.stringify(item)} id={JSON.stringify(item)} data={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {unsavedChanges && (
        <div className="text-yellow-400 mt-3 font-medium">
          You have unsaved changes.
        </div>
      )}

      <div className="mt-4 flex justify-start gap-3">
        <button
          onClick={saveOrder}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          {saving ? 'Saving...' : 'Save Order'}
        </button>

        {/* Render Edit button inline here */}
        <WorkExperienceEditor />
      </div>
    </div>
  );
}

function SortableWorkCard({
  id,
  data
}: {
  id: string;
  data: WorkExperience;
}) {
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
      className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 bg-[#1B1917] cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">
            {data.jobTitle}
          </h3>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">
            {data.company}
          </p>
        </div>
        <div className="text-sm text-gray-500 sm:text-right">
          <span className="font-medium">{data.startDate} - {data.endDate}</span>
        </div>
      </div>

      {data.jobDesc && (
        <div className="mb-4">
          <p className="leading-relaxed text-gray-300">{data.jobDesc}</p>
        </div>
      )}

      {data.responsibilities?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide">
            Key Responsibilities
          </h4>
          <ul className="space-y-2">
            {data.responsibilities.map((resp, i) => (
              <li key={i} className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                <span className="text-sm leading-relaxed">{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}