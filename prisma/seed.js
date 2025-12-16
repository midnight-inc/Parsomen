const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const categories = [
        { name: 'Bilim Kurgu', image: '', gradient: 'from-blue-900 to-purple-900' },
        { name: 'Fantastik', image: '', gradient: 'from-purple-900 to-pink-900' },
        { name: 'Korku', image: '', gradient: 'from-black to-red-900' },
        { name: 'Polisiye', image: '', gradient: 'from-gray-900 to-gray-700' },
        { name: 'Tarih', image: '', gradient: 'from-amber-900 to-yellow-900' },
        { name: 'Romantik', image: '', gradient: 'from-pink-500 to-rose-500' },
        { name: 'Macera', image: '', gradient: 'from-green-900 to-emerald-900' },
        { name: 'Psikoloji', image: '', gradient: 'from-indigo-900 to-blue-800' },
        { name: 'Felsefe', image: '', gradient: 'from-gray-800 to-gray-600' },
        { name: 'Klasikler', image: '', gradient: 'from-amber-800 to-orange-900' }
    ]

    console.log('Start seeding categories...')

    for (const cat of categories) {
        const exists = await prisma.category.findUnique({
            where: { name: cat.name }
        });

        if (!exists) {
            await prisma.category.create({
                data: cat
            })
            console.log(`Created category: ${cat.name}`)
        } else {
            console.log(`Category exists: ${cat.name}`)
        }
    }

    console.log('Seeding finished.')
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
