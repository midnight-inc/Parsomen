"use client";
import { useState, useEffect } from 'react';
import { FaGem, FaCrown, FaBox, FaFire, FaClock, FaShoppingCart, FaStar, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DailySpinWheel from '@/components/gamification/DailySpinWheel';
import Button from '@/components/ui/Button';


const rarityColors = {
    COMMON: 'border-gray-500 bg-gray-500/10',
    RARE: 'border-blue-500 bg-blue-500/10',
    EPIC: 'border-purple-500 bg-purple-500/10',
    LEGENDARY: 'border-yellow-500 bg-yellow-500/10',
};

const rarityLabels = {
    COMMON: 'Yaygın',
    RARE: 'Nadir',
    EPIC: 'Epik',
    LEGENDARY: 'Efsanevi',
};

export default function PointsShopPage() {
    const [items, setItems] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch shop items
            const shopRes = await fetch('/api/shop');
            const shopData = await shopRes.json();
            if (shopData.success) {
                setItems(shopData.items);
            }

            // Fetch user inventory and points
            const invRes = await fetch('/api/shop/inventory');
            const invData = await invRes.json();
            if (invData.success) {
                setInventory(invData.inventory);
                setUserPoints(invData.points);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
            toast.error('Veri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (itemId) => {
        try {
            const res = await fetch('/api/shop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Satın alma başarılı! 🎉');
                fetchData(); // Refresh data
            } else {
                toast.error(data.error || 'Satın alma başarısız');
            }
        } catch (error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleEquip = async (itemId) => {
        try {
            const res = await fetch('/api/store/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Çerçeve güncellendi!');
                fetchData(); // Refresh inventory
                // Ideally reload user context too to see changes immediately in navbar
                window.location.reload(); // Hard reload for now to reflect in header
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error('Hata oluştu');
        }
    };

    const isOwned = (itemId) => inventory.some(inv => inv.itemId === itemId);

    const frames = items.filter(i => i.type === 'FRAME');
    const themes = items.filter(i => i.type === 'THEME');
    const lootboxes = items.filter(i => i.type === 'LOOTBOX');
    const limitedItems = items.filter(i => i.limited);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <FaSpinner className="text-4xl text-green-500 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen pt-24 px-4 sm:px-8 max-w-[1600px] mx-auto text-white pb-20">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                Puan Dükkanı
                            </h1>
                            <p className="text-gray-400">Puanlarınla profilini özelleştir</p>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-6 py-3 rounded-xl flex items-center gap-3">
                            <FaGem className="text-2xl text-yellow-200" />
                            <div>
                                <div className="text-2xl font-black text-white">{userPoints.toLocaleString()}</div>
                                <div className="text-xs text-yellow-200">Puan Bakiyesi</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Limited Items */}
                {limitedItems.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <FaFire className="text-orange-500" />
                            <h2 className="text-2xl font-bold">Sınırlı Stok</h2>
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">Kaçırmayın!</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {limitedItems.map(item => (
                                <div key={item.id} className={`relative p-6 rounded-2xl border-2 ${rarityColors[item.rarity]} overflow-hidden group`}>
                                    {item.stock !== null && (
                                        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                                            <FaClock /> {item.stock} Kaldı
                                        </div>
                                    )}
                                    <div className="flex items-center gap-6">
                                        <div className="text-6xl">{item.image}</div>
                                        <div className="flex-1">
                                            <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${item.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' : item.rarity === 'EPIC' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                {rarityLabels[item.rarity]}
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <FaGem className="text-yellow-500" />
                                                <span className="font-bold text-yellow-500">{item.price}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handlePurchase(item.id)}
                                            disabled={isOwned(item.id) || userPoints < item.price}
                                            variant={isOwned(item.id) ? 'success' : 'primary'}
                                            size="lg"
                                            className={isOwned(item.id) ? 'cursor-default' : ''}
                                            icon={!isOwned(item.id) && <FaShoppingCart />}
                                        >
                                            {isOwned(item.id) ? '✓ Sahip' : 'Satın Al'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Loot Boxes */}
                {lootboxes.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <FaBox className="text-purple-500" />
                            <h2 className="text-2xl font-bold">Gizemli Sandıklar</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {lootboxes.map(box => (
                                <div key={box.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all text-center cursor-pointer group">
                                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{box.image}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{box.name}</h3>
                                    <p className="text-gray-400 text-sm mb-4">{box.description}</p>
                                    <Button
                                        onClick={() => handlePurchase(box.id)}
                                        disabled={userPoints < box.price}
                                        fullWidth
                                        className="bg-purple-600/20 hover:bg-purple-600/40 text-white"
                                        icon={<FaGem className="text-yellow-500" />}
                                    >
                                        <span className="font-bold">{box.price} Puan</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Frames */}
                {frames.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <FaCrown className="text-yellow-500" />
                            <h2 className="text-2xl font-bold">Profil Çerçeveleri</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {frames.map(item => {
                                const owned = inventory.find(inv => inv.itemId === item.id);
                                const isEquipped = owned?.equipped;

                                return (
                                    <div key={item.id} className={`relative p-6 rounded-xl border border-gray-800 bg-gray-900/50 flex flex-col items-center hover:border-gray-600 transition-all ${isEquipped ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : ''}`}>
                                        {/* Preview */}
                                        <div className="relative mb-4">
                                            <div className={`w-24 h-24 rounded-full border-4 ${item.image} flex items-center justify-center bg-black overflow-hidden`}>
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                                                    Avatar
                                                </div>
                                            </div>
                                            {isEquipped && (
                                                <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-1 rounded-full shadow">
                                                    <FaCheckCircle className="text-sm" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center w-full">
                                            <h4 className="font-bold text-white text-sm mb-1">{item.name}</h4>
                                            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-3 ${item.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' : item.rarity === 'EPIC' ? 'bg-purple-500 text-white' : item.rarity === 'RARE' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                                {rarityLabels[item.rarity]}
                                            </div>

                                            {owned ? (
                                                <Button
                                                    onClick={() => handleEquip(item.id)}
                                                    disabled={isEquipped}
                                                    size="sm"
                                                    variant={isEquipped ? 'secondary' : 'success'}
                                                    fullWidth
                                                    className={`text-xs ${isEquipped ? 'opacity-70 cursor-default' : ''}`}
                                                >
                                                    {isEquipped ? 'Kullanılıyor' : 'Kullan'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handlePurchase(item.id)}
                                                    disabled={userPoints < item.price}
                                                    size="sm"
                                                    variant="ghost"
                                                    fullWidth
                                                    className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/30"
                                                    icon={<FaGem className="text-xs" />}
                                                >
                                                    {item.price} Puan
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Themes */}
                {themes.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <FaStar className="text-pink-500" />
                            <h2 className="text-2xl font-bold">Temalar</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {themes.map(item => (
                                <div key={item.id} className={`p-6 rounded-xl border ${rarityColors[item.rarity]} hover:scale-105 transition-all cursor-pointer flex items-center gap-4 ${isOwned(item.id) ? 'ring-2 ring-green-500' : ''}`}>
                                    <div className="text-5xl">{item.image}</div>
                                    <div className="flex-1">
                                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${item.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' : item.rarity === 'EPIC' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                                            {rarityLabels[item.rarity]}
                                        </div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        {isOwned(item.id) ? (
                                            <div className="text-green-500 font-bold">✓ Sahip</div>
                                        ) : (
                                            <Button
                                                onClick={() => handlePurchase(item.id)}
                                                disabled={userPoints < item.price}
                                                variant="ghost"
                                                size="sm"
                                                className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                                                icon={<FaGem className="text-xs" />}
                                            >
                                                {item.price}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* No Items Message */}
                {items.length === 0 && (
                    <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <FaGem className="text-5xl text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Henüz Ürün Yok</h3>
                        <p className="text-gray-500">Admin panelinden ürün eklendiğinde burada görünecek.</p>
                    </div>
                )}

                {/* Daily Spin Wheel */}
                <section className="mb-12">
                    <DailySpinWheel onWin={(points) => {
                        setUserPoints(prev => prev + points);
                        fetchData();
                    }} />
                </section>
            </div>
        </>
    );
}
