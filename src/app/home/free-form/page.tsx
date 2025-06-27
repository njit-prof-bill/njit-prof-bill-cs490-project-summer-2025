"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { getAIResponse, saveAIResponse, AIPrompt } from "@/components/ai/aiPrompt";
import { User } from "firebase/auth";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";

type freeFormEntry = {
    text: string;
    label: string;
    dateSubmitted: Timestamp;
};

type DeleteButtonProps = {
    index: number;
    freeFormList: freeFormEntry[];
    setFreeFormList: React.Dispatch<React.SetStateAction<freeFormEntry[]>>;
    user: User | null;
};

function DeleteButton({index, freeFormList, setFreeFormList, user}: DeleteButtonProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Controls whether the confirmation dialog is open
    const [open, setOpen] = useState(false);

    async function confirmDelete(event: React.MouseEvent<HTMLButtonElement>) {
        if (!user) return;
        event.preventDefault(); // Prevent the browser from reloading the page
        setDeleting(true);
        setError(null);
        try {
            const newList = freeFormList.filter((_, i) => i !== index);
            setFreeFormList(newList);
            const newListRef = doc(db, "users", user.uid);
            await updateDoc(newListRef, {freeFormText: newList});
            console.log("Free-form text successfully deleted.");
            setOpen(false);
        } catch (error) {
            console.error("Error deleting free-form text: ", error);
            setError("Failed to delete free-form text.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button type="button" disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete"}
                </button>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50"></DialogOverlay>
                <DialogContent className="fixed top-1/2 left-1/2 bg-white p-4 rounded shadow transform -translate-x-1/2 -translate-y-1/2">
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{freeFormList[index].label}</strong>?;
                    </DialogDescription>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            {deleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                        <DialogClose asChild>
                            <button className="bg-gray-300 px-2 py-1 rounded" disabled={deleting}>
                                Cancel
                            </button>
                        </DialogClose>
                    </div>
                    {error && <div className="mt-2 text-red-500">{error}</div>}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

type LabelMenuProps = {
    freeFormList: freeFormEntry[];
    setFreeFormList: React.Dispatch<React.SetStateAction<freeFormEntry[]>>;
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    label: string;
    setLabel: React.Dispatch<React.SetStateAction<string>>;
    user: User | null;
};

function LabelMenu({freeFormList, setFreeFormList, text, setText, label, setLabel, user}: LabelMenuProps) {
    // Show a menu of the user's past free-form text submissions by their labels.
    // Clicking on a single label populates the free-form text field with that submission.
    async function handleClick(event: React.MouseEvent<HTMLButtonElement>, index: number) {
        // Prevent the browser from reloading the page
        event.preventDefault();
        // Fill the text field with the previous submission's contents
        setText(freeFormList[index].text);
        setLabel(freeFormList[index].label);
    }
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Load Past Submissions:</h1>
            {freeFormList.map((submission, index) => (
                <div key={index}>
                    <button
                        onClick={(event) => handleClick(event, index)}
                    >
                        {submission.label}
                    </button>
                    <SubmissionDate dateSubmitted={submission.dateSubmitted} />
                    <DeleteButton index={index} freeFormList={freeFormList} setFreeFormList={setFreeFormList} user={user} />
                </div>
            ))}
        </div>
    );
}

type SubmissionDateProps = {
    dateSubmitted: Timestamp;
};

function SubmissionDate({dateSubmitted}: SubmissionDateProps) {
    const date = dateSubmitted.toDate();
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const monthWord = monthNames[month];
    return (
        <div>
            <p>Modified: {monthWord} {day}, {year} at {hours}:{minutes}:{seconds}</p>
        </div>
    );
}

export default function FreeFormPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    // For keeping track of submission status
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    // For keeping track of user submissions
    const [freeFormList, setFreeFormList] = useState<freeFormEntry[]>([]);
    // For keeping track of the editable text in the form
    const [text, setText] = useState("");
    const [label, setLabel] = useState("");

    useEffect(() => {
        if (!loading && user) {
            getFreeFormList().then((arr: freeFormEntry[]) => {
                if (arr) setFreeFormList([...arr]);
            })
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the browser from reloading the page
        event.preventDefault();

        // Read the form data and then convert it to a JSON object
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries())

        // For debugging purposes
        console.log(formJson);

        // Convert the object into a new free-form submission object 
        // and append it to the list of free-form submissions
        const newSubmission: freeFormEntry = {
            text: formJson.text as string,
            label: formJson.label as string,
            dateSubmitted: Timestamp.now()
        };
        // For debugging purposes
        // console.log(newSubmission);

        // Append new submission to list
        const newList = [...freeFormList, newSubmission];
        setFreeFormList(newList);

        // Save updated submission list to the database
        submitNewList(newList);

        // Send AI prompt with text corpus and retrieve its response
        try {
            const AIResponse = await getAIResponse(AIPrompt, formJson.text as string);
            // For debugging purposes
            //console.log(AIResponse);

            // For debugging purposes
            // console.log(finalResponse);

            try {
                const responseObj = JSON.parse(AIResponse);
                // For debugging purposes
                console.log(JSON.parse(AIResponse));
                saveAIResponse(responseObj, user, db);
            } catch (error) {
                console.error("Error parsing AI response: ", error);
            }
        } catch (error) {
            console.error("Error fetching AI response: ", error);
        }
    }

    async function submitNewList(newList: freeFormEntry[]) {
        if (!user) return;
        try {
            setSubmitting(true);
            setSubmitted(false);
            // Should overwrite the user's pre-existing array of submissions
            const newSubmissionRef = doc(db, "users", user.uid);
            await updateDoc(newSubmissionRef, { freeFormText: newList });
            setTimeout(() => setSubmitted(false), 3000); // reset after 3s
        } catch (error) {
            console.log("Failed to save.");
        } finally {
            setSubmitting(false);
            setSubmitted(true);
        }
    }

    async function getFreeFormList() {
        let freeFormList: freeFormEntry[] = [];
        if (user) {
            const documentRef = doc(db, "users", user.uid);
            const document = await getDoc(documentRef);
            const data = document.data();
            if (data?.freeFormText) {
                freeFormList = data.freeFormText.map((entry: any): freeFormEntry => ({
                    text: entry.text ?? "",
                    label: entry.label ?? "",
                    dateSubmitted: entry.dateSubmitted ?? new Timestamp(0, 0)
                }));
            }
        }
        console.log(freeFormList);
        return freeFormList;
    }

    return (
        <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-md">
                <LabelMenu freeFormList={freeFormList} setFreeFormList={setFreeFormList} text={text} setText={setText} label={label} setLabel={setLabel} user={user}/>
                <h1 className="text-2xl font-bold mb-6">Free-form Text</h1>
                <form method="post" onSubmit={handleSubmit}>
                    <p>Enter some text in the box below. <br></br>When you are done, hit 'Submit'.</p>
                    <textarea
                        name="text"
                        // Using defaultValue since I just want to pre-fill the text field once
                        // with whatever the user entered there in a past session,
                        // instead of updating the field while the user is typing in it.
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Start typing here"
                        rows={15}
                        className="w-full p-3 border border-gray-300 rounded-md mb-4"
                    ></textarea>
                    <input
                        name="label"
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder="Enter a label for this submission"
                        className="w-full p-3 border border-gray-300 rounded-md mb-4"
                        required
                    ></input>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-4 py-2 rounded text-white font-semibold transition duration-300 ${submitted
                                ? "bg-blue-600 cursor-not-allowed"
                                : submitting
                                    ? "bg-gray-500 cursor-wait"
                                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// "use client";

// import { useAuth } from "@/context/authContext";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { db } from "@/lib/firebase";
// import { collection, doc, setDoc, addDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { getAIResponse, saveAIResponse, AIPrompt } from "@/components/ai/aiPrompt";

// type freeFormEntry = {
//     text: string;
//     label: string;
//     dateSubmitted: Timestamp;
// };

// export default function FreeFormPage() {
//     // For checking whether the user is logged in and redirecting them accordingly
//     const { user, loading } = useAuth();
//     const router = useRouter();
//     // For retrieving any free-form text the user entered in the past (if it exists)
//     const [freeFormList, setFreeFormList] = useState<freeFormEntry[]>([]);
//     const [label, setLabel] = useState("");
//     const [corpusValue, setCorpusValue] = useState("");
//     const [submitting, setSubmitting] = useState(false);
//     const [submitted, setSubmitted] = useState(false);


//     useEffect(() => {
//         if (!loading && user) {
//             // Retrieve the user's pre-existing free-form text (if it exists)
//             getFreeFormList().then((arr: freeFormEntry[]) => {
//                 if (arr) {
//                     setFreeFormList([...arr]);
//                 }
//             });
//             // getFreeFormCorpus().then((corpus) => {
//             //     if (corpus) {
//             //         setCorpusValue(corpus);
//             //     }
//             // });
//         }
//         if (!loading && !user) {
//             router.push("/"); // Redirect to landing page if not authenticated
//         }
//     }, [user, loading, router]);

//     if (loading) {
//         return <p>Loading...</p>; // Show a loading state while checking auth
//     }

//     async function getFreeFormList() {
//         let freeFormList: freeFormEntry[] = [];
//         if (user) {
//             const documentRef = doc(db, "users", user.uid);
//             const document = await getDoc(documentRef);
//             const data = document.data();
//             if (data?.freeFormText) {
//                 freeFormList = data.freeFormText.map((entry: any): freeFormEntry => ({
//                     text: entry.text ?? "",
//                     label: entry.label ?? "",
//                     dateSubmitted: entry.dateSubmitted ?? new Timestamp(0, 0)
//                 }));
//             }
//         }
//         return freeFormList;
//     }

//     // async function setFreeFormCorpus(corpus: string) {
//     //     // Documents are identified in the database by the user's UID
//     //     let uid;
//     //     if (user) {
//     //         uid = user.uid;
//     //     } else {
//     //         // Don't try to send anything if user is logged out
//     //         return;
//     //     }
//     //     setSubmitting(true);
//     //     setSubmitted(false);
//     //     setTimeout(() => setSubmitted(false), 3000); // reset after 3s

//     //     // Should overwrite the user's pre-existing submission
//     //     const newSubmissionRef = doc(db, "users", uid);
//     //     await updateDoc(newSubmissionRef, { freeFormText: { text: corpus } });
//     //     setSubmitting(false);
//     //     setSubmitted(true);

//     //     // For debugging purposes
//     //     //console.log("User    UID: ", user.uid);
//     //     //console.log("Document ID: ", newSubmissionRef.id);
//     // }

//     // async function getFreeFormCorpus() {
//     //     // Retrieve the user's pre-existing free-form text (if it exists)
//     //     let corpus = "";
//     //     let uid;
//     //     if (user) {
//     //         // Documents are identified in the database by the user's UID
//     //         uid = user.uid;
//     //     } else {
//     //         // Don't try to retrieve anything if the user is logged out
//     //         return corpus;
//     //     }
//     //     const documentRef = doc(db, "users", uid);
//     //     const document = await getDoc(documentRef);
//     //     if (!document.exists) {
//     //         return corpus;
//     //     }
//     //     const data = document.data();
//     //     // Check if the data exists before attempting to parse it
//     //     if (data && typeof data.freeFormText.text === "string") {
//     //         corpus = data.freeFormText.text;
//     //     }
//     //     return corpus;
//     // }
//     function getFreeFormCorpus(freeFormList: freeFormEntry[], index: number) {
//         // Just to test, get the 1st submission in the array
//         return (Array.isArray(freeFormList) && freeFormList) ? freeFormList[0] : "";
//     }

//     async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//         // Prevent the browser from reloading the page
//         event.preventDefault();

//         // Read the form data and then convert it to a JSON object
//         const form = event.target as HTMLFormElement;
//         const formData = new FormData(form);
//         const formJson = Object.fromEntries(formData.entries())

//         // Send the form data to the database
//         //setFreeFormCorpus(formJson.text as string);

//         // For debugging purposes
//         console.log(formJson);

//         // Send AI prompt with text corpus and retrieve its response
//         // try {
//         //     const AIResponse = await getAIResponse(AIPrompt, formJson.text as string);
//         //     // For debugging purposes
//         //     //console.log(AIResponse);

//         //     // For debugging purposes
//         //     // console.log(finalResponse);

//         //     try {
//         //         const responseObj = JSON.parse(AIResponse);
//         //         // For debugging purposes
//         //         console.log(JSON.parse(AIResponse));
//         //         saveAIResponse(responseObj, user, db);
//         //     } catch (error) {
//         //         console.error("Error parsing AI response: ", error);
//         //     }
//         // } catch (error) {
//         //     console.error("Error fetching AI response: ", error);
//         // }

//     }
//     return (
//         <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-gray-100">
//             <div className="w-full max-w-md">
//                 <h1 className="text-2xl font-bold mb-6">Free-form Text</h1>
//                 <form method="post" onSubmit={handleSubmit}>
//                     <p>Enter some text in the box below. <br></br>When you are done, hit 'Submit'.</p>
//                     <textarea
//                         name="text"
//                         // Using defaultValue since I just want to pre-fill the text field once
//                         // with whatever the user entered there in a past session,
//                         // instead of updating the field while the user is typing in it.
//                         //defaultValue={corpusValue}
//                         placeholder="Start typing here"
//                         rows={15}
//                         className="w-full p-3 border border-gray-300 rounded-md mb-4"

//                     ></textarea>
//                     <input
//                         name="label"
//                         placeholder="Enter a label for this submission"
//                         className="w-full p-3 border border-gray-300 rounded-md mb-4"
//                         required
//                     ></input>
//                     <button
//                         type="submit"
//                         disabled={submitting}
//                         className={`px-4 py-2 rounded text-white font-semibold transition duration-300 ${submitted
//                                 ? "bg-blue-600 cursor-not-allowed"
//                                 : submitting
//                                     ? "bg-gray-500 cursor-wait"
//                                     : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
//                             }`}
//                     >
//                         {submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit"}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }