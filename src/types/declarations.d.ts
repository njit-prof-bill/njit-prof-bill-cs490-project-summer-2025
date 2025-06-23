declare module '*.mjs?url' {
    const src: string;
    export default src;
}

declare module 'pdfjs-dist/build/pdf.mjs' {
    export * from 'pdfjs-dist';
}