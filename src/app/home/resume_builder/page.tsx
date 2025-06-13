import FileUploadForm from "@/components/forms/FileUploadForm";
import { Container, Grid, SimpleGrid, Skeleton } from "@mantine/core";

const PRIMARY_COL_HEIGHT = "300px";

export default function Sprint1Page() {
  const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;
  return (
    <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Build Your Resume</h1>
        <FileUploadForm />
    </main> 
  );
}