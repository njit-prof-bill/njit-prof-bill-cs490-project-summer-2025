// app/api/get-jobApplications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/fireBaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';

// Get admin auth instance
const adminAuth = getAuth(getApps()[0]);

async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch job descriptions using Firebase Admin SDK
    const jobsRef = adminDB.collection("users").doc(userId).collection("userJobDescriptions");
    const jobsSnapshot = await jobsRef.get();
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch resumes using Firebase Admin SDK
    const resumesRef = adminDB.collection("users").doc(userId).collection("userAIResumes");
    const resumesSnapshot = await resumesRef.get();
    const resumes = resumesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort jobs by creation date (most recent first)
    const sortedJobs = jobs.sort((a: any, b: any) => {
      if (a.createdAt?._seconds && b.createdAt?._seconds) {
        return b.createdAt._seconds - a.createdAt._seconds;
      }
      return 0;
    });

    return NextResponse.json({
      jobs: sortedJobs,
      resumes: resumes,
      success: true
    });

  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}