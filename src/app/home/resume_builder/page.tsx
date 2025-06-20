"use client";

import { Container, Grid, SimpleGrid, Skeleton } from "@mantine/core";
import FileUploadForm from "@/components/forms/FileUploadForm";


export default function Sprint1Page() {
  return (
    <Container my="md" className="w-full h-full flex justify-center items-center m-4" >
        <FileUploadForm />
    </Container>
  );
}
