// src/types/pdfjs-legacy.d.ts

declare module "pdfjs-dist/legacy/build/pdf" {
  import type { TextContent } from "pdfjs-dist/types/src/display/api";

  /** Source object for getDocument(). */
  export interface PDFSource {
    data: Uint8Array | ArrayBuffer;
  }

  /**
   * Call getDocument({ data }) to load a PDF.
   * We also expose GlobalWorkerOptions.disableWorker.
   */
  export function getDocument(
    source: PDFSource | Uint8Array | string
  ): { promise: Promise<PDFDocumentProxy> };

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  /** Controls how PDF.js launches its worker. */
  export const GlobalWorkerOptions: {
    /** if true, parse entirely on the main thread */
    disableWorker: boolean;
    /** (not needed here) */
    workerSrc: string;
  };
}
