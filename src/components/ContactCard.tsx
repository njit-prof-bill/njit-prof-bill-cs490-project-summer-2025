interface ContactCardProps {
  contact: {
    emails: string[];
    phones: string[];
  };
  onChange: (contact: { emails: string[]; phones: string[] }) => void;
}

export default function ContactCard({ contact, onChange }: ContactCardProps) {
  const handleEmailChange = (idx: number, value: string) => {
    const newEmails = [...contact.emails];
    newEmails[idx] = value;
    onChange({ ...contact, emails: newEmails });
  };
  const handlePhoneChange = (idx: number, value: string) => {
    const newPhones = [...contact.phones];
    newPhones[idx] = value;
    onChange({ ...contact, phones: newPhones });
  };
  const addEmail = () => onChange({ ...contact, emails: [...contact.emails, ""] });
  const removeEmail = (idx: number) => onChange({ ...contact, emails: contact.emails.filter((_, i) => i !== idx) });
  const addPhone = () => onChange({ ...contact, phones: [...contact.phones, ""] });
  const removePhone = (idx: number) => onChange({ ...contact, phones: contact.phones.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4 p-6 rounded-lg bg-gray-800 text-white shadow-md">
      <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
      <div className="space-y-2">
        {contact.emails.map((email, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="email"
              value={email}
              onChange={e => handleEmailChange(idx, e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-700 text-white px-3 py-2 focus:outline-none focus:bg-gray-600"
              placeholder={`Email${contact.emails.length > 1 ? ` #${idx + 1}` : ''}`}
            />
            {contact.emails.length > 1 && (
              <button type="button" onClick={() => removeEmail(idx)} className="text-red-400 hover:text-red-300 text-xl">&times;</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addEmail} className="text-blue-400 hover:underline text-sm">+ Add Email</button>
      </div>
      <div className="space-y-2">
        {contact.phones.map((phone, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="tel"
              value={phone}
              onChange={e => handlePhoneChange(idx, e.target.value)}
              className="mt-1 block w-full border border-gray-600 rounded bg-gray-700 text-white px-3 py-2 focus:outline-none focus:bg-gray-600"
              placeholder={`Phone${contact.phones.length > 1 ? ` #${idx + 1}` : ''}`}
            />
            {contact.phones.length > 1 && (
              <button type="button" onClick={() => removePhone(idx)} className="text-red-400 hover:text-red-300 text-xl">&times;</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addPhone} className="text-blue-400 hover:underline text-sm">+ Add Phone</button>
      </div>
    </div>
  );
}
