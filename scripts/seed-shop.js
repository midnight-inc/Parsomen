const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SHOP_ITEMS = [
    {
        name: "Altın Çerçeve",
        type: "FRAME",
        price: 500,
        rarity: "RARE",
        image: "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]",
        description: "Parlayan altın bir çerçeve."
    },
    {
        name: "Neon Mor",
        type: "FRAME",
        price: 750,
        rarity: "EPIC",
        image: "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse",
        description: "Nabız gibi atan neon mor ışık."
    },
    {
        name: "Alevli Çerçeve",
        type: "FRAME",
        price: 1500,
        rarity: "LEGENDARY",
        image: "border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.8)] ring-2 ring-orange-500",
        description: "Alev alev yanan efsanevi bir çerçeve."
    },
    {
        name: "Buz Mavisi",
        type: "FRAME",
        price: 300,
        rarity: "COMMON",
        image: "border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]",
        description: "Soğuk ve şık."
    },
    {
        name: "Doğa Yeşili",
        type: "FRAME",
        price: 300,
        rarity: "COMMON",
        image: "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]",
        description: "Doğayla iç içe."
    }
];

async function main() {
    console.log('Seeding shop items...');

    for (const item of SHOP_ITEMS) {
        // Check if exists to prevent duplicates
        const exists = await prisma.shopItem.findFirst({ where: { name: item.name } });
        if (!exists) {
            await prisma.shopItem.create({ data: item });
            console.log(`Created: ${item.name}`);
        } else {
            console.log(`Skipped: ${item.name} (Exists)`);
        }
    }

    console.log(`Seeding complete.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
