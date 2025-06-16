"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function FreeformInputCard() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "processing" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/history/freeform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const result = await res.json();

      if (res.ok && result.status === "processing") {
        setStatus("processing");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Error submitting freeform text:", err);
      setStatus("error");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Submit Freeform Biography</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your biography here..."
            className="resize-none min-h-[100px] mb-2"
            required
          />
          {/* <p className="text-sm text-gray-400 text-right">{text.length} characters</p> */}
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-2">
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting..." : "Submit"}
          </Button>

          {status === "processing" && (
            <span className="text-sm text-green-600">✔️ AI parsing started</span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-600">❌ Failed to submit</span>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
