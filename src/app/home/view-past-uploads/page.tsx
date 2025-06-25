"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ref, list, ListResult, StorageReference, getDownloadURL, getMetadata, FullMetadata } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { text } from "stream/consumers";
import { renderAsync } from "docx-preview";
import { array } from "zod";
import JSZip from "jszip";
import { content } from "html2canvas/dist/types/css/property-descriptors/content";

// Used when fetching file proxies
type ProxyFileResult = 
    | { type: "text", content: string, contentType: string, fileName: string } 
    | { type: "blob", blobUrl: string, contentType: string, fileName: string };

// Used when parsing styles from ODT documents
type OdtStyleMap = Record<string, React.CSSProperties>;

async function fetchAndHandleFileProxy(userId: string, fileName: string): Promise<ProxyFileResult> {
    // This function was made to address the following error 
    // when the client attempts to fetch files directly from Firebase Storage:
    // 
    // "Access to fetch at 'https://firebasestorage.googleapis.com/...' 
    // from origin 'http://localhost:3000' has been blocked by CORS policy: 
    // No 'Access-Control-Allow-Origin' header is present on the requested resource."
    try {
        const res = await fetch(`/api/file-proxy?userId=${encodeURIComponent(userId)}&file=${encodeURIComponent(fileName)}`);

        if (!res.ok) {
            throw new Error(`Proxy fetch failed: ${res.status}`);
        }

        const contentType = res.headers.get("Content-Type") || "";
        const returnedFileName = res.headers.get("X-File-Name") || fileName;

        if (
            contentType.startsWith("text/plain") ||
            contentType === "text/markdown" ||
            fileName.endsWith(".md") ||
            fileName.endsWith(".txt")
        ) {
            const text = await res.text();
            return {
                type: "text",
                content: text,
                contentType,
                fileName: returnedFileName
            };
        }

        if (
            contentType === "application/pdf" ||
            contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            contentType === "application/vnd.oasis.opendocument.text"
        ) {
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            return {
                type: "blob",
                blobUrl,
                contentType,
                fileName: returnedFileName
            };
        }

        // Fallback: treat the file as a blob
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        return {
            type: "blob",
            blobUrl,
            contentType,
            fileName: returnedFileName
        };
    } catch (error) {
        console.error("fetchAndHandleFileProxy error: ", error);
        throw error;
    }
}

async function parseOdtWithStyles(blob: Blob): Promise <{ contentDoc: Document, styleMap: OdtStyleMap }> {
    const zip = await JSZip.loadAsync(blob);
    const contentXml = await zip.file("content.xml")?.async("text");
    if (!contentXml) throw new Error("content.xml not found in ODT");

    const stylesXml = await zip.file("styles.xml")?.async("text") || null;
    const parser = new DOMParser();
    const contentDoc = parser.parseFromString(contentXml, "application/xml");
    const stylesDoc = stylesXml ? parser.parseFromString(stylesXml, "application/xml") : null;
    const styleMap = buildStyleMap(stylesDoc);

    return { contentDoc, styleMap };
}

function buildStyleMap(stylesDoc: Document | null): OdtStyleMap {
    if (!stylesDoc) return {};
    const map: OdtStyleMap = {};
    const styleNodes = stylesDoc.getElementsByTagName("style:style");

    Array.from(styleNodes).forEach(el => {
        const name = el.getAttribute("style:name");
        if (!name) return;
        const textProps = el.getElementsByTagName("style:text-properties")[0];
        const css: React.CSSProperties = {};

        if (textProps) {
            const fontSize = textProps.getAttribute("fo:font-size");
            if (fontSize) css.fontSize = fontSize;
            const fontWeight = textProps.getAttribute("fo:font-weight");
            if (fontWeight) css.fontWeight = fontWeight;
            const color = textProps.getAttribute("fo:color");
            if (color) css.color = color;
            // if (textProps.getAttribute("fo:font-size")) css.fontSize = textProps.getAttribute("fo:font-size");
            // if (textProps.getAttribute("fo:font-weight")) css.fontWeight = textProps.getAttribute("fo:font-weight");
            // if (textProps.getAttribute("fo:color")) css.color = textProps.getAttribute("fo:color");
        }
        map[name] = css;
    });

    return map;
}

function odtNodeToReact(node: Element, key: number, styleMap: OdtStyleMap): React.ReactNode {
    const styleName = node.getAttribute("text:style-name");
    const style = styleName ? styleMap[styleName] || {} : {};

    switch (node.tagName) {
        case "text:p":
            return (<p key={key} style={style}>{node.textContent}</p>);
        case "text:h":
            const level = Number(node.getAttribute("text:outline-level"));
            const HeadingTag = (`h${level}` as keyof React.JSX.IntrinsicElements);
            return <HeadingTag key={key} style={style}>{node.textContent}</HeadingTag>
        case "text:list":
            const items = Array.from(node.getElementsByTagName("text:list-item"));
            return (
                <ul key={key} style={style}>
                    {items.map((li, idx) => (
                        <li key={idx}>{li.textContent}</li>
                    ))}
                </ul>
            );
        default:
            return null;
    }
}

// function odtNodeToReact(node: Element, key: number): React.ReactNode {
//     switch(node.tagName) {
//         case "text:p":
//             return (<p key={key}>{node.textContent}</p>);
//         case "text:h":
//             const level = Number(node.getAttribute("text:outline-level"));
//             const HeadingTag = (`h${level}` as keyof React.JSX.IntrinsicElements);
//             return (<HeadingTag key={key}>{node.textContent}</HeadingTag>);
//         case "text:list":
//             const listItems = Array.from(node.getElementsByTagName("text:list-item"));
//             return (
//                 <ul key={key}>
//                     {listItems.map((li, idx) => (
//                         <li key={idx}>{li.textContent}</li>
//                     ))}
//                 </ul>
//             );
//         default:
//             return null // Skip unsupported nodes
//     }
// }

function renderOdtToReact(doc: Document, styleMap: OdtStyleMap): React.ReactNode[] {
    const body = doc.getElementsByTagName("office:body")[0];
    if (!body) return [];
    const textEl = body.getElementsByTagName("office:text")[0];
    if (!textEl) return [];
    return Array.from(textEl.children).flatMap((node, idx) => {
        const el = odtNodeToReact(node, idx, styleMap);
        return el ? [el] : [];
    });
}

// function renderOdtToReact(xmlDoc: Document): React.ReactNode[] {
//     const body = xmlDoc.getElementsByTagName("office:body")[0];
//     if (!body) return [];
//     const textEl = body.getElementsByTagName("office:text")[0];
//     if (!textEl) return [];
//     const children = Array.from(textEl.children);
//     // Using flatMap() because we want to produce an array 
//     // of React nodes without any null items.
//     return children.flatMap((node, idx) => {
//         const result = odtNodeToReact(node, idx);
//         if (Array.isArray(result)) {
//             return result.filter(Boolean);
//         }
//         return result ? [result] : [];
//     });
// }

async function parseOdtBlobToXml(blob: Blob): Promise<Document> {
    const zip = await JSZip.loadAsync(blob);
    const contentXml = await zip.file("content.xml")?.async("text");
    if (!contentXml) throw new Error("content.xml not found in ODT");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contentXml, "application/xml");
    return xmlDoc;
}

async function parseOdtBlob(blob: Blob): Promise<string> {
    const zip = await JSZip.loadAsync(blob);
    const contentXml = await zip.file("content.xml")?.async("text");
    if (!contentXml) throw new Error("content.xml not found in ODT");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contentXml, "application/xml");
    const paragraphs = Array.from(xmlDoc.getElementsByTagName("text:p"));
    const textContent = paragraphs.map(p => p.textContent).join("\n");
    return textContent;
}

type PreviewOdtFileProps = {
    fileData: ProxyFileResult;
};

function PreviewOdtFile({ fileData }: PreviewOdtFileProps) {
    const [elements, setElements] = useState<React.ReactNode[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ((fileData.type === "blob") && (fileData.contentType === "application/vnd.oasis.opendocument.text")) {
            (async () => {
                try {
                    const response = await fetch(fileData.blobUrl);
                    const blob = await response.blob();
                    const { contentDoc, styleMap } = await parseOdtWithStyles(blob);
                    setElements(renderOdtToReact(contentDoc, styleMap));
                } catch (error) {
                    setError((error as Error).message);
                }
            })();
        } else {
            setError("Unsupported file type for ODT preview");
        }
    }, [fileData]);

    if (error) return (<div>Error: {error}</div>);
    if (!elements) return (<div>Loading ODT Preview...</div>);
    return (<div>{elements}</div>);
}

// function PreviewOdtFile({fileData}: PreviewOdtFileProps) {
//     const [elements, setElements] = useState<React.ReactNode[] | null>(null);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if ((fileData.type === "blob") && (fileData.contentType === "application/vnd.oasis.opendocument.text")) {
//             (async () => {
//                 try {
//                     const response = await fetch(fileData.blobUrl);
//                     const blob = await response.blob();
//                     const xmlDoc = await parseOdtBlobToXml(blob);
//                     const reactElements = renderOdtToReact(xmlDoc);
//                     setElements(reactElements);
//                 } catch (error) {
//                     console.error(error);
//                     setError((error as Error).message);
//                 }
//             })();
//         } else {
//             setError("Unsupported file type for ODT preview");
//         }
//     }, [fileData]);

//     if (error) return (<div>Error: {error}</div>);
//     if (!elements) return (<div>Loading ODT preview...</div>);

//     return (
//         <div className="odt-preview">
//             <h3>ODT Preview: {fileData.fileName}</h3>
//             <div>
//                 {elements}
//             </div>
//         </div>
//     );
// }

type PreviewDocxFileProps = {
    fileData: ProxyFileResult;
};

function PreviewDocxFile({fileData}: PreviewDocxFileProps) {
    const docxContainerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDocxFile();
    }, [fileData]);

    async function getDocxFile() {
        try {
            if (!fileData) {
                throw new Error("No file data provided.");
            }
            if (!(fileData.type === "blob")) {
                throw new Error(`${fileData.fileName} is not a blob.`);
            }
            if (!(fileData.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
                throw new Error(`${fileData.fileName} is not a DOCX file.`);
            }
            if (docxContainerRef.current) {
                docxContainerRef.current.innerHTML = "";
                const response = await fetch(fileData.blobUrl);
                if (!response.ok) {
                    throw new Error(`HTTP Error - Status Code ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                await renderAsync(arrayBuffer, docxContainerRef.current);
            }
        } catch (error) {
            setError((error as Error).message);
        }
    }

    if (error) {
        return (<div>Error: {error}</div>);
    }

    return <div ref={docxContainerRef}></div>
}

type PreviewPDFFileProps = {
    fileData: ProxyFileResult;
};

function PreviewPDFFile({fileData}: PreviewPDFFileProps) {
    if ((fileData.type === "blob") && (fileData.contentType === "application/pdf")) {
        return (
            <div>
                <h3>PDF Preview: {fileData.fileName}</h3>
                <iframe src={fileData.blobUrl} width="100%" height="600px"></iframe>
            </div>
        );
    }
    return (<pre>{fileData.fileName} is not a PDF file.</pre>);
}

type PreviewTxtFileProps = {
    fileData: ProxyFileResult;
    charLimit: number;
};

function PreviewTxtFile({fileData, charLimit}: PreviewTxtFileProps) {
    if (fileData.type === "text") {
        const displayedText = fileData.content.substring(0, charLimit) + 
            (fileData.content.length > charLimit ? "...\n...(truncated)" : "");
        return (
            <div>
                <h3>Preview: {fileData.fileName}</h3>
                <pre>{displayedText}</pre>
            </div>
        );
    }
    return (<pre>{fileData.fileName} is not a plain text file.</pre>);
}

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
                        <PreviewFile ref={ref} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

type PreviewFileProps = {
    ref: StorageReference;
};

function PreviewFile({ref}: PreviewFileProps) {
    const { user } = useAuth();
    const [fileData, setFileData] = useState<ProxyFileResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setError("User is not authenticated.");
            return;
        }

        let isMounted = true;
        (async () => {
            try {
                const data = await fetchAndHandleFileProxy(user.uid, ref.name);
                if (isMounted) {
                    setFileData(data);
                }
            } catch (error) {
                if (isMounted) {
                    setError((error as Error).message);
                }
            }
        })();

        return () => {
            isMounted = false;
            if (fileData && fileData.type === "blob") {
                URL.revokeObjectURL(fileData.blobUrl);
            }
        };
    }, [ref, user]);

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!fileData) {
        return <div>Loading preview...</div>
    }

    if (fileData.type === "text") {
        return <PreviewTxtFile fileData={fileData} charLimit={300} />
    }

    if (fileData.type === "blob") {
        if (fileData.contentType === "application/pdf") {
            return <PreviewPDFFile fileData={fileData} />
        }
        if (fileData.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            return <PreviewDocxFile fileData={fileData}/>
        }
        if (fileData.contentType === "application/vnd.oasis.opendocument.text") {
            return <PreviewOdtFile fileData={fileData} />
        }

        // Fallback for unknown blob types
        return (
            <div>
                <h3>{fileData.fileName}</h3>
                <a href={fileData.blobUrl} download={fileData.fileName}>
                    Download file
                </a>
            </div>
        );
    }

    return (<div>Unknown file type</div>);
}

// To be reused by different functions
async function GetFileURL(ref: StorageReference) {
    if (!ref) {
        console.log("Null ref...?");
        return "";
    }
    try {
        const url = await getDownloadURL(ref);
        return url;
    } catch (error) {
        console.log(`Error retrieving URL for ${ref.name}: ${error}`);
        return "";
    }
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
            <PreviewFileMenu fileURLList={fileURLList} setFileURLList={setFileURLList} fileRefList={fileRefList} setFileRefList={setFileRefList} />
        </div>
    );
}