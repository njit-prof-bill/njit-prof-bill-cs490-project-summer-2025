

// src/app/api/image/route.ts
// import { NextResponse } from 'next/server';

export async function GET() {
  const imageUrl = '/team-logo-1.jpg'; // replace with your image URL

    const res = await fetch(imageUrl);
    const contentType = res.headers.get('content-type') || 'application/octet-stream'; 
 
    // Return the fetched response directly, copying headers and body
    return new Response(res.body, {
        headers: {
        'Content-Type': contentType,
        },
  });

}

