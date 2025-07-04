import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function getResumeById(userId: string, resumeId: string) {
  // Replace with your real data fetching logic
  return {
    emails: ["user@example.com"],
    phones: ["555-1234"],
    objective: "Seeking a Software Engineering role...",
    skills: ["JavaScript", "React", "Node.js"],
    education: [
      {
        school: "NJIT",
        degree: "B.S. Computer Science",
        years: "2021-2025",
      },
    ],
    jobHistory: [
      {
        company: "Best Buy",
        title: "Geek Squad Lead",
        dates: "2023-Present",
        responsibilities: [
          "Managed team",
          "Improved sales",
        ],
      },
    ],
    bio: "Experienced developer...",
  };
}

export async function POST(request: Request) {
  try {
    const { userId, resumeId, format } = await request.json();

    if (!userId || !resumeId || !format) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (format !== "pdf") {
      return NextResponse.json({ error: "Only PDF format is supported currently" }, { status: 400 });
    }

    const resume = await getResumeById(userId, resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const { width, height } = page.getSize();
    const fontSize = 12;
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    let y = height - 50;

    function drawText(text: string) {
      page.drawText(text, {
        x: 50,
        y,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 8;
    }

    drawText("Resume");
    y -= 10;

    if (resume.emails && resume.emails.length > 0) {
      drawText("Emails: " + resume.emails.join(", "));
    }
    if (resume.phones && resume.phones.length > 0) {
      drawText("Phones: " + resume.phones.join(", "));
    }
    y -= 10;

    if (resume.objective) {
      drawText("Objective:");
      drawText(resume.objective);
      y -= 10;
    }

    if (resume.skills && resume.skills.length > 0) {
      drawText("Skills:");
      drawText(resume.skills.join(", "));
      y -= 10;
    }

    if (resume.education && resume.education.length > 0) {
      drawText("Education:");
      for (const edu of resume.education) {
        drawText(`${edu.degree} - ${edu.school} (${edu.years || ""})`);
      }
      y -= 10;
    }

    if (resume.jobHistory && resume.jobHistory.length > 0) {
      drawText("Job History:");
      for (const job of resume.jobHistory) {
        drawText(`${job.title} at ${job.company} (${job.dates || ""})`);
        if (job.responsibilities && job.responsibilities.length > 0) {
          for (const resp of job.responsibilities) {
            drawText(" - " + resp);
          }
        }
        y -= 10;
      }
    }

    if (resume.bio) {
      drawText("Bio:");
      drawText(resume.bio);
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${resumeId}.pdf`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
