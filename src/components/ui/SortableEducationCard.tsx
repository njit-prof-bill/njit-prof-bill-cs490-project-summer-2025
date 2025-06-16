// src/components/ui/SortableEducationCard.tsx
"use client";

import React from "react";
import { Card, Group, Title, ActionIcon, Tooltip, Text } from "@mantine/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";

export interface EducationEntry {
  institution: string | null;
  degree: string | null;
  graduation_date: string | null;
  GPA: number | null;
}

interface SortableEducationCardProps {
  id: string;
  entry: EducationEntry;
  children?: React.ReactNode;
}

export default function SortableEducationCard({
  id,
  entry,
  children,
}: SortableEducationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : "none",
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card withBorder mb="sm" p="sm">
        <Group align="center" {...attributes}>
          <Tooltip label="Drag Education" withArrow>
            <ActionIcon {...listeners} variant="light" color="gray">
              <IconGripVertical size={18} />
            </ActionIcon>
          </Tooltip>
          <div style={{ flex: 1, marginLeft: 8 }}>
            <Title order={4}>
              {entry.institution ?? "<No School>"} — {entry.degree ?? "<No Degree>"}
            </Title>
            <Text size="sm" c="dimmed">
              {entry.graduation_date ?? "No Date"} {entry.GPA !== null ? `· GPA: ${entry.GPA}` : ""}
            </Text>
          </div>
        </Group>
        {children}
      </Card>
    </div>
  );
}
