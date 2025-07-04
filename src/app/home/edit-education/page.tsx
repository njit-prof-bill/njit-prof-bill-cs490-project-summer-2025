"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { 
    GraduationCap, 
    Building, 
    Calendar, 
    Plus, 
    Trash2, 
    ChevronUp, 
    ChevronDown, 
    Save, 
    Award,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";

type EducationEntry = {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  gpa: string;
};

type EducationFormProps = {
  educationList: EducationEntry[];
  setEducationList: React.Dispatch<React.SetStateAction<EducationEntry[]>>;
  user: any;
};

function EducationForm({ educationList, setEducationList, user }: EducationFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false); //for unsaved changes check

  function moveEduUp(index: number) {
    if (index === 0) return;
    const newList = [...educationList];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setEducationList(newList);
  }

  function moveEduDown(index: number) {
    if (index === educationList.length - 1) return;
    const newList = [...educationList];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setEducationList(newList);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());

    let num_entries = Object.keys(formObj).length;
    if (num_entries % 5 !== 0) return;
    num_entries = num_entries / 5;

    const eduFields = ["degree", "institution", "startDate", "endDate", "gpa"] as const;
    const newEduList: EducationEntry[] = [];

    for (let i = 0; i < num_entries; i++) {
      const entry: EducationEntry = {
        degree: formObj[`degree_${i}`] as string,
        institution: formObj[`institution_${i}`] as string,
        startDate: formObj[`startDate_${i}`] as string,
        endDate: formObj[`endDate_${i}`] as string,
        gpa: formObj[`gpa_${i}`] as string,
      };
      newEduList.push(entry);
    }
    submitEduList(newEduList);
  }

  async function submitEduList(newEduList: EducationEntry[]) {
    if (!user) return;
    try {
      setIsSubmitting(true);
      const newEduRef = doc(db, "users", user.uid);
      await updateDoc(newEduRef, { "resumeFields.education": newEduList });
      setStatusMessage("Saved!");
      setFormChanged(false);
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (error) {
      setStatusMessage("Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function addNewEdu(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setEducationList((oldEdu) => [...oldEdu, {
      degree: "", institution: "", startDate: "", endDate: "", gpa: ""
    }]);
  }

  function removeEdu(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    setEducationList((oldEdu) => oldEdu.filter((_, i) => i !== index));
  }

  useEffect(() => {
    //handles reload and close tab if there are unsaved changes
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (formChanged) {
        event.preventDefault();
        event.returnValue = ''; //is deprecated but might be necessary to prompt on Chrome
      }
    };

    //handles (most) clicks on links within the page if there are unsaved changes
    const handleClick = (event: MouseEvent) => {
      if (!formChanged) return;

      const nav = document.querySelector('nav');
      if (nav && nav.contains(event.target as Node)) {
        const target = (event.target as HTMLElement).closest('a');
        if (target && target instanceof HTMLAnchorElement) {
          const confirmed = window.confirm('You have unsaved changes. Leave this page?');
          if (!confirmed) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      }

      const header = document.querySelector('header');
      if (header && header.contains(event.target as Node)) {
        const target = (event.target as HTMLElement).closest('a');
        if (target && target instanceof HTMLAnchorElement) {
          const confirmed = window.confirm('You have unsaved changes. Leave this page?');
          if (!confirmed) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
    };
  }, [formChanged]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {educationList.map((entry, index) => (
        <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          {/* Education Header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {entry.degree || `Education #${index + 1}`}
                </h2>
                {entry.institution && (
                  <span className="text-gray-500 dark:text-gray-400">
                    at {entry.institution}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    moveEduUp(index);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  className="p-2"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    moveEduDown(index);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  variant="outline"
                  size="sm"
                  disabled={index === educationList.length - 1}
                  className="p-2"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(event) => {
                    removeEdu(event, index);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Education Details */}
          <div className="p-6 space-y-6">
            {/* Degree and Institution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor={`degree_${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Degree/Program
                </label>
                <input
                  type="text"
                  id={`degree_${index}`}
                  name={`degree_${index}`}
                  value={entry.degree}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  onChange={(e) => {
                    const updated = { ...entry, degree: e.target.value };
                    const list = [...educationList];
                    list[index] = updated;
                    setEducationList(list);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`institution_${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Institution
                </label>
                <input
                  type="text"
                  id={`institution_${index}`}
                  name={`institution_${index}`}
                  value={entry.institution}
                  placeholder="e.g., University of California, Berkeley"
                  onChange={(e) => {
                    const updated = { ...entry, institution: e.target.value };
                    const list = [...educationList];
                    list[index] = updated;
                    setEducationList(list);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Dates and GPA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor={`startDate_${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </label>
                <input
                  type="text"
                  id={`startDate_${index}`}
                  name={`startDate_${index}`}
                  value={entry.startDate}
                  pattern="\d{4}-\d{2}"
                  title="Format: YYYY-MM"
                  placeholder="YYYY-MM (e.g., 2020-08)"
                  onChange={(e) => {
                    const updated = { ...entry, startDate: e.target.value };
                    const list = [...educationList];
                    list[index] = updated;
                    setEducationList(list);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`endDate_${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Date
                </label>
                <input
                  type="text"
                  id={`endDate_${index}`}
                  name={`endDate_${index}`}
                  value={entry.endDate}
                  pattern="(\d{4}-\d{2}|Present)"
                  title="Format: YYYY-MM or Present"
                  placeholder="YYYY-MM or Present"
                  onChange={(e) => {
                    const updated = { ...entry, endDate: e.target.value };
                    const list = [...educationList];
                    list[index] = updated;
                    setEducationList(list);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`gpa_${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  GPA (Optional)
                </label>
                <input
                  type="text"
                  id={`gpa_${index}`}
                  name={`gpa_${index}`}
                  value={entry.gpa}
                  placeholder="e.g., 3.8/4.0"
                  onChange={(e) => {
                    const updated = { ...entry, gpa: e.target.value };
                    const list = [...educationList];
                    list[index] = updated;
                    setEducationList(list);
                    setFormChanged(true);
                    setStatusMessage("There has been a change. Don't forget to save!");
                  }}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Education Button */}
      <div className="flex justify-center">
        <Button
          onClick={addNewEdu}
          variant="outline"
          className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Plus className="h-5 w-5" />
          Add New Education
        </Button>
      </div>

      {/* Status Messages */}
      {statusMessage === "There has been a change. Don't forget to save!" && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{statusMessage}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Education
            </>
          )}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {statusMessage === "Saved!" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">Education saved successfully!</p>
        </div>
      )}
      {statusMessage === "Failed to save." && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800 dark:text-red-200">Failed to save education. Please try again.</p>
        </div>
      )}
    </form>
  );
}

export default function EditEducationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [education, setEducation] = useState<EducationEntry[]>([]);

  useEffect(() => {
    if (!loading && user) {
      getEducation().then((arr: EducationEntry[]) => {
        if (arr) setEducation([...arr]);
      });
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function getEducation(): Promise<EducationEntry[]> {
    let educationList: EducationEntry[] = [];

    if (user) {
      const documentRef = doc(db, "users", user.uid);
      const document = await getDoc(documentRef);
      const data = document.data();
      if (data?.resumeFields?.education) {
        educationList = data.resumeFields.education.map((entry: any): EducationEntry => ({
          degree: entry.degree ?? "",
          institution: entry.institution ?? "",
          startDate: entry.startDate ?? "",
          endDate: entry.endDate ?? "",
          gpa: entry.gpa ?? ""
        }
        ));
      }
    }
    return educationList;
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Education
          </h1>
        </div>
      </div>

      {/* Empty State */}
      {education.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No education added yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building your academic background by adding your education history.
            </p>
            <Button
              onClick={() => setEducation([{
                degree: "",
                institution: "",
                startDate: "",
                endDate: "",
                gpa: "",
              }])}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Education
            </Button>
          </div>
        </div>
      ) : (
        <EducationForm educationList={education} setEducationList={setEducation} user={user} />
      )}
    </div>
  );
}