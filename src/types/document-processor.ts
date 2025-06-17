// ==========================================
// 4. TYPES: /types/document-processor.ts
// ==========================================

export interface ProcessDocumentRequest {
  sourceDocId: string;
  sourceCollection: string;
  targetDocId: string;
  targetCollection: string;
  promptType: 'summarize' | 'analyze' | 'extract' | 'improve' | 'custom';
  customPrompt?: string;
  textField?: string;
  model?: string;
}

export interface ProcessDocumentResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    sourceTextLength: number;
    responseLength: number;
    targetDocId: string;
    targetCollection: string;
  };
}