"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ref, list, getDownloadURL, StorageReference, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { renderAsync } from "docx-preview";
import JSZip from "jszip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";

// Types

type ProxyFileResult = 
  | { type: "text"; content: string; contentType: string; fileName: string }
  | { type: "blob"; blobUrl: string; contentType: string; fileName: string };

type OdtStyleMap = Record<string, React.CSSProperties>;

// Utility Functions

async function fetchAndHandleFileProxy(userId: string, fileName: string): Promise<ProxyFileResult> {
  // This function was made to address the following error 
  // when the client attempts to fetch files directly from Firebase Storage:
  // 
  // "Access to fetch at 'https://firebasestorage.googleapis.com/...' 
  // from origin 'http://localhost:3000' has been blocked by CORS policy: 
  // No 'Access-Control-Allow-Origin' header is present on the requested resource."
  const res = await fetch(`/api/file-proxy?userId=${encodeURIComponent(userId)}&file=${encodeURIComponent(fileName)}`);
  if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);

  const contentType = res.headers.get("Content-Type") || "";
  const returnedFileName = res.headers.get("X-File-Name") || fileName;

  if (contentType.startsWith("text/plain") || contentType === "text/markdown" || fileName.endsWith(".md") || fileName.endsWith(".txt")) {
    return { type: "text", content: await res.text(), contentType, fileName: returnedFileName };
  }

  const blob = await res.blob();
  return { type: "blob", blobUrl: URL.createObjectURL(blob), contentType, fileName: returnedFileName };
}

async function parseOdtWithStyles(blob: Blob): Promise<{ contentDoc: Document; styleMap: OdtStyleMap }> {
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

  Array.from(stylesDoc.getElementsByTagName("style:style")).forEach(el => {
    const name = el.getAttribute("style:name");
    if (!name) return;
    const css: React.CSSProperties = {};

    const textProps = el.getElementsByTagName("style:text-properties")[0];
    if (textProps) {
      const fontSize = textProps.getAttribute("fo:font-size");
      if (fontSize) css.fontSize = fontSize;
      const fontWeight = textProps.getAttribute("fo:font-weight");
      if (fontWeight) css.fontWeight = fontWeight;
      const color = textProps.getAttribute("fo:color");
      if (color) css.color = color;
    }

    const paraProps = el.getElementsByTagName("style:paragraph-properties")[0];
    if (paraProps) {
      const align = paraProps.getAttribute("fo:text-align");
      if (align) css.textAlign = align as React.CSSProperties["textAlign"];
      const marginLeft = paraProps.getAttribute("fo:margin-left");
      if (marginLeft) css.marginLeft = marginLeft;
      const marginRight = paraProps.getAttribute("fo:margin-right");
      if (marginRight) css.marginRight = marginRight;
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
      return <p key={key} style={style}>{renderChildren(node, styleMap)}</p>;
    case "text:h":
      const level = Number(node.getAttribute("text:outline-level") || "1");
      const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
      return <HeadingTag key={key} style={style}>{renderChildren(node, styleMap)}</HeadingTag>;
    case "text:list":
      return <ul key={key} style={style}>{Array.from(node.getElementsByTagName("text:list-item")).map((li, idx) => <li key={idx}>{renderChildren(li, styleMap)}</li>)}</ul>;
    case "text:span":
      return <span key={key} style={style}>{node.textContent}</span>;
    default:
      return null;
  }
}

function renderChildren(node: Element, styleMap: OdtStyleMap): React.ReactNode[] {
  return Array.from(node.children).map((child, idx) => odtNodeToReact(child, idx, styleMap));
}

function renderOdtToReact(doc: Document, styleMap: OdtStyleMap): React.ReactNode[] {
  const body = doc.getElementsByTagName("office:body")[0];
  const textEl = body?.getElementsByTagName("office:text")[0];
  if (!textEl) return [];
  return Array.from(textEl.children).flatMap((node, idx) => odtNodeToReact(node, idx, styleMap) || []);
}

// Components

function PreviewOdtFile({ fileData }: { fileData: ProxyFileResult }) {
  const [elements, setElements] = useState<React.ReactNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (fileData.type === "blob" && fileData.contentType === "application/vnd.oasis.opendocument.text") {
          const res = await fetch(fileData.blobUrl);
          const blob = await res.blob();
          const { contentDoc, styleMap } = await parseOdtWithStyles(blob);
          setElements(renderOdtToReact(contentDoc, styleMap));
        } else {
          throw new Error("Unsupported ODT file type.");
        }
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [fileData]);

  if (error) return <div>Error: {error}</div>;
  if (!elements) return <div>Loading ODT preview...</div>;
  return <div>{elements}</div>;
}

function PreviewDocxFile({ fileData }: { fileData: ProxyFileResult }) {
  const refDiv = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (fileData.type === "blob" && fileData.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          if (refDiv.current) {
            refDiv.current.innerHTML = "";
            const res = await fetch(fileData.blobUrl);
            const buffer = await res.arrayBuffer();
            await renderAsync(buffer, refDiv.current);
          }
        } else {
          throw new Error("Unsupported DOCX file type.");
        }
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [fileData]);

  if (error) return <div>Error: {error}</div>;
  return <div ref={refDiv}></div>;
}

function PreviewPDFFile({ fileData }: { fileData: ProxyFileResult }) {
  if (fileData.type === "blob" && fileData.contentType === "application/pdf") {
    return <iframe src={fileData.blobUrl} width="100%" height="600px"></iframe>;
  }
  return <div>Not a PDF file.</div>;
}

function PreviewTxtFile({ fileData, charLimit }: { fileData: ProxyFileResult; charLimit: number }) {
  if (fileData.type === "text") {
    const text = fileData.content;
    const displayed = text.length > charLimit ? `${text.substring(0, charLimit)}...\n...(truncated)` : text;
    return <pre>{displayed}</pre>;
  }
  return <div>Not a text file.</div>;
}

function PreviewFile({ fileRef }: { fileRef: StorageReference }) {
  const { user } = useAuth();
  const [fileData, setFileData] = useState<ProxyFileResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError("User not authenticated");
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const data = await fetchAndHandleFileProxy(user.uid, fileRef.name);
        if (mounted) setFileData(data);
      } catch (e) {
        if (mounted) setError((e as Error).message);
      }
    })();
    return () => {
      mounted = false;
      if (fileData?.type === "blob") URL.revokeObjectURL(fileData.blobUrl);
    };
  }, [user, fileRef]);

  if (error) return <div>Error: {error}</div>;
  if (!fileData) return <div>Loading...</div>;

  if (fileData.type === "text") return <PreviewTxtFile fileData={fileData} charLimit={300} />;
  if (fileData.type === "blob") {
    if (fileData.contentType === "application/pdf") return <PreviewPDFFile fileData={fileData} />;
    if (fileData.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return <PreviewDocxFile fileData={fileData} />;
    if (fileData.contentType === "application/vnd.oasis.opendocument.text") return <PreviewOdtFile fileData={fileData} />;
    return <a href={fileData.blobUrl} download={fileData.fileName}>Download {fileData.fileName}</a>;
  }
  return <div>Unknown file type</div>;
}

type DeleteFileButtonProps = {
  fileRef: StorageReference;
  fileRefs: StorageReference[];
  setFileRefs: React.Dispatch<React.SetStateAction<StorageReference[]>>;
}

function DeleteFileButton({fileRef, fileRefs, setFileRefs}: DeleteFileButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Controls whether the confirmation dialog is open
  const [open, setOpen] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteObject(fileRef);
      setFileRefs((oldRefs) => oldRefs.filter((r) => r !== fileRef));
      console.log("File successfully deleted.");
      setOpen(false);
    } catch (error) {
      console.error("Error deleting file: ", error);
      setError("Failed to delete file.");
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
                Are you sure you want to delete <strong>{fileRef.name}</strong>?
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
                  <button className="bg-gray-300 px-2 py-1 rounded" disabled={deleting}>Cancel</button>
                </DialogClose>
              </div>
              {error && <div className="mt-2 text-red-500">{error}</div>}
            </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export default function ViewPastUploadsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fileRefs, setFileRefs] = useState<StorageReference[]>([]);

  useEffect(() => {
    if (!loading && user) {
      (async () => {
        const listRef = ref(storage, `users/${user.uid}`);
        const result = await list(listRef, { maxResults: 10 });
        setFileRefs(result.items);
      })();
    } else if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <div>
      <h1>View Past Uploads</h1>
      <Accordion type="single" collapsible className="w-full">
        {fileRefs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{f.name}</AccordionTrigger>
            <AccordionContent>
              <PreviewFile fileRef={f} />
              <DeleteFileButton fileRef={f} fileRefs={fileRefs} setFileRefs={setFileRefs} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}