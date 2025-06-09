import FileUploadForm from "@/components/forms/FileUploadForm";

export default function Sprint1Page() {
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-4">Build Your Resume</h1>
            <FileUploadForm />
        </main>
    );
}