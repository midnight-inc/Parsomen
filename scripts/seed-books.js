const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOCK_BOOKS = [
    {
        title: "Karanlığın Soluğu",
        author: "Marcus Vance",
        rating: 4.8,
        cover: "https://m.media-amazon.com/images/I/41gr-N6N-aL._SX342_SY445_.jpg",
        category: "Korku",
        isNew: true,
        description: "Eski bir kasabada uyanan kadim kötülük..."
    },
    {
        title: "Yıldıztozu Gezginleri",
        author: "Sarah J. Clarke",
        rating: 4.5,
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630504222i/58438579.jpg",
        category: "Bilim Kurgu",
        isNew: false,
        description: "Galaksinin ucunda bir macera..."
    },
    {
        title: "Boşluktaki Fısıltı",
        author: "H.P. Lovecraft",
        rating: 4.9,
        cover: "https://m.media-amazon.com/images/I/51V1Z3k-1aL._AC_SY780_.jpg",
        category: "Korku",
        isNew: false,
        description: "Bilinmezin kıyısında..."
    },
    {
        title: "Sessiz Tanık",
        author: "Agatha Christie",
        rating: 4.7,
        cover: "https://m.media-amazon.com/images/I/51r0M+3mNPL._SY445_SX342_.jpg",
        category: "Polisiye",
        isNew: false,
        description: "Hercule Poirot yine iş başında..."
    },
    {
        title: "Yapay Zeka Çağı",
        author: "Kai-Fu Lee",
        rating: 4.6,
        cover: "https://m.media-amazon.com/images/I/410h-XyFfKL._SY445_SX342_.jpg",
        category: "Teknoloji",
        isNew: true,
        description: "Geleceğin dünyasını şekillendiren güç..."
    }
];

async function main() {
    console.log('Seeding books...');

    // Ensure categories exist first
    const categories = [...new Set(MOCK_BOOKS.map(b => b.category))];
    for (const catName of categories) {
        await prisma.category.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName }
        });
    }

    // Now create books
    for (const book of MOCK_BOOKS) {
        // Upsert based on title (assuming unique enough for seed) or check first
        // Since we don't have unique title constraint, findFirst then update/create
        const existing = await prisma.book.findFirst({
            where: { title: book.title }
        });

        if (existing) {
            console.log(`Updating ${book.title}`);
            await prisma.book.update({
                where: { id: existing.id },
                data: { ...book }
            });
        } else {
            console.log(`Creating ${book.title}`);
            await prisma.book.create({
                data: { ...book }
            });
        }
    }
    console.log('Books seeded!');
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
