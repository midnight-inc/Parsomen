"use client";
import { useState, useEffect } from 'react';
import { FaToggleOn, FaToggleOff, FaSave, FaTools, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        maintenance_mode: 'false',
        maintenance_message: 'Sistem şu anda bakım aşamasındadır. Lütfen daha sonra tekrar deneyiniz.'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Settings fetch error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success('Ayarlar kaydedildi!');
            } else {
                const data = await res.json();
                toast.error(data.details || data.error || 'Kayıt başarısız');
                console.error('Save error:', data);
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaTools className="text-gray-400" />
                Sistem Ayarları
            </h1>

            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 space-y-6 max-w-2xl">

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-800">
                    <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                            Bakım Modu
                            {String(settings.maintenance_mode) === 'true' && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">AKTİF</span>}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                            Siteyi bakıma al. Sadece adminler siteye erişebilir.
                        </p>
                    </div>
                    <button
                        onClick={() => setSettings(s => ({ ...s, maintenance_mode: String(s.maintenance_mode) === 'true' ? 'false' : 'true' }))}
                        className={`text-4xl transition-colors ${String(settings.maintenance_mode) === 'true' ? 'text-green-500' : 'text-gray-600'}`}
                    >
                        {String(settings.maintenance_mode) === 'true' ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                </div>

                {/* Maintenance Message */}
                <div>
                    <label className="text-white/70 text-sm font-bold mb-2 block">Bakım Mesajı</label>
                    <textarea
                        value={settings.maintenance_message}
                        onChange={(e) => setSettings(s => ({ ...s, maintenance_message: e.target.value }))}
                        className="w-full bg-black/40 border border-gray-800 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none transition-colors"
                        rows={3}
                    />
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                        {saving ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <FaSave />}
                        Kaydet
                    </button>
                </div>

            </div>
        </div>
    );
}
