// accordion.tsx
import { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

export default function Accordion({ title, children }: AccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-3 font-medium bg-gray-100"
      >
        {title}
      </button>
      {open && <div className="p-3 bg-white">{children}</div>}
    </div>
  );
}
