const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting debug update...');

    // 1. Find the user 'Test' (ID 2 usually, or find by username)
    const username = 'Test'; // Adjust if needed
    const user = await prisma.user.findFirst({
        where: { username: username }
    });

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user: ${user.username} (ID: ${user.id})`);
    console.log('Current Bio:', user.bio);
    console.log('Current Avatar:', user.avatar);

    try {
        // 2. Attempt update
        const newBio = "Debug bio updated at " + new Date().toISOString();
        console.log(`Attempting to update bio to: "${newBio}"`);

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                bio: newBio
            }
        });

        console.log('Update SUCCESS!');
        console.log('New Bio:', updatedUser.bio);

    } catch (error) {
        console.error('Update FAILED!');
        console.error('Error details:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
