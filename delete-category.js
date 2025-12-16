const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const deleted = await prisma.category.deleteMany({
            where: {
                name: 'deneme'
            }
        })
        console.log(`Deleted ${deleted.count} categories named 'deneme'`)
    } catch (e) {
        console.error(e)
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
