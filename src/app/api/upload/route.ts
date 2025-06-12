// // File: src/app/api/upload/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import * as mammoth from 'mammoth';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export async function POST(req: NextRequest) {
//   try {
//     const contentType = req.headers.get('content-type') || '';
//     if (!contentType.includes('multipart/form-data')) {
//       return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
//     }

//     const formData = await req.formData();
//     const file = formData.get('file') as Blob;

//     if (!file) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const fileName = file.name;
//     const ext = fileName.split('.').pop()?.toLowerCase();

//     let rawText = '';

//     if (ext === 'pdf') {
//       const pdfParse = (await import('pdf-parse')).default;
//       const result = await pdfParse(buffer);
//       rawText = result.text;
//     } else if (ext === 'docx') {
//       const result = await mammoth.extractRawText({ buffer });
//       rawText = result.value;
//     } else if (['txt', 'md', 'odt'].includes(ext)) {
//       rawText = buffer.toString('utf-8');
//     } else {
//       return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
//     }

//     return NextResponse.json({ success: true, rawText });
//   } catch (error: any) {
//     console.error('Upload error:', error);
//     return NextResponse.json({
//       error: 'Internal server error',
//       message: error?.message || 'Unknown error',
//     }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import * as unzipper from 'unzipper';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();

    let rawText = '';

    if (ext === 'pdf') {
      const pdfParse = (await import('pdf-parse')).default;
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

    return NextResponse.json({ success: true, rawText });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}
