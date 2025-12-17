const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('--- Checking DB connection... ---');
    try {
        const count = await prisma.book.count();
        console.log(`Current books: ${count}`);

        if (count > 0) {
            // Get first book
            const first = await prisma.book.findFirst();
            console.log(`Duplicating book: ${first.title}`);

            // Create a blatant duplicate
            await prisma.book.create({
                data: {
                    ...first,
                    id: undefined, // Let it autoincrement
                    isNew: true
                }
            });
            console.log('Duplicate created successfully. Now go run the Check in Admin Panel!');
        } else {
            console.log('No books to duplicate.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
