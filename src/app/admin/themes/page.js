"use client";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaMagic, FaCalendarAlt, FaPalette, FaSave } from 'react-icons/fa';

export default function ThemeSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('AUTO'); // AUTO, MANUAL
    const [selectedTheme, setSelectedTheme] = useState('default');

    const themes = [
        { id: 'default', name: 'Varsayılan', color: 'bg-gray-800' },
        { id: 'christmas', name: 'Yılbaşı (Christmas)', color: 'bg-red-900 border-green-500' },
        { id: 'valentine', name: 'Sevgililer Günü', color: 'bg-pink-900 border-rose-500' },
        { id: 'halloween', name: 'Cadılar Bayramı', color: 'bg-orange-900 border-purple-500' },
        { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-slate-900 border-cyan-500' },
        { id: 'coffee', name: 'Coffee House', color: 'bg-[#463b33] border-[#d4a373]' },
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, theme: selectedTheme })
            });

            if (res.ok) {
                toast.success('Tema ayarları kaydedildi! Sayfayı yenileyerek görebilirsiniz.');
                // Force reload to see changes globally or rely on router refresh
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error('Kaydedilemedi');
            }
        } catch (e) {
            toast.error('Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <FaPalette className="text-pink-500" />
                Tema Yönetimi
            </h1>

            <div className="grid gap-8">
                {/* Mode Selection */}
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FaMagic /> Kontrol Modu
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setMode('AUTO')}
                            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${mode === 'AUTO'
                                ? 'border-pink-500 bg-pink-500/10'
                                : 'border-gray-700 hover:border-gray-500 bg-gray-800'
                                }`}
                        >
                            <FaCalendarAlt className={`text-3xl ${mode === 'AUTO' ? 'text-pink-500' : 'text-gray-400'}`} />
                            <div className="text-center">
                                <strong className="block text-white text-lg">Otomatik (Takvim)</strong>
                                <span className="text-sm text-gray-400">Tarihe göre tema otomatik değişir (Yılbaşı, Halloween vb.)</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('MANUAL')}
                            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${mode === 'MANUAL'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-500 bg-gray-800'
                                }`}
                        >
                            <FaPalette className={`text-3xl ${mode === 'MANUAL' ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div className="text-center">
                                <strong className="block text-white text-lg">Manuel Seçim</strong>
                                <span className="text-sm text-gray-400">Temayı yöneticiler belirler ve sabit kalır.</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Theme Selection (Only visible if Manual) */}
                {mode === 'MANUAL' && (
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-top-4">
                        <h2 className="text-xl font-bold text-white mb-4">Aktif Tema</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme.id)}
                                    className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden group ${selectedTheme === theme.id
                                        ? 'border-white scale-105 shadow-xl'
                                        : 'border-transparent hover:border-gray-600 opacity-70 hover:opacity-100 hover:scale-105'
                                        } ${theme.color}`}
                                >
                                    <span className="relative z-10 font-bold text-white drop-shadow-md">{theme.name}</span>
                                    {/* Helper visual for selection */}
                                    {selectedTheme === theme.id && (
                                        <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                    >
                        {loading ? 'Kaydediliyor...' : (
                            <>
                                <FaSave /> Ayarları Kaydet
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
