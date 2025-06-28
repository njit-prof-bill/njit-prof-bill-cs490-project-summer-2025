"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Profile {
  name: string;
  contact: {
    phones: string[];
    emails: string[];
    displayPhoneIndex: number | null;
    displayEmailIndex: number | null;
  };
  objectives: string;
  skills: string[];
  jobHistory: { title: string; company: string; dates: string }[];
  education: { degree: string; school: string; year: number }[];
}

const defaultProfile: Profile = {
    name: "",
    contact: {
      phones: [""],         // One empty phone by default
      emails: [""],         // One empty email by default
      displayPhoneIndex: null,
      displayEmailIndex: null,
    },
    objectives: "",
    skills: [],
    jobHistory: [{ title: "", company: "", dates: "" }],
    education: [{ degree: "", school: "", year: new Date().getFullYear() }],
  };
  
  
  

export default function ResumeBuilderPage() {
  const [rawText, setRawText] = useState("");
//   const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [profile, setProfile] = useState<Profile | null>(null);

  const handleParse = async () => {
    try {
      const response = await fetch("http://localhost:8000/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });

      if (!response.ok) {
        alert("Failed to parse with AI.");
        return;
      }

      const parsed = await response.json();

      // Normalize contact with default values
      const contactData = parsed.contact || {};
      const phones = Array.isArray(contactData.phones) ? contactData.phones : [];
      const emails = Array.isArray(contactData.emails) ? contactData.emails : [];

      const newProfile: Profile = {
        name: parsed.name || "",
        contact: {
          phones: phones.length > 0 ? phones : [""],
          emails: emails.length > 0 ? emails : [""],
          displayPhoneIndex: phones.length > 0 ? 0 : null,
          displayEmailIndex: emails.length > 0 ? 0 : null,
        },
        objectives: parsed.objectives || "",
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        jobHistory:
          parsed.jobHistory?.length > 0
            ? parsed.jobHistory
            : [{ title: "", company: "", dates: "" }],
        education:
          parsed.education?.length > 0
            ? parsed.education
            : [{ degree: "", school: "", year: new Date().getFullYear() }],
      };

      setProfile(newProfile);
      await handleSave(newProfile);
    } catch (err) {
      console.error("Parse error:", err);
      alert("An error occurred while parsing.");
    }
  };

  const handleSave = async (p: Profile = profile!) => {
    try {
      const docRef = doc(db, "profiles", "demoUser"); // Replace with real user ID
      await setDoc(docRef, p);
      alert("Profile saved to Firebase!");
    } catch (error) {
      console.error("🔥 Firebase Save Error:", error);
      alert("Failed to save profile to Firebase.");
    }
  };

  // Job handlers
  const addJob = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      jobHistory: [...profile.jobHistory, { title: "", company: "", dates: "" }],
    });
  };
  const removeJob = (index: number) => {
    if (!profile) return;
    const updatedJobs = profile.jobHistory.filter((_, i) => i !== index);
    setProfile({ ...profile, jobHistory: updatedJobs });
  };

  // Education handlers
  const addEducation = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      education: [...profile.education, { degree: "", school: "", year: new Date().getFullYear() }],
    });
  };
  const removeEducation = (index: number) => {
    if (!profile) return;
    const updatedEducation = profile.education.filter((_, i) => i !== index);
    setProfile({ ...profile, education: updatedEducation });
  };

  // Contact handlers
  const addPhone = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        phones: [...profile.contact.phones, ""],
      },
    });
  };
  const removePhone = (index: number) => {
    if (!profile) return;
    const newPhones = profile.contact.phones.filter((_, i) => i !== index);
    let newDisplayIndex = profile.contact.displayPhoneIndex;

    // If removing the displayed phone, reset displayPhoneIndex
    if (profile.contact.displayPhoneIndex === index) {
      newDisplayIndex = newPhones.length > 0 ? 0 : null;
    } else if (profile.contact.displayPhoneIndex !== null && profile.contact.displayPhoneIndex > index) {
      // Adjust index if necessary
      newDisplayIndex = profile.contact.displayPhoneIndex - 1;
    }

    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        phones: newPhones.length > 0 ? newPhones : [""],
        displayPhoneIndex: newDisplayIndex,
      },
    });
  };
  const updatePhone = (index: number, value: string) => {
    if (!profile) return;
    const updatedPhones = [...profile.contact.phones];
    updatedPhones[index] = value;
    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        phones: updatedPhones,
      },
    });
  };
  const setDisplayPhoneIndex = (index: number | null) => {
    if (!profile) return;
    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        displayPhoneIndex: index,
      },
    });
  };

  const addEmail = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        emails: [...profile.contact.emails, ""],
      },
    });
  };
  const removeEmail = (index: number) => {
    if (!profile) return;
    const newEmails = profile.contact.emails.filter((_, i) => i !== index);
    let newDisplayIndex = profile.contact.displayEmailIndex;

    if (profile.contact.displayEmailIndex === index) {
      newDisplayIndex = newEmails.length > 0 ? 0 : null;
    } else if (profile.contact.displayEmailIndex !== null && profile.contact.displayEmailIndex > index) {
      newDisplayIndex = profile.contact.displayEmailIndex - 1;
    }

    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        emails: newEmails.length > 0 ? newEmails : [""],
        displayEmailIndex: newDisplayIndex,
      },
    });
  };
  const updateEmail = (index: number, value: string) => {
    if (!profile) return;
    const updatedEmails = [...profile.contact.emails];
    updatedEmails[index] = value;
    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        emails: updatedEmails,
      },
    });
  };
  const setDisplayEmailIndex = (index: number | null) => {
    if (!profile) return;
    setProfile({
      ...profile,
      contact: {
        ...profile.contact,
        displayEmailIndex: index,
      },
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {!profile ? (
        <>
          <textarea
            className="w-full h-40 p-4 border rounded mb-4 resize-none"
            placeholder="Paste your resume or LinkedIn bio..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
            onClick={handleParse}
          >
            Parse and Build Profile
          </button>
        </>
      ) : (
        <div className="mt-6 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Structured Profile</h2>

          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Name:</label>
            <input
              className="w-full border p-2 rounded"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          {/* Contact Section */}
          <section className="border p-4 rounded space-y-4">
            <h3 className="text-xl font-semibold mb-3">Contact</h3>

            {/* Phones */}
            <div>
              <label className="block font-medium mb-2">Phone Numbers:</label>
              {(profile.contact?.phones ?? []).map((phone, idx) => (
                <div key={idx} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    className="flex-grow border p-2 rounded"
                    value={phone}
                    onChange={(e) => updatePhone(idx, e.target.value)}
                    placeholder="Enter phone number"
                  />
                  {(profile.contact.phones.length > 1) && (
                    <button
                      type="button"
                      onClick={() => removePhone(idx)}
                      className="text-red-600 font-bold hover:text-red-800"
                      aria-label={`Remove phone number ${idx + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhone}
                className="bg-gray-300 hover:bg-gray-400 transition rounded px-3 py-1"
              >
                + Add Another Phone
              </button>

              <div className="mt-3">
                <label className="font-medium block mb-1">Select phone number to display on resume:</label>
                <div className="flex flex-col space-y-1">
                  {/* Option for "Display none" */}
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="radio"
                      name="displayPhone"
                      checked={profile.contact.displayPhoneIndex === null}
                      onChange={() => setDisplayPhoneIndex(null)}
                    />
                    <span>Display none</span>
                  </label>

                  {(profile.contact?.phones ?? []).map((phone, idx) => (
                    <label key={idx} className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name="displayPhone"
                        checked={profile.contact.displayPhoneIndex === idx}
                        onChange={() => setDisplayPhoneIndex(idx)}
                      />
                      <span>{phone || "(empty)"}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Emails */}
            <div>
              <label className="block font-medium mb-2 mt-4">Email Addresses:</label>
              {(profile.contact?.emails ?? []).map((email, idx) => (
                <div key={idx} className="flex items-center space-x-2 mb-2">
                  <input
                    type="email"
                    className="flex-grow border p-2 rounded"
                    value={email}
                    onChange={(e) => updateEmail(idx, e.target.value)}
                    placeholder="Enter email address"
                  />
                  {(profile.contact.emails.length > 1) && (
                    <button
                      type="button"
                      onClick={() => removeEmail(idx)}
                      className="text-red-600 font-bold hover:text-red-800"
                      aria-label={`Remove email address ${idx + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addEmail}
                className="bg-gray-300 hover:bg-gray-400 transition rounded px-3 py-1"
              >
                + Add Another Email
              </button>

              <div className="mt-3">
                <label className="font-medium block mb-1">Select email to display on resume:</label>
                <div className="flex flex-col space-y-1">
                  {/* Option for "Display none" */}
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="radio"
                      name="displayEmail"
                      checked={profile.contact.displayEmailIndex === null}
                      onChange={() => setDisplayEmailIndex(null)}
                    />
                    <span>Display none</span>
                  </label>

                  {(profile.contact?.emails ?? []).map((email, idx) => (
                    <label key={idx} className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name="displayEmail"
                        checked={profile.contact.displayEmailIndex === idx}
                        onChange={() => setDisplayEmailIndex(idx)}
                      />
                      <span>{email || "(empty)"}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Objectives */}
          <div>
            <label className="block font-medium mb-1">Objectives:</label>
            <textarea
              className="w-full border p-2 rounded resize-none"
              rows={3}
              value={profile.objectives}
              onChange={(e) => setProfile({ ...profile, objectives: e.target.value })}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block font-medium mb-1">Skills (comma separated):</label>
            <input
              className="w-full border p-2 rounded"
              value={profile.skills.join(", ")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  skills: e.target.value.split(",").map((s) => s.trim()),
                })
              }
            />
          </div>

          {/* Job History */}
          <section>
            <h3 className="text-xl font-semibold mb-3">Job History</h3>
            {(profile.jobHistory ?? []).map((job, idx) => (
              <div
                key={idx}
                className="mb-4 p-4 border rounded bg-gray-50 space-y-2 relative"
              >
                {idx > 0 && (
                  <button
                    className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
                    onClick={() => removeJob(idx)}
                    aria-label={`Remove job entry ${idx + 1}`}
                  >
                    ×
                  </button>
                )}

                <div>
                  <label className="block font-medium mb-1">Job Title</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={job.title}
                    onChange={(e) => {
                      const updatedJobs = [...profile.jobHistory];
                      updatedJobs[idx].title = e.target.value;
                      setProfile({ ...profile, jobHistory: updatedJobs });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Company</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={job.company}
                    onChange={(e) => {
                      const updatedJobs = [...profile.jobHistory];
                      updatedJobs[idx].company = e.target.value;
                      setProfile({ ...profile, jobHistory: updatedJobs });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Dates</label>
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="e.g. 2020 - 2023"
                    value={job.dates}
                    onChange={(e) => {
                      const updatedJobs = [...profile.jobHistory];
                      updatedJobs[idx].dates = e.target.value;
                      setProfile({ ...profile, jobHistory: updatedJobs });
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              className="bg-gray-300 hover:bg-gray-400 transition rounded px-3 py-1"
              onClick={addJob}
            >
              + Add Another Job
            </button>
          </section>

          {/* Education */}
          <section>
            <h3 className="text-xl font-semibold mb-3 mt-6">Education</h3>
            {(profile.education ?? []).map((edu, idx) => (
              <div
                key={idx}
                className="mb-4 p-4 border rounded bg-gray-50 space-y-2 relative"
              >
                {idx > 0 && (
                  <button
                    className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
                    onClick={() => removeEducation(idx)}
                    aria-label={`Remove education entry ${idx + 1}`}
                  >
                    ×
                  </button>
                )}

                <div>
                  <label className="block font-medium mb-1">Degree</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={edu.degree}
                    onChange={(e) => {
                      const updatedEdu = [...profile.education];
                      updatedEdu[idx].degree = e.target.value;
                      setProfile({ ...profile, education: updatedEdu });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">School</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={edu.school}
                    onChange={(e) => {
                      const updatedEdu = [...profile.education];
                      updatedEdu[idx].school = e.target.value;
                      setProfile({ ...profile, education: updatedEdu });
                    }}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Year</label>
                  <input
                    type="number"
                    className="w-full border p-2 rounded"
                    value={edu.year}
                    onChange={(e) => {
                      const updatedEdu = [...profile.education];
                      updatedEdu[idx].year = parseInt(e.target.value) || new Date().getFullYear();
                      setProfile({ ...profile, education: updatedEdu });
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              className="bg-gray-300 hover:bg-gray-400 transition rounded px-3 py-1"
              onClick={addEducation}
            >
              + Add Another Education
            </button>
          </section>

          {/* Save button */}
          <button
            className="mt-8 bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded w-full"
            onClick={() => handleSave()}
          >
            Save to Firebase
          </button>
        </div>
      )}
    </div>
  );
}



// -------------------------- GRAVEYARD
// "use client";

// import { useState } from "react";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// interface Profile {
//   name: string;
//   contact: string;
//   objectives: string;
//   skills: string[];
//   jobHistory: { title: string; company: string; dates: string }[];
//   education: { degree: string; school: string; year: number }[];
// }

// export default function ResumeBuilderPage() {
//   const [rawText, setRawText] = useState("");
//   const [profile, setProfile] = useState<Profile | null>(null);

//   const handleParse = async () => {
//     try {
//       const response = await fetch("http://localhost:8000/parse", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: rawText }),
//       });

//       if (!response.ok) {
//         alert("Failed to parse with AI.");
//         return;
//       }

//       const parsed = await response.json();

//       const newProfile: Profile = {
//         name: parsed.name || "",
//         contact: parsed.contact || "",
//         objectives: parsed.objectives || "",
//         skills: parsed.skills || [],
//         jobHistory:
//           parsed.jobHistory?.length > 0
//             ? parsed.jobHistory
//             : [{ title: "", company: "", dates: "" }],
//         education:
//           parsed.education?.length > 0
//             ? parsed.education
//             : [{ degree: "", school: "", year: new Date().getFullYear() }],
//       };

//       setProfile(newProfile);
//       await handleSave(newProfile);
//     } catch (err) {
//       console.error("Parse error:", err);
//       alert("An error occurred while parsing.");
//     }
//   };

//   const handleSave = async (p: Profile = profile!) => {
//     try {
//       const docRef = doc(db, "profiles", "demoUser"); // Replace with real user ID
//       await setDoc(docRef, p);
//       alert("Profile saved to Firebase!");
//     } catch (error) {
//       console.error("🔥 Firebase Save Error:", error);
//       alert("Failed to save profile to Firebase.");
//     }
//   };

//   // Handlers to add new blank entries
//   const addJob = () => {
//     if (!profile) return;
//     setProfile({
//       ...profile,
//       jobHistory: [...profile.jobHistory, { title: "", company: "", dates: "" }],
//     });
//   };

//   const removeJob = (index: number) => {
//     if (!profile) return;
//     const updatedJobs = profile.jobHistory.filter((_, i) => i !== index);
//     setProfile({ ...profile, jobHistory: updatedJobs });
//   };

//   const addEducation = () => {
//     if (!profile) return;
//     setProfile({
//       ...profile,
//       education: [...profile.education, { degree: "", school: "", year: new Date().getFullYear() }],
//     });
//   };

//   const removeEducation = (index: number) => {
//     if (!profile) return;
//     const updatedEducation = profile.education.filter((_, i) => i !== index);
//     setProfile({ ...profile, education: updatedEducation });
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       {!profile ? (
//         <>
//           <textarea
//             className="w-full h-40 p-4 border rounded mb-4 resize-none"
//             placeholder="Paste your resume or LinkedIn bio..."
//             value={rawText}
//             onChange={(e) => setRawText(e.target.value)}
//           />
//           <button
//             className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
//             onClick={handleParse}
//           >
//             Parse and Build Profile
//           </button>
//         </>
//       ) : (
//         <div className="mt-6 space-y-6">
//           <h2 className="text-2xl font-semibold mb-4">Structured Profile</h2>

//           {/* Name */}
//           <div>
//             <label className="block font-medium mb-1">Name:</label>
//             <input
//               className="w-full border p-2 rounded"
//               value={profile.name}
//               onChange={(e) => setProfile({ ...profile, name: e.target.value })}
//             />
//           </div>

//           {/* Contact */}
//           <div>
//             <label className="block font-medium mb-1">Contact:</label>
//             <input
//               className="w-full border p-2 rounded"
//               value={profile.contact}
//               onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
//             />
//           </div>

//           {/* Objectives */}
//           <div>
//             <label className="block font-medium mb-1">Objectives:</label>
//             <textarea
//               className="w-full border p-2 rounded resize-none"
//               rows={3}
//               value={profile.objectives}
//               onChange={(e) => setProfile({ ...profile, objectives: e.target.value })}
//             />
//           </div>

//           {/* Skills */}
//           <div>
//             <label className="block font-medium mb-1">Skills (comma separated):</label>
//             <input
//               className="w-full border p-2 rounded"
//               value={profile.skills.join(", ")}
//               onChange={(e) =>
//                 setProfile({
//                   ...profile,
//                   skills: e.target.value.split(",").map((s) => s.trim()),
//                 })
//               }
//             />
//           </div>

//           {/* Job History */}
//           <section>
//             <h3 className="text-xl font-semibold mb-3">Job History</h3>
//             {profile.jobHistory.map((job, idx) => (
//               <div
//                 key={idx}
//                 className="mb-4 p-4 border rounded bg-gray-50 space-y-2 relative"
//               >
//                 {idx > 0 && (
//                   <button
//                     className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
//                     onClick={() => removeJob(idx)}
//                     aria-label={`Remove job entry ${idx + 1}`}
//                   >
//                     ×
//                   </button>
//                 )}

//                 <div>
//                   <label className="block font-medium mb-1">Job Title</label>
//                   <input
//                     className="w-full border p-2 rounded"
//                     value={job.title}
//                     onChange={(e) => {
//                       const updatedJobs = [...profile.jobHistory];
//                       updatedJobs[idx].title = e.target.value;
//                       setProfile({ ...profile, jobHistory: updatedJobs });
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">Company</label>
//                   <input
//                     className="w-full border p-2 rounded"
//                     value={job.company}
//                     onChange={(e) => {
//                       const updatedJobs = [...profile.jobHistory];
//                       updatedJobs[idx].company = e.target.value;
//                       setProfile({ ...profile, jobHistory: updatedJobs });
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">Dates</label>
//                   <input
//                     className="w-full border p-2 rounded"
//                     placeholder="e.g. 2020 - 2023"
//                     value={job.dates}
//                     onChange={(e) => {
//                       const updatedJobs = [...profile.jobHistory];
//                       updatedJobs[idx].dates = e.target.value;
//                       setProfile({ ...profile, jobHistory: updatedJobs });
//                     }}
//                   />
//                 </div>
//               </div>
//             ))}

//             <button
//               className="bg-gray-300 hover:bg-gray-400 transition rounded px-3 py-1"
//               onClick={addJob}
//             >
//               + Add Another Job
//             </button>
//           </section>

//           {/* Education */}
//           <section>
//             <h3 className="text-xl font-semibold mb-3 mt-6">Education</h3>
//             {profile.education.map((edu, idx) => (
//               <div
//                 key={idx}
//                 className="mb-4 p-4 border rounded bg-gray-50 space-y-2 relative"
//               >
//                 {idx > 0 && (
//                   <button
//                     className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
//                     onClick={() => removeEducation(idx)}
//                     aria-label={`Remove education entry ${idx + 1}`}
//                   >
//                     ×
//                   </button>
//                 )}

//                 <div>
//                   <label className="block font-medium mb-1">Degree</label>
//                   <input
//                     className="w-full border p-2 rounded"
//                     value={edu.degree}
//                     onChange={(e) => {
//                       const updatedEdu = [...profile.education];
//                       updatedEdu[idx].degree = e.target.value;
//                       setProfile({ ...profile, education: updatedEdu });
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">School</label>
//                   <input
//                     className="w-full border p-2 rounded"
//                     value={edu.school}
//                     onChange={(e) => {
//                       const updatedEdu = [...profile.education];
//                       updatedEdu[idx].school = e.target.value;
//                       setProfile({ ...profile, education: updatedEdu });
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <label className="block font-medium mb-1">Year</label>
//                   <input
//                     type="number"
//                     className="w-full border p-2 rounded"
//                     value={edu.year}
//                     onChange={(e) => {
//                       const updatedEdu = [...profile.education];
//                       updatedEdu[idx].year = parseInt(e.target.value) || new Date().getFullYear();
//                       setProfile({ ...profile, education: updatedEdu });
//                     }}
//                   />
//                 </div>
//               </div>
//             ))}

//             <button
//               className="bg-gray-300 hover:bg-gray-400 transition rounded px-3 py-1"
//               onClick={addEducation}
//             >
//               + Add Another Education
//             </button>
//           </section>

//           {/* Save button */}
//           <button
//             className="mt-8 bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded w-full"
//             onClick={() => handleSave()}
//           >
//             Save to Firebase
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
