"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { ref, list, getDownloadURL, StorageReference, deleteObject, getMetadata, FullMetadata } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { renderAsync } from "docx-preview";
import JSZip from "jszip";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { metadata } from "@/app/server-layout";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar, 
  AlertCircle,
  CheckCircle,
  Archive,
  ChevronDown,
  File,
  Image,
  FileImage
} from "lucide-react";

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

  if (error) return (
    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <span className="text-red-800 dark:text-red-200">Error: {error}</span>
    </div>
  );
  
  if (!elements) return (
    <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      <span className="text-blue-800 dark:text-blue-200">Loading ODT preview...</span>
    </div>
  );
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="prose dark:prose-invert max-w-none">{elements}</div>
    </div>
  );
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

  if (error) return (
    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <span className="text-red-800 dark:text-red-200">Error: {error}</span>
    </div>
  );
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div ref={refDiv} className="prose dark:prose-invert max-w-none"></div>
    </div>
  );
}

function PreviewPDFFile({ fileData }: { fileData: ProxyFileResult }) {
  if (fileData.type === "blob" && fileData.contentType === "application/pdf") {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <iframe 
          src={fileData.blobUrl} 
          width="100%" 
          height="600px" 
          className="rounded-lg"
          title="PDF Preview"
        />
      </div>
    );
  }
  return <div className="text-red-600">Not a PDF file.</div>;
}

function PreviewTxtFile({ fileData }: { fileData: ProxyFileResult }) {
  if (fileData.type === "text") {
    const text = fileData.content;
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap overflow-auto max-h-96">{text}</pre>
      </div>
    );
  }
  return <div className="text-red-600">Not a text file.</div>;
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

  if (error) return (
    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <span className="text-red-800 dark:text-red-200">Error: {error}</span>
    </div>
  );
  
  if (!fileData) return (
    <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      <span className="text-blue-800 dark:text-blue-200">Loading file preview...</span>
    </div>
  );

  if (fileData.type === "text") return <PreviewTxtFile fileData={fileData} />;
  if (fileData.type === "blob") {
    if (fileData.contentType === "application/pdf") return <PreviewPDFFile fileData={fileData} />;
    if (fileData.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return <PreviewDocxFile fileData={fileData} />;
    if (fileData.contentType === "application/vnd.oasis.opendocument.text") return <PreviewOdtFile fileData={fileData} />;
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <Download className="h-5 w-5 text-blue-600" />
        <a 
          href={fileData.blobUrl} 
          download={fileData.fileName}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Download {fileData.fileName}
        </a>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
      <AlertCircle className="h-5 w-5 text-yellow-600" />
      <span className="text-yellow-800 dark:text-yellow-200">Unknown file type</span>
    </div>
  );
}

type DeleteFileButtonProps = {
  fileRef: StorageReference;
  fileRefs: StorageReference[];
  setFileRefs: React.Dispatch<React.SetStateAction<StorageReference[]>>;
}

function DeleteFileButton({fileRef, fileRefs, setFileRefs}: DeleteFileButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        <Button
          variant="outline"
          size="sm"
          disabled={deleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></DialogOverlay>
        <DialogContent className="fixed top-1/2 left-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl transform -translate-x-1/2 -translate-y-1/2 border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Confirm Delete
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{fileRef.name}</strong>? This action cannot be undone.
          </DialogDescription>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function GetFileDate({fileRef}: {fileRef: StorageReference}) {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    getMetadata(fileRef).then((metadata: FullMetadata) => {
      if (metadata && metadata.timeCreated) {
        const formatted = formatDateTime(metadata.timeCreated);
        setDate(formatted);
      }
    }).catch((error) => {
      console.error("Could not retrieve upload date: ", error);
      setDate("Date unavailable");
    });
  }, [fileRef]);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Calendar className="h-4 w-4" />
      <span>{date || "Loading date..."}</span>
    </div>
  );
}

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <FileText className="h-6 w-6 text-red-600" />;
    case 'docx':
    case 'doc':
      return <FileText className="h-6 w-6 text-blue-600" />;
    case 'odt':
      return <FileText className="h-6 w-6 text-green-600" />;
    case 'txt':
    case 'md':
      return <FileText className="h-6 w-6 text-gray-600" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return <FileImage className="h-6 w-6 text-purple-600" />;
    default:
      return <File className="h-6 w-6 text-gray-500" />;
  }
}

export default function ViewPastUploadsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fileRefs, setFileRefs] = useState<StorageReference[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [previewStates, setPreviewStates] = useState<Record<string, boolean>>({});

  const togglePreview = (fileName: string) => {
    setPreviewStates(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };

  useEffect(() => {
    if (!loading && user) {
      (async () => {
        try {
          const listRef = ref(storage, `users/${user.uid}`);
          const result = await list(listRef, { maxResults: 10 });
          setFileRefs(result.items);
        } catch (error) {
          console.error("Error loading files:", error);
        } finally {
          setLoadingFiles(false);
        }
      })();
    } else if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
          <Archive className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Past Uploads
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your uploaded files
        </p>
      </div>

      {/* Content */}
      {loadingFiles ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : fileRefs.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No files uploaded yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your first file to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fileRefs.map((fileRef, index) => {
            const isPreviewOpen = previewStates[fileRef.name] || false;
            
            return (
              <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(fileRef.name)}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {fileRef.name}
                        </h3>
                        <GetFileDate fileRef={fileRef} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePreview(fileRef.name)}
                        className="flex items-center gap-2"
                      >
                        {isPreviewOpen ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hide Preview
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Show Preview
                          </>
                        )}
                      </Button>
                      <DeleteFileButton 
                        fileRef={fileRef} 
                        fileRefs={fileRefs} 
                        setFileRefs={setFileRefs} 
                      />
                    </div>
                  </div>
                </div>
                
                {isPreviewOpen && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Eye className="h-4 w-4" />
                        <span>File Preview</span>
                      </div>
                      <PreviewFile fileRef={fileRef} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}