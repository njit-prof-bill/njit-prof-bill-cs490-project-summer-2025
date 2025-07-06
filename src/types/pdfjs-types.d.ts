// src/types/pdfjs-types.d.ts

declare module "pdfjs-dist/types/src/display/api" {
    /**
     * A single line/word on the PDF page.
     */
    export interface TextItem {
      str: string;
    }
  
    /**
     * The text‐extraction result for a page.
     */
    export interface TextContent {
      items: TextItem[];
    }
  }
  