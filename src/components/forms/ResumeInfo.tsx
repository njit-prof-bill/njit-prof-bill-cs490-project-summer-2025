"use client";

import { useState } from "react";
import { Container, Card, Title, Text, Group, Stack, Badge, Button, TextInput, ActionIcon, Autocomplete } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";

interface ResumeInfoProps {
  data: {
    _id?: string;
    name?: string;
    contact?: {
      phones?: string[];
      emails?: string[];
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

  const { name, contact, skills, education, jobs } = data;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const [phones, setPhones] = useState(contact?.phones?.length ? contact.phones : [""]);
  const [phoneErrors, setPhoneErrors] = useState<(string | null)[]>(new Array(phones.length).fill(null));


  const [emails, setEmails] = useState(contact?.emails?.length ? contact.emails : [""]);
  const [emailErrors, setEmailErrors] = useState<(string | null)[]>(new Array(emails.length).fill(null));

  const [saving, setSaving] = useState({ emails: false, phones: false });


  const validateEmails = (emails: string[]) => {
    return emails.map((email) => {
      const trimmed = email.trim();
      if(!trimmed) return "Email is required"
      if (!emailRegex.test(email)) return "Invalid email format"
      return null
    });
  };
  
  const updateEmailAtIndex = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
    setEmailErrors(validateEmails(updated));
  };

  const addNewEmail = () => {
    const updated = [...emails, ""];
    setEmails(updated);
    setEmailErrors(validateEmails(updated));
  };

  const removeEmail = (index: number) => {
    if(emails.length === 1) return;
    const updated = emails.filter((_, i) => i !== index);
    setEmails(updated);
    setEmailErrors(validateEmails(updated));
  }

  const saveEmails = async () => {
    if (!data._id) {
      console.error("Missing resume _id");
      return;
    }

    if(emailErrors.some((e) => e !== null)) {
      notifications.show({
        title: "Validation Error",
        message: "Please fix invalid emails before saving.",
        color: "red",
        withCloseButton: true,
        autoClose: 2000,
      });
      return;
    }

    // Allow only valid emails to be saved
    const cleanedEmails = emails.map(e => e.trim()).filter(e => e !== "");

    if(cleanedEmails.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "At least one email is required",
        color: "red",
        withCloseButton: true,
        autoClose: 2000,
      });
      return;
    }

    setSaving((prev) => ({ ...prev, emails: true}));

    try {
      const response = await fetch(`http://localhost:5000/resume/${data._id}/update_contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: cleanedEmails }),
      });

      const resData = await response.json();

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "Emails saved successfully.",
          color: "teal",
          withCloseButton: true,
        });
      }
      else {
        notifications.show({
          title: "Error",
          message: resData.error || "Failed to save emails.",
          color: "red",
          withCloseButton: true,
        });
      }
    }
    catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save emails.",
        color: "red",
        withCloseButton: true,
      });
    }
    finally {
      setSaving((prev) => ({ ...prev, emails: false}));
    }
  };

  const validatePhones = (phones: string[]) => {
    return phones.map((phone) => {
      const digitsOnly = phone.replace(/\D/g, "");
      if (!digitsOnly) return "Phone number is required";
      if (digitsOnly.length !== 10) return "Invalid phone format, must be exactly 10 digits";
      return null;
    });
  };

  const formatPhone = (input: string) => {
    const digits = input.replace(/\D/g, "").slice(0, 10)
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length > 3) parts.push(digits.slice(3, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 10));
    return parts.join("-");
  }

  const updatePhoneAtIndex = (index: number, value: string) => {
    const formatted = formatPhone(value);
    const updated = [...phones];
    updated[index] = formatted;
    setPhones(updated);
    setPhoneErrors(validatePhones(updated));
  };

  const addNewPhone = () => {
    const updated = [...phones, ""];
    setPhones(updated);
    setPhoneErrors(validatePhones(updated));
  };

  const removePhone = (index: number) => {
    if (phones.length === 1) return;
    const updated = phones.filter((_, i) => i !== index);
    setPhones(updated);
    setPhoneErrors(validatePhones(updated));
  };

  const savePhones = async () => {
    if (!data._id) return;

    if (phoneErrors.some((e) => e !== null)) {
      notifications.show({
        title: "Validation Error",
        message: "Please fix invalid phone numbers before saving.",
        color: "red",
      });
      return;
    }

    const cleanedPhones = phones
    .map(p => p.replace(/\D/g, "")) // Strip non digits
    .filter((p) => p.length === 10) // only keep valid
    .map((p) => `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`);
    if (cleanedPhones.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "At least one phone number is required",
        color: "red",
      });
      return;
    }

    setSaving((prev) => ({ ...prev, phones: true}));

    try {
      const response = await fetch(`http://localhost:5000/resume/${data._id}/update_phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones: cleanedPhones }),
      });

      const resData = await response.json();
      if (response.ok) {
        notifications.show({ title: "Success", message: "Phones saved.", color: "teal" });
      } else {
        notifications.show({ title: "Error", message: resData.error, color: "red" });
      }
    } 
    catch (err) {
      notifications.show({ title: "Error", message: "Save failed", color: "red" });
    }
    finally {
      setSaving((prev) => ({ ...prev, phones: false}));
    }
};

  return (
    <Container size="lg" py="md">
      <Title order={2} mb="lg">Data Overview</Title>

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

          {/* Email Section */}
          {emails.map((email, index) => (
            <Group key={index} mt={index === 0 ? "sm" : "xs"} align="flex-end">
              <Autocomplete
                style={{ flex: 1 }}
                label={index === 0 ? "Primary Email" : `Email ${index + 1}`}
                withAsterisk={index === 0}
                value={email}
                onChange={(value) => updateEmailAtIndex(index, value)}
                placeholder={`Email ${index + 1}`}
                error={emailErrors[index] || undefined}
                data={
                  email && email.includes("@") 
                  ? [] 
                  : ["@gmail.com", "@yahoo.com", "@outlook.com", "@njit.edu"].map(domain => {
                    const prefix = email.trim();
                    return prefix ? prefix + domain : ""; 
                    }).filter(Boolean)
                }
              />
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => removeEmail(index)}
                disabled={emails.length === 1}
                title="Remove this email"
              >
                <IconTrash size="1rem" />
              </ActionIcon>
            </Group>
          ))}
          {/* Button to add new emails */}
          <Group mt="sm">
            <Button variant="light" onClick={addNewEmail}>+ Add Email</Button>
            <Button onClick={saveEmails} loading={saving.emails} disabled={emailErrors.some(e => e !== null)}>Save Emails</Button>
          </Group>

          {contact.emails && contact.emails.length > 1 && (
            <>
              <Text mt="sm"><strong>Other Emails:</strong></Text>
              <Group>
                {contact.emails.slice(1).map((email, index) => (
                  <Badge key={index} color="gray">{email}</Badge>
                ))}
              </Group>
            </>
          )}

          {/* Phone Section */}
          <Title order={3} mt="lg">Phone Numbers</Title>
          {phones.map((phone, index) => (
            <Group key={index} mt="xs" align="flex-end">
              <TextInput
                style={{ flex: 1 }}
                label={index === 0 ? "Primary Phone" : `Phone ${index + 1}`}
                withAsterisk={index === 0}
                value={phone}
                onChange={(e) => updatePhoneAtIndex(index, e.currentTarget.value)}
                error={phoneErrors[index] || undefined}
              />
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => removePhone(index)}
                disabled={phones.length === 1}
                title="Remove this phone"
              >
                <IconTrash size="1rem" />
              </ActionIcon>
            </Group>
          ))}
          {/* Button to add new phone numbers */}
          <Group mt="sm">
            <Button variant="light" onClick={addNewPhone}>+ Add Phone</Button>
            <Button onClick={savePhones} loading={saving.phones} disabled={phoneErrors.some(e => e !== null) || phones.every((p) => p.trim() === "")}>Save Phones</Button>
          </Group>
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