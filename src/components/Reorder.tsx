// import { useEffect, useState } from 'react';
// import { auth, db } from '@/lib/firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { DndContext, closestCenter } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

// interface MoveAroundProps {
//   tag: 'skills' | 'education' | 'workExperience';
// }

// function SortableItem({ id }: { id: string }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//   } = useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <li
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className="bg-gray border rounded p-2 mb-2 shadow cursor-move"
//     >
//       {id}
//     </li>
//   );
// }

// export default function MoveAround({ tag }: MoveAroundProps) {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [items, setItems] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [status, setStatus] = useState<string>('');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUserId(user.uid);
//         const docRef = doc(db, 'users', user.uid, 'userDocuments', 'categoryData');
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           try {
//             const parsed = JSON.parse(data.groqResponse);
//             setItems(parsed[tag] || []);
//           } catch (e) {
//             console.error('Invalid JSON in groqResponse');
//           }
//         }
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, [tag]);

//   const handleDragEnd = (event: any) => {
//     const { active, over } = event;
//     if (active.id !== over.id) {
//       const oldIndex = items.indexOf(active.id);
//       const newIndex = items.indexOf(over.id);
//       setItems(arrayMove(items, oldIndex, newIndex));
//     }
//   };

//   const handleSave = async () => {
//     if (!userId) return;
//     setSaving(true);
//     setStatus('Saving...');
//     const docRef = doc(db, 'users', userId, 'userDocuments', 'categoryData');
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       try {
//         const data = docSnap.data();
//         const parsed = JSON.parse(data.groqResponse);
//         parsed[tag] = items;
//         await updateDoc(docRef, {
//           groqResponse: JSON.stringify(parsed, null, 2),
//         });
//         setStatus('Saved successfully!');
//       } catch (e) {
//         setStatus('Failed to save changes');
//       }
//     }
//     setSaving(false);
//   };

//   if (loading) return <p>Loading {tag}...</p>;

//   return (
//     <div className="my-4">
//       <h3 className="font-semibold text-lg capitalize mb-2">Reorder {tag}</h3>
//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext items={items} strategy={verticalListSortingStrategy}>
//           <ul>{items.map((item) => <SortableItem key={item} id={item} />)}</ul>
//         </SortableContext>
//       </DndContext>
//       <button
//         onClick={handleSave}
//         disabled={saving}
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
//       >
//         {saving ? 'Saving...' : 'Save Order'}
//       </button>
//       {status && <p className="text-sm mt-2">{status}</p>}
//     </div>
//   );
// }
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

interface ReorderProps {
  tag: 'skills' | 'education' | 'workExperience';
}

export default function Reorder({ tag }: ReorderProps) {
  const [items, setItems] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
            setItems(parsed[tag] || []);
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
  };

  if (loading) return <div className="text-white">Loading {tag}...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-semibold text-white mb-3 capitalize">Skills</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItem key={item} id={item} content={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={saveOrder}
        disabled={saving}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        {saving ? 'Saving...' : 'Save Order'}
      </button>
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
      className="flex items-center justify-start px-4 py-3 bg-[#121212] text-white border border-gray-700 rounded cursor-grab"
    >
      <div className="mr-3 text-gray-400 select-none">≡</div>
      <span>{content}</span>
    </div>
  );
}
