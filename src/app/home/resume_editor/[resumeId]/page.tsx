"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Text } from "@mantine/core";
import ResumeInfo from "@/components/forms/ResumeInfo";

export default function Resume_Editor() {
  const params = useParams();
  const resumeId = params?.resumeId as string;

  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResume() {
      if (!resumeId) return;

      try {
        const res = await fetch(`http://localhost:5000/resume/${resumeId}`);
        const data = await res.json();

        if(res.ok) {
          setResumeData({
            _id: data.id,
            ...data.parse_result
          });
          setError(null);
        }
        else {
          setError(data.error || "Unknown error fetching resume.");
        }
      } 
      catch (err) {
        console.error("Failed to fetch resume:", err);
        setError("Failed to fetch resume.");
      }
    }
    
    fetchResume();
  }, [resumeId]);

  if(error) {
    return (
        <Container my="md" className="w-full h-full flex justify-center items-center m-4">
          <Text color="red">Error: {error}</Text>
        </Container>
    );
  }



  if(!resumeData) {
    return (
      <Container my="md" className="w-full h-full flex justify-center items-center m-4">
        <Text>Loading resume...</Text>
      </Container>
    );
  }

  return (
    <Container my="md" className="w-full h-full flex justify-center items-center m-4">
      <ResumeInfo data={resumeData} />
    </Container>
  );
}
