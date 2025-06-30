"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
        <>
            <h3 className="text-md font-semibold mt-4">Responsibilities:</h3>
            {resList.map((res, idx) => (
                <div key={idx} className="mb-2">
                    <input
                        type="text"
                        id={`responsibilities_${idx}_job_${jobIdx}`}
                        name={`responsibilities_${idx}_job_${jobIdx}`}
                        placeholder="Enter a responsibility here"
                        value={res}
                        onChange={(e) => {
                            handleChange(idx, e.target.value);
                            setFormChanged(true);
                            setStatusMessage("There has been a change. Don't forget to click \"Save Responsibility\" and then the \"Save\" button at the bottom!");
                        }}
                        className="border rounded w-full p-2"
                    />
                    <button onClick={(e) => {
                        removeRes(e, idx);
                        setFormChanged(true);
                        setStatusMessage("There has been a change. Don't forget to click \"Save Responsibility\" and then the \"Save\" button at the bottom!");
                    }} className="bg-red-500 text-white px-3 py-1 mt-2 rounded hover:bg-red-600 cursor-pointer">
                        Remove
                    </button>
                </div>
            ))}
            {statusMessage == "There has been a change. Don't forget to click \"Save Responsibility\" and then the \"Save\" button at the bottom!" && <p className="mt-2 text-sm text-yellow-400">{statusMessage}</p>}
            <button onClick={addRes} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600 cursor-pointer">
                Add Responsibility
            </button>
            <br />
            {/*PLACEBO BUTTON USED TO RESET FORMEDCHANGES, DOESN'T ACTUALLY SAVE ANYTHING IN THE BACKEND*/}
            <button
                type="button"
                className="submit-button bg-green-500 text-white px-6 py-2 mt-4 rounded hover:bg-green-600 cursor-pointer disabled:opacity-50"
                disabled={isSubmitting}
                onClick={placeboSubmit}
            > 
                {isSubmitting ? "Saving..." : "Save Responsibility"}
            </button>
            {statusMessage == "Saved!" && <p className="mt-2 text-sm text-green-700">{statusMessage}</p>}
        </>
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
        <form onSubmit={handleSubmit} className="space-y-8">
            {jobList.map((job, i) => (
                <div key={i} className="border p-4 rounded-lg shadow-md">
                    <h2 className="font-bold text-lg mb-2">Job #{i + 1}</h2>

                    <input
                        type="text"
                        name={`jobTitle_${i}`}
                        placeholder="Job Title"
                        value={job.jobTitle}
                        onChange={(e) => {
                            updateJobAt(i, { ...job, jobTitle: e.target.value });
                            setFormChanged(true);
                            setStatusMessage("There has been a change. Don't forget to save!");
                        }}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <input
                        type="text"
                        name={`company_${i}`}
                        placeholder="Company"
                        value={job.company}
                        onChange={(e) => {
                            updateJobAt(i, { ...job, company: e.target.value });
                            setFormChanged(true);
                            setStatusMessage("There has been a change. Don't forget to save!");
                        }}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <textarea
                        name={`jobSummary_${i}`}
                        placeholder="Summary of your role"
                        value={job.jobSummary}
                        onChange={(e) => {
                            updateJobAt(i, { ...job, jobSummary: e.target.value });
                            setFormChanged(true);
                            setStatusMessage("There has been a change. Don't forget to save!");
                        }}
                        className="w-full p-2 mb-2 border rounded h-24"
                    />
                    <input
                        type="text"
                        name={`startDate_${i}`}
                        placeholder="Start Date (YYYY-MM)"
                        value={job.startDate}
                        pattern="\d{4}-\d{2}"
                        title="Format: YYYY-MM"
                        onChange={(e) => {
                            updateJobAt(i, { ...job, startDate: e.target.value });
                            setFormChanged(true);
                            setStatusMessage("There has been a change. Don't forget to save!");
                        }}
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <input
                        type="text"
                        name={`endDate_${i}`}
                        placeholder="End Date (YYYY-MM or Present)"
                        value={job.endDate}
                        pattern="(\d{4}-\d{2}|Present)"
                        title="Format: YYYY-MM or Present"
                        onChange={(e) => {
                            updateJobAt(i, { ...job, endDate: e.target.value });
                            setFormChanged(true);
                            setStatusMessage("There has been a change. Don't forget to save!");
                        }}
                        className="w-full p-2 mb-2 border rounded"
                    />

                    <ResponsibilitiesForm
                        resList={job.responsibilities}
                        setResList={(newList) =>
                            updateJobAt(i, { ...job, responsibilities: newList })
                        }
                        jobIdx={i}
                    />
                    <br />
                    <br />
                    <div className="flex space-x-2 mt-4">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                moveJobUp(i);
                                setFormChanged(true);
                                setStatusMessage("There has been a change. Don't forget to save!");
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50 cursor-pointer"
                            disabled={i === 0}
                        >
                            Move Up
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                moveJobDown(i);
                                setFormChanged(true);
                                setStatusMessage("There has been a change. Don't forget to save!");
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50 cursor-pointer"
                            disabled={i === jobList.length - 1}
                        >
                            Move Down
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={(e) => {
                                removeJob(e, i);
                                setFormChanged(true);
                                setStatusMessage("There has been a change. Don't forget to save!");
                            }}
                            className="bg-red-500 text-white px-3 py-1 mt-2 rounded hover:bg-red-600 cursor-pointer"
                        >
                            Remove Job
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={addNewJob}
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600 cursor-pointer"
            >
                Add New Job
            </button>
            {statusMessage == "There has been a change. Don't forget to save!" && <p className="mt-2 text-sm text-yellow-400">{statusMessage}</p>}
            <div>
                <button
                    type="submit"
                    className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 cursor-pointer"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
                {statusMessage == "Saved!" && <p className="mt-2 text-green-600 dark:text-green-400">{statusMessage}</p>}
                {statusMessage == "Failed to save." && <p className="mt-2 text-sm text-red-600">{statusMessage}</p>}
            </div>
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

    if (loading) return <p>Loading...</p>;

    return (
        <div className="min-h-screen px-6 py-10 text-gray-900 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-8">Edit Work Experience</h1>
            <WorkExpForm jobList={workExp} setJobList={setWorkExp} user={user} />
        </div>
    );
}