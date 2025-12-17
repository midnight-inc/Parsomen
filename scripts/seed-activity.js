const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding fake live activity...')

    // Get some users and books
    const users = await prisma.user.findMany({ take: 5 });
    const books = await prisma.book.findMany({ take: 10 });

    if (users.length === 0 || books.length === 0) {
        console.log('No users or books found.');
        return;
    }

    // Create random activities in the last 5 minutes
    for (const book of books) {
        // Random number of readers (0-5)
        const readersCount = Math.floor(Math.random() * 6);

        for (let i = 0; i < readersCount; i++) {
            const user = users[Math.floor(Math.random() * users.length)];

            await prisma.userActivity.create({
                data: {
                    userId: user.id,
                    type: 'VIEW_BOOK',
                    targetId: book.id,
                    createdAt: new Date() // Now
                }
            })
        }
        console.log(`Added ${readersCount} readers for book ${book.title}`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
