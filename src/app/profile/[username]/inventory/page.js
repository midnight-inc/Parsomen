"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaGem, FaImage, FaPalette, FaGift, FaCheck, FaCoins, FaShoppingBag, FaBoxOpen, FaArrowLeft, FaCrown } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Item type info
const ITEM_TYPES = {
    FRAME: { icon: FaImage, label: 'Çerçeve', color: 'purple' },
    THEME: { icon: FaPalette, label: 'Tema', color: 'blue' },
    LOOTBOX: { icon: FaGift, label: 'Lootbox', color: 'amber' },
};

// Rarity styles
const RARITY_STYLES = {
    COMMON: {
        gradient: 'from-gray-500/20 to-gray-600/20',
        border: 'border-gray-500/30',
        text: 'text-gray-300',
        label: 'Yaygın',
    },
    RARE: {
        gradient: 'from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/40',
        text: 'text-blue-300',
        label: 'Nadir',
    },
    EPIC: {
        gradient: 'from-purple-500/20 to-purple-600/20',
        border: 'border-purple-500/40',
        text: 'text-purple-300',
        label: 'Epik',
    },
    LEGENDARY: {
        gradient: 'from-amber-500/20 to-yellow-500/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-300',
        label: 'Efsanevi',
    },
};

export default function UserInventoryPage() {
    const params = useParams();
    const { username } = params;
    const { user: currentUser } = useAuth();

    const [profileUser, setProfileUser] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [equipping, setEquipping] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        if (username) {
            fetchData();
        }
    }, [username]);

    const fetchData = async () => {
        try {
            // Fetch user profile
            const profileRes = await fetch(`/api/user/profile/${username}`);
            const profileData = await profileRes.json();

            if (profileData.success && profileData.user) {
                setProfileUser(profileData.user);
                setPoints(profileData.user.points || 0);
            }

            // Fetch inventory (only for own profile)
            if (currentUser?.username === username) {
                const invRes = await fetch('/api/shop/inventory');
                const invData = await invRes.json();
                if (invData.success) {
                    setInventory(invData.inventory || []);
                    setPoints(invData.points || 0);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEquip = async (itemId, currentlyEquipped) => {
        if (!isOwnProfile) return;

        setEquipping(itemId);
        try {
            const res = await fetch('/api/shop/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, equipped: !currentlyEquipped })
            });

            if (res.ok) {
                toast.success(currentlyEquipped ? 'Eşya çıkarıldı' : 'Eşya kuşanıldı');
                fetchData();
            } else {
                toast.error('İşlem başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setEquipping(null);
        }
    };

    // Filter items
    const filteredItems = inventory.filter(inv => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'EQUIPPED') return inv.equipped;
        return inv.item?.type === activeFilter;
    });

    // Stats
    const totalItems = inventory.length;
    const equippedItems = inventory.filter(i => i.equipped).length;

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-purple-500/50 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Envanter yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen pt-24 px-8 flex items-center justify-center">
                <div className="text-center">
                    <FaBoxOpen className="text-6xl text-gray-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Kullanıcı Bulunamadı</h2>
                    <Link href="/" className="text-purple-400 hover:text-purple-300">← Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    // Not own profile
    if (!isOwnProfile) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto">
                <Link
                    href={`/profile/${username}`}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>{profileUser.username} profiline dön</span>
                </Link>

                <div className="text-center py-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl">
                    <FaBoxOpen className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Envanter Gizli</h2>
                    <p className="text-gray-400">Sadece kullanıcının kendisi envanterini görebilir</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-6xl mx-auto">
            {/* Back link */}
            <Link
                href={`/profile/${username}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Profilime dön</span>
            </Link>

            {/* Glass Header Card */}
            <div className="relative overflow-hidden rounded-3xl mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-gray-900/80 to-blue-900/40"></div>
                <div className="absolute inset-0 backdrop-blur-xl"></div>

                <div className="relative p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        {/* Icon */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                            <FaBoxOpen className="text-4xl text-purple-400" />
                        </div>

                        {/* Title */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-1">Envanterim</h1>
                            <p className="text-gray-400">
                                {totalItems === 0
                                    ? 'Henüz eşya satın almadın'
                                    : `${totalItems} eşya mevcut`
                                }
                            </p>
                        </div>

                        {/* Points */}
                        <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <FaCoins className="text-amber-400" />
                            <span className="text-xl font-bold text-amber-300">{points}</span>
                            <span className="text-amber-400/60 text-sm">puan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
                    <FaShoppingBag className="text-2xl text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalItems}</p>
                    <p className="text-xs text-gray-500">Toplam Eşya</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
                    <FaCheck className="text-2xl text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{equippedItems}</p>
                    <p className="text-xs text-gray-500">Kuşanılan</p>
                </div>
            </div>

            {/* Filters */}
            {totalItems > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {[
                        { id: 'ALL', label: 'Tümü', icon: FaBoxOpen },
                        { id: 'EQUIPPED', label: 'Kuşanılan', icon: FaCheck },
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm transition-all ${activeFilter === filter.id
                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
                                }`}
                        >
                            <filter.icon className="text-sm" />
                            <span>{filter.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <FaBoxOpen className="text-6xl text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                        {totalItems === 0 ? 'Envanter Boş' : 'Eşya Bulunamadı'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {totalItems === 0
                            ? 'Puan Dükkanı\'ndan eşya satın alabilirsin'
                            : 'Seçilen filtreye uygun eşya yok'
                        }
                    </p>
                    {totalItems === 0 && (
                        <Link
                            href="/store/points-shop"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-xl transition-colors"
                        >
                            <FaGem /> Puan Dükkanı
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredItems.map((inv) => {
                        const item = inv.item;
                        if (!item) return null;

                        const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.COMMON;

                        return (
                            <div
                                key={inv.id}
                                className={`group relative bg-gradient-to-br ${rarity.gradient} border ${rarity.border} rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                            >
                                {/* Equipped indicator */}
                                {inv.equipped && (
                                    <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-green-500/80 backdrop-blur-sm flex items-center justify-center">
                                        <FaCheck className="text-white text-xs" />
                                    </div>
                                )}

                                {/* Main content */}
                                <button
                                    onClick={() => setSelectedItem(inv)}
                                    className="w-full aspect-square flex flex-col items-center justify-center p-4"
                                >
                                    <span className="text-4xl mb-2 flex justify-center w-full">
                                        {item.image?.startsWith('/') ? (
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                        ) : (item.type === 'FRAME' || item.type === 'frame') ? (
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.image.includes('gradient') ? item.image : (item.image.includes('from') ? item.image : `from-gray-500 to-gray-700`)} p-1 shadow-lg`}>
                                                <div className="w-full h-full bg-black rounded-full"></div>
                                            </div>
                                        ) : (
                                            item.image || '🎁'
                                        )}
                                    </span>
                                    <p className="text-sm font-medium text-white text-center line-clamp-2">{item.name}</p>
                                    <p className={`text-xs mt-1 ${rarity.text}`}>{rarity.label}</p>
                                </button>

                                {/* Quick equip button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEquip(item.id, inv.equipped); }}
                                    disabled={equipping === item.id}
                                    className={`w-full py-2.5 text-xs font-medium transition-all backdrop-blur-sm ${inv.equipped
                                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-t border-red-500/20'
                                        : 'bg-white/5 hover:bg-white/10 text-white/80 border-t border-white/10'
                                        } ${equipping === item.id ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    {equipping === item.id ? '...' : (inv.equipped ? 'Çıkar' : 'Kuşan')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Item Detail Modal */}
            {selectedItem && selectedItem.item && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        {(() => {
                            const item = selectedItem.item;
                            const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.COMMON;

                            return (
                                <div className="text-center">
                                    <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${rarity.gradient} border ${rarity.border} flex items-center justify-center mb-4`}>
                                        <span className="text-5xl flex justify-center w-full">
                                            {item.image?.startsWith('/') ? (
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                                            ) : (item.type === 'FRAME' || item.type === 'frame') ? (
                                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.image.includes('gradient') ? item.image : (item.image.includes('from') ? item.image : `from-gray-500 to-gray-700`)} p-1 shadow-xl`}>
                                                    <div className="w-full h-full bg-black rounded-full"></div>
                                                </div>
                                            ) : (
                                                item.image || '🎁'
                                            )}
                                        </span>
                                    </div>

                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${rarity.text} bg-white/5 border ${rarity.border}`}>
                                        {rarity.label}
                                    </span>

                                    <h2 className="text-2xl font-bold text-white mb-1">{item.name}</h2>
                                    <p className="text-gray-500 text-sm mb-4">
                                        {ITEM_TYPES[item.type]?.label || item.type}
                                    </p>

                                    {item.description && (
                                        <p className="text-gray-400 mb-6">{item.description}</p>
                                    )}

                                    <p className="text-gray-600 text-xs mb-6">
                                        Alındı: {new Date(selectedItem.purchasedAt).toLocaleDateString('tr-TR')}
                                    </p>

                                    <button
                                        onClick={() => { handleEquip(item.id, selectedItem.equipped); setSelectedItem(null); }}
                                        className={`w-full py-3 rounded-xl font-medium transition-all ${selectedItem.equipped
                                            ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                                            : 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300'
                                            }`}
                                    >
                                        {selectedItem.equipped ? 'Çıkar' : 'Kuşan'}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Shop Link */}
            <div className="mt-8 text-center">
                <Link
                    href="/store/points-shop"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 text-white rounded-xl transition-all"
                >
                    <FaGem className="text-purple-400" /> Puan Dükkanı'na Git
                </Link>
            </div>
        </div>
    );
}
