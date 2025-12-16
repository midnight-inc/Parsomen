const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Listing Users & Bios ---');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            bio: true,
            lastUsernameChange: true,
            lastAvatarChange: true
        }
    });

    users.forEach(u => {
        console.log(`ID: ${u.id} | User: ${u.username} | Bio: "${u.bio}" | LastUserChg: ${u.lastUsernameChange} | LastAvtChg: ${u.lastAvatarChange}`);
    });
    console.log('----------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
