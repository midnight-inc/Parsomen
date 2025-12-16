import Link from 'next/link';
import { FaStar, FaTrophy, FaGift, FaShoppingBag, FaNewspaper, FaChartBar } from 'react-icons/fa';

const cards = [
    {
        title: "Öne Çıkanlar",
        href: "/store/featured",
        icon: <FaStar className="w-8 h-8 mb-3 text-yellow-400" />,
        color: "from-purple-900 to-indigo-900",
        description: "En popüler ve yeni kitaplar"
    },
    {
        title: "Editörün Seçimi",
        href: "/store/editor-choice",
        icon: <FaTrophy className="w-8 h-8 mb-3 text-orange-400" />,
        color: "from-red-900 to-orange-900",
        description: "Özel seçki ve koleksiyonlar"
    },
    {
        title: "Hediye Listesi",
        href: "/store/gift-list",
        icon: <FaGift className="w-8 h-8 mb-3 text-pink-400" />,
        color: "from-pink-900 to-rose-900",
        description: "Sevdiklerinize kitap hediye edin"
    },
    {
        title: "Puan Dükkanı",
        href: "/store/points-shop",
        icon: <FaShoppingBag className="w-8 h-8 mb-3 text-green-400" />,
        color: "from-emerald-900 to-teal-900",
        description: "Puanlarınızla profilinizi özelleştirin"
    },
    {
        title: "Haberler",
        href: "/store/news",
        icon: <FaNewspaper className="w-8 h-8 mb-3 text-blue-400" />,
        color: "from-blue-900 to-cyan-900",
        description: "Kitap dünyasından son gelişmeler"
    },
    {
        title: "İstatistikler",
        href: "/store/stats",
        icon: <FaChartBar className="w-8 h-8 mb-3 text-violet-400" />,
        color: "from-violet-900 to-purple-900",
        description: "Kişisel okuma verileriniz"
    }
];

export default function StoreNavigation() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {cards.map((card, index) => (
                <Link
                    key={index}
                    href={card.href}
                    className={`
                        relative group overflow-hidden rounded-xl p-4 h-40
                        bg-gradient-to-br ${card.color}
                        border border-white/10 hover:border-white/30 transition-all duration-300
                        hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20
                    `}
                >
                    {/* Background Pattern/Glow */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            {card.icon}
                            <h3 className="font-bold text-lg leading-tight text-white mb-1 group-hover:text-white/90">
                                {card.title}
                            </h3>
                        </div>
                        <p className="text-xs text-white/60 group-hover:text-white/80 line-clamp-2">
                            {card.description}
                        </p>
                    </div>

                    {/* Hover Effect Light */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-300" />
                </Link>
            ))}
        </div>
    );
}
