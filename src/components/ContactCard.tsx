// src/components/ContactCard.tsx
import { mockContact } from "@/lib/mockContact";

export default function ContactCard() {
  return (
    <div className="border p-4 rounded-md shadow-md w-full max-w-md bg-white">
      <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
      <p><strong>Name:</strong> {mockContact.name}</p>
      <p><strong>Email:</strong> {mockContact.email}</p>
      <p><strong>Phone:</strong> {mockContact.phone}</p>
    </div>
  );
}
