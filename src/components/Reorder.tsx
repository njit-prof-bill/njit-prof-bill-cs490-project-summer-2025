import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import SkillsEditor from './SkillsEditor';
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

interface ReorderProps {
  tag: 'skills' | 'education' | 'workExperience';
  deduplicateSkills?: (skills: string[]) => string[]; // optional for non-skills
}

export default function Reorder({ tag, deduplicateSkills }: ReorderProps) {
  const [items, setItems] = useState<string[]>([]);
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
            let values = parsed[tag] || [];

            // Deduplicate skills after loading
            if (tag === 'skills') {
              const seen = new Set<string>();
              values = values.filter((item) => {
                const lower = item.toLowerCase();
                if (seen.has(lower)) return false;
                seen.add(lower);
                return true;
              });
            }
            setItems(values);
          }
        }
        setLoading(false);
      }
    });
  }, [tag]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item === active.id);
      const newIndex = items.findIndex((item) => item === over?.id);
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
      groq[tag] = items;
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

  if (loading) return <div className="text-white">Loading {tag}...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-semibold text-white mb-3 capitalize">{tag}</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem key={`${item}-${index}`} id={item} content={item} />
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

        {tag === 'skills' && (
          <SkillsEditor deduplicateSkills={deduplicateSkills} />
        )}
      </div>
    </div>
  );
}

function SortableItem({ id, content }: { id: string; content: string }) {
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
      className="flex items-center justify-start px-4 py-3 w-full max-w-4xl bg-[#1B1917] text-white border border-gray-700 rounded cursor-grab hover:bg-[#24252A] active:bg-[#0d0d0d] select-none"
    >
      <div className="mr-3 text-gray-400 select-none">≡</div>
      <span>{content}</span>
    </div>
  );
}
