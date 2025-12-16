import { NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// GET: List all files
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        try {
            await stat(UPLOAD_DIR);
        } catch {
            return NextResponse.json({ success: true, files: [] });
        }

        const files = await readdir(UPLOAD_DIR);

        // Filter for files and map to URLs
        // We can add more robust filtering here if needed
        const fileList = files.map(file => ({
            name: file,
            url: `/uploads/${file}`,
            type: file.split('.').pop()
        }));

        return NextResponse.json({ success: true, files: fileList });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a file
export async function DELETE(request) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { filename } = await request.json();
        if (!filename) {
            return NextResponse.json({ success: false, message: 'Filename required' }, { status: 400 });
        }

        const filepath = join(UPLOAD_DIR, filename);

        // Security check: ensure traversal attacks aren't possible
        if (!filepath.startsWith(UPLOAD_DIR)) {
            return NextResponse.json({ success: false, message: 'Invalid path' }, { status: 403 });
        }

        await unlink(filepath);
        return NextResponse.json({ success: true, message: 'File deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
