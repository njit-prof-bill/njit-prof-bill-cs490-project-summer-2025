interface ContactCardProps {
  contact: {
    email: string;
    phone: string;
  };
  onChange: (contact: { email: string; phone: string }) => void;
}

export default function ContactCard({ contact, onChange }: ContactCardProps) {
  return (
    <div className="space-y-4 p-6 rounded-lg bg-gray-800 text-white shadow-md">
      <h3 className="text-xl font-semibold mb-2">Contact Information</h3>

      <label className="block">
        Email:
        <input
          type="email"
          value={contact.email}
          onChange={(e) => onChange({ ...contact, email: e.target.value })}
          className="mt-1 block w-full border border-gray-600 rounded bg-gray-700 text-white px-3 py-2 focus:outline-none focus:bg-gray-600"
        />
      </label>

      <label className="block">
        Phone:
        <input
          type="tel"
          value={contact.phone}
          onChange={(e) => onChange({ ...contact, phone: e.target.value })}
          className="mt-1 block w-full border border-gray-600 rounded bg-gray-700 text-white px-3 py-2 focus:outline-none focus:bg-gray-600"
        />
      </label>
    </div>
  );
}
