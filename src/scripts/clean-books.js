const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    console.log('Cleaning books and dependencies...');
    try {
        // Delete dependencies first to avoid Foreign Key Violations
        console.log('Deleting Library Entries...');
        await prisma.libraryEntry.deleteMany({});

        console.log('Deleting Reviews...');
        await prisma.review.deleteMany({});

        console.log('Deleting Favorites...');
        await prisma.favorite.deleteMany({});

        console.log('Deleting Collection Books...');
        await prisma.collectionBook.deleteMany({});

        // ShopItems might be linked to books too
        // await prisma.shopItem.deleteMany({ where: { bookId: { not: null } } }); 
        // Assuming shop items are manual, maybe skip? User said "all valid books are foreign". 
        // Let's safe Delete ShopItem if it relies on Book.
        // Actually simpler:
        // await prisma.shopItem.deleteMany({}); 
        // But let's trust library entries are the main blocker.

        console.log('Deleting Books...');
        const deleted = await prisma.book.deleteMany({});
        console.log(`Successfully deleted ${deleted.count} books.`);
    } catch (e) {
        console.error('Cleanup Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

clean();
