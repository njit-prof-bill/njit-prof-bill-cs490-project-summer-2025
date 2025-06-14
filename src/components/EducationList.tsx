// src/components/EducationList.tsx
import { mockEducation } from "@/lib/mockEducation";

export default function EducationList() {
  return (
    <div className="border p-4 rounded-md shadow-md w-full max-w-md bg-white mt-6">
      <h2 className="text-lg font-semibold mb-2">Education History</h2>
      <ul className="space-y-2">
        {mockEducation.map((edu, idx) => (
          <li key={idx} className="border p-2 rounded bg-gray-50">
            <p><strong>School:</strong> {edu.school}</p>
            <p><strong>Degree:</strong> {edu.degree}</p>
            <p><strong>Years:</strong> {edu.startYear} - {edu.endYear}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
