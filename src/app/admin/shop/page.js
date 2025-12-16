"use client";
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGem } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

const rarityOptions = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
const typeOptions = ['FRAME', 'THEME', 'LOOTBOX'];

export default function AdminShopPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'FRAME',
        price: 100,
        rarity: 'COMMON',
        image: '🎨',
        limited: false,
        stock: null,
        description: '',
        active: true
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/admin/shop');
            const data = await res.json();
            if (data.success) {
                setItems(data.items);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const method = editing ? 'PUT' : 'POST';
            const body = editing ? { ...formData, id: editing } : formData;

            const res = await fetch('/api/admin/shop', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(editing ? 'Ürün güncellendi' : 'Ürün eklendi');
                fetchItems();
                resetForm();
            } else {
                toast.error('İşlem başarısız');
            }
        } catch (error) {
            toast.error('Bağlantı hatası');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Ürünü Sil',
            message: 'Bu ürünü silmek istediğinize emin misiniz?',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch('/api/admin/shop', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                toast.success('Ürün silindi');
                fetchItems();
            } else {
                toast.error('Silme başarısız');
            }
        } catch (error) {
            toast.error('Silme başarısız');
        }
    };

    const handleEdit = (item) => {
        setEditing(item.id);
        setFormData({
            name: item.name,
            type: item.type,
            price: item.price,
            rarity: item.rarity,
            image: item.image,
            limited: item.limited,
            stock: item.stock,
            description: item.description || '',
            active: item.active
        });
        setIsCreating(true);
    };

    const resetForm = () => {
        setEditing(null);
        setIsCreating(false);
        setFormData({
            name: '',
            type: 'FRAME',
            price: 100,
            rarity: 'COMMON',
            image: '🎨',
            limited: false,
            stock: null,
            description: '',
            active: true
        });
    };

    if (loading) return <div className="text-white">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FaGem className="text-green-500" /> Puan Dükkanı Yönetimi
                </h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FaPlus /> Yeni Ürün
                </button>
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">
                            {editing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-white">
                            <FaTimes />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">İsim</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black border border-gray-700 p-2 rounded text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Tür</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-black border border-gray-700 p-2 rounded text-white mt-1"
                            >
                                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Fiyat</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                className="w-full bg-black border border-gray-700 p-2 rounded text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Nadirlik</label>
                            <select
                                value={formData.rarity}
                                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                                className="w-full bg-black border border-gray-700 p-2 rounded text-white mt-1"
                            >
                                {rarityOptions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Emoji/Görsel</label>
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full bg-black border border-gray-700 p-2 rounded text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Stok (Sınırlı için)</label>
                            <input
                                type="number"
                                value={formData.stock || ''}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full bg-black border border-gray-700 p-2 rounded text-white mt-1"
                                placeholder="Boş bırak = sınırsız"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500 uppercase font-bold">Açıklama</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-gray-700 p-2 rounded text-white mt-1"
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <label className="flex items-center gap-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={formData.limited}
                                    onChange={(e) => setFormData({ ...formData, limited: e.target.checked })}
                                />
                                Sınırlı Stok
                            </label>
                            <label className="flex items-center gap-2 text-white">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                Aktif
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={resetForm} className="px-4 py-2 text-gray-400 hover:text-white">İptal</button>
                        <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                            <FaSave /> Kaydet
                        </button>
                    </div>
                </div>
            )}

            {/* Items Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-gray-400">
                    <thead className="bg-gray-800 text-gray-200 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Görsel</th>
                            <th className="p-4">İsim</th>
                            <th className="p-4">Tür</th>
                            <th className="p-4">Fiyat</th>
                            <th className="p-4">Nadirlik</th>
                            <th className="p-4">Stok</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-800/50">
                                <td className="p-4 text-3xl">{item.image}</td>
                                <td className="p-4 text-white font-bold">{item.name}</td>
                                <td className="p-4">{item.type}</td>
                                <td className="p-4 text-yellow-500 font-bold">{item.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' :
                                        item.rarity === 'EPIC' ? 'bg-purple-500 text-white' :
                                            item.rarity === 'RARE' ? 'bg-blue-500 text-white' :
                                                'bg-gray-600 text-white'
                                        }`}>
                                        {item.rarity}
                                    </span>
                                </td>
                                <td className="p-4">{item.limited ? (item.stock || 'Tükendi') : '∞'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {item.active ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-500/20 rounded text-blue-400">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/20 rounded text-red-500">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Henüz ürün eklenmedi.
                    </div>
                )}
            </div>
        </div>
    );
}
