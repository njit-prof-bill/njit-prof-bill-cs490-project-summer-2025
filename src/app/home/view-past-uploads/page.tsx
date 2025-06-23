"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ref, list, ListResult, StorageReference, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";

type PreviewFileProps = {
    item: StorageReference;
}

function PreviewFile({item}: PreviewFileProps) {
    try {
        if (!item) {
            console.log("Null item");
            return (<div></div>);
        }

        const validExtensions = ["pdf", "docx", "txt", "md", "odt"];
        const ext = item.name.split(".").pop()?.toLowerCase();

        if (!ext) {
            console.log("No file extension for ", item.name);
            return (<div></div>);
        }
        if (validExtensions.includes(ext)) {
            // Determine the file type
            // .txt : show the first few lines as a preview
            // .md  : render the first few lines as a preview
            // .odt : render the first page as a preview
            // .docx: render the first page as a preview
            // .pdf : render the first page as a preview
            if (ext === "txt") {
                return (<p>Content of {item.name} goes here</p>);
            } else if (ext === "md") {
                return (<p>Content of {item.name} goes here</p>);
            } else if (ext === "odt") {
                return (<p>Content of {item.name} goes here</p>);
            } else if (ext === "docx") {
                return (<p>Content of {item.name} goes here</p>);
            } else if (ext === "pdf") {
                return (<p>Content of {item.name} goes here</p>);
            }
        } else {
            return (<div></div>);
        }
    } catch (error) {
        console.log("Error previewing file: ", error);
        return (<div></div>);
    }
}

type FileMenuProps = {
    itemArr: StorageReference[] | null;
}

function FileMenu({itemArr}: FileMenuProps) {
    if (!itemArr) return (<div></div>);
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-0"
        >
            {itemArr.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={`item-${index}`}>
                    <AccordionTrigger>
                        <h3>{item.name}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <PreviewFile item={item} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export default function ViewPastUploadsPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ fileRefList, setFileRefList ] = useState<StorageReference[] | null>(null);

    useEffect(() => {
        if (!loading && user) {
            getFileList().then((arr) => {
                if (arr) setFileRefList([...arr]);
            });
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    async function getFileList() {
        if (!user) return null;
        try {
            const listRef = ref(storage, `users/${user.uid}`);
            const firstPage = await list(listRef, { maxResults: 10 });
            return firstPage.items;
        } catch (error) {
            console.error("Error retrieving list of files: ", error);
            return null;
        }
    }

    return (
        <div>
            <h1>View Past Uploads</h1>
            <FileMenu itemArr={fileRefList} />
        </div>
    );
}