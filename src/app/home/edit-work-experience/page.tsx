"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { 
    Briefcase, 
    Building, 
    Calendar, 
    Plus, 
    Trash2, 
    ChevronUp, 
    ChevronDown, 
    Save, 
    MapPin,
    Edit3,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";

type JobEntry = {
    jobTitle: string;
    company: string;
    jobSummary: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
};

type ResponsibilitiesFormProps = {
    resList: string[];
    setResList: (newList: string[]) => void;
    jobIdx: number;
};

function ResponsibilitiesForm({ resList, setResList, jobIdx }: ResponsibilitiesFormProps) {
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formChanged, setFormChanged] = useState(false); //for unsaved changes check

    function handleChange(index: number, value: string) {
        setResList(
            resList.map((res, i) => (i === index ? value : res))
        );
    }

    function addRes(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        setResList([...resList, ""]);
    }

    function removeRes(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        event.preventDefault();
        setResList(resList.filter((_, i) => i !== index));
    }

    function placeboSubmit() { //all this does is reset formChanged and statusMessage so unchanged edits can be set & reset
        try {
            setIsSubmitting(true);
            setStatusMessage("Saved!");
            setFormChanged(false);
            setTimeout(() => setStatusMessage(null), 2000);
        } finally {
            setIsSubmitting(false);
        }
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
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Edit3 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Key Responsibilities
                </h3>
            </div>
            
            <div className="space-y-3">
                {resList.map((res, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                        <div className="flex-1">
                            <input
                                type="text"
                                id={`responsibilities_${idx}_job_${jobIdx}`}
                                name={`responsibilities_${idx}_job_${jobIdx}`}
                                placeholder="Describe a key responsibility or achievement..."
                                value={res}
                                onChange={(e) => {
                                    handleChange(idx, e.target.value);
                                    setFormChanged(true);
                                    setStatusMessage("There has been a change. Don't forget to click \"Save Responsibility\" and then the \"Save\" button at the bottom!");
                                }}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>
                        <Button
                            onClick={(e) => {
                                removeRes(e, idx);
                                setFormChanged(true);
                                setStatusMessage("There has been a change. Don't forget to click \"Save Responsibility\" and then the \"Save\" button at the bottom!");
                            }}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 mt-1"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {statusMessage === "There has been a change. Don't forget to click \"Save Responsibility\" and then the \"Save\" button at the bottom!" && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{statusMessage}</p>
                </div>
            )}

            <div className="flex gap-3">
                <Button
                    onClick={addRes}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Responsibility
                </Button>
                
                <Button
                    type="button"
                    onClick={placeboSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Responsibility
                        </>
                    )}
                </Button>
            </div>

            {statusMessage === "Saved!" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800 dark:text-green-200">{statusMessage}</p>
                </div>
            )}
        </div>
    );
}

type WorkExpFormProps = {
    jobList: JobEntry[];
    setJobList: React.Dispatch<React.SetStateAction<JobEntry[]>>;
    user: any;
};

function WorkExpForm({ jobList, setJobList, user }: WorkExpFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formChanged, setFormChanged] = useState(false); //for unsaved changes check
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    function updateJobAt(index: number, updatedJob: JobEntry) {
        const newList = [...jobList];
        newList[index] = updatedJob;
        setJobList(newList);
    }

    function moveJobUp(index: number) {
        if (index === 0) return;
        const newList = [...jobList];
        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        setJobList(newList);
    }

    function moveJobDown(index: number) {
        if (index === jobList.length - 1) return;
        const newList = [...jobList];
        [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
        setJobList(newList);
    }

    async function submitJobList(newJobList: JobEntry[]) {
        if (!user) return;
        try {
            setIsSubmitting(true);
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, { "resumeFields.workExperience": newJobList });
            setStatusMessage("Saved!");
            setFormChanged(false);
            setTimeout(() => setStatusMessage(null), 2000);
        } catch (err) {
            setStatusMessage("Failed to save.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        submitJobList(jobList);
    }

    function addNewJob(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        const newJob: JobEntry = {
            jobTitle: "",
            company: "",
            jobSummary: "",
            startDate: "",
            endDate: "",
            responsibilities: [],
        };
        setJobList([...jobList, newJob]);
    }

    function removeJob(e: React.MouseEvent<HTMLButtonElement>, index: number) {
        e.preventDefault();
        setJobList(jobList.filter((_, i) => i !== index));
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
            {jobList.map((job, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                    {/* Job Header */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {job.jobTitle || `Position #${i + 1}`}
                                </h2>
                                {job.company && (
                                    <span className="text-gray-500 dark:text-gray-400">
                                        at {job.company}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        moveJobUp(i);
                                        setFormChanged(true);
                                        setStatusMessage("There has been a change. Don't forget to save!");
                                    }}
                                    variant="outline"
                                    size="sm"
                                    disabled={i === 0}
                                    className="p-2"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        moveJobDown(i);
                                        setFormChanged(true);
                                        setStatusMessage("There has been a change. Don't forget to save!");
                                    }}
                                    variant="outline"
                                    size="sm"
                                    disabled={i === jobList.length - 1}
                                    className="p-2"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={(e) => {
                                        removeJob(e, i);
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

                    {/* Job Details */}
                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor={`jobTitle_${i}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    id={`jobTitle_${i}`}
                                    name={`jobTitle_${i}`}
                                    placeholder="e.g., Software Engineer"
                                    value={job.jobTitle}
                                    onChange={(e) => {
                                        updateJobAt(i, { ...job, jobTitle: e.target.value });
                                        setFormChanged(true);
                                        setStatusMessage("There has been a change. Don't forget to save!");
                                    }}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={`company_${i}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Company
                                </label>
                                <input
                                    type="text"
                                    id={`company_${i}`}
                                    name={`company_${i}`}
                                    placeholder="e.g., Google Inc."
                                    value={job.company}
                                    onChange={(e) => {
                                        updateJobAt(i, { ...job, company: e.target.value });
                                        setFormChanged(true);
                                        setStatusMessage("There has been a change. Don't forget to save!");
                                    }}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Employment Period */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor={`startDate_${i}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Start Date
                                </label>
                                <input
                                    type="text"
                                    id={`startDate_${i}`}
                                    name={`startDate_${i}`}
                                    placeholder="YYYY-MM (e.g., 2023-01)"
                                    value={job.startDate}
                                    pattern="\d{4}-\d{2}"
                                    title="Format: YYYY-MM"
                                    onChange={(e) => {
                                        updateJobAt(i, { ...job, startDate: e.target.value });
                                        setFormChanged(true);
                                        setStatusMessage("There has been a change. Don't forget to save!");
                                    }}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor={`endDate_${i}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    End Date
                                </label>
                                <input
                                    type="text"
                                    id={`endDate_${i}`}
                                    name={`endDate_${i}`}
                                    placeholder="YYYY-MM or Present"
                                    value={job.endDate}
                                    pattern="(\d{4}-\d{2}|Present)"
                                    title="Format: YYYY-MM or Present"
                                    onChange={(e) => {
                                        updateJobAt(i, { ...job, endDate: e.target.value });
                                        setFormChanged(true);
                                        setStatusMessage("There has been a change. Don't forget to save!");
                                    }}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Job Summary */}
                        <div className="space-y-2">
                            <label htmlFor={`jobSummary_${i}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role Summary
                            </label>
                            <textarea
                                id={`jobSummary_${i}`}
                                name={`jobSummary_${i}`}
                                placeholder="Provide a brief overview of your role, key achievements, and impact..."
                                value={job.jobSummary}
                                onChange={(e) => {
                                    updateJobAt(i, { ...job, jobSummary: e.target.value });
                                    setFormChanged(true);
                                    setStatusMessage("There has been a change. Don't forget to save!");
                                }}
                                rows={4}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                            />
                        </div>

                        {/* Responsibilities */}
                        <ResponsibilitiesForm
                            resList={job.responsibilities}
                            setResList={(newList) =>
                                updateJobAt(i, { ...job, responsibilities: newList })
                            }
                            jobIdx={i}
                        />
                    </div>
                </div>
            ))}

            {/* Add New Job Button */}
            <div className="flex justify-center">
                <Button
                    onClick={addNewJob}
                    variant="outline"
                    className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                    <Plus className="h-5 w-5" />
                    Add New Position
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
                            Save Work Experience
                        </>
                    )}
                </Button>
            </div>

            {/* Success/Error Messages */}
            {statusMessage === "Saved!" && (
                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800 dark:text-green-200">Work experience saved successfully!</p>
                </div>
            )}
            {statusMessage === "Failed to save." && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-800 dark:text-red-200">Failed to save work experience. Please try again.</p>
                </div>
            )}
        </form>
    );
}

export default function EditWorkExpPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [workExp, setWorkExp] = useState<JobEntry[]>([]);

    useEffect(() => {
        if (!loading && user) {
            getWorkExp().then((data) => {
                if (data) setWorkExp(data);
            });
        }
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    async function getWorkExp(): Promise<JobEntry[]> {
        if (!user) return [];

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (Array.isArray(data.resumeFields?.workExperience)) {
                return data.resumeFields.workExperience.map((entry: any): JobEntry => ({
                    jobTitle: entry.jobTitle ?? "",
                    company: entry.company ?? "",
                    jobSummary: entry.jobSummary ?? "",
                    startDate: entry.startDate ?? "",
                    endDate: entry.endDate ?? "",
                    responsibilities: Array.isArray(entry.responsibilities) ? entry.responsibilities : [],
                }));
            }
        }

        return [];
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
                    <Briefcase className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Work Experience
                    </h1>
                </div>
            </div>

            {/* Empty State */}
            {workExp.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No work experience added yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start building your professional story by adding your first work experience.
                        </p>
                        <Button
                            onClick={() => setWorkExp([{
                                jobTitle: "",
                                company: "",
                                jobSummary: "",
                                startDate: "",
                                endDate: "",
                                responsibilities: [],
                            }])}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Your First Position
                        </Button>
                    </div>
                </div>
            ) : (
                <WorkExpForm jobList={workExp} setJobList={setWorkExp} user={user} />
            )}
        </div>
    );
}