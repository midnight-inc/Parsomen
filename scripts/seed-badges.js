const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding badges...');

    const badges = [
        {
            name: 'Tür Kaşifi',
            description: 'Farklı bir edebi türden ilk kitabını bitirdin.',
            icon: '🧭'
        },
        {
            name: 'Kitap Kurdu',
            description: 'Toplam 10 kitap bitirdin.',
            icon: '📚'
        },
        {
            name: 'Usta Eleştirmen',
            description: '5 detaylı inceleme yazdın.',
            icon: '✍️'
        },
        {
            name: 'Sosyal Kelebek',
            description: '10 Arkadaş edindin.',
            icon: '🦋'
        },
        {
            name: 'Maratoncu',
            description: 'Okuma maratonuna katıldın.',
            icon: '🏃'
        },
        {
            name: 'İlk Adım',
            description: 'Parsomen ailesine katıldın.',
            icon: '🥚'
        }
    ];

    for (const badge of badges) {
        const existing = await prisma.badge.findFirst({
            where: { name: badge.name }
        });

        if (!existing) {
            await prisma.badge.create({ data: badge });
            console.log(`Created badge: ${badge.name}`);
        } else {
            console.log(`Badge already exists: ${badge.name}`);
        }
    }

    console.log('✅ Badges seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
