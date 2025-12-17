const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Community Events...');

    const events = [
        {
            title: 'Aylık Klasikler Maratonu',
            description: 'Bu ayın teması Rus Edebiyatı! Dostoyevski veya Tolstoy\'dan bir eser okuyun, rozeti kazanın.',
            type: 'CHALLENGE',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            isActive: true,
            image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=80&w=800&auto=format&fit=crop'
        },
        {
            title: 'Bilim Kurgu Haftası',
            description: 'Geleceğe yolculuk zamanı. En sevdiğiniz bilim kurgu romanını inceleyin.',
            type: 'EVENT',
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            isActive: true,
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop'
        }
    ];

    for (const event of events) {
        await prisma.communityEvent.create({
            data: event
        });
    }

    console.log('✅ Events seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
