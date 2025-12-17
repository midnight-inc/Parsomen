import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { uploadToCloudinary } from '@/lib/cloudinary';

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

// Max file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

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

        // 6. Upload to Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine resource type (pdf triggers 'raw' or 'auto' usually, images are 'image')
        const isPdf = extension === 'pdf';

        const result = await uploadToCloudinary(buffer, {
            resource_type: isPdf ? 'raw' : 'image',
            folder: 'parsomen/uploads'
        });

        console.log(`[Upload] User ${session.user.id} uploaded to Cloudinary: ${result.secure_url}`);

        return NextResponse.json({
            url: result.secure_url,
            success: true,
            filename: result.public_id
        });

    } catch (error) {
        console.error('[Upload] Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Sunucu hatası: Dosya buluta yüklenemedi.'
        }, { status: 500 });
    }
}

