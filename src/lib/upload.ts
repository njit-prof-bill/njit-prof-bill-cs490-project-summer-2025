import { getAuth } from "firebase/auth";

/**
 * Uploads a file to the /api/history/upload endpoint with Firebase Auth token.
 */
export async function uploadFileWithToken(file: File): Promise<"success" | "error"> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("User not authenticated");

  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/history/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return res.ok ? "success" : "error";
}
