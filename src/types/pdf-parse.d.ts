declare module 'pdf-parse/lib/pdf-parse.js' {
    function pdfParse(buffer: Buffer): Promise<{
        text: string;
        numpages?: number;
        numrender?: number;
        info?: Record<string, any>;
        metadata?: any;
        version?: string;
        [key: string]: any;
    }>;

    export default pdfParse;
}