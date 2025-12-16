"use client";
import { useState, useEffect } from 'react';
import { FaMedal, FaPlus, FaEdit, FaTrash, FaTimes, FaThLarge, FaList } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa'; // Import all icons for selection
import toast from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function BadgeManager() {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = { name: '', description: '', icon: 'FaMedal' };
    const [formData, setFormData] = useState(initialFormState);

    // Filtered icons for selection (simple list)
    const iconList = Object.keys(FaIcons).filter(icon => icon.startsWith('Fa'));

    useEffect(() => {
        fetchBadges();
        const savedMode = localStorage.getItem('badgeViewMode');
        if (savedMode) setViewMode(savedMode);
    }, []);

    const fetchBadges = async () => {
        try {
            const res = await fetch('/api/badges');
            if (res.ok) setBadges(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Rozeti Sil',
            message: 'Bu rozeti silmek istediğine emin misin?',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            await fetch(`/api/badges/${id}`, { method: 'DELETE' });
            toast.success('Rozet silindi');
            fetchBadges();
        } catch (error) {
            toast.error('Silme başarısız');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `/api/badges/${editingId}` : '/api/badges';
        const method = editingId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setIsModalOpen(false);
            fetchBadges();
            setFormData(initialFormState);
        }
    };

    const openEdit = (badge) => {
        setEditingId(badge.id);
        setFormData({ name: badge.name, description: badge.description, icon: badge.icon });
        setIsModalOpen(true);
    };

    // Helper to render dynamic icon
    const RenderIcon = ({ name, className }) => {
        const IconComponent = FaIcons[name] || FaIcons.FaMedal;
        return <IconComponent className={className} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FaMedal className="text-yellow-500" /> Rozet Yönetimi
                </h1>
                <div className="flex gap-3">
                    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                        <button onClick={() => { setViewMode('grid'); localStorage.setItem('badgeViewMode', 'grid'); }} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><FaThLarge /></button>
                        <button onClick={() => { setViewMode('list'); localStorage.setItem('badgeViewMode', 'list'); }} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><FaList /></button>
                    </div>
                    <button onClick={() => { setEditingId(null); setFormData(initialFormState); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
                        <FaPlus /> Yeni Rozet
                    </button>
                </div>
            </div>

            {loading ? <div className="text-center py-10">Yükleniyor...</div> : (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {badges.map(badge => (
                            <div key={badge.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center hover:border-yellow-500/50 transition-colors group relative">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                                    <RenderIcon name={badge.icon} className="text-3xl text-yellow-500" />
                                </div>
                                <h3 className="text-white font-bold text-lg">{badge.name}</h3>
                                <p className="text-gray-400 text-sm mt-2">{badge.description}</p>
                                <div className="mt-4 flex gap-2 w-full justify-center">
                                    <button onClick={() => openEdit(badge)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"><FaEdit /></button>
                                    <button onClick={() => handleDelete(badge.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><FaTrash /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
                                <tr>
                                    <th className="p-4">İkon</th>
                                    <th className="p-4">Ad</th>
                                    <th className="p-4">Açıklama</th>
                                    <th className="p-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {badges.map(badge => (
                                    <tr key={badge.id} className="hover:bg-gray-800/50">
                                        <td className="p-4"><RenderIcon name={badge.icon} className="text-xl text-yellow-500" /></td>
                                        <td className="p-4 font-bold text-white">{badge.name}</td>
                                        <td className="p-4">{badge.description}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => openEdit(badge)} className="p-2 text-blue-400"><FaEdit /></button>
                                            <button onClick={() => handleDelete(badge.id)} className="p-2 text-red-500"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Rozet Düzenle' : 'Yeni Rozet'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><FaTimes className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Ad</label>
                                <input className="w-full bg-black border border-gray-700 rounded p-2 text-white" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Açıklama</label>
                                <textarea className="w-full bg-black border border-gray-700 rounded p-2 text-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">İkon (React Icons Adı)</label>
                                <input className="w-full bg-black border border-gray-700 rounded p-2 text-white" placeholder="Örn: FaStar" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} />
                                <p className="text-xs text-gray-500 mt-1">Örn: FaMedal, FaStar, FaTrophy, FaCrown</p>
                            </div>
                            <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded mt-4">Kaydet</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
