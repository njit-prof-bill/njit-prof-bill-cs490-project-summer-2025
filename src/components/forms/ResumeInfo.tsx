"use client";

import React from "react";
import { useState } from "react";
import { Container, Card, Title, Text, Group, Stack, Badge, Button } from "@mantine/core";

interface ResumeInfoProps {
  data: {
    _id?: string;
    name?: string;
    contact?: {
      phone?: string;
      email?: string;
      location?: string;
    };
    skills?: {
      [category: string]: string[];
    };
    education?: {
      degree?: string;
      institution?: string;
      graduation_date?: string;
      GPA?: number;
    };
    jobs?: {
      title: string;
      company: string;
      location?: string;
      duration?: string;
      responsibilities: string[];
    }[];
  };
}

export default function ResumeInfo({ data }: ResumeInfoProps) {
    
   const {
        name,
        contact,
        skills,
        education,
        jobs
    } = data;

    const [editedEmail, setEditedEmail] = useState(contact?.email || "");
    const [isSaving, setIsSaving] = useState(false);

    return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">
        Data Overview
      </Title>

      {/* Name */}
      {name && (
        <Card withBorder mb="md" shadow="sm">
          <Title order={3}>Name</Title>
          <Text mt="sm">{name}</Text>
        </Card>
      )}

      {/* Contact Information */}
      {contact && (
        <Card withBorder mb="md" shadow="sm">
            <Title order={3}>Contact Information</Title>

            {/* EMAIL - editable field */}
            <Text mt="sm">
                <strong>Email:</strong>
            </Text>

            <input
                type="text"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="border p-2 rounded w-full"
            />

            {/* Save button */}
            <Button
              onClick={async () => {
                if (!data._id) {
                  console.error("Cannot update contact — missing _id");
                  return;
                }
                setIsSaving(true);

                try {
                  const response = await fetch(`http://localhost:5000/resume/${data._id}/update_contact`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: editedEmail }),
                  });

                  const resData = await response.json();
                  console.log("Save response:", resData);

                  if (response.ok) {
                    // Optional: you can show success notification here later
                    console.log("Email saved successfully.");
                  } 
                  else {
                    console.error("Error saving email:", resData.error);
                  }
                }
                catch(err) {
                  console.error("Failed to save email:", err);
                }
                finally {
                  setIsSaving(false);
                }
              }}
              loading={isSaving}
              mt="md"
            > 
            Save Email
            </Button>




          {contact.phone && (
            <Text mt="sm">
              <strong>Phone:</strong> {contact.phone}
            </Text>
          )}
          {contact.location && (
            <Text mt="sm">
              <strong>Location:</strong> {contact.location}
            </Text>
          )}
        </Card>
      )}

      {/* Skills */}
      {skills && (
        <Card withBorder mb="md" shadow="sm">
          <Title order={3}>Skills</Title>
          <Stack mt="sm">
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category}>
                <Title order={4} mt="sm">{category}</Title>
                <Group mt="xs">
                  {Array.isArray(skillList)
                    ? skillList.map((skill, index) => (
                        <Badge key={index}>{skill}</Badge>
                      ))
                    : null}
                </Group>
              </div>
            ))}
          </Stack>
        </Card>
      )}

      {/* Education */}
      {education && (
        <Card withBorder mb="md" shadow="sm">
          <Title order={3}>Education</Title>
          <Card withBorder mb="sm" p="sm">
            <Title order={4}>{education.institution}</Title>
            <Text size="sm" mt="xs">
              {education.degree} ({education.graduation_date})
            </Text>
            <Text mt="xs">GPA: {education.GPA}</Text>
          </Card>
        </Card>
      )}

      {/* Job History */}
      {Array.isArray(jobs) && jobs.length > 0 && (
        <Card withBorder mb="md" shadow="sm">
          <Title order={3}>Job History</Title>
          <Stack mt="sm">
            {jobs.map((job, index) => (
              <Card withBorder key={index} mb="sm" p="sm">
                <Title order={4}>
                  {job.title} @ {job.company}
                </Title>
                {job.location && (
                  <Text size="sm" mt="xs">
                    Location: {job.location}
                  </Text>
                )}
                {job.duration && (
                  <Text size="sm" mt="xs">
                    Duration: {job.duration}
                  </Text>
                )}
                <Text mt="xs">
                  <strong>Responsibilities:</strong>
                </Text>
                <ul>
                  {Array.isArray(job.responsibilities)
                    ? job.responsibilities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))
                    : null}
                </ul>
              </Card>
            ))}
          </Stack>
        </Card>
      )}
    </Container>
  );
}