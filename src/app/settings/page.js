"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaFont, FaPalette, FaCheck, FaLock, FaEnvelope, FaBoxOpen, FaImage, FaSave, FaSpinner, FaCrown, FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Settings state
    const [selectedFont, setSelectedFont] = useState('inter');
    const [selectedTheme, setSelectedTheme] = useState('dark');
    const [saving, setSaving] = useState(false);

    // Password change
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // Inventory items
    const [inventory, setInventory] = useState([]);
    const [equippedFrame, setEquippedFrame] = useState(null);
    const [equippedTheme, setEquippedTheme] = useState(null);
    const [valentineStatus, setValentineStatus] = useState('auto'); // auto, true, false

    useEffect(() => {
        setValentineStatus(localStorage.getItem('theme_valentine_override') || 'auto');
    }, []);

    const toggleValentine = () => {
        const nextStatus = valentineStatus === 'true' ? 'false' : 'true';
        localStorage.setItem('theme_valentine_override', nextStatus);
        setValentineStatus(nextStatus);
        window.dispatchEvent(new Event('storage')); // Trigger MainLayout update
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            setSelectedFont(user.font || 'inter');
            setSelectedTheme(user.theme || 'dark');
            fetchInventory();
        }
    }, [user]);

    const fetchInventory = async () => {
        try {
            const res = await fetch('/api/shop/inventory');
            const data = await res.json();
            if (data.success) {
                setInventory(data.inventory || []);
                // Find equipped items
                const equipped = data.inventory.filter(i => i.equipped);
                const frame = equipped.find(i => i.item?.type === 'FRAME');
                const theme = equipped.find(i => i.item?.type === 'THEME');
                if (frame) setEquippedFrame(frame.item);
                if (theme) setEquippedTheme(theme.item);
            }
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        const loadingToast = toast.loading('Ayarlar kaydediliyor...');
        try {
            const res = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ font: selectedFont, theme: selectedTheme }),
            });

            if (res.ok) {
                toast.success('Ayarlar kaydedildi!', { id: loadingToast });
                // Reload to apply changes
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error('Kaydetme başarısız', { id: loadingToast });
            }
        } catch (e) {
            toast.error('Bir hata oluştu', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('Yeni şifre en az 6 karakter olmalı');
            return;
        }

        setChangingPassword(true);
        const loadingToast = toast.loading('Şifre değiştiriliyor...');

        try {
            const res = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Şifre başarıyla değiştirildi!', { id: loadingToast });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Şifre değiştirilemedi', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Bir hata oluştu', { id: loadingToast });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleEquipItem = async (itemId, type) => {
        const loadingToast = toast.loading('Değiştiriliyor...');
        try {
            const res = await fetch('/api/shop/inventory', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, equipped: true })
            });

            if (res.ok) {
                toast.success('Uygulandı!', { id: loadingToast });
                fetchInventory();
            } else {
                toast.error('Uygulama başarısız', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Bir hata oluştu', { id: loadingToast });
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-purple-500" />
            </div>
        );
    }

    // Filter inventory by type
    const frames = inventory.filter(i => i.item?.type === 'FRAME');
    const themes = inventory.filter(i => i.item?.type === 'THEME');

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
            <p className="text-gray-400 mb-8">Hesap ve görünüm ayarlarını özelleştir</p>

            <div className="space-y-8">
                {/* Account Security Section */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaLock className="text-red-400" /> Hesap Güvenliği
                        </h2>
                    </div>
                    <div className="p-6">
                        {/* Email */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">E-posta Adresi</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300">
                                    {user.email || 'E-posta yok'}
                                </div>
                                <span className="text-xs text-gray-500 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">Doğrulanmış</span>
                            </div>
                        </div>

                        {/* Password Change */}
                        <form onSubmit={handlePasswordChange}>
                            <label className="block text-sm text-gray-400 mb-2">Şifre Değiştir</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <input
                                    type="password"
                                    placeholder="Mevcut şifre"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all"
                                />
                                <input
                                    type="password"
                                    placeholder="Yeni şifre"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all"
                                />
                                <input
                                    type="password"
                                    placeholder="Şifreyi tekrarla"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                                className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {changingPassword ? <FaSpinner className="animate-spin" /> : <FaLock />}
                                Şifreyi Değiştir
                            </button>
                        </form>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaPalette className="text-purple-400" /> Görünüm
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Font Selection */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-3 flex items-center gap-2">
                                    <FaFont /> Yazı Tipi
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'inter', name: 'Inter', desc: 'Klasik & Temiz' },
                                        { id: 'montserrat', name: 'Montserrat', desc: 'Modern & Dinamik' }
                                    ].map(font => (
                                        <button
                                            key={font.id}
                                            onClick={() => setSelectedFont(font.id)}
                                            className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${selectedFont === font.id
                                                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium">{font.name}</p>
                                                <p className="text-xs opacity-60">{font.desc}</p>
                                            </div>
                                            {selectedFont === font.id && <FaCheck className="text-purple-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theme Selection */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-3 flex items-center gap-2">
                                    <FaPalette /> Tema
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'dark', name: 'Koyu Tema', desc: 'Varsayılan' },
                                        { id: 'light', name: 'Açık Tema', desc: 'Yakında', disabled: true }
                                    ].map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => !theme.disabled && setSelectedTheme(theme.id)}
                                            disabled={theme.disabled}
                                            className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${theme.disabled
                                                ? 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed opacity-50'
                                                : selectedTheme === theme.id
                                                    ? 'bg-green-500/20 border-green-500/50 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium">{theme.name}</p>
                                                <p className="text-xs opacity-60">{theme.desc}</p>
                                            </div>
                                            {selectedTheme === theme.id && !theme.disabled && <FaCheck className="text-green-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="mt-6 px-6 py-3 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            Görünüm Ayarlarını Kaydet
                        </button>

                        {/* Special Themes */}
                        <div className="mt-8 border-t border-white/10 pt-6">
                            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                <FaHeart className="text-pink-500" /> Özel Modlar
                            </h3>
                            <div className="bg-gradient-to-r from-pink-900/20 to-transparent p-4 rounded-xl border border-pink-500/20 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-pink-400">Sevgililer Günü Teması</h4>
                                    <p className="text-xs text-pink-300/60">Romantik bir atmosfer (14 Şubat'ta otomatik açılır)</p>
                                </div>
                                <button
                                    onClick={toggleValentine}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors border ${valentineStatus === 'true'
                                            ? 'bg-pink-500 text-white border-pink-500'
                                            : 'bg-pink-500/10 text-pink-300 border-pink-500/30 hover:bg-pink-500/20'
                                        }`}
                                >
                                    {valentineStatus === 'true' ? 'Aktif' : 'Pasif'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Customization */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaBoxOpen className="text-amber-400" /> Envanter Öğeleri
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Puan Dükkanından aldığın öğeleri uygula</p>
                    </div>
                    <div className="p-6">
                        {inventory.length === 0 ? (
                            <div className="text-center py-8">
                                <FaBoxOpen className="text-4xl text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500">Envanterinde öğe yok</p>
                                <a href="/store/points-shop" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
                                    Puan Dükkanı'na Git →
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Frames */}
                                {frames.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                            <FaImage /> Profil Çerçeveleri
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {frames.map(inv => (
                                                <button
                                                    key={inv.id}
                                                    onClick={() => handleEquipItem(inv.item.id, 'FRAME')}
                                                    className={`p-4 rounded-xl border text-center transition-all ${inv.equipped
                                                        ? 'bg-purple-500/20 border-purple-500/50'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <span className="text-3xl block mb-2">
                                                        {inv.item.image?.startsWith('/') ? (
                                                            <img src={inv.item.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                                        ) : (
                                                            inv.item.image || <FaImage className="mx-auto" />
                                                        )}
                                                    </span>
                                                    <p className="text-xs text-white truncate">{inv.item.name}</p>
                                                    {inv.equipped && <span className="text-[10px] text-purple-400">Aktif</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Themes */}
                                {themes.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                            <FaCrown /> Profil Temaları
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {themes.map(inv => (
                                                <button
                                                    key={inv.id}
                                                    onClick={() => handleEquipItem(inv.item.id, 'THEME')}
                                                    className={`p-4 rounded-xl border text-center transition-all ${inv.equipped
                                                        ? 'bg-amber-500/20 border-amber-500/50'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <span className="text-3xl block mb-2">
                                                        {inv.item.image?.startsWith('/') ? (
                                                            <img src={inv.item.image} alt="" className="w-12 h-12 object-contain mx-auto" />
                                                        ) : (
                                                            inv.item.image || '🎨'
                                                        )}
                                                    </span>
                                                    <p className="text-xs text-white truncate">{inv.item.name}</p>
                                                    {inv.equipped && <span className="text-[10px] text-amber-400">Aktif</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
