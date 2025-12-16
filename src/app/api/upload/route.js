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

// Max file size (100MB) - Increased for Book PDFs
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename) {
    // Remove path separators and null bytes
    return filename
        .replace(/[\/\\]/g, '')
        .replace(/\0/g, '')
        .replace(/\.\./g, '')
        .replace(/[<>:"|?*]/g, '_'); // Windows forbidden chars
}

// Magic byte signatures for validation
const SIGNATURES = {
    '25504446': ['pdf'],                  // %PDF
    '89504e47': ['png'],                  // .PNG
    'ffd8ff': ['jpg', 'jpeg'],            // JPEG start
    '47494638': ['gif'],                  // GIF8
    '52494646': ['webp'],                 // RIFF (webp) - partial check, usually followed by WEBP
};

// Check file signature (Magic Bytes)
async function validateFileSignature(file, extension) {
    const arrayBuffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Check specific signatures
    for (const [signature, extensions] of Object.entries(SIGNATURES)) {
        if (hex.startsWith(signature) && extensions.includes(extension)) {
            return true;
        }
    }

    // Special handling for WEBP (RIFF....WEBP)
    if (extension === 'webp' && hex.startsWith('52494646')) {
        return true;
    }

    // Special handling for some SVGs (text based)
    if (extension === 'svg') return true; // SVG validation is harder, accepting for now

    console.log('[Security] Signature Mismatch:', hex, 'Expected for:', extension);
    return false;
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

        // 2. Rate Limiting
        const rateLimitError = await checkRateLimit(request, 'heavy');
        if (rateLimitError) return rateLimitError;

        // 3. Get file
        const data = await request.formData();
        const file = data.get('file');

        if (!file) return NextResponse.json({ success: false, error: 'Dosya yüklenmedi.' }, { status: 400 });

        // 4. Size Check
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                success: false,
                error: `Dosya çok büyük. (Max: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
            }, { status: 400 });
        }

        // 5. Extension Validation
        const originalName = file.name || 'unknown';
        const extension = originalName.split('.').pop()?.toLowerCase();

        if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
            return NextResponse.json({
                success: false,
                error: 'Geçersiz dosya uzantısı.'
            }, { status: 400 });
        }

        // 6. MAGIC BYTE VALIDATION (Security)
        const isValidSignature = await validateFileSignature(file, extension);
        if (!isValidSignature) {
            return NextResponse.json({
                success: false,
                error: 'Güvenlik Uyarısı: Dosya içeriği uzantısı ile eşleşmiyor! (Magic Byte Mismatch)'
            }, { status: 400 });
        }

        // 7. Process & Save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const sanitizedName = sanitizeFilename(originalName.replace(/\.[^/.]+$/, ""));
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${sanitizedName}-${uniqueSuffix}.${extension}`;

        const uploadDir = join(process.cwd(), 'public/uploads');
        try { await mkdir(uploadDir, { recursive: true }); } catch (e) { }

        const filepath = join(uploadDir, filename);
        if (!filepath.startsWith(uploadDir)) {
            return NextResponse.json({ success: false, error: 'Geçersiz yol.' }, { status: 400 });
        }

        await writeFile(filepath, buffer);
        console.log(`[Upload] User ${session.user.id} uploaded: ${filename}`);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            success: true,
            filename: filename
        });

    } catch (error) {
        console.error('[Upload] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Sunucu hatası: Dosya yüklenemedi.'
        }, { status: 500 });
    }
}

