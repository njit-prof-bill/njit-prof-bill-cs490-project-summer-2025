import { NextResponse } from "next/server";

const mockApplications = [
  {
    id: 1,
    jobTitle: "Frontend Developer",
    company: "Tech Corp",
    dateApplied: "2025-06-15",
    status: "Under Review",
  },
  {
    id: 2,
    jobTitle: "Backend Engineer",
    company: "InnovateX",
    dateApplied: "2025-06-10",
    status: "Interview Scheduled",
  },
];

export async function GET() {
  return NextResponse.json({ applications: mockApplications });
}