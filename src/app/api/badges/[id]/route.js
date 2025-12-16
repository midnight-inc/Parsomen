import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, props) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const json = await request.json();

        const badge = await prisma.badge.update({
            where: { id },
            data: {
                name: json.name,
                description: json.description,
                icon: json.icon,
            }
        });

        return NextResponse.json(badge);
    } catch (error) {
        return NextResponse.json({ error: 'Güncelleme başarısız.' }, { status: 500 });
    }
}

export async function DELETE(request, props) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        await prisma.badge.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Silme başarısız.' }, { status: 500 });
    }
}
