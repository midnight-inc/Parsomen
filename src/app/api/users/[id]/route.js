import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

// PUT: Update Role
export async function PUT(request, { params }) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { role } = await request.json(); // 'ADMIN' or 'USER'

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Ban/Delete User
export async function DELETE(request, { params }) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Prevent deleting self
        if (parseInt(id) === session.user.id) {
            return NextResponse.json({ success: false, message: 'Cannot delete yourself' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
