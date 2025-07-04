"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { 
    Wrench, 
    Plus, 
    Trash2, 
    ChevronUp, 
    ChevronDown, 
    Save, 
    Star,
    AlertCircle,
    CheckCircle,
    Code,
    Lightbulb
} from "lucide-react";

type SkillsFormProps = {
  skillsList: string[];
  setSkillsList: React.Dispatch<React.SetStateAction<string[]>>;
  user: any;
};

function SkillsForm({ skillsList, setSkillsList, user }: SkillsFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false); //for unsaved changes check

  function moveSkillUp(index: number) {
    if (index === 0) return;
    const newList = [...skillsList];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setSkillsList(newList);
  }

  function moveSkillDown(index: number) {
    if (index === skillsList.length - 1) return;
    const newList = [...skillsList];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setSkillsList(newList);
  }

  async function submitSkills(skills: string[]) {
    if (!user) return;
    try {
      setIsSubmitting(true);
      const newSkillsRef = doc(db, "users", user.uid);
      await updateDoc(newSkillsRef, { "resumeFields.skills": skills });
      setStatusMessage("Saved!");
      setFormChanged(false);
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (error) {
      setStatusMessage("Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData.entries());

    let skillsArr = [...new Set(Object.values(formObj).map(String))];
    skillsArr = skillsArr.filter((str) => str.trim() !== "");

    setSkillsList(skillsArr);
    submitSkills(skillsArr);
  }

  function addNewSkill(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setSkillsList((oldSkills) => [...oldSkills, ""]);
  }

  function removeSkill(event: React.MouseEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    setSkillsList((oldSkills) => oldSkills.filter((_, i) => i !== index));
  }

  function handleChange(index: number, value: string) {
    setSkillsList((oldSkills) =>
      oldSkills.map((skill, i) => (i === index ? value : skill))
    );
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
      {/* Skills List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Skills
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({skillsList.length} skills)
            </span>
          </div>
        </div>

        <div className="p-6">
          {skillsList.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No skills added yet. Start building your skill set!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {skillsList.map((field, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        moveSkillUp(index);
                        setFormChanged(true);
                        setStatusMessage("There has been a change. Don't forget to save!");
                      }}
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      className="p-1 h-6 w-6"
                      title="Move Up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        moveSkillDown(index);
                        setFormChanged(true);
                        setStatusMessage("There has been a change. Don't forget to save!");
                      }}
                      variant="outline"
                      size="sm"
                      disabled={index === skillsList.length - 1}
                      className="p-1 h-6 w-6"
                      title="Move Down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Skill Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      id={index.toString()}
                      name={`skill-${index}`}
                      placeholder="e.g., JavaScript, Project Management, Data Analysis..."
                      value={field}
                      onChange={(event) => {
                        handleChange(index, event.target.value);
                        setFormChanged(true);
                        setStatusMessage("There has been a change. Don't forget to save!");
                      }}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>

                  {/* Delete Button */}
                  <Button
                    onClick={(event) => {
                      removeSkill(event, index);                
                      setFormChanged(true);
                      setStatusMessage("There has been a change. Don't forget to save!");
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Skill Button */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={addNewSkill}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-5 w-5" />
              Add New Skill
            </Button>
          </div>
        </div>
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
              Save Skills
            </>
          )}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {statusMessage === "Saved!" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">Skills saved successfully!</p>
        </div>
      )}
      {statusMessage === "Failed to save." && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800 dark:text-red-200">Failed to save skills. Please try again.</p>
        </div>
      )}
    </form>
  );
}

export default function EditSkillsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && user) {
      getSkills().then((arr: string[]) => setSkills([...arr]));
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function getSkills() {
    let skillList: string[] = [];
    if (user) {
      const documentRef = doc(db, "users", user.uid);
      const document = await getDoc(documentRef);
      const data = document.data();
      if (data && Array.isArray(data.resumeFields?.skills)) {
        skillList = [...data.resumeFields.skills];
      }
    }
    return skillList;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Wrench className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Skills
          </h1>
        </div>
      </div>

      {/* Empty State */}
      {skills.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No skills added yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Showcase your abilities by adding your key skills and competencies.
            </p>
            <Button
              onClick={() => setSkills([""])}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Skill
            </Button>
          </div>
        </div>
      ) : (
        <SkillsForm skillsList={skills} setSkillsList={setSkills} user={user} />
      )}
    </div>
  );
}
