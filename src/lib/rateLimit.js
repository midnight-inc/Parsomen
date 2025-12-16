import { RateLimiterMemory } from 'rate-limiter-flexible';

// Different rate limiters for different endpoints
const rateLimiters = {
    // General API - 100 requests per minute
    general: new RateLimiterMemory({
        points: 100,
        duration: 60,
    }),

    // Auth endpoints - 5 attempts per minute (prevent brute force)
    auth: new RateLimiterMemory({
        points: 5,
        duration: 60,
    }),

    // Heavy operations (uploads, etc.) - 10 per minute
    heavy: new RateLimiterMemory({
        points: 10,
        duration: 60,
    }),

    // Review/Vote - 30 per minute
    interaction: new RateLimiterMemory({
        points: 30,
        duration: 60,
    }),
};

/**
 * Get client IP from request
 */
function getClientIP(req) {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    return '127.0.0.1';
}

/**
 * Rate limit middleware
 * @param {string} type - 'general' | 'auth' | 'heavy' | 'interaction'
 * @returns {Promise<{success: boolean, error?: Response}>}
 */
export async function rateLimit(req, type = 'general') {
    const limiter = rateLimiters[type] || rateLimiters.general;
    const clientIP = getClientIP(req);

    try {
        await limiter.consume(clientIP);
        return { success: true };
    } catch (rejRes) {
        const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000) || 60;

        return {
            success: false,
            error: new Response(
                JSON.stringify({
                    error: 'Çok fazla istek gönderdiniz. Lütfen bekleyin.',
                    retryAfter
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': String(retryAfter),
                        'X-RateLimit-Reset': String(Date.now() + rejRes.msBeforeNext)
                    }
                }
            )
        };
    }
}

/**
 * Simple rate limit check helper for API routes
 */
export async function checkRateLimit(req, type = 'general') {
    const result = await rateLimit(req, type);
    if (!result.success) {
        return result.error;
    }
    return null;
}
