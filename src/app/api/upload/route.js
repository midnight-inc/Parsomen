import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

// Allowed file types with their MIME types
const ALLOWED_TYPES = {
    // Images
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/svg+xml': ['svg'],
    // Documents
    'application/pdf': ['pdf'],
};

// Get all allowed extensions
const ALLOWED_EXTENSIONS = Object.values(ALLOWED_TYPES).flat();

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename) {
    // Remove path separators and null bytes
    return filename
        .replace(/[\/\\]/g, '')
        .replace(/\0/g, '')
        .replace(/\.\./g, '')
        .replace(/[<>:"|?*]/g, '_'); // Windows forbidden chars
}

export async function POST(request) {
    try {
        // 1. Authentication Check
        const session = await getSession();
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Dosya yüklemek için giriş yapmalısınız.'
            }, { status: 401 });
        }

        // 2. Rate Limiting - 10 uploads per minute
        const rateLimitError = await checkRateLimit(request, 'heavy');
        if (rateLimitError) return rateLimitError;

        // 3. Get file from form data
        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'Dosya yüklenmedi.'
            }, { status: 400 });
        }

        // 4. File Size Check
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                success: false,
                error: `Dosya boyutu çok büyük. Maksimum ${MAX_FILE_SIZE / 1024 / 1024}MB yükleyebilirsiniz.`
            }, { status: 400 });
        }

        // 5. File Type Validation
        const originalName = file.name || 'unknown';
        const extension = originalName.split('.').pop()?.toLowerCase();
        const mimeType = file.type;

        // Check extension
        if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
            return NextResponse.json({
                success: false,
                error: `Geçersiz dosya türü. İzin verilen türler: ${ALLOWED_EXTENSIONS.join(', ')}`
            }, { status: 400 });
        }

        // Check MIME type matches extension
        const allowedMimeTypes = Object.keys(ALLOWED_TYPES);
        if (!allowedMimeTypes.includes(mimeType)) {
            return NextResponse.json({
                success: false,
                error: 'Dosya türü doğrulanamadı.'
            }, { status: 400 });
        }

        // Verify extension matches MIME type
        const expectedExtensions = ALLOWED_TYPES[mimeType];
        if (!expectedExtensions || !expectedExtensions.includes(extension)) {
            return NextResponse.json({
                success: false,
                error: 'Dosya uzantısı içerik türüyle eşleşmiyor.'
            }, { status: 400 });
        }

        // 6. Process File
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 7. Create unique, sanitized filename
        const sanitizedName = sanitizeFilename(originalName.replace(/\.[^/.]+$/, ""));
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${sanitizedName}-${uniqueSuffix}.${extension}`;

        // 8. Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public/uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        // 9. Write file
        const filepath = join(uploadDir, filename);

        // Final security check - ensure we're writing to upload dir
        if (!filepath.startsWith(uploadDir)) {
            return NextResponse.json({
                success: false,
                error: 'Geçersiz dosya yolu.'
            }, { status: 400 });
        }

        await writeFile(filepath, buffer);
        console.log(`[Upload] User ${session.user?.id || 'unknown'} uploaded: ${filename}`);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            success: true,
            filename: filename
        });

    } catch (error) {
        console.error('[Upload] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Dosya yüklenirken bir hata oluştu.'
        }, { status: 500 });
    }
}

