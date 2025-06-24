import { NextRequest, NextResponse } from "next/server";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from '@/lib/firebase';
import { bucket } from "@/lib/firebaseAdmin";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("error", (error) => reject(error));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("userId");
        const fileName = req.nextUrl.searchParams.get("file");

        if (!userId || !fileName) {
            return NextResponse.json({ error: "Missing userId or file parameter" }, { status: 400 });
        }

        const filePath = `users/${userId}/${fileName}`;
        const file = bucket.file(filePath);

        const [exists] = await file.exists();
        if (!exists) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || "application/octet-stream";

        const buffer = await streamToBuffer(file.createReadStream());

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Content-Length", buffer.length.toString());
        if (metadata.name) {
            headers.set("X-File-Name", metadata.name);
        }

        return new NextResponse(buffer, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error("Proxy error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}