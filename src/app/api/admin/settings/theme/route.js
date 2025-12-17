import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req) {
    try {
        const session = await getSession();
        // Check for Admin access
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mode, theme } = await req.json();

        // Validate
        if (!['AUTO', 'MANUAL'].includes(mode)) {
            return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
        }

        // Upsert settings
        await prisma.$transaction([
            prisma.systemSetting.upsert({
                where: { key: 'theme_mode' },
                update: { value: mode },
                create: { key: 'theme_mode', value: mode, description: 'Theme control mode (AUTO/MANUAL)' }
            }),
            prisma.systemSetting.upsert({
                where: { key: 'theme_selected' },
                update: { value: theme },
                create: { key: 'theme_selected', value: theme, description: 'Selected extensive theme name' }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Theme save error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
