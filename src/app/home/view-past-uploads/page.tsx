"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ref, list, ListResult, StorageReference, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";

type PreviewFileProps = {
    url: string;
}

function PreviewFile({url}: PreviewFileProps) {
    if (!url) {
        console.log("Empty string");
        return (<p>No preview</p>);
    }
    // Parse the file's extension from the url
    const newUrl = url.split(".").pop();
    if (!newUrl) {
        console.log("Empty");
        return;
    }
    // console.log(newUrl);
    const ext = newUrl.split("?")[0];
    if (!ext) {
        console.log("No extension");
        return;
    }
    console.log(ext);
}

export default function ViewPastUploadsPage() {
    // For checking whether the user is logged in and redirecting them accordingly
    const { user, loading } = useAuth();
    const router = useRouter();
    const [ fileRefList, setFileRefList ] = useState<StorageReference[]>([]);
    const [ fileURLList, setFileURLList ] = useState<string[]>([]);

    useEffect(() => {
        if (!loading && user) {
            (async () => {
                const refs = await getFileList(10);
                setFileRefList(refs);
                const urls = await getFileURLList(refs);
                setFileURLList(urls);
            })();
            // getFileList(10).then((arr) => {
            //     if (arr) setFileRefList([...arr]);
            // });
            // getFileURLList(fileRefList).then((arr) => {
            //     if (arr) setFileURLList([...arr]);
            // })
        }
        if (!loading && !user) {
            router.push("/"); // Redirect to landing page if not authenticated
        }
    }, [user, loading, router]);

    async function getFileList(maxFiles: number) {
        if (!user) return [];
        try {
            const listRef = ref(storage, `users/${user.uid}`);
            const firstPage = await list(listRef, { maxResults: maxFiles });
            return firstPage.items;
        } catch (error) {
            console.error("Error retrieving list of files: ", error);
            return [];
        }
    }

    async function getFileURL(item: StorageReference) {
        if (!user) return "";
        if (!item) {
            console.log("Null item");
            return "";
        }
        try {
            const url = await getDownloadURL(item);
            // console.log(`URL to ${item.name}: ${url}`);
            PreviewFile({url});
            return url;
        } catch (error) {
            console.log(`Error retrieving URL for ${item.name}: ${error}`);
            return "";
        }
    }

    async function getFileURLList(itemList: StorageReference[]) {
        if (!user) return [];
        if (!itemList) {
            console.log("Empty item list");
            return [];
        }
        try {
            // const urlList = itemList.map(async (item) => await getFileURL(item));
            const urlList = await Promise.all(
                itemList.map(async (item) => await getFileURL(item))
            );
            console.log(urlList);
            return urlList;
        } catch (error) {
            console.log("Error making list of file URLs: ", error);
            return [];
        }
    }

    return (
        <div>
            <h1>View Past Uploads</h1>
        </div>
    );
}

// type getFileURLProps = {
//     item: StorageReference;
// }

// async function getFileURL({item}: getFileURLProps) {
//     if (!item) return "";
//     try {
//         const url = await getDownloadURL(item);
//         console.log(`URL to ${item.name}: ${url}`);
//         return url;
//     } catch (error) {
//         console.log(`Error getting URL for ${item.name}: ${error}`);
//         return "";
//     }
// }

// type PreviewFileProps = {
//     item: StorageReference;
// }

// function PreviewFile({item}: PreviewFileProps) {
//     try {
//         if (!item) {
//             console.log("Null item");
//             return (<div></div>);
//         }

//         const validExtensions = ["pdf", "docx", "txt", "md", "odt"];
//         const ext = item.name.split(".").pop()?.toLowerCase();

//         if (!ext) {
//             console.log("No file extension for ", item.name);
//             return (<div></div>);
//         }
//         if (validExtensions.includes(ext)) {
//             // Determine the file type
//             // .txt : show the first few lines as a preview
//             // .md  : render the first few lines as a preview
//             // .odt : render the first page as a preview
//             // .docx: render the first page as a preview
//             // .pdf : render the first page as a preview
//             if (ext === "txt") {
//                 return (<p>Content of {item.name} goes here</p>);
//             } else if (ext === "md") {
//                 return (<p>Content of {item.name} goes here</p>);
//             } else if (ext === "odt") {
//                 return (<p>Content of {item.name} goes here</p>);
//             } else if (ext === "docx") {
//                 return (<p>Content of {item.name} goes here</p>);
//             } else if (ext === "pdf") {
//                 return (<p>Content of {item.name} goes here</p>);
//             }
//         } else {
//             return (<div></div>);
//         }
//     } catch (error) {
//         console.log("Error previewing file: ", error);
//         return (<div></div>);
//     }
// }

// type FileMenuProps = {
//     itemArr: StorageReference[] | null;
// }

// function FileMenu({itemArr}: FileMenuProps) {
//     if (!itemArr) return (<div></div>);
//     return (
//         <Accordion
//             type="single"
//             collapsible
//             className="w-full"
//             defaultValue="item-0"
//         >
//             {itemArr.map((item, index) => (
//                 <AccordionItem value={`item-${index}`} key={`item-${index}`}>
//                     <AccordionTrigger>
//                         <h3>{item.name}</h3>
//                     </AccordionTrigger>
//                     <AccordionContent>
//                         <p>Content goes here</p>
//                     </AccordionContent>
//                 </AccordionItem>
//             ))}
//         </Accordion>
//     );
// }