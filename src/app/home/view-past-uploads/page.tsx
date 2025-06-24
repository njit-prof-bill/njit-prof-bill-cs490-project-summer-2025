"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ref, list, ListResult, StorageReference, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { text } from "stream/consumers";

type PreviewFileMenuProps = {
    fileURLList: string[];
    setFileURLList: React.Dispatch<React.SetStateAction<string[]>>;
    fileRefList: StorageReference[];
    setFileRefList: React.Dispatch<React.SetStateAction<StorageReference[]>>;
};

function PreviewFileMenu({fileURLList, setFileURLList, fileRefList, setFileRefList}: PreviewFileMenuProps) {
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-0"
        >
            {fileRefList.map((ref, index) => (
                <AccordionItem value={`item-${index}`} key={`item-${index}`}>
                    <AccordionTrigger>{ref.name}</AccordionTrigger>
                    <AccordionContent>
                        {/* Use the file reference to:
                            1. Determine what type of file it is (DOCX, PDF, TXT, etc.)
                            2. Use a different function to generate a preview of the file */}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

// type GetFileURLProps = {
//     ref: StorageReference;
// };

async function GetFileURL(ref: StorageReference) {
    if (!ref) {
        console.log("Null ref...?");
        return "";
    }
    try {
        const url = await getDownloadURL(ref);
        // console.log(`URL to ${item.name}: ${url}`);
        // GetFileExt({url});
        return url;
    } catch (error) {
        console.log(`Error retrieving URL for ${ref.name}: ${error}`);
        return "";
    }
}

// Using a StorageReference to a file

type PreviewTxtFileProps = {
    ref: StorageReference;
    charLimit: number;
};

function PreviewTxtFile({ref, charLimit}: PreviewTxtFileProps) {
    const [url, setURL] = useState("");
    const [textContent, setTextContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | string | null>(null);

    useEffect(() => {
        (async () => {
            const url = await GetFileURL(ref);
            setURL(url);
            const text = await getTxtFile(url);
            setTextContent(text);
        })();
    }, [ref]);

    // async function getFileURL(item: StorageReference) {
    //     if (!item) {
    //         console.log("Null item");
    //         return "";
    //     }
    //     try {
    //         const url = await getDownloadURL(item);
    //         // console.log(`URL to ${item.name}: ${url}`);
    //         // GetFileExt({url});
    //         return url;
    //     } catch (error) {
    //         console.log(`Error retrieving URL for ${item.name}: ${error}`);
    //         return "";
    //     }
    // }

    async function getTxtFile(url: string) {
        let text = "";
        try {
            if (!url) {
                throw new Error("Error: file URL is empty.");
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Error - Status Code ${response.status}`);
            }
            text = await response.text();
        } catch (error) {
            setError(error instanceof Error ? error : String(error));
            text = "";
        } finally {
            setLoading(false);
        }
        return text;
    }

    if (loading) {
        return (<div>Loading preview...</div>);
    }

    if (error) {
        return (<div>
            Error: {error instanceof Error ? error.message : String(error)}
        </div>);
    }

    const displayedText = textContent.substring(0, charLimit) + (textContent.length > charLimit ? "...(truncated)" : "");

    return (
        <div>
            <h3>Preview:</h3>
            <pre>{displayedText}</pre>
        </div>
    );
}

// Using URLs of files

// type PreviewTxtFileProps = {
//     url: string;
//     charLimit: number;
// }

// function PreviewTxtFile({url, charLimit}: PreviewTxtFileProps) {
//     const [textContent, setTextContent] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<Error | string | null>(null);

//     useEffect(() => {
//         getTxtFile();
//     }, [url]);

//     async function getTxtFile() {
//         try {
//             if (!url) {
//                 setTextContent("");
//                 return;
//             }
//             const response = await fetch(url);
//             if (!response.ok) {
//                 throw new Error(`HTTP Error - Status Code ${response.status}`);
//             }
//             const text = await response.text();
//             setTextContent(text);
//         } catch (error) {
//             setError(error instanceof Error ? error : String(error));
//         } finally {
//             setLoading(false);
//         }
//     }

//     if (loading) {
//         return (<div>Loading preview...</div>);
//     }

//     if (error) {
//         return (<div>Error: {error instanceof Error ? error.message : String(error)}</div>);
//     }

//     const displayedText = textContent.substring(0, charLimit) + (textContent.length > charLimit ? '\n...(truncated)' : '');

//     return (
//         <div>
//             <h3>Preview:</h3>
//             <pre>{displayedText}</pre>
//         </div>
//     );
// }

// type GetFileExtProps = {
//     url: string;
// }

function GetFileExt(url: string) {
    if (!url) {
        console.log("Empty string");
        return "";
    }
    // Parse the file's extension from the url
    const newUrl = url.split(".").pop();
    if (!newUrl) {
        console.log("Empty");
        return "";
    }
    // console.log(newUrl);
    const ext = newUrl.split("?")[0];
    if (!ext) {
        console.log("No extension");
        return "";
    }
    console.log(ext);
    return ext;
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

    // async function getFileURL(item: StorageReference) {
    //     if (!user) return "";
    //     if (!item) {
    //         console.log("Null item");
    //         return "";
    //     }
    //     try {
    //         const url = await getDownloadURL(item);
    //         // console.log(`URL to ${item.name}: ${url}`);
    //         // GetFileExt({url});
    //         return url;
    //     } catch (error) {
    //         console.log(`Error retrieving URL for ${item.name}: ${error}`);
    //         return "";
    //     }
    // }

    async function getFileURLList(itemList: StorageReference[]) {
        if (!user) return [];
        if (!itemList) {
            console.log("Empty item list");
            return [];
        }
        try {
            const urlList = await Promise.all(
                itemList.map(async (item) => await GetFileURL(item))
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

// type PreviewTxtFileProps = {
//     txtFile: Blob;
// }

// function PreviewTxtFile({txtFile}: PreviewTxtFileProps) {
//     if (!txtFile) {
//         console.log("txtFile is empty");
//         return (<p>No preview available</p>);
//     }
//     try {
//         console.log(txtFile.type);
//         return (<p>File preview goes here</p>);
//     } catch (error) {
//         console.log("Error generating preview: ", error);
//         return (<p>Error generating preview</p>);
//     }
// }

// type GetFileFromURLProps = {
//     url: string;
// }

// async function GetFileFromURL({url}: GetFileFromURLProps) {
//     if (!url) {
//         console.log("No URL");
//         return null;
//     }
//     try {
//         const xhr = new XMLHttpRequest();
//         xhr.responseType = "blob";
//         xhr.onload = (event) => {
//             const blob = xhr.response;
//         }
//         xhr.open("GET", url);
//         xhr.send();
//         const response = await xhr.response;
//         return response as Blob;
//     } catch (error) {
//         console.log("Error occured in retrieving file: ", error);
//         return null;
//     }
// }