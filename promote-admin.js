const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = "Ozgur";

    console.log(`Searching for user: ${username}...`);
    const user = await prisma.user.findFirst({
        where: { username: username }
    });

    if (!user) {
        console.log("User not found! Listing all users:");
        const allUsers = await prisma.user.findMany();
        console.log(allUsers.map(u => u.username));
        return;
    }

    console.log(`Found user ${user.username} (ID: ${user.id}). Updating role to ADMIN...`);

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
    });

    console.log("Success! User role updated:", updated.role);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
