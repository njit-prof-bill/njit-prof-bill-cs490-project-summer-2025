import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import * as unzipper from 'unzipper';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { bucket } from '@/lib/firebaseAdmin';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase-admin/auth';

async function extractODTText(buffer: Buffer): Promise<string> {
  const entries = await unzipper.Open.buffer(buffer);
  const contentXml = entries.files.find(f => f.path === 'content.xml');

  if (!contentXml) {
    throw new Error('content.xml not found in .odt file');
  }

  const xmlBuffer = await contentXml.buffer();
  const xmlString = xmlBuffer.toString('utf-8');

  // remove XML tags and keep only text content
  const text = xmlString.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { filePath, idToken } = body;

        if (!filePath || !idToken) {
            return NextResponse.json({ error: 'Missing filePath or idToken' }, { status: 400 });
        }

        // Verify ID token
        const decoded = await getAuth().verifyIdToken(idToken);
        const uid = decoded.uid;

        // Check that the path belongs to the user
        if (!filePath.startsWith(`users/${uid}/`)) {
            return NextResponse.json({ error: 'Unauthorized access to file' }, { status: 403 });
        }

        // Download the file from cloud storage
        const file = bucket.file(filePath);
        const [buffer] = await file.download();

        // Extract the text from the file
        const ext = filePath.split('.').pop()?.toLowerCase();
        let rawText = '';

        if (ext === 'pdf') {
            const result = await pdfParse(buffer);
            rawText = result.text;
        } else if (ext === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
        } else if (ext === 'odt') {
            rawText = await extractODTText(buffer);
        } else if (['txt', 'md'].includes(ext)) {
            rawText = buffer.toString('utf-8');
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
        }

        return NextResponse.json({
            success: true,
            rawText
        });
    } catch (err: any) {
        console.error('Processing error: ', err);
        return NextResponse.json({
            error: 'Processing failed',
            message: err.message || 'Unknown error',
        }, { status: 500 });
    }
}