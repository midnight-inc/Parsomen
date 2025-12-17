"use client";
import { useState, useEffect } from 'react';
import { FaSearch, FaUserShield, FaTrash, FaUser, FaClock, FaEnvelope, FaPen } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Debounce search
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const url = searchTerm ? `/api/admin/users?q=${searchTerm}` : '/api/admin/users';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error(error);
            toast.error('Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const promoteUser = async (user) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const confirmed = await confirm({
            title: 'Rol Değiştir',
            message: `${user.username} adlı kullanıcının rolünü ${newRole} yapmak istiyor musun?`,
            confirmText: newRole === 'ADMIN' ? 'Admin Yap 🛡️' : 'Kullanıcı Yap',
            variant: newRole === 'ADMIN' ? 'primary' : 'warning'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`Kullanıcı rolü güncellendi: ${newRole}`);
                fetchUsers();
            } else {
                toast.error('Rol değiştirme başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    const deleteUser = async (id) => {
        const confirmed = await confirm({
            title: 'Kullanıcıyı Sil',
            message: 'Bu kullanıcıyı ve tüm verilerini (kitaplar, yorumlar vb.) silmek istediğine emin misin? Bu işlem geri alınamaz!',
            confirmText: 'Sil 🗑️',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchUsers();
                toast.success('Kullanıcı silindi');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Silinemedi');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    return (
    const [pointModal, setPointModal] = useState({ open: false, userId: null, username: '', amount: '' });

    const handleGivePoints = async (e) => {
        e.preventDefault();
        if (!pointModal.amount || !pointModal.userId) return;

        try {
            const res = await fetch(`/api/admin/users/${pointModal.userId}/points`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseInt(pointModal.amount) })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setPointModal({ open: false, userId: null, username: '', amount: '' });
                fetchUsers(); // Refresh to ensure data consistency
            } else {
                toast.error(data.error || 'Puan eklenemedi');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FaUser className="text-blue-500" /> Kullanıcı Yönetimi
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">{users.length} kayıtlı kullanıcı</p>
                </div>

                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Kullanıcı Ara (Ad, E-posta)..."
                        className="bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors w-64 md:w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-300 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-4 w-16">ID</th>
                                <th className="p-4">Kullanıcı Bilgileri</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Katılım</th>
                                <th className="p-4 text-center">İnceleme</th>
                                <th className="p-4 text-right">Yönetim</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Kullanıcı bulunamadı.</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-gray-600 font-mono text-xs">#{user.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
                                                {user.avatar ? (
                                                    <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-blue-500 font-bold bg-blue-500/10">
                                                        {user.username?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{user.username}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <FaEnvelope className="opacity-50" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${user.role === 'ADMIN'
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-400" title={new Date(user.createdAt).toLocaleString()}>
                                            <FaClock className="opacity-50" />
                                            {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-sm font-mono text-gray-300 bg-white/5 px-2 py-1 rounded">
                                            {user._count.reviews}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setPointModal({ open: true, userId: user.id, username: user.username, amount: '' })}
                                                className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all shadow-lg shadow-green-500/10"
                                                title="Puan Ver"
                                            >
                                                🪙
                                            </button>

                                            <button
                                                onClick={() => promoteUser(user)}
                                                className={`p-2 rounded-lg transition-all ${user.role === 'ADMIN'
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black shadow-lg shadow-yellow-500/10'
                                                    }`}
                                                title={user.role === 'ADMIN' ? "Yetkisini Al" : "Yönetici Yap"}
                                            >
                                                <FaUserShield />
                                            </button>

                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-lg shadow-red-500/10"
                                                title="Kullanıcıyı Sil"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Point Modal */}
            {pointModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Puan Ver: {pointModal.username}</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Kullanıcıya eklenecek puan miktarını girin. Puan silmek için negatif değer girebilirsiniz (örn: -100).
                        </p>
                        <form onSubmit={handleGivePoints}>
                            <input
                                type="number"
                                autoFocus
                                value={pointModal.amount}
                                onChange={e => setPointModal({ ...pointModal, amount: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500 mb-6 text-lg font-mono placeholder:text-gray-600"
                                placeholder="Örn: 500"
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setPointModal({ open: false, userId: null, username: '', amount: '' })}
                                    className="px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors font-bold"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={!pointModal.amount}
                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all"
                                >
                                    Puan Ver
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
