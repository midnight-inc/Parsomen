"use client";
import { useState, useEffect } from 'react';
import { FaSearch, FaUserShield, FaUserTimes, FaTrash, FaUser, FaClock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { confirm } from '@/components/ui/ConfirmModal';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [searchTerm]);

    const fetchUsers = async () => {
        // Debounce handled naturally by user typing speed usually, but for simplicity we fetch direct
        // In production, add a debounce here
        const url = searchTerm ? `/api/users?q=${searchTerm}` : '/api/users';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            setUsers(data.users);
        }
        setLoading(false);
    };

    const promoteUser = async (id, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        const confirmed = await confirm({
            title: 'Rol Değiştir',
            message: `Kullanıcı rolünü ${newRole} yapmak istiyor musun?`,
            confirmText: 'Değiştir',
            cancelText: 'İptal',
            variant: 'warning'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`Kullanıcı rolü ${newRole} olarak değiştirildi`);
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
            message: 'Kullanıcıyı ve tüm verilerini silmek istiyor musun? Bu işlem geri alınamaz!',
            confirmText: 'Sil',
            cancelText: 'İptal',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchUsers();
                toast.success('Kullanıcı silindi');
            } else {
                toast.error('Kullanıcı silinemedi.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    if (loading) return <div className="text-white">Kullanıcılar yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Kullanıcı Yönetimi</h1>
                    <p className="text-gray-400 text-sm">Toplam {users.length} kullanıcı</p>
                </div>

                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        className="bg-gray-900 border border-gray-700 pl-10 pr-4 py-2 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-gray-400">
                    <thead className="bg-gray-800 text-gray-200 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Kullanıcı</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Kayıt Tarihi</th>
                            <th className="p-4 text-center">İncelemeler</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="p-4 text-gray-600 font-mono text-xs">#{user.id}</td>
                                <td className="p-4 text-white font-bold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-xs">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div>{user.username}</div>
                                        <div className="text-xs text-gray-500 font-normal">{user.email}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-900 text-red-200 border border-red-800' : 'bg-blue-900/30 text-blue-200'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-xs font-mono">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-center">
                                    {user._count.reviews}
                                </td>
                                <td className="p-4 flex gap-2 justify-end">
                                    <button
                                        title={user.role === 'ADMIN' ? "Adminliği Al" : "Admin Yap"}
                                        onClick={() => promoteUser(user.id, user.role)}
                                        className="p-2 bg-gray-800 hover:bg-yellow-600 hover:text-white rounded transition-colors text-yellow-500"
                                    >
                                        <FaUserShield />
                                    </button>
                                    <button
                                        title="Kullanıcıyı Sil"
                                        onClick={() => deleteUser(user.id)}
                                        className="p-2 bg-gray-800 hover:bg-red-600 hover:text-white rounded transition-colors text-red-500"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="p-8 text-center text-gray-500">Kullanıcı bulunamadı.</div>}
            </div>
        </div>
    );
}
