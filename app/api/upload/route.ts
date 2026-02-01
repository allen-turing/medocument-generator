import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Use Vercel Blob in production, local storage in development
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Use Vercel Blob
      const filename = `logo-${session.user.id}-${uuidv4()}${path.extname(file.name)}`;

      const blob = await put(filename, file, {
        access: 'public',
      });

      return NextResponse.json({ url: blob.url }, { status: 200 });
    } else {
      // Development: Save locally
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const filename = `${session.user.id}-${uuidv4()}${path.extname(file.name)}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

      // Ensure uploads directory exists
      await mkdir(uploadsDir, { recursive: true });

      const filepath = path.join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      return NextResponse.json({ url: `/uploads/${filename}` }, { status: 200 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
