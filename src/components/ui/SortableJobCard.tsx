"use client";

import React from "react";
import { Card, Group, Title, ActionIcon, Tooltip } from "@mantine/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";

export interface JobEntry {
  title: string | null;
  company: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  role_summary: string | null;
  responsibilities: string[];
  accomplishments: string[];
}

interface SortableJobCardProps {
  /** Unique identifier for DnDKit, typically the index as string */
  id: string;
  /** Job data for display in the header */
  job: JobEntry;
  /** Children to render inside the card, e.g., the expanded <Collapse> editor */
  children?: React.ReactNode;
}

export default function SortableJobCard({ id, job, children }: SortableJobCardProps) {
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
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card withBorder mb="sm" p="sm">
        <Group align="center" {...attributes}>
          <Tooltip label="Drag Job" withArrow>
            <ActionIcon {...listeners} variant="light" color="gray" title="Drag to reorder">
              <IconGripVertical size={18} />
            </ActionIcon>
          </Tooltip>
          <div style={{ flex: 1, marginLeft: 8 }}>
            <Title order={4}>
              {job.title ?? "<No Title>"} @ {job.company ?? "<No Company>"}
            </Title>
          </div>
        </Group>
        {children}
      </Card>
    </div>
  );
}
