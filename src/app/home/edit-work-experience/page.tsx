"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// type ResponsibilityList = {
//     responsibilities: string[];
// };

type JobEntry = {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
};

type WorkExpFormProps = {
    jobList: JobEntry[];
    setJobList: React.Dispatch<React.SetStateAction<JobEntry[]>>;
    user: any;
}

function WorkExpForm({ jobList, setJobList, user }: WorkExpFormProps) {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Read form data and convert to object
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formObj = Object.fromEntries(formData.entries());
        // For debugging purposes
        console.log(formObj);
    }
    function addNewJob(event: React.MouseEvent<HTMLButtonElement>) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Add a new, empty job entry to the array
        let newJobEntry: JobEntry = {
            jobTitle: "",
            company: "",
            startDate: "",
            endDate: "",
            responsibilities: []
        };
        setJobList((oldJobs) => [...oldJobs, newJobEntry]);
    }
    function removeJob(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Remove the job entry from the array
        setJobList((oldJobs) => oldJobs.filter((currJob, i) => i !== index));
    }
    return (
        <div>
            <form method="post" onSubmit={handleSubmit}>
                {jobList.map((jobEntry, jobIdx) => (
                    <div key={jobIdx}>
                        <h3>Job Title:</h3>
                        <input
                            type="text"
                            id={`jobTitle_${jobIdx}`}
                            name={`jobTitle_${jobIdx}`}
                            placeholder="Enter job title here"
                            value={jobEntry.jobTitle}
                            onChange={(event) => {
                                const updatedEntry = {...jobEntry, jobTitle: event.target.value};
                                const updatedList = [...jobList];
                                updatedList[jobIdx] = updatedEntry;
                                setJobList(updatedList);
                            }}
                            size={40}
                        ></input><br></br>
                        <h3>Company:</h3>
                        <input
                            type="text"
                            id={`company_${jobIdx}`}
                            name={`company_${jobIdx}`}
                            placeholder="Enter company name here"
                            value={jobEntry.company}
                            onChange={(event) => {
                                const updatedEntry = {...jobEntry, company: event.target.value};
                                const updatedList = [...jobList];
                                updatedList[jobIdx] = updatedEntry;
                                setJobList(updatedList);
                            }}
                            size={40}
                        ></input><br></br>
                        <h3>Start Date:</h3>
                        <input
                            type="text"
                            id={`startDate_${jobIdx}`}
                            name={`startDate_${jobIdx}`}
                            placeholder="Enter start date here"
                            value={jobEntry.startDate}
                            onChange={(event) => {
                                const updatedEntry = {...jobEntry, startDate: event.target.value};
                                const updatedList = [...jobList];
                                updatedList[jobIdx] = updatedEntry;
                                setJobList(updatedList);
                            }}
                            size={40}
                        ></input><br></br>
                        <h3>End Date:</h3>
                        <input
                            type="text"
                            id={`endDate_${jobIdx}`}
                            name={`endDate_${jobIdx}`}
                            placeholder="Enter end date here"
                            value={jobEntry.endDate}
                            onChange={(event) => {
                                const updatedEntry = {...jobEntry, endDate: event.target.value};
                                const updatedList = [...jobList];
                                updatedList[jobIdx] = updatedEntry;
                                setJobList(updatedList);
                            }}
                            size={40}
                        ></input><br></br>
                        <ResponsibilitiesForm resList={jobEntry.responsibilities} jobIdx={jobIdx} />
                        <button onClick={(event) => removeJob(event, jobIdx)}>Remove Job</button>
                    </div>
                ))}
                <button onClick={addNewJob}>Add New Job</button><br></br>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

type ResponsibilitiesFormProps = {
    resList: string[],
    jobIdx: number
};

function ResponsibilitiesForm({resList, jobIdx}: ResponsibilitiesFormProps) {
    const [ list, setList ] = useState(resList);

    function handleChange(index: number, value: string) {
        setList((oldRes) => 
            oldRes.map((res, i) => (i === index ? value : res))
        );
    }

    function addRes(event: React.MouseEvent<HTMLButtonElement>) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Add a new, empty string to the array
        setList((oldRes) => [...oldRes, ""]);
    }

    function removeRes(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        // Prevent browser from reloading page
        event.preventDefault();
        // Remove the responsibility string from the array
        setList((oldRes) => oldRes.filter((currRes, i) => i !== index));
    }
    return (
        <>
            <h3>Responsibilities:</h3>
            {list.map((resEntry, resIdx) => (
                <>
                    <input
                        type="text"
                        id={`responsibilities_${resIdx}_job_${jobIdx}`}
                        name={`responsibilities_${resIdx}_job_${jobIdx}`}
                        placeholder="Enter a responsibility here"
                        value={resEntry}
                        onChange={(event) => handleChange(resIdx, event.target.value)}
                        size={40}
                    ></input>
                    <button onClick={(event) => removeRes(event, resIdx)}>Remove</button><br></br>
                </>
            ))}
            <button onClick={addRes}>Add New Responsibility</button>
            <br></br>
        </>
    );
}

export default function EditWorkExpPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ workExp, setWorkExp ] = useState<JobEntry[]>([]);

    useEffect(() => {
        if (!loading && user) {
            getWorkExp().then((arr: Array<JobEntry>) => {
                if (arr) {
                    setWorkExp([...arr]);
                }
            })
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    if (loading) {
        return <p>Loading...</p>; // Show a loading state while checking auth
    }

    async function getWorkExp() {
        // Retrieve the user's work experience from their profile
        let jobList = new Array<JobEntry>();
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            if (!document.exists) {
                return jobList;
            }
            const data = document.data();
            if (
                data &&
                Array.isArray(data.resumeFields.workExperience)
            ) {
                // Want a copy of the array, not a reference to it
                jobList = [...data.resumeFields.workExperience];
            }
        }
        console.log(jobList);
        return jobList;
    }

    return (
        <div>
            <h1>Work Experience</h1>
            <WorkExpForm jobList={workExp} setJobList={setWorkExp} user={user} />
        </div>
    );
}