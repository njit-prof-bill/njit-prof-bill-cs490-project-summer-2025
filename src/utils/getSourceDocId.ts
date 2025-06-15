export function getSourceDocIdFromFile(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase();
  
    switch (ext) {
      case 'pdf':
        return 'documentTextPdf';
      case 'txt':
        return 'documentTextTxt';
      case 'docx':
        return 'documentTextDocx';
      default:
        return 'documentText'; // fallback
    }
  }
  