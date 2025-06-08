

// src/app/api/image/route.ts
// import { NextResponse } from 'next/server';

export async function GET() {
<<<<<<< Updated upstream
  const imageUrl = 'https://cdn2.thecatapi.com/images/6t9.jpg';  // replace with your image URL
=======
  const imageUrl = '../../public/team-logo-1.jpg'; // replace with your image URL
>>>>>>> Stashed changes

    const res = await fetch(imageUrl);
    const contentType = res.headers.get('content-type') || 'application/octet-stream'; 
 
    // Return the fetched response directly, copying headers and body
    return new Response(res.body, {
        headers: {
        'Content-Type': contentType,
        },
  });

}

