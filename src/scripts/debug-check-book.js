const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- DB Check Started ---');

    // Total Count
    const count = await prisma.book.count();
    console.log(`Total Books in DB: ${count}`);

    // Check specific author from logs
    const agatha = await prisma.book.findMany({
        where: { author: { contains: 'Agatha', mode: 'insensitive' } },
        select: { id: true, title: true, publisher: true }
    });

    console.log(`\nBooks by Agatha Christie (${agatha.length}):`);
    agatha.forEach(b => console.log(`- [${b.id}] ${b.title} (${b.publisher})`));

    // Check "On Kişiydiler" specifically
    const specific = await prisma.book.findFirst({
        where: { title: { equals: 'On Kişiydiler (On Küçük Zenci)', mode: 'insensitive' } }
    });
    console.log(`\nSpecifc Book 'On Kişiydiler' exists? ${!!specific}`);

    // Check Category table
    const catCount = await prisma.category.count();
    console.log(`\nTotal Categories: ${catCount}`);
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
