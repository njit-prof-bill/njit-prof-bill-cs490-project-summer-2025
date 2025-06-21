import { ProfileData } from "@/context/profileContext";

async function postForm(form: FormData): Promise<Partial<ProfileData>> {
  const res = await fetch("/api/parse-document", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Parse failed: ${txt}`);
  }
  return res.json();
}

/** Parse a resume file (PDF, DOCX, TXT, MD) */
export async function parseDocument(file: File): Promise<Partial<ProfileData>> {
  const form = new FormData();
  form.append("file", file);
  form.append("type", "document");
  return postForm(form);
}

/** Parse freeform biography text */
export async function parseBiographyText(
  biography: string
): Promise<Partial<ProfileData>> {
  const form = new FormData();
  form.append("file", new Blob([biography], { type: "text/plain" }));
  form.append("type", "biography");
  return postForm(form);
}
