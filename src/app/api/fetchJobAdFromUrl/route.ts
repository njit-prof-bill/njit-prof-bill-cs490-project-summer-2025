import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    // Fetch the HTML from the URL
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
    }
    const html = await response.text();

    // Use Cheerio to parse and extract main content
    const $ = cheerio.load(html);

    // Try to extract the main job description (customize selectors as needed)
    let jobText =
      $("main").text() ||
      $('[class*="jobDescription"], [id*="jobDescription"]').text() ||
      $('[class*="description"], [id*="description"]').text() ||
      $("body").text();

    jobText = jobText.replace(/\s+/g, " ").trim();
    if (jobText.length > 5000) jobText = jobText.slice(0, 5000) + "...";

    return NextResponse.json({ jobText });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch job ad" }, { status: 500 });
  }
}
