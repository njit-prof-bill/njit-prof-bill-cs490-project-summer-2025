import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    contact: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "(123) 456-7890",
    },
    objectives: "To apply my data science expertise...",
    skills: ["Python", "TensorFlow", "SQL"],
    jobs: [
      { company: "Company A", title: "Data Scientist", years: "2019–2021" },
      { company: "Company B", title: "Analyst", years: "2017–2019" }
    ],
    education: [
      { school: "University X", degree: "B.Sc. in Computer Science", year: 2017 }
    ],
  });
}